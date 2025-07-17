import Component from "../component.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import ISerializableForInit from "../ISerializableForInit.js";
import Block from "../../world/block.js";
import Game from "../../game.js";

/** A Block Component that allows the block to be opened as a light */
class LightComponent extends Component<BlockDefinition> implements ISerializableForInit {
    distance: number;

    constructor(distance: number){
        super();

        this.distance = distance;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);

        this.getParent().registerInstantiateListener((block: Block, game: Game) => this.instantiate(block, game));
        this.getParent().registerBreakListener((block: Block, game: Game) => this.break(block, game));
        this.getParent().registerUnloadListener((block: Block, game: Game) => this.unload(block, game));
    }

    /** Defines the instantiate event of the block with this component */
    instantiate(block: Block, game: Game): void {
        const keys = this.getCellKeysInRange(block);
        for(const key of keys){
            const light = game.world.light.get(key);

            if(light === undefined){
                game.world.light.set(key, 1);
            }else{
                game.world.light.set(key, light + 1);
            }
        }
    }

    /** Defines the break event of the block with this component */
    break(block: Block, game: Game): void {
        const keys = this.getCellKeysInRange(block);
        for(const key of keys){
            const light = game.world.light.get(key);
            if(light === undefined) return;

            if(light == 1) game.world.light.delete(key);
            else game.world.light.set(key, light - 1);
        }
    }

    /** Defines the unload event of the block with this component */
    unload(block: Block, game: Game): void {
        const keys = this.getCellKeysInRange(block);
        for(const key of keys){
            const light = game.world.light.get(key);
            if(light === undefined) return;

            if(light == 1) game.world.light.delete(key);
            else game.world.light.set(key, light - 1);
        }
    }

    /** Returns strings representing each cell within this light blocks range */
    private getCellKeysInRange(block: Block): string[] {
        const keys: string[] = [];
        for(let dx = -this.distance; dx <= this.distance; dx++){
            for(let dy = -this.distance; dy <= this.distance; dy++){
                if(Math.sqrt(dx * dx + dy * dy) > this.distance) continue;

                const x = block.cell.getWorldX() + dx;
                const y = block.cell.getWorldY() + dy;

                keys.push([x,y].toString());
            }
        }
        return keys;
    }

    /** Returns an object representing this light component for saving to the client */
    serializeForInit(): any {
        return {
            light: this.distance,
        };
    }
}

export default LightComponent;
