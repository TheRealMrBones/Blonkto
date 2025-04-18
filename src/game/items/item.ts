import EventEmitter from "events";

import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import ItemStack from "./itemStack.js";
import Player from "../objects/player.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of item with its functionality and base statistics */
class Item extends ComponentHandler<Item> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    stacksize: number;
    asset: string;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, stacksize: number, asset: string | null){
        super();
        this.displayname = displayname;
        this.stacksize = stacksize;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }
}

export default Item;