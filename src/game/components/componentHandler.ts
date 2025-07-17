import Logger from "../../server/logging/logger.js";
import Component from "./component.js";
import ComponentData from "./componentData.js";
import ISerializableForInit from "./ISerializableForInit.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Defines functionality for a type to handle its own set of components */
class ComponentHandler<T> {
    private readonly logger: Logger;

    private components: Map<string, Component<T>> = new Map<string, Component<T>>();
    private requiredComponentData: { componentdata: (new (...args: any[]) => ComponentData<any>), parent: Component<T> }[] = [];

    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.COMPONENT_HANDLER);
    }

    // #region components

    /** Builder function to add components */
    addComponent(component: Component<T>): this {
        if(component.getRequirements().some(r => !this.hasComponent(r))){
            this.logger.error("Component being added without required components beforehand");
            throw null;
        }

        if(this.components.has(component.constructor.name)){
            this.logger.error("This component type is already used in this handler");
            throw null;
        }

        this.components.set(component.constructor.name, component);
        component.setParent(this as unknown as T);
        return this;
    }

    /** Returns if this handler has an instance of the given component type */
    hasComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): boolean {
        return this.components.has(componentType.name);
    }

    /** Gets the component type specified if it exists */
    getComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): T2 | undefined {
        return this.components.get(componentType.name) as T2;
    }

    /** Removes the given component type if it exists in this handler */
    removeComponent<T2 extends Component<T>>(componentType: new (...args: any[]) => T2): void {
        this.components.delete(componentType.name);
    }

    /** Gets all components held in this handler */
    getAllComponents(): Component<T>[] {
        return [...this.components.values()];
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

    /** Returns an object representing this objects component for saving to the client */
    serializeComponentsForInit(): any {
        let data: { [key: string]: any } = {};

        for(const component of this.components.values()){
            const c = component as unknown as ISerializableForInit;
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
