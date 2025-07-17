import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import EntityDefinition from "../definitions/entityDefinition.js";
import Game from "../game.js";
import EntityRegistry from "../registries/entityRegistry.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import Entity from "./entity.js";
import { Pos } from "../../shared/types.js";
import Player from "./player.js";

/** The base class for non-player entities loaded in the game world */
class NonplayerEntity extends Entity implements IRegistryDefinedWithComponents<EntityDefinition> {
    readonly definition: EntityDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();

    constructor(x: number, y: number, dir: number, entitydefinition: string){
        super(x, y, EntityRegistry.get(entitydefinition).maxhealth, dir, EntityRegistry.get(entitydefinition).scale, EntityRegistry.get(entitydefinition).asset);

        this.definition = EntityRegistry.get(entitydefinition);
        this.initComponentData();

        this.basespeed = this.definition.speed;
    }

    /** Returns the nonplayer entity from its save data */
    static readFromSave(data: any): NonplayerEntity {
        const entity = new NonplayerEntity(data.x, data.y, data.dir, data.entitydefinition);
        entity.loadComponentData(data.componentdata);
        return entity;
    }

    // #region events

    /** Emits a tick event to this object */
    override emitTickEvent(game: Game, dt: number): void {
        super.emitTickEvent(game, dt);
        this.definition.emitEvent("tick", this, game, dt);
    }

    /** Emits a death event to this object */
    override emitDeathEvent(game: Game, killedby: string, killer: any): void {
        super.emitDeathEvent(game, killedby, killer);
        this.definition.emitEvent("death", this, game, killedby, killer);

        game.entityManager.removeEntity(this.id);
    }

    /** Emits a collision event to this object */
    override emitCollisionEvent(game: Game, entity: Entity, push: Pos): void {
        super.emitCollisionEvent(game, entity, push);
        this.definition.emitEvent("collision", this, game, entity, push);
    }

    /** Emits an interact event to this object */
    override emitInteractEvent(game: Game, player: Player): void {
        super.emitInteractEvent(game, player);
        this.definition.emitEvent("interact", this, game, player);
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

    // #region component helpers

    /** Returns this entities instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata.get(componentDataType.name) as T2;
    }

    /** Initializes this entities required component data instances */
    private initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata.set(c.componentdata.name, new c.componentdata(c.parent));
        });
    }

    /** Loads this entities required component data instances with the given data */
    private loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata.get(componentdataloaded[0]) as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns an object representing this entities component data for a game update to the client */
    private serializeComponentDataForUpdate(): any {
        const data = {
            static: {},
            dynamic: {},
        };

        for(const componentdata of this.componentdata.values()){
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
    private serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of this.componentdata.entries()){
            const cd = componentdata[1] as unknown as ISerializableForWrite;
            if(cd.serializeForWrite === undefined) continue;

            const serialized = cd.serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion
}

export default NonplayerEntity;
