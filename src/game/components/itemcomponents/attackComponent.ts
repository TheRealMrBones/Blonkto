import Component from "../component";
import Item from "../../items/item";

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