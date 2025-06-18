import ComponentData from "../components/componentData.js";
import RegistryDefinedWithComponents from "../components/registryDefinedWithComponents.js";
import EntityDefinition from "../entities/entityDefinition.js";
import Game from "../game.js";
import EntityRegistry from "../registries/entityRegistry.js";
import Entity from "./entity.js";

/** The base class for non-player entities loaded in the game world */
class NonplayerEntity extends Entity implements RegistryDefinedWithComponents<EntityDefinition> {
    readonly definition: EntityDefinition;
    readonly componentdata: { [key: string]: ComponentData } = {};

    constructor(x: number, y: number, dir: number, entitydefinition: string){
        super(x, y, EntityRegistry.get(entitydefinition).maxhealth, dir, EntityRegistry.get(entitydefinition).scale, EntityRegistry.get(entitydefinition).asset);

        this.definition = EntityRegistry.get(entitydefinition);
        this.initComponentData();

        this.basespeed = this.definition.speed;

        this.registerDeathListener((game: Game, killedby: string, killer: any) => {
            game.entityManager.removeEntity(this.id);
        });
    }

    /** Returns the nonplayer entity from its save data */
    static readFromSave(data: any): NonplayerEntity {
        const entity = new NonplayerEntity(data.x, data.y, data.dir, data.entitydefinition);
        entity.loadComponentData(data.componentdata);
        return entity;
    }

    // #region component helpers

    /** Initializes this entities required component data instances */
    initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata[c.name] = new c();
        });
    }

    /** Loads this objects required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            this.componentdata[componentdataloaded[0]].readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this entities instance of the requested component data */
    getComponentData<T2 extends ComponentData>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Return an object representing this entities component data for a game update to the client */
    serializeComponentDataForUpdate(): any {
        const data = {
            static: {},
            dynamic: {},
        };

        for(const componentdata of Object.values(this.componentdata)){
            const serialized = componentdata.serializeForUpdate();
            if(serialized === null) continue;
            data.static = { ...data.static, ...serialized.static };
            data.dynamic = { ...data.dynamic, ...serialized.dynamic };
        }

        return data;
    }

    /** Return an object representing this entities component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of Object.entries(this.componentdata)){
            const serialized = componentdata[1].serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion

    // #region events

    /** Emits an event to this objects event handler */
    protected override emitEvent(event: string, ...args: any[]): void {
        this.definition.emitEvent(event, this, ...args);
        super.emitEvent(event, ...args);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this nonplayer entities data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            static: {
                ...base.static,
                ...componentdata.static,
            },
            dynamic: {
                ...base.dynamic,
                ...componentdata.dynamic,
            },
        };
    }

    /** Return an object representing this nonplayer entities data for writing to the save */
    override serializeForWrite(): any {
        const base = super.serializeForWrite();
        const componentdata = this.serializeComponentDataForWrite();
        
        return {
            ...base,
            componentdata: componentdata,
            type: "entity",
            entitydefinition: this.definition.name,
        };
    }

    // #endregion
}

export default NonplayerEntity;