import Component from "../component.js";
import Item from "../../items/item.js";

/** An Item Component that alows the item to be used to place blocks */
class BuildComponent extends Component<Item> {
    block: string;

    constructor(block: string){
        super();
        this.block = block;
    }
}

export default BuildComponent;