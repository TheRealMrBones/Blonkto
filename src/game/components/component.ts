/** An attachable component to add additional data and/or functionality to an object */
class Component<T> {
    parent: T | null = null;
}

export default Component;