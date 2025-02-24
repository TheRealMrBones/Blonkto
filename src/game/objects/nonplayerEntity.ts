import EntityDefinition from "../entities/entityDefinition.js";
import Game from "../game.js";
import EntityRegistry from "../registries/entityRegistry.js";
import Entity from "./entity.js";

/** The base class for non-player entities loaded in the game world */
class NonplayerEntity extends Entity {
    entitydefinition: EntityDefinition;

    constructor(x: number, y: number, dir: number, entitydefinition: string){
        super(x, y, EntityRegistry.get(entitydefinition).maxhealth, dir, EntityRegistry.get(entitydefinition).scale, EntityRegistry.get(entitydefinition).asset);

        this.entitydefinition = EntityRegistry.get(entitydefinition);

        this.eventEmitter.on("death", (killedby: string, killer: any, game: Game) => {
            game.removeEntity(this.id);
            this.entitydefinition.eventEmitter.emit("death", this, game);
        });
    }

    /** Returns the nonplayer entity from its save data */
    static readFromSave(data: any): NonplayerEntity {
        return new NonplayerEntity(data.x, data.y, data.dir, data.entitydefinition);
    }

    // #region serialization

    /** Return an object representing this nonplayer entities data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...base.static,
            },
            dynamic: {
                ...base.dynamic,
            },
        };
    }

    /** Return an object representing this nonplayer entities data for writing to the save */
    override serializeForWrite(): any {
        const base = super.serializeForWrite();
        
        return {
            ...base,
            type: "entity",
            entitydefinition: this.entitydefinition.name,
        };
    }

    // #endregion
}

export default NonplayerEntity;