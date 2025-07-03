import Component from "../component.js";
import Game from "../../game.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import ComponentData from "../componentData.js";
import SerializableForWrite from "../../serialization/serializableForWrite.js";

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
            for(const object of game.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t.x == block.cell.getWorldX() && t.y == block.cell.getWorldY())) return;
            }
        }

        if(data.delayleft == 0)
            game.world.setBlock(block.cell.getWorldX(), block.cell.getWorldY(), this.newblock);
    }
}

class TimeChangeComponentData extends ComponentData<TimeChangeComponent> implements SerializableForWrite {
    delayleft: number = -1;

    /** Sets this time change component data objects values with the given save data */
    readFromSave(data: any): void {
        this.delayleft = data.delayleft;
    }

    /** Returns an object representing this time change component data for writing to the save */
    serializeForWrite(): any {
        return {
            delayleft: this.delayleft,
        };
    }
}

export default TimeChangeComponent;