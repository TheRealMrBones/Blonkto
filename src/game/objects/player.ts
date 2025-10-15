import { Socket } from "socket.io-client";

import Entity from "./entity.js";
import Layer from "../world/layer.js";
import ItemStack from "../items/itemStack.js";
import Game from "../game.js";
import Inventory from "../items/inventory/inventory.js";
import Recipe from "../items/recipe.js";
import Station from "../items/station.js";
import IInventory from "../items/inventory/IInventory.js";
import CombinedInventory from "../items/inventory/combinedInventory.js";
import { SerializedWriteInventory } from "../items/inventory/inventory.js";
import { Color, Vector2D } from "../../shared/types.js";
import { InputContent } from "../../shared/messageContentTypes.js";
import { createOneTimeMessage, OneTimeMessageContent, PushContent, SetColorContent, SetGamemodeContent, SetPosContent } from "../../shared/oneTimeMessageContentTypes.js";

import Constants from "../../shared/constants.js";
const { ASSETS, GAME_MODES, ONE_TIME_MSG_TYPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE, PLAYER_SPEED } = SharedConfig.PLAYER;
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

import ServerConfig from "../../configs/server.js";
const { RACISM, RACISM_PERM, KEEP_INVENTORY } = ServerConfig.PLAYER;
const { DEFAULT_GAME_MODE, FORCE_GAME_MODE } = ServerConfig.GAME_MODE;

/** The base class for a logged in and living player entity in the world */
class Player extends Entity {
    readonly socket: Socket;
    private lastupdated: number = 0;
    private serverlastupdated: number;
    private username: string;
    private gamemode: string = GAME_MODES.SURVIVAL;
    private kills: number = 0;
    private color: Color;
    private inventory: Inventory;
    private hotbarslot: number = 0;
    private station: Station | null = null;
    private lastchunk: Vector2D | null = null;
    private recipes: Recipe[] = [];
    private moving: boolean = false;
    private statereset: boolean = false;

    private pushx: number = 0;
    private pushy: number = 0;
    private setpos: Vector2D | null = null;
    private lastsetpos: number = 0;
    private setgamemode: boolean = false;
    private setcolor: boolean = false;
    private lastdarkness: number = 0;

    constructor(socket: Socket, username: string, layer: Layer, x: number, y: number, starter: boolean){
        super(layer, x, y, 10, 0, PLAYER_SCALE, ASSETS.PLAYER);
        this.id = socket.id!;
        this.serverlastupdated = Date.now();

        this.socket = socket;
        this.username = username;
        this.setGamemode(DEFAULT_GAME_MODE, true);
        this.scale = PLAYER_SCALE;
        this.basespeed = PLAYER_SPEED;

        // racism
        const antiracism = 1 - RACISM;
        this.color = {
            r: antiracism + Math.random() * RACISM,
            g: antiracism + Math.random() * RACISM,
            b: antiracism + Math.random() * RACISM,
        };

        // inventory
        this.inventory = new Inventory(INVENTORY_SIZE);
        if(starter == true) this.starterInventory();
    }

