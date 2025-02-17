import EventEmitter from "events";

import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import ItemStack from "./itemStack.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of items functionality and base statistics */
class Item implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    stacksize: number;
    asset: string = ASSETS.MISSING_TEXTURE;

    eventEmitter: EventEmitter = new EventEmitter();
    componentHandler: ComponentHandler<Item> = new ComponentHandler<Item>(this);

    constructor(displayname: string, stacksize: number, asset: string | null){
        this.displayname = displayname;
        this.stacksize = stacksize;
        if(asset != null) this.asset = asset;
    }

    /** Value used to map this item to the item registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** The base functionality of using (left clicking) this item */
    use(game: Game, itemStack: ItemStack): void{
        if(this.eventEmitter.listenerCount("use") == 0){
            // a
        }
    }
}

export default Item;