import { Socket } from "socket.io-client";

import Entity from "./entity.js";
import ItemStack from "../items/itemStack.js";
import Game from "../game.js";
import Inventory from "../items/inventory.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE } = SharedConfig.PLAYER;
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

import ServerConfig from "../../configs/server.js";
const { RACISM, RACISM_PERM, KEEP_INVENTORY } = ServerConfig.PLAYER;

/** The base class for a logged in and living player entity in the world */
class Player extends Entity {
    socket: Socket;
    username: string;
    kills: number;
    color: Color;
    inventory: Inventory;
    hotbarslot: number;
    fixes: any;

    constructor(socket: Socket, username: string, x: number, y: number, starter: boolean){
        super(x, y, 10, 0, PLAYER_SCALE, ASSETS.PLAYER);
        this.id = socket.id!;

        this.chunk = { x: this.chunk.x + 10, y: this.chunk.y + 10}; // purposefully make chunk off so that first update has load data

        this.socket = socket;
        this.username = username;
        this.kills = 0;
        this.scale = PLAYER_SCALE;
        this.health = 10;

        // racism
        const antiracism = 1 - RACISM;
        this.color = {
            r: antiracism + Math.random() * RACISM,
            g: antiracism + Math.random() * RACISM,
            b: antiracism + Math.random() * RACISM,
        };

        // inventory
        this.inventory = new Inventory(INVENTORY_SIZE);
        this.hotbarslot = 0;
        if(starter == true) this.starterInventory();

        this.resetFixes();

        this.eventEmitter.on("death", (killedby: string, killer: any, game: Game) => {
            game.playerManager.killPlayer(this.socket, killedby);
            if(!KEEP_INVENTORY) this.inventory.dropInventory(this.x, this.y, game);
        });
    }

    /** Returns the player from its save data */
    static readFromSave(socket: Socket, x: number, y: number, data: any): Player {
        const player = new Player(socket, data.username, x, y, (data.dead && !KEEP_INVENTORY));

        player.kills = data.kills;

        if(data.dead){
            // Respawn
            if(RACISM_PERM) player.color = data.color;

            if(KEEP_INVENTORY) player.inventory = Inventory.readFromSave(data.inventory);
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

    /** Initializes this players inventory to the starter items */
    starterInventory(): void {
        this.inventory.setSlot(0, new ItemStack("pickaxe"));
        this.inventory.setSlot(1, new ItemStack("shovel"));
        this.inventory.setSlot(2, new ItemStack("sword"));
        this.inventory.setSlot(3, new ItemStack("stone_block", 64));
        this.inventory.setSlot(4, new ItemStack("wood_floor", 64));
    }

    /** Default player collision checks */
    override checkCollisions(game: Game): void {
        super.checkCollisions(game);
        game.collisionManager.collectCheck(this);
    }

    /** Player action after falling */
    override onFell(game: Game): void {
        setTimeout(() => {
            this.eventEmitter.emit("death", "gravity", null, game);
        }, 1000);
    }

    // #region setters

    /** Updates this players data with the given new input data */
    update(data: any): void {
        const deltatime = data.t - this.lastupdated;

        this.dir = data.dir;
        this.x += data.dx;
        this.y += data.dy;

        this.lastupdated = data.t;
    }

    /** Heal the player the given amount of health */
    heal(amount: number, ignoremax?: boolean): void {
        this.health += amount;
        if(!ignoremax) this.health = Math.min(this.health, this.maxhealth);
    }

    /** Tries to collect the given item stack and returns if complete take */
    collectStack(itemstack: ItemStack): boolean {
        return this.inventory.collectStack(itemstack, this.fixes.inventoryupdates);
    }

    /** Removes the given amount from the given slot in this players inventory */
    removeFromSlot(slot: number, amount: number): boolean {
        if(!this.inventory.removeFromSlot(slot, amount)) return false;
        const stack = this.inventory.getSlot(slot);

        this.fixes.inventoryupdates.push({
            slot: slot,
            itemstack: stack !== null ? stack.serializeForUpdate() : null,
        });

        return true;
    }

    /** Rempoves the given amount from the players current slot */
    removeFromCurrentSlot(amount: number): boolean {
        return this.removeFromSlot(this.hotbarslot, amount);
    }

    /** Drops the given amount from the given slot in this players inventory */
    dropFromSlot(slot: number, game: Game, amount?: number): void {
        this.inventory.dropStack(this.x, this.y, slot, game, amount, this);
        const stack = this.inventory.getSlot(slot);
        
        this.fixes.inventoryupdates.push({
            slot: slot,
            itemstack: stack !== null ? stack.serializeForUpdate() : null,
        });
    }

    // #endregion

    // #region fixes

    /** Resets the saved update fixes */
    resetFixes(): void {
        this.fixes = {
            pushx: null,
            pushy: null,
            setpos: null,
            inventoryupdates: [],
        };
    }

    /** Returns the saved update fixes */
    getFixes(): any {
        const fixescopy = {
            pushx: this.fixes.pushx,
            pushy: this.fixes.pushy,
            setpos: this.fixes.setpos,
            inventoryupdates: this.fixes.inventoryupdates,
        };
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
    }

    // #endregion

    // #region serialization

    /** Return an object representing this players data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                username: this.username,
                color: this.color,
                kills: this.kills,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    /** Return an object representing this players data for writing to the save */
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

    /** Return an object representing this players kept data for writing to the save after they have died */
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