import ItemStack from '../items/itemStack';
import GameObject from './object';

class DroppedStack extends GameObject {
    itemStack: ItemStack;

    constructor(x: number, y: number, itemStack: ItemStack){
        super(x, y, undefined, .5);

        this.itemStack = itemStack;
        this.asset = itemStack.item.asset;
    }
}

export default DroppedStack;