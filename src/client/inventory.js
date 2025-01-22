const Constants = require('../shared/constants.js');
import { Item } from './item.js'

const { INVENTORY_SIZE } = Constants
const inventory = new Array(INVENTORY_SIZE).fill(false);

export function getInventorySlot(slot){
    return inventory[slot];
}

export function setInventorySlot(slot, item){
    inventory[slot] = item;
}

export function setInventory(itemsdata){
    for(let i = 0; i < INVENTORY_SIZE; i++){
        const itemdata = itemsdata[i];
        inventory[i] = new Item(itemdata.name, itemdata.asset);
    }
}