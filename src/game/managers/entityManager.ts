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
    private readonly game: Game;

    readonly objects: Map<string, GameObject> = new Map<string, GameObject>();
    readonly nonplayerentities: Map<string, NonplayerEntity> = new Map<string, NonplayerEntity>();
    readonly players: Map<string, Player> = new Map<string, Player>();
    
    private readonly allobjects: CombinedMapIterator<GameObject> = new CombinedMapIterator<GameObject>([this.objects, this.nonplayerentities, this.players]);
    private readonly entities: CombinedMapIterator<Entity> = new CombinedMapIterator<Entity>([this.nonplayerentities, this.players]);
    private readonly nonplayers: CombinedMapIterator<GameObject> = new CombinedMapIterator<GameObject>([this.objects, this.nonplayerentities]);

    constructor(game: Game){
        this.game = game;
    }

    // #region ticking

    /** Tick all currently loaded entities and entity spawners */
    tick(dt: number): void {
        // new spawns
        this.spawnZombies();

        // tick loaded entities
        for(const o of this.getAllObjects()){
            o.emitTickEvent(this.game, dt);
        }
    }

    /** Spawns new zombies nearby players in the world */
    spawnZombies(): void {
        if(this.game.world.isDay()) return;

        for(const p of this.getPlayerEntities()){
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

                if(this.game.world.light.get([cellx,celly].toString()) !== undefined) continue;

                if(Math.random() > .05){
                    const zombie = new NonplayerEntity(spawnx, spawny, 0, "zombie");
                    this.nonplayerentities.set(zombie.id, zombie);
                }else{
                    const megazombie = new NonplayerEntity(spawnx, spawny, 0, "mega_zombie");
                    this.nonplayerentities.set(megazombie.id, megazombie);
                }
                break;
            }
        }
    }

    // #endregion

    // #region getters and setters

    /** Returns all ticking objects loaded in the game world */
    getAllObjects(): CombinedMapIterator<GameObject> {
        return this.allobjects;
    }

    /** Returns all ticking entities loaded in the game world */
    getEntities(): CombinedMapIterator<Entity> {
        return this.entities;
    }

    /** Returns all ticking non-player objects loaded in the game world */
    getNonplayers(): CombinedMapIterator<GameObject> {
        return this.nonplayers;
    }

    /** Returns all ticking non-entity objects loaded in the game world */
    getObjects(): MapIterator<GameObject> {
        return this.objects.values();
    }

    /** Returns all ticking players loaded in the game world */
    getPlayerEntities(): MapIterator<Player> {
        return this.players.values();
    }

    /** Returns all ticking non-player entities loaded in the game world */
    getNonplayerEntities(): MapIterator<NonplayerEntity> {
        return this.nonplayerentities.values();
    }

    /** Returns all ticking dropped stacks loaded in the game world */
    getDroppedStacks(): DroppedStack[] {
        return [...this.getObjects()].filter(o => o instanceof DroppedStack);
    }

    /** Removes and unloads the non-player object with the given id from the game world */
    removeNonplayer(id: string): void {
        this.objects.delete(id);
        this.nonplayerentities.delete(id);
    }

    /** Removes and unloads the non-entity object with the given id from the game world */
    removeObject(id: string): void {
        this.objects.delete(id);
    }

    /** Removes and unloads the non-player entity with the given id from the game world */
    removeEntity(id: string): void {
        this.nonplayerentities.delete(id);
    }

    /** Returns the count of all ticking objects loaded in the game world */
    getAllObjectCount(): number {
        return this.objects.size + this.nonplayerentities.size + this.players.size;
    }

    /** Returns the count of all ticking non-entity objects loaded in the game world */
    getObjectCount(): number {
        return this.objects.size;
    }

    /** Returns the count of all ticking non-player entities loaded in the game world */
    getNonplayerEntityCount(): number {
        return this.nonplayerentities.size;
    }

    /** Returns the count of all ticking player entities loaded in the game world */
    getPlayerEntityCount(): number {
        return this.players.size;
    }
    
    // #endregion

    // #region helpers

    /** Returns the filtered list of gameobjects to only those nearby the given player */
    filterToNearby<T extends GameObject>(player: Player, objects: T[]): T[] {
        return objects.filter(e => e.id != player.id
            && Math.abs(e.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < CELLS_VERTICAL / 2
        );
    }

    // #endregion
}

/** Iterator class for combined MapIterators of multiple Maps values */
class CombinedMapIterator<T> {
    private readonly maps: Map<any, T>[];

    constructor(maps: Map<any, T>[]) {
        this.maps = maps;
    }

    *[Symbol.iterator](): Iterator<T> {
        for(let m = 0; m < this.maps.length; m++){
            const map = this.maps[m];
            
            for(const v of map.values()){
                yield v;
            }
        }
    }
}

export default EntityManager;
