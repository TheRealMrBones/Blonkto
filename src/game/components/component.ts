/** An attachable component to add additional data and/or functionality to an object */
class Component<T> {
    parent: T | null = null;

    /** Sets the parent of this component */
    setParent(parent: T): void {
        this.parent = parent;
    }
}

export default Component;