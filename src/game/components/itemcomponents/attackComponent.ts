import Component from "../component.js";
import Item from "../../items/item.js";

/** An Item Component that alows the item to be used to attack entities */
class AttackComponent extends Component<Item> {
    damage: number;

    constructor(damage: number){
        super();
        this.damage = damage;
    }
}

export default AttackComponent;