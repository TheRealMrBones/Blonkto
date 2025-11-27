import Component from "game/components/component.js";
import ComponentData from "game/components/componentData.js";
import ISerializableForWrite from "game/components/ISerializableForWrite.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import Block from "game/world/block.js";

/** A Block Component that allows the block to be changed after a set amount of ticks have passed */
class TimeChangeComponent extends Component<BlockDefinition> {
    private newblock: string;
    private cancollide: boolean;
    private delay: number;
    private randomdelay: number;

    constructor(newblock: string, delay: number, randomdelay?: number, cancollide?: boolean){
        super();
        this.newblock = newblock;
        this.delay = delay;
        this.randomdelay = randomdelay || 0;
        this.cancollide = cancollide || false;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(TimeChangeComponentData, this);

        this.getParent().registerTickListener((block: Block, game: Game, dt: number) => this.tick(block, game, dt));
    }

    /** Defines the tick action of the block with this component */
    tick(block: Block, game: Game, dt: number): void {
        const data = block.getComponentData(TimeChangeComponentData);
        if(data.delayleft == -1) data.delayleft = this.delay + Math.round(Math.random() * this.randomdelay);

        data.delayleft--;
        if(data.delayleft == -1) data.delayleft++;

        if(!this.cancollide){
            for(const object of block.cell.chunk.layer.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t[0] == block.cell.getWorldX() && t[1] == block.cell.getWorldY())) return;
            }
        }

        if(data.delayleft == 0)
            block.cell.setBlock(this.newblock, game);
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
