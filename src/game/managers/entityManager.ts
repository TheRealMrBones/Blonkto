import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import GameObject from "../objects/gameObject.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import Player from "../objects/player.js";
import { Pos } from "../../shared/types.js";

import SharedConfig from "../../configs/shared.js";
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** Manages all of the ticking entities/objects for the game */
class EntityManager {
    private readonly game: Game;

    private readonly parent: EntityManager | null;
    private readonly children: EntityManager[] = [];

    private readonly objects: Map<string, GameObject> = new Map<string, GameObject>();
    private readonly nonplayerentities: Map<string, NonplayerEntity> = new Map<string, NonplayerEntity>();
    private readonly players: Map<string, Player> = new Map<string, Player>();

    private readonly allobjects: CombinedMapIterator<GameObject> = new CombinedMapIterator<GameObject>([this.objects, this.nonplayerentities, this.players]);
    private readonly entities: CombinedMapIterator<Entity> = new CombinedMapIterator<Entity>([this.nonplayerentities, this.players]);
    private readonly nonplayers: CombinedMapIterator<GameObject> = new CombinedMapIterator<GameObject>([this.objects, this.nonplayerentities]);

    constructor(game: Game, parent?: EntityManager){
        this.game = game;

        this.parent = parent || null;
    }

    // #region children

    /** Adds a child EntityManager to this manager */
    addChild(child: EntityManager): void {
        this.children.push(child);
    }

    // #endregion

    // #region ticking

    /** Tick all currently loaded entities */
    tick(dt: number): void {
        for(const o of this.getAllObjects()){
            o.emitTickEvent(this.game, dt);
        }
    }

    // #endregion

    // #region getters

    /** Returns the requested object if it exists */
    getObject(id: string): GameObject | undefined {
        return this.objects.get(id);
    }

    /** Returns the requested non-player entity if it exists */
    getEntity(id: string): NonplayerEntity | undefined {
        return this.nonplayerentities.get(id);
    }

    /** Returns the requested player if it exists */
    getPlayer(id: string): Player | undefined {
        return this.players.get(id);
    }

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

    // #region setters

    /** Adds the given object to the game world */
    addObject(object: GameObject): void {
        this.objects.set(object.id, object);

        if(this.parent !== null) this.parent.addObject(object);
    }

    /** Adds the given non-player entity to the game world */
    addEntity(entity: NonplayerEntity): void {
        this.nonplayerentities.set(entity.id, entity);

        if(this.parent !== null) this.parent.addEntity(entity);
    }

    /** Adds the given player to the game world */
    addPlayer(player: Player): void {
        this.players.set(player.id, player);

        if(this.parent !== null) this.parent.addPlayer(player);
    }

    /** Removes and unloads the non-player object with the given id from the game world */
    removeNonplayer(id: string): void {
        this.objects.delete(id);
        this.nonplayerentities.delete(id);

        for(const child of this.children){
            child.removeNonplayer(id);
        }
    }

    /** Removes and unloads the non-entity object with the given id from the game world */
    removeObject(id: string): void {
        this.objects.delete(id);

        for(const child of this.children){
            child.removeObject(id);
        }
    }

    /** Removes and unloads the non-player entity with the given id from the game world */
    removeEntity(id: string): void {
        this.nonplayerentities.delete(id);

        for(const child of this.children){
            child.removeEntity(id);
        }
    }

    /** Removes and unloads the player object with the given id from the game world */
    removePlayer(id: string): void {
        this.players.delete(id);

        for(const child of this.children){
            child.removePlayer(id);
        }
    }

    // #endregion

    // #region helpers

    /** Returns the filtered list of gameobjects to only those nearby the given player */
    static filterToNearby<T extends GameObject>(player: Player, objects: T[]): T[] {
        return objects.filter(e => e.id != player.id
            && Math.abs(e.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < CELLS_VERTICAL / 2
        );
    }

    /** Returns the filtered list of gameobjects to only those in the given chunk */
    static filterToChunk<T extends GameObject>(chunk: Pos, objects: T[]): T[] {
        return objects.filter(o =>
            o.getChunk().x == chunk.x &&
            o.getChunk().y == chunk.y
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
