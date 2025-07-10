import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import EntityDefinition from "../definitions/entityDefinition.js";
import Game from "../game.js";
import EntityRegistry from "../registries/entityRegistry.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import Entity from "./entity.js";

/** The base class for non-player entities loaded in the game world */
class NonplayerEntity extends Entity implements IRegistryDefinedWithComponents<EntityDefinition> {
    readonly definition: EntityDefinition;
    readonly componentdata: { [key: string]: ComponentData<any> } = {};

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
            this.componentdata[c.componentdata.name] = new c.componentdata(c.parent);
        });
    }

    /** Loads this entities required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata[componentdataloaded[0]] as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this entities instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Returns an object representing this entities component data for a game update to the client */
    serializeComponentDataForUpdate(): any {
        const data = {
            static: {},
            dynamic: {},
        };

        for(const componentdata of Object.values(this.componentdata)){
            const cd = componentdata as unknown as ISerializableForUpdate;
            if(cd.serializeForUpdate === undefined) continue;

            const serialized = cd.serializeForUpdate();
            if(serialized === null) continue;
            data.static = { ...data.static, ...serialized.static };
            data.dynamic = { ...data.dynamic, ...serialized.dynamic };
        }

        return data;
    }

    /** Returns an object representing this entities component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of Object.entries(this.componentdata)){
            const cd = componentdata[1] as unknown as ISerializableForWrite;
            if(cd.serializeForWrite === undefined) continue;

            const serialized = cd.serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion

    // #region events

    /** Emits an event to this objects event handler */
    protected override emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        super.emitEvent(event, game, ...args);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this nonplayer entities data for a game update to the client */
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

    /** Returns an object representing this nonplayer entities data for writing to the save */
    override serializeForWrite(): any {
        const base = super.serializeForWrite();
        const componentdata = this.serializeComponentDataForWrite();
        
        const returnobj = {
            ...base,
            type: "entity",
            entitydefinition: this.definition.getRegistryKey(),
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion
}

export default NonplayerEntity;