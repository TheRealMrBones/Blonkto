import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import GameObject from "../objects/gameObject.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import Player from "../objects/player.js";

/** Manages all of the ticking entities/objects for the game */
class EntityManager {
    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    // #region basic getters and setters

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

    /** Returns all ticking non-entity objects loaded in the game world */
    getObjects(): GameObject[] {
        return Object.values(this.game.objects);
    }

    /** Returns all ticking players loaded in the game world */
    getPlayerEntities(): Player[] {
        return Object.values(this.game.players);
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