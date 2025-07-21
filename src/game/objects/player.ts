import { Socket } from "socket.io-client";

import Entity from "./entity.js";
import Layer from "../world/layer.js";
import ItemStack from "../items/itemStack.js";
import Game from "../game.js";
import ChangesInventory from "../items/inventory/changesInventory.js";
import Recipe from "../items/recipe.js";
import Station from "../items/station.js";
import IInventory from "../items/inventory/IInventory.js";
import CombinedInventory from "../items/inventory/combinedInventory.js";
import { Color, Pos } from "../../shared/types.js";
import { InputContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE, PLAYER_SPEED } = SharedConfig.PLAYER;
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

import ServerConfig from "../../configs/server.js";
const { RACISM, RACISM_PERM, KEEP_INVENTORY } = ServerConfig.PLAYER;

/** The base class for a logged in and living player entity in the world */
class Player extends Entity {
    socket: Socket;
    lastupdated: number;
    serverlastupdated: number;
    username: string;
    kills: number;
    color: Color;
    private inventory: ChangesInventory;
    hotbarslot: number;
    station: Station | null = null;
    fixes: any;
    lastsetpos: number = 0;
    lastchunk: Pos | undefined;
    recipes: Recipe[] = [];
    moving: boolean = false;

    constructor(socket: Socket, username: string, layer: Layer, x: number, y: number, starter: boolean){
        super(layer, x, y, 10, 0, PLAYER_SCALE, ASSETS.PLAYER);
        this.id = socket.id!;
        this.lastupdated = 0;
        this.serverlastupdated = Date.now();

        this.socket = socket;
        this.username = username;
        this.kills = 0;
        this.scale = PLAYER_SCALE;
        this.health = 10;
        this.basespeed = PLAYER_SPEED;

        // racism
        const antiracism = 1 - RACISM;
        this.color = {
            r: antiracism + Math.random() * RACISM,
            g: antiracism + Math.random() * RACISM,
            b: antiracism + Math.random() * RACISM,
        };

        // inventory
        this.inventory = new ChangesInventory(INVENTORY_SIZE);
        this.hotbarslot = 0;
        if(starter == true) this.starterInventory();

        this.resetFixes();
    }

    /** Returns the player from its save data */
    static readFromSave(socket: Socket, layer: Layer, x: number, y: number, data: any): Player {
        const player = new Player(socket, data.username, layer, x, y, (data.dead && !KEEP_INVENTORY));

        player.kills = data.kills;

        if(data.dead){
            // Respawn
            if(RACISM_PERM) player.color = data.color;

            if(KEEP_INVENTORY) player.inventory = ChangesInventory.readFromSave(data.inventory);
        }else{
            // Load Exact
            player.x = data.x;
            player.y = data.y;
            player.health = data.health;
            player.color = data.color;
            player.inventory = ChangesInventory.readFromSave(data.inventory);
        }

        return player;
    }

    // #region constructor helpers

    /** Initializes this players inventory to the starter items */
    starterInventory(): void {
        this.inventory.setSlot(0, new ItemStack("pickaxe"));
        this.inventory.setSlot(1, new ItemStack("axe"));
    }

    // #endregion

    // #region events

    /** Emits a death event to this object */
    override emitDeathEvent(game: Game, killedby: string, killer: any): void {
        super.emitDeathEvent(game, killedby, killer);

        if(killer instanceof Player) killer.kills++;

        game.playerManager.killPlayer(this.socket, killedby);
        if(!KEEP_INVENTORY && this.scale > 0) this.inventory.dropInventory(this.layer, this.x, this.y, game);
    }

    // #endregion

    // #region physics

    /** Default player collision checks */
    override checkCollisions(game: Game): void {
        super.checkCollisions(game);
        game.collisionManager.collectCheck(this);
    }

    /** Player action after falling */
    override onFell(game: Game): void {
        setTimeout(() => {
            this.emitDeathEvent(game, "gravity", null);
        }, 1000);
    }

    // #endregion

    // #region getters

    getCombinedInventory(): IInventory {
        const inventory = this.station === null ? this.inventory :
            new CombinedInventory([this.inventory, ...this.station.inventories]);
        return inventory;
    }

