const StoneBlockItem = require('./stoneBlockItem.js');
const PickaxeItem = require('./pickaxeItem.js');
const SwordItem = require('./swordItem.js');

const items = [
    StoneBlockItem,
    PickaxeItem,
    SwordItem,
];

exports.GetItemObject = (id, itemid) => {
    // Find item
    const i = items.find(i => i.itemid == itemid);
    if(i){
        return new i(id);
    }else{
        return null;
    }
}