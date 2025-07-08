import Logger from "../../server/logging/logger.js";
import Component from "./component.js";
import ComponentData from "./componentData.js";
import SerializableForInit from "./serializableForInit.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Defines functionailty for a type to handle its own set of components */
class ComponentHandler<T> {
    private readonly logger: Logger;

    private components: { [key: string]: Component<T> } = {};
    private requiredComponentData: { componentdata: (new (...args: any[]) => ComponentData<any>), parent: Component<T> }[] = [];

    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.COMPONENT_HANDLER);
    }

    // #region components

    /** Builder function to add components */
    addComponent(component: Component<T>): this {
        for(const requirement of component.getRequirements()){
            if(!this.hasComponent(requirement)){
                this.logger.error("Component being added without required components beforehand");
                throw null;
            }
        }

        this.components[component.constructor.name] = component;
        component.setParent(this as unknown as T);
        return this;
    }

    /** Returns if this handler has an instance of the given component type */
    hasComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): boolean {
        return this.components[componentType.name] !== undefined;
    }

    /** Gets the component type specified if it exists */
    getComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): T2 | undefined {
        return this.components[componentType.name] as T2;
    }

    /** Removes the given component type if it exists in this handler */
    removeComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): void {
        if(this.components[componentType.name]) delete this.components[componentType.name];
    }

    /** Gets all components held in this handler */
    getAllComponents(): Component<T>[] {
        return Object.values(this.components);
    }

    // #endregion

    // #region component data

    /** Adds the requested required component data to this handler */
    addRequiredComponentData(componentdata: new (...args: any[]) => ComponentData<any>, parent: Component<T>): void {
        this.requiredComponentData.push({ componentdata: componentdata, parent: parent });
    }

    /** Returns this handlers list of required component data types */
    getRequiredComponentData(): { componentdata: (new (...args: any[]) => ComponentData<any>), parent: Component<T> }[] {
        return this.requiredComponentData;
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this objects component data for saving to the client */
    serializeComponentDataForInit(): any {
        let data: { [key: string]: any } = {};

        for(const component of Object.values(this.components)){
            const c = component as unknown as SerializableForInit;
            if(c.serializeForInit === undefined) continue;

            const serialized = c.serializeForInit();
            if(serialized === null) continue;
            data = { ...data, ...serialized };
        }

        return data;
    }

    // #endregion
}

export default ComponentHandler;