    getInventory(): ChangesInventory {
        return this.inventory;
    }

    // #endregion

    // #region setters

    /** Updates this players data with the given new input data */
    update(data: InputContent): void {
        const deltatime = this.lastupdated == 0 ? 20 : data.t - this.lastupdated;

        // only move if valid distance
        //const movedist = Math.sqrt(data.dx * data.dx + data.dy * data.dy);
        const allowederror = 0.01;
        const maxmovedist = (this.getSpeed() * deltatime / 1000) + allowederror;

        if(this.lastsetpos > data.lastserverupdate){
            // ignore if setpos happened in future for client
        }else if(data.dx > maxmovedist || data.dy > maxmovedist){
            // player moved too fast compared to known speed
            this.logger.info(`Player "${this.username}" moved too fast! Resyncing...`);

            this.x += Math.min(data.dx, maxmovedist);
            this.y += Math.min(data.dy, maxmovedist);

            this.resync();
        }else{
            this.x += data.dx;
            this.y += data.dy;
            
            this.moving = (data.dx != 0 || data.dy != 0);
        }

        // set other data
        this.dir = data.dir;
        this.hotbarslot = data.hotbarslot;

        // resync if missed update
        if(data.lastupdatetime !== null)
            if(this.lastupdated != data.lastupdatetime) this.resync();

        // populate last updated
        this.lastupdated = data.t;
        this.serverlastupdated = Date.now();
    }

    /** Resyncs the players client with the server */
    resync(){
        this.setPos(this.x, this.y);
    }

    /** Heal the player the given amount of health */
    heal(amount: number, ignoremax?: boolean): void {
        this.health += amount;
        if(!ignoremax) this.health = Math.min(this.health, this.maxhealth);
    }

    /** Rempoves the given amount from the players current slot */
    removeFromCurrentSlot(amount: number): boolean {
        return this.inventory.removeFromSlot(this.hotbarslot, amount);
    }

    /** Drops the given amount from the given slot in this players inventory */
    dropFromSlot(slot: number, game: Game, amount?: number): void {
        const inventory = this.getCombinedInventory();
        inventory.dropFromSlot(this.layer, this.x, this.y, slot, game, amount, this.id);
        const stack = inventory.getSlot(slot);
    }

    // #endregion

    // #region fixes

    /** Resets the saved update fixes */
    resetFixes(): void {
        this.fixes = {
            pushx: null,
            pushy: null,
            setpos: null,
            setcolor: null,
        };
    }

    /** Returns the saved update fixes then resets them */
    getFixes(): any {
        const fixescopy = {
            pushx: this.fixes.pushx,
            pushy: this.fixes.pushy,
            setpos: this.fixes.setpos,
            setcolor: this.fixes.setcolor,
        };
        this.resetFixes();
        return fixescopy;
    }

    /** Pushes the player the given distances */
    override push(x: number, y: number): void {
        super.push(x, y);
        this.fixes.pushx += x;
        this.fixes.pushy += y;
    }

    /** Sets the players position to the given values */
    override setPos(x: number, y: number): void {
        super.setPos(x, y);
        this.fixes.setpos = {
            x: x,
            y: y
        };
        this.lastsetpos = Date.now();
    }

    /** Sets the color of the player */
    setColor(color: Color): void {
        this.color = color;
        this.fixes.setcolor = color;
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this players data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                lastupdated: this.serverlastupdated,
                username: this.username,
                color: this.color,
                kills: this.kills,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    /** Returns an object representing this players data for writing to the save */
    override serializeForWrite(): any {
        return JSON.stringify({
            dead: false,
            username: this.username,
            x: this.x,
            y: this.y,
            health: this.health,
            kills: this.kills,
            color: this.color,
            inventory: this.inventory.serializeForWrite(),
        });
    }

    /** Returns an object representing this players kept data for writing to the save after they have died */
    serializeAfterKilled(): any {
        const base: any = {
            dead: true,
            username: this.username,
            kills: this.kills,
            color: this.color,
        };

        if(KEEP_INVENTORY) base.inventory = this.inventory.serializeForWrite();
    
        return JSON.stringify(base);
    }

    // #endregion
}

export default Player;
