import Component from "./component.js";

class ComponentHandler<T> {
    private components: Component<T>[] = [];
    parent: T;

    constructor(parent: T){
        this.parent = parent;
    }

    addComponent(component: Component<T>): T{
        // Remove component if already exists
        if(this.hasComponent(component.getcid()))
            this.removeComponent(component.getcid());

        this.components.push(component);
        return this.parent;
    }

    removeComponent(cid: string){
        this.components.filter(c => !(c.getcid() == cid));
    }

    hasComponent(cid: string): boolean {
        return this.components.some(c => c.getcid() == cid);
    }

    getComponent(cid: string): any{
        return this.components.find(c => c.getcid() == cid);
    }
}

export default ComponentHandler;