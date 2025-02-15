import ItemStack from "../items/itemStack";
import GameObject from "./object";

class DroppedStack extends GameObject {
    itemStack: ItemStack;

    constructor(x: number, y: number, itemStack: ItemStack){
        super(x, y, undefined, .5);

        this.itemStack = itemStack;
        this.asset = itemStack.item.asset;
    }

    static getDroppedWithSpread(x: number, y: number, itemStack: ItemStack, spread: number){
        const angle = Math.random() * 2 * Math.PI;
        const magnitude = Math.random() * spread;

        const xmovement = Math.cos(angle) * magnitude;
        const ymovement = Math.sin(angle) * magnitude;

        return new DroppedStack(x + xmovement, y + ymovement, itemStack);
    }
}

export default DroppedStack;