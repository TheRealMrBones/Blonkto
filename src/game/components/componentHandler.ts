import Component from "./component.js";

/** A place to manage and interact with a list of components */
class ComponentHandler<T> {
    private components: { [key: string]: Component<T> } = {};
    parent: T;

    constructor(parent: T){
        this.parent = parent;
    }

    /** Builder function to add components */
    addComponent(component: Component<T>): ComponentHandler<T> {
        this.components[component.constructor.name] = component;
        component.parent = this.parent;
        return this;
    }

    /** Returns the parents (aka finish building stack) */
    finishBuilding(): T {
        return this.parent;
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
        if (this.components[componentType.name]) {
            delete this.components[componentType.name];
        }
    }

    /** Gets all components held in this handler */
    getAllComponents(): Component<T>[] {
        return Object.values(this.components);
    }
}

export default ComponentHandler;