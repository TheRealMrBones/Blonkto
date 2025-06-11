import Logger from "../../server/logging/logger";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** An attachable component to add additional data and/or functionality to an object */
class Component<T> {
    private logger: Logger;

    private parent: T | null = null;
    private requirements: (new (...args: any[]) => Component<T>)[] = [];

    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.COMPONENT_HANDLER);
    }

    /** Sets the parent of this component */
    setParent(parent: T): void {
        if(this.parent !== null){
            this.logger.error("Cannot set component parent more than once");
            throw null;
        }

        this.parent = parent;
    }

    //** Returns the parent of this component */
    protected getParent(): T {
        if(this.parent === null){
            this.logger.error("Cannot access parent before component is initialized");
            throw null;
        }

        return this.parent;
    }

    /** Sets the requirements of this component */
    protected setRequirements(requirements: (new (...args: any[]) => Component<T>)[]): void {
        if(this.requirements.length > 0){
            this.logger.error("Cannot set component requirements more than once");
            throw null;
        }

        this.requirements = requirements;
    }

    //** Returns the requirements of this component */
    getRequirements(): (new (...args: any[]) => Component<T>)[] {
        return this.requirements;
    }
}

export default Component;