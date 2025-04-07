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
    speed: number;
    scale: number;
    asset: string;
    drops: DropBase | null;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, maxhealth: number, speed: number, scale: number, drops?: DropBase){
        super();
        this.displayname = displayname;
        this.maxhealth = maxhealth;
        this.speed = speed;
        this.scale = scale;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;

        this.eventEmitter.on("death", (entity: NonplayerEntity, game: Game) => {
            if(entity.scale > 0) this.dropItems(entity, game);
        });
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** Drops this entities types items on an instances death */
    dropItems(entity: NonplayerEntity, game: Game): void {
        if(this.drops != null) this.drops.drop(entity.x, entity.y, game);
    }
}

export default EntityDefinition;