import Component from "../component.js";
import Item from "../../items/item.js";

class MineComponent implements Component<Item> {
    static cid: string = "mine_component";
    power: number;

    constructor(power: number){
        this.power = power;
    }

    getcid(): string {
        return MineComponent.cid;
    }
}

export default MineComponent;