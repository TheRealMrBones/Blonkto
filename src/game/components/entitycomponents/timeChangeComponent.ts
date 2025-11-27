import Component from "game/components/component.js";
import ComponentData from "game/components/componentData.js";
import ISerializableForWrite from "game/components/ISerializableForWrite.js";
import EntityDefinition from "game/definitions/entityDefinition.js";
import Game from "game/game.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";

/** A Entity Component that allows the entity to be changed after a set amount of ticks have passed */
class TimeChangeComponent extends Component<EntityDefinition> {
    private newentity: string;
    private delay: number;
    private randomdelay: number;

    constructor(newentity: string, delay: number, randomdelay?: number){
        super();
        this.newentity = newentity;
        this.delay = delay;
        this.randomdelay = randomdelay || 0;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(TimeChangeComponentData, this);

        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
    }

    /** Defines the tick action of the entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const data = self.getComponentData(TimeChangeComponentData);
        if(data.delayleft == -1) data.delayleft = this.delay + Math.round(Math.random() * this.randomdelay);

        data.delayleft--;
        if(data.delayleft == -1) data.delayleft++;

        if(data.delayleft == 0){
            game.entityManager.removeEntity(self.id);
            const newentity = new NonplayerEntity(self.layer, self.x, self.y, self.dir, this.newentity);
            self.layer.entityManager.addEntity(newentity);
        }
    }
}

class TimeChangeComponentData extends ComponentData<TimeChangeComponent> implements ISerializableForWrite {
    delayleft: number = -1;

    /** Sets this time change component data objects values with the given save data */
    readFromSave(data: SerializedWriteTimeChangeComponent): void {
        this.delayleft = data.delayleft;
    }

    /** Returns an object representing this time change component data for writing to the save */
    serializeForWrite(): SerializedWriteTimeChangeComponent {
        return {
            delayleft: this.delayleft,
        };
    }
}

/** Defines the format for serialized writes of a time change component */
type SerializedWriteTimeChangeComponent = {
    delayleft: number;
};

export default TimeChangeComponent;
