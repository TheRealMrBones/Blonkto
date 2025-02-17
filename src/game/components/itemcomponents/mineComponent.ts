import Component from "../component.js";
import Item from "../../items/item.js";

/** An Item Component that alows the item to be used to mine/destroy blocks */
class MineComponent extends Component<Item> {
    power: number;

    constructor(power: number){
        super();
        this.power = power;
    }
}

export default MineComponent;