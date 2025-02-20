import EventEmitter from "events";

import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of item with its functionality and base statistics */
class EntityDefinition extends ComponentHandler<EntityDefinition> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    maxhealth: number;
    scale: number = 1;
    asset: string = ASSETS.MISSING_TEXTURE;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, maxhealth: number, scale: number | null){
        super();
        this.displayname = displayname;
        this.maxhealth = maxhealth;
        if(scale != null) this.scale = scale;
        if(asset != null) this.asset = asset;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }
}

export default EntityDefinition;