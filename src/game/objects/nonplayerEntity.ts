import Entity from "./entity.js";

class NonplayerEntity extends Entity {
    constructor(x: number, y: number, dir: number){
        super(x, y, dir);
    }

    // #region serialization

    /** Return an object representing this nonplayer entities data for a game update to the client */
    serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...base.static,
            },
            dynamic: {
                ...base.dynamic,
            },
        };
    }

    /** Return an object representing this nonplayer entities data for writing to the save */
    serializeForWrite(): any {
        const base = super.serializeForWrite();
        
        return {
            ...base,
            type: "entity",
        };
    }

    // #endregion
}

export default NonplayerEntity;