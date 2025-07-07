import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import GameObject from "../objects/gameObject.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import Player from "../objects/player.js";

import SharedConfig from "../../configs/shared.js";
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** Manages all of the ticking entities/objects for the game */
class EntityManager {
    private game: Game;

    constructor(game: Game){
        this.game = game;
    }

    // #region ticking

    /** Tick all currently loaded entities and entity spawners */
    tick(dt: number): void {
        // new spawns
        this.spawnZombies();

        // tick loaded entities
        this.getAllObjects().forEach(o => {
            o.emitTickEvent(this.game, dt);
        });
    }

    /** Spawns new zombies nearby players in the world */
    spawnZombies(): void {
        if(this.game.world.isDay()) return;

        this.getPlayerEntities().forEach(p => {
            if(Math.random() > .01) return;

            const dir = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(CELLS_HORIZONTAL * CELLS_HORIZONTAL + CELLS_VERTICAL * CELLS_VERTICAL) / 2 + 1;
            
            for(let triesdist = 0; triesdist < 5; triesdist++){
                const spawnx = p.x + Math.cos(dir) * (dist + triesdist);
                const spawny = p.y + Math.sin(dir) * (dist + triesdist);
                const cellx = Math.floor(spawnx);
                const celly = Math.floor(spawny);

                const cell = this.game.world.getCell(cellx, celly, false);
                if(cell === null) continue;
                if(cell.block !== null) continue;

                if(this.game.world.light[[cellx,celly].toString()] !== undefined) continue;

                if(Math.random() > .05){
                    const zombie = new NonplayerEntity(spawnx, spawny, 0, "zombie");
                    this.game.entities[zombie.id] = zombie;
                }else{
                    const megazombie = new NonplayerEntity(spawnx, spawny, 0, "mega_zombie");
                    this.game.entities[megazombie.id] = megazombie;
                }
                break;
            }
        });
    }

    // #endregion

    // #region getters and setters

    /** Returns all ticking objects loaded in the game world */
    getAllObjects(): GameObject[] {
        return [...Object.values(this.game.players), ...Object.values(this.game.entities), ...Object.values(this.game.objects)];
    }

    /** Returns all ticking entities loaded in the game world */
    getEntities(): Entity[] {
        return [...Object.values(this.game.players), ...Object.values(this.game.entities)];
    }

    /** Returns all ticking non-player objects loaded in the game world */
    getNonplayers(): GameObject[] {
        return [...Object.values(this.game.entities), ...Object.values(this.game.objects)];
    }

    /** Returns all non-player objects nearby the given player */
    getNonplayersNearby(player: Player): GameObject[] {
        return this.getNonplayers().filter(e => e.id != player.id
            && Math.abs(e.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < CELLS_VERTICAL / 2
        );
    }

    /** Returns all ticking non-entity objects loaded in the game world */
    getObjects(): GameObject[] {
        return Object.values(this.game.objects);
    }

    /** Returns all ticking players loaded in the game world */
    getPlayerEntities(): Player[] {
        return Object.values(this.game.players);
    }

    /** Returns all players nearby the given player */
    getPlayerEntitiesNearby(player: Player): Player[] {
        return this.getPlayerEntities().filter(p => p.id != player.id
            && Math.abs(p.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(p.y - player.y) < CELLS_VERTICAL / 2
        );
    }

    /** Returns all ticking non-player entities loaded in the game world */
    getNonplayerEntities(): NonplayerEntity[] {
        return Object.values(this.game.entities);
    }

    /** Returns all ticking dropped stacks loaded in the game world */
    getDroppedStacks(): DroppedStack[] {
        return this.getObjects().filter(o => o instanceof DroppedStack);
    }

    /** Removes and unloads the non-player object with the given id from the game world */
    removeNonplayer(id: string): void {
        delete this.game.objects[id];
        delete this.game.entities[id];
    }

    /** Removes and unloads the non-entity object with the given id from the game world */
    removeObject(id: string): void {
        delete this.game.objects[id];
    }

    /** Removes and unloads the non-player entity with the given id from the game world */
    removeEntity(id: string): void {
        delete this.game.entities[id];
    }

    /** Returns the count of all ticking objects loaded in the game world */
    getAllObjectCount(): number {
        return this.getAllObjects().length;
    }

    /** Returns the count of all ticking non-entity objects loaded in the game world */
    getObjectCount(): number {
        return this.getObjects().length;
    }

    /** Returns the count of all ticking non-player entities loaded in the game world */
    getNonplayerEntityCount(): number {
        return this.getNonplayerEntities().length;
    }

    /** Returns the count of all ticking player entities loaded in the game world */
    getPlayerEntityCount(): number {
        return this.getPlayerEntities().length;
    }
    
    // #endregion
}

export default EntityManager;