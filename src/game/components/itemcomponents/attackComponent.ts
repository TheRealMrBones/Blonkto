import Component from "../component.js";
import Item from "../../items/item.js";

class AttackComponent implements Component<Item> {
    static cid: string = "attack_component";
    damage: number;

    constructor(damage: number){
        this.damage = damage;
    }

    getcid(): string {
        return AttackComponent.cid;
    }
}

export default AttackComponent;