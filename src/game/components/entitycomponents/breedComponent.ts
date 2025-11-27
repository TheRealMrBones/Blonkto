import Component from "game/components/component.js";
import ComponentData from "game/components/componentData.js";
import MoveTargetComponent, { MoveTargetComponentData } from "game/components/entitycomponents/moveTargetComponent.js";
import ISerializableForWrite from "game/components/ISerializableForWrite.js";
import EntityDefinition from "game/definitions/entityDefinition.js";
import Game from "game/game.js";
import Entity from "game/objects/entity.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import Player from "game/objects/player.js";
import Constants from "shared/constants.js";
import { Vector2D } from "shared/types.js";

const { GAME_MODES } = Constants;

/** An Entity Component that makes this entity type breed with others when fed */
class BreedComponent extends Component<EntityDefinition> {
    private food: string;
    private newentity: string;
    private distance: number;
    private delay: number;
    private breedtime: number;
    private fedtime: number;

    constructor(food: string, newentity: string, distance?: number, delay?: number, fedtime?: number, breedtime?: number) {
        super();
        this.setRequirements([MoveTargetComponent]);

        this.food = food;
        this.newentity = newentity;
        this.distance = distance || 10;
        this.delay = delay || 18000;
        this.fedtime = fedtime || 10000;
        this.breedtime = breedtime || 1000;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(BreedComponentData, this);

        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
        this.getParent().registerCollisionListener((self: NonplayerEntity, game: Game, entity: Entity, push: Vector2D) => this.breed(self, game, entity, push));
        this.getParent().registerInteractListener((self: NonplayerEntity, game: Game, player: Player) => this.feed(self, game, player));
    }

    /** Defines the feed action of an entity with this component after getting an interaction from a player */
    feed(self: NonplayerEntity, game: Game, player: Player): void {
        const data = self.getComponentData(BreedComponentData);

        if(Date.now() - data.lastfed < this.fedtime || data.breedstart > 0 || data.target !== null || data.delayticks > 0) return;

        const hotbarItem = player.getCurrentItem();
        if(hotbarItem === null) return;
        if(hotbarItem.definition.key != this.food) return;

        data.lastfed = Date.now();
        if(player.getGamemode() != GAME_MODES.CREATIVE) player.removeFromCurrentSlot(1);
        player.setImmediateAction(true);

        // look for target
        for(const entity of self.layer.entityManager.getNonplayerEntities()){
            if(entity.definition.key !== self.definition.key) continue;
            if(self.distanceTo([entity.x, entity.y]) > this.distance) continue;
            if(entity === self) continue;

            const otherdata = entity.getComponentData(BreedComponentData);
            if(data.lastfed > 0 && Date.now() - data.lastfed < this.fedtime && otherdata.lastfed > 0 && Date.now() - otherdata.lastfed < this.fedtime && otherdata.target === null){
                data.target = entity;
                otherdata.target = self;
                break;
            }
        }
    }

    /** Defines the breed action of an entity with this component after colliding with another entity */
    breed(self: NonplayerEntity, game: Game, entity: Entity, push: Vector2D): void {
        const data = self.getComponentData(BreedComponentData);

        if(data.target === entity && data.breedstart == 0)
            data.breedstart = Date.now();
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const data = self.getComponentData(BreedComponentData);
        const targetdata = self.getComponentData(MoveTargetComponentData);

        // do breed time stuff
        if(data.breedstart > 0 && Date.now() - data.breedstart > this.breedtime && data.target !== null){
            const x = (self.x + data.target.x) / 2;
            const y = (self.y + data.target.y) / 2;
            const newentity = new NonplayerEntity(self.layer, x, y, 0, this.newentity);
            self.layer.entityManager.addEntity(newentity);

            const otherdata = data.target.getComponentData(BreedComponentData);
            const othertargetdata = data.target.getComponentData(MoveTargetComponentData);
            data.reset(this.delay);
            otherdata.reset(this.delay);
            targetdata.clearQueue();
            othertargetdata.clearQueue();
        }

        data.delayticks--;
        if(data.delayticks < 0) data.delayticks++;

        // do target stuff
        const target = data.target;
        if(target === null) return;

        if(self.distanceTo([target.x, target.y]) >= this.distance * 2){
            targetdata.clearQueue();
            data.target = null;
            return;
        }

        targetdata.setQueue(5, [this.getRunPosition(target)]);
    }

    /** Returns a new run target postion given the current target */
    getRunPosition(target: Entity): Vector2D {
        return [target.x, target.y];
    }
}

class BreedComponentData extends ComponentData<BreedComponent> implements ISerializableForWrite {
    lastfed: number = 0;
    target: NonplayerEntity | null = null;
    breedstart: number = 0;
    delayticks: number = 0;

    /** Sets this breed component data objects values with the given save data */
    readFromSave(data: SerializedWriteBreedComponent): void {
        this.delayticks = data.delayticks;
    }

    /** Returns an object representing this breed component data for writing to the save */
    serializeForWrite(): SerializedWriteBreedComponent {
        return {
            delayticks: this.delayticks,
        };
    }

    /** Resets after successful breed */
    reset(delayticks: number): void {
        this.lastfed = 0;
        this.target = null;
        this.breedstart = 0;
        this.delayticks = delayticks;
    }
}

/** Defines the format for serialized writes of a breed component */
type SerializedWriteBreedComponent = {
    delayticks: number;
};

export default BreedComponent;
