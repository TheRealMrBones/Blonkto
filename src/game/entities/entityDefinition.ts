import EventEmitter from "events";

import DropBase from "../items/dropBase.js";
import Game from "../game.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
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
    drops: DropBase | null = null;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, maxhealth: number, scale: number | null, drops?: DropBase){
        super();
        this.displayname = displayname;
        this.maxhealth = maxhealth;
        if(scale != null) this.scale = scale;
        if(asset != null) this.asset = asset;
        if(drops !== undefined) this.drops = drops;

        this.eventEmitter.on("death", (entity: NonplayerEntity, game: Game) => {
            if(entity.scale > 0) this.dropItems(entity.x, entity.y, game);
        });
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** Drops this entities types items on an instances death */
    dropItems(x: number, y: number, game: Game): void {
        if(this.drops != null) this.drops.drop(x, y, game);
    }
}

export default EntityDefinition;