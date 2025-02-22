import { Socket } from "socket.io-client";

import Entity from "./entity.js";
import ItemStack from "../items/itemStack.js";
import Game from "../game.js";
import { collectCheck } from "../collisions.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE } = SharedConfig.PLAYER;
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

import ServerConfig from "../../configs/server.js";
const { RACISM, RACISM_PERM } = ServerConfig.PLAYER;

/** The base class for a logged in and living player entity in the world */
class Player extends Entity {
    socket: Socket;
    username: string;
    kills: number;
    playerdelay: number;
    color: Color;
    inventory: (ItemStack | null)[];
    hotbarslot: number;
    fixes: any;

    constructor(socket: Socket, username: string, x: number, y: number, spawn: boolean){
        super(x, y, 10, 0, PLAYER_SCALE, ASSETS.PLAYER);
        this.id = socket.id!;

        this.chunk = { x: this.chunk.x + 10, y: this.chunk.y + 10}; // purposefully make chunk off so that first update has load data

        this.socket = socket;
        this.username = username;
        this.kills = 0;
        this.playerdelay = 0;
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
        this.inventory = Array(INVENTORY_SIZE).fill(null);
        this.hotbarslot = 0;

        // if spawning give starter items
        if(spawn == true){
            this.starterInventory();
        }

        this.resetFixes();
    }

    /** Returns the player from its save data */
    static readFromSave(socket: Socket, x: number, y: number, data: any): Player {
        const player = new Player(socket, data.username, x, y, data.dead);

        player.kills = data.kills;

        if(data.dead){
            // Respawn
            if(RACISM_PERM){
                player.color = data.color;
            }
        }else{
            // Load Exact
            player.x = data.x;
            player.y = data.y;
            player.health = data.health;
            player.color = data.color;
            player.inventory = data.inventory.map((stack: { name: string; amount: number | undefined; }) => stack ? new ItemStack(stack.name, stack.amount) : null);
        }

        return player;
    }

    /** Initializes this players inventory to the starter items */
    starterInventory(): void {
        this.inventory[0] = new ItemStack("pickaxe");
        this.inventory[1] = new ItemStack("sword");
        this.inventory[2] = new ItemStack("stone_block", 64);
    }

    /** Default object collision checks */
    override checkCollisions(game: Game): void {
        collectCheck(this, game.getDroppedStacks(), game);
    }

    // #region setters

    /** Player action after falling */
    override onFell(game: Game): void {
        setTimeout(() => {
            this.dead = true;
            this.killedby = "gravity";
        }, 1000);
    }

    /** Updates this players data with the given new data */
    update(data: any): void {
        if(this.playerdelay == 0){
            this.playerdelay = Date.now() - data.t;
        }
        super.update(data);
    }

    /** Tries to collect the given item stack and returns if complete take */
    collectStack(itemstack: ItemStack): boolean {
        for(let i = 0; i < INVENTORY_SIZE; i++){
            const itemstack2 = this.inventory[i];
            if(itemstack2 != null){
                const done = itemstack2.mergeStack(itemstack);

                this.fixes.inventoryupdates.push({
                    slot: i,
                    itemstack: this.inventory[i] ? itemstack2.serializeForUpdate() : null,
                });

                if(done){
                    return true;
                }
            }
        }

        const slot = this.nextOpenSlot();
        if(slot == -1){
            return false;
        }

        this.inventory[slot] = itemstack;
        this.fixes.inventoryupdates.push({
            slot: slot,
            itemstack: itemstack ? itemstack.serializeForUpdate() : null,
        });
        return true;
    }

    /** Removes the given amount from the given slot in this players inventory */
    removeFromSlot(slot: number, amount: number): void {
        if(this.inventory[slot] == null) return;

        if(this.inventory[slot].removeAmount(amount)){
            this.inventory[slot] = null;
        }

        this.fixes.inventoryupdates.push({
            slot: slot,
            itemstack: this.inventory[slot] ? this.inventory[slot].serializeForUpdate() : null,
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
    push(x: number, y: number): void {
        this.fixes.pushx += x;
        this.fixes.pushy += y;
    }

    /** Sets the players position to the given values */
    setPos(x: number, y: number): void {
        this.fixes.setpos = {
            x: x,
            y: y
        };
    }

    // #endregion

    // #region helpers

    /** Returns the next open slot in this players inventory or -1 if there is none */
    nextOpenSlot(): number {
        for(let i = 0; i < INVENTORY_SIZE; i++){
            if(this.inventory[i] == null) return i;
        }
        return -1;
    }

    // #endregion

    // #region serialization

    /** Return an object representing this players data for a game update to the client */
    serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                username: this.username,
                playerdelay: this.playerdelay,
                color: this.color,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    /** Return an object representing this players data for writing to the save */
    serializeForWrite(): any {
        return JSON.stringify({
            dead: false,
            username: this.username,
            x: this.x,
            y: this.y,
            health: this.health,
            kills: this.kills,
            color: this.color,
            inventory: this.inventory.map(stack => stack ? stack.serializeForWrite() : null),
        });
    }

    /** Return an object representing this players kept data for writing to the save after they have died */
    serializeAfterKilled(): any {
        return JSON.stringify({
            dead: true,
            username: this.username,
            kills: this.kills,
            color: this.color,
        });
    }

    // #endregion
}

export default Player;