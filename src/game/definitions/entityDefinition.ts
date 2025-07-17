import EventEmitter from "events";

import IDrop from "../items/drops/IDrop.js";
import Game from "../game.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import ComponentHandler from "../components/componentHandler.js";
import Entity from "../objects/entity.js";
import Player from "../objects/player.js";
import { Pos } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of item with its functionality and base statistics */
class EntityDefinition extends ComponentHandler<EntityDefinition> {
    readonly displayname: string;
    readonly maxhealth: number;
    readonly speed: number;
    readonly scale: number;
    readonly asset: string;
    readonly drops: IDrop | null;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(key: string, displayname: string, asset: string | null, maxhealth: number, speed: number, scale: number, drops?: IDrop){
        super(key);

        this.displayname = displayname;
        this.maxhealth = maxhealth;
        this.speed = speed;
        this.scale = scale;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;

        this.registerDeathListener((self: NonplayerEntity, game: Game) => {
            if(self.scale > 0) this.dropItems(self, game);
        });
    }

    /** Drops this entities types items on an instances death */
    dropItems(self: NonplayerEntity, game: Game): void {
        if(this.drops != null) this.drops.drop(self.x, self.y, game);
    }
    
    // #region events

    /** Registers a listener to this entity definitions event handler */
    private registerListener(event: string, listener: (self: NonplayerEntity, game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this entity definitions event handler */
    registerTickListener(listener: (self: NonplayerEntity, game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a death event listener to this entity definitions event handler */
    registerDeathListener(listener: (self: NonplayerEntity, game: Game, killedby: string, killer: any) => void): void {
        this.registerListener("death", listener);
    }

    /** Registers a collision event listener to this entity definitions event handler */
    registerCollisionListener(listener: (self: NonplayerEntity, game: Game, entity: Entity, push: Pos) => void): void {
        this.registerListener("collision", listener);
    }

    /** Registers an interact event listener to this entity definitions event handler */
    registerInteractListener(listener: (self: NonplayerEntity, game: Game, player: Player) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this entity definitions event handler with the given self entity */
    emitEvent(event: string, self: NonplayerEntity, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, self, game, ...args);
    }

    // #endregion
}

export default EntityDefinition;
