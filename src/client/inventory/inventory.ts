import { Item } from "./item.js";

import SharedConfig from "../../configs/shared.js";
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

const inventory = new Array(INVENTORY_SIZE).fill(false);

/** Returns the item from the given inventory slot */
export function getInventorySlot(slot: number): any {
    return inventory[slot];
}

/** Sets the requested inventory slot to contain the given item */
export function setInventorySlot(slot: number, item: Item): void {
    inventory[slot] = item;

    // show item in slot ui
    if(slot < 9){
        const hotbarslot = document.getElementById("hotbarslot" + (slot + 1))!;
        
        const itemimage = hotbarslot.querySelector("img");
        if(itemimage) hotbarslot.removeChild(itemimage);

        const itemimg = document.createElement("img");
        itemimg.className = "hotbaritem";
        itemimg.src = item.asset;
        hotbarslot.appendChild(itemimg);

        const hotbaritemamount = document.getElementById("hotbaritemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = item.amount.toString();
    }
}

/** Sets the entire inventories data to the given inventory */
export function setInventory(itemsdata: any): void {
    for(let i = 0; i < INVENTORY_SIZE; i++){
        const itemdata = itemsdata[i];
        if(itemdata){
            setInventorySlot(i, new Item(itemdata.name, itemdata.asset, itemdata.amount));
        }else{
            clearInventorySlot(i);
        }
    }
}

/** Sets a single inventory slot to the given slot data */
export function setSingleInventorySlot(data: any): void {
    if(data.itemstack == null){
        clearInventorySlot(data.slot);
    }else{
        setInventorySlot(data.slot, new Item(data.itemstack.name, data.itemstack.asset, data.itemstack.amount));
    }
}

/** Clears the given inventory slot of its item and if in the hotbar updates the UI */
export function clearInventorySlot(slot: number): void {
    inventory[slot] = false;

    // remove item in slot ui
    if(slot < 9){
        const hotbarslot = document.getElementById("hotbarslot" + (slot + 1))!;
        const itemimage = hotbarslot.querySelector("img");
        if(itemimage) hotbarslot.removeChild(itemimage);
        
        const hotbaritemamount = document.getElementById("hotbaritemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = "";
    }
}

/** Clears the entire inventory of its data */
export function clearInventory(): void {
    for(let i = 0; i < INVENTORY_SIZE; i++){
        if(inventory[i]) clearInventorySlot(i);
    }
}