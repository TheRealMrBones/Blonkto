import StoneBlockItem from './stoneBlockItem.js';
import PickaxeItem from './pickaxeItem.js';
import SwordItem from './swordItem.js';

const items = [
    StoneBlockItem,
    PickaxeItem,
    SwordItem,
];

export const GetItemObject = (id, itemid) => {
    // Find item
    const i = items.find(i => i.itemid == itemid);
    if(i){
        return new i(id);
    }else{
        return null;
    }
}