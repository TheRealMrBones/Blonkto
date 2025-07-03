import Component from "../component.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import ComponentData from "../componentData.js";
import SerializableForUpdate from "../serializableForUpdate.js";
import Block from "../../world/block.js";
import Game from "../../game.js";

/** A Block Component that allows the block to be opened as a light */
class LightComponent extends Component<BlockDefinition> {
    distance: number;

    constructor(distance: number){
        super();

        this.distance = distance;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(LightComponentData, this);

        this.getParent().registerInstantiateListener((block: Block, game: Game) => this.instantiate(block, game));
    }

    /** Defines the instantiate event of the block with this component */
    instantiate(block: Block, game: Game): void {
        for(let dx = -this.distance; dx <= this.distance; dx++){
            for(let dy = -this.distance; dy <= this.distance; dy++){
                if(Math.sqrt(dx * dx + dy * dy) > this.distance) continue;

                const x = block.cell.getWorldX() + dx;
                const y = block.cell.getWorldY() + dy;

                const key = [x,y].toString();
                if(game.world.light[key] === undefined){
                    game.world.light[key] = 1;
                }else{
                    game.world.light[key] += 1;
                }
            }
        }
    }
}

class LightComponentData extends ComponentData<LightComponent> implements SerializableForUpdate {
    /** Returns an object representing this light component data for a game update to the client */
    serializeForUpdate(): any {
        return {
            light: this.parent.distance,
        };
    }
}

export default LightComponent;