    /** Returns the player from its save data */
    static readFromSave(socket: Socket, layer: Layer, x: number, y: number, data: SerializedWritePlayer | SerializedWriteDeadPlayer): Player {
        const player = new Player(socket, data.username, layer, x, y, (data.dead && !KEEP_INVENTORY));

        if(!FORCE_GAME_MODE) player.setGamemode(data.gamemode, true);
        player.kills = data.kills;

        if(data.dead){
            // Respawn
            if(RACISM_PERM) player.color = data.color;

            if(KEEP_INVENTORY && data.inventory !== undefined) player.inventory = Inventory.readFromSave(data.inventory);
        }else{
            // Load Exact
            player.x = data.x;
            player.y = data.y;
            player.health = data.health;
            player.color = data.color;
            player.inventory = Inventory.readFromSave(data.inventory);
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

    // #region getters

    /** Returns this players username */
    getUsername(): string {
        return this.username;
    }

    /** Returns this players gamemode */
    getGamemode(): string {
        return this.gamemode;
    }

    /** Returns this players kills */
    getKills(): number {
        return this.kills;
    }

    /** Returns this players color */
    getColor(): Color {
        return this.color;
    }

    /** Returns this players active station */
    getStation(): Station | null {
        return this.station;
    }

    /** Returns the combined inventory associated with this players current state */
    getCombinedInventory(): IInventory {
        const inventory = this.station === null ? this.inventory :
            new CombinedInventory([this.inventory, ...this.station.inventories]);
        return inventory;
    }

    /** Returns this players inventory */
    getInventory(): Inventory {
        return this.inventory;
    }

    /** Returns this players currently held item */
    getCurrentItem(): ItemStack | null {
        return this.inventory.getSlot(this.hotbarslot);
    }

    /** Returns if this player is currently moving */
    getMoving(): boolean {
        return this.moving;
    }

    // #endregion

    // #region setters

    /** Sets the players username to the given value */
    setUsername(username: string): void {
        this.username = username;
    }

    /** Pushes the player the given distances */
    override push(x: number, y: number): void {
        super.push(x, y);
        this.pushx += x;
        this.pushy += y;
    }

    /** Sets the players position to the given values */
    override setPos(x: number, y: number): void {
        super.setPos(x, y);
        this.setpos = [x, y];

        this.pushx = 0;
        this.pushy = 0;

        this.lastsetpos = Date.now();
    }

    /** Sets the players layer to the given layer */
    override setLayer(newlayer: Layer): void {
        this.layer.entityManager.removePlayer(this.id);
        this.layer = newlayer;
        newlayer.entityManager.addPlayer(this);
        this.statereset = true;
    }

    /** Sets the gamemode of this player */
    setGamemode(gamemode: string, ordefault?: boolean): void {
        const oldgamemode = this.gamemode;

        if(!Object.values(GAME_MODES).includes(gamemode)){
            this.logger.warning(`Player "${this.username}" gamemode tried to be set to invalid gamemode "${gamemode}"`);
            if(ordefault){
                if(!Object.values(GAME_MODES).includes(DEFAULT_GAME_MODE)){
                    this.logger.warning(`Default gamemode set to invalid gamemode "${DEFAULT_GAME_MODE}", defaulting to survival...`);
                    this.gamemode = GAME_MODES.SURVIVAL;
                }else{
                    this.gamemode = DEFAULT_GAME_MODE;
                }
            }
        }else{
            this.gamemode = gamemode;
        }

        if(oldgamemode != this.gamemode) this.setgamemode = true;
    }

    /** Sets the color of the player */
    setColor(color: Color): void {
        this.color = color;
        this.setcolor = true;
    }

    /** Sets this players station to the given station */
    setStation(station: Station | null): void {
        this.station = station;
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

    /** Adds the given recipe to this players recipes and returns if it was not already there */
    addRecipe(recipe: Recipe): boolean {
        if(this.recipes.includes(recipe)) return false;

        this.recipes.push(recipe);
        return true;
    }

    // #endregion

    // #region events

    /** Emits a tick event to this player */
    override emitTickEvent(game: Game, dt: number): void {
        this.inventory.resetChanges();
        
        super.emitTickEvent(game, dt);
    }

    /** Emits a death event to this object */
    override emitDeathEvent(game: Game, killedby: string, killer: any): void {
        super.emitDeathEvent(game, killedby, killer);

        if(killer instanceof Player) killer.kills++;

        game.playerManager.killPlayer(this.socket, killedby);
        if(!KEEP_INVENTORY && this.scale > 0) this.inventory.dropInventory(this.layer, this.x, this.y, game);
    }

    // #endregion

    // #region update

    /** Updates this players data with the given new input data */
    update(data: InputContent): void {
        const deltatime = this.lastupdated == 0 ? 20 : data.t - this.lastupdated;

        // only move if valid distance
        //const movedist = Math.sqrt(data.dx * data.dx + data.dy * data.dy);
        const allowederror = 0.01;
        const maxmovedist = (this.getSpeed() * deltatime / 1000) + allowederror;

        if(this.lastsetpos > data.lastserverupdate){
            // ignore if setVector2D happened in future for client
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

    /** Updates this players darkness level and returns if it changed */
    updateDarkness(darkness: number): boolean {
        const olddarkness = this.lastdarkness;
        this.lastdarkness = darkness;
        
        return olddarkness != darkness;
    }

    /** Sets this players last chunk to the given value and returns the old value */
    updateLastChunk(lastchunk: Vector2D | null): Vector2D | null {
        const oldlastchunk = this.lastchunk;
        this.lastchunk = lastchunk;

        return oldlastchunk;
    }

    /** Returns if state reset is true and sets it back to false */
    updateStateReset(): boolean {
        const oldstatereset = this.statereset;
        this.statereset = false;

        return oldstatereset;
    }

    // #endregion

    // #region physics

    /** Default player collision checks */
    override checkCollisions(game: Game): void {
        if(this.gamemode == GAME_MODES.SPECTATOR) return;

        super.checkCollisions(game);
        game.collisionManager.collectCheck(this);
    }

    /** Returns if this player can be collided with */
    override canCollide(): boolean {
        return (this.gamemode != GAME_MODES.SPECTATOR && super.canCollide());
    }

    /** Returns if this object can start falling */
    override canFall(): boolean {
        return (this.gamemode == GAME_MODES.SURVIVAL && super.canFall());
    }

    /** Player action after falling */
    override onFell(game: Game): void {
        setTimeout(() => {
            this.emitDeathEvent(game, "gravity", null);
        }, 1000);
    }

    // #endregion

    // #region attacking

    /** Returns if this entity can be targeted for attacks / AI */
    override isValidTarget(): boolean {
        return (this.gamemode == GAME_MODES.SURVIVAL && super.isValidTarget());
    }

    /** Returns if this entity can be hit */
    override canHit(): boolean {
        return (this.gamemode == GAME_MODES.SURVIVAL && super.canHit());
    }

    // #endregion

    // #region one time messages

    /** Resets the saved update fixes */
    private resetOneTimeMessages(): void {
        this.pushx = 0;
        this.pushy = 0;
        this.setpos = null;
        this.setcolor = false;
        this.setgamemode = false;
    }

    /** Returns the saved update fixes then resets them */
    getOneTimeMessages(): OneTimeMessageContent[] {
        const onetimemessages: OneTimeMessageContent[] = [];

        if(this.setpos !== null){
            onetimemessages.push(createOneTimeMessage<SetPosContent>(ONE_TIME_MSG_TYPES.SET_POS,
                {
                    pos: this.setpos,
                }
            ));
        }

        if(this.pushx != 0 || this.pushy != 0){
            onetimemessages.push(createOneTimeMessage<PushContent>(ONE_TIME_MSG_TYPES.PUSH,
                {
                    pushx: this.pushx,
                    pushy: this.pushy,
                }
            ));
        }

        if(this.setgamemode){
            onetimemessages.push(createOneTimeMessage<SetGamemodeContent>(ONE_TIME_MSG_TYPES.SET_GAMEMODE,
                {
                    gamemode: this.gamemode,
                }
            ));
        }

        if(this.setcolor){
            onetimemessages.push(createOneTimeMessage<SetColorContent>(ONE_TIME_MSG_TYPES.SET_COLOR,
                {
                    color: this.color,
                }
            ));
        }

        this.resetOneTimeMessages();
        return onetimemessages;
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
    serializePlayerForWrite(): SerializedWritePlayer {
        return {
            dead: false,
            username: this.username,
            gamemode: this.gamemode,
            layer: this.layer.z,
            x: this.x,
            y: this.y,
            health: this.health,
            kills: this.kills,
            color: this.color,
            inventory: this.inventory.serializeForWrite(),
        };
    }

    /** Returns an object representing this players kept data for writing to the save after they have died */
    serializePlayerAfterKilled(): SerializedWriteDeadPlayer {
        const returnobj: SerializedWriteDeadPlayer = {
            dead: true,
            username: this.username,
            gamemode: this.gamemode,
            kills: this.kills,
            color: this.color,
        };

        if(KEEP_INVENTORY) returnobj.inventory = this.inventory.serializeForWrite();

        return returnobj;
    }

    // #endregion
}

/** Defines the format for serialized writes of a player */
export type SerializedWritePlayer = {
    dead: false,
    username: string,
    gamemode: string,
    layer: number,
    x: number,
    y: number,
    health: number,
    kills: number,
    color: Color,
    inventory: SerializedWriteInventory,
}

/** Defines the format for serialized writes of a dead player */
export type SerializedWriteDeadPlayer = {
    dead: true,
    username: string,
    gamemode: string,
    kills: number,
    color: Color,
    inventory?: SerializedWriteInventory,
}

export default Player;
