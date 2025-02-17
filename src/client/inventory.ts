import { Item } from "./item.js";

import SharedConfig from "../configs/shared.js";
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

const inventory = new Array(INVENTORY_SIZE).fill(false);

export function getInventorySlot(slot: number){
    return inventory[slot];
}

export function setInventorySlot(slot: number, item: Item){
    inventory[slot] = item;

    // show item in slot ui
    if(slot < 9){
        const hotbarslot = document.getElementById("hotbarslot" + (slot + 1))!;
        
        const itemimage = hotbarslot.querySelector("img");
        if (itemimage) hotbarslot.removeChild(itemimage);

        const itemimg = document.createElement("img");
        itemimg.className = "hotbaritem";
        itemimg.src = item.asset;
        hotbarslot.appendChild(itemimg);

        const hotbaritemamount = document.getElementById("hotbaritemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = item.amount.toString();
    }
}

export function setInventory(itemsdata: any){
    for(let i = 0; i < INVENTORY_SIZE; i++){
        const itemdata = itemsdata[i];
        if(itemdata){
            setInventorySlot(i, new Item(itemdata.name, itemdata.asset, itemdata.amount));
        }else{
            clearInventorySlot(i);
        }
    }
}

export function setSingleInventorySlot(data: any){
    if(data.itemstack == null){
        clearInventorySlot(data.slot);
    }else{
        setInventorySlot(data.slot, new Item(data.itemstack.name, data.itemstack.asset, data.itemstack.amount));
    }
}

export function clearInventorySlot(slot: number){
    inventory[slot] = false;

    // remove item in slot ui
    if(slot < 9){
        const hotbarslot = document.getElementById("hotbarslot" + (slot + 1))!;
        const itemimage = hotbarslot.querySelector("img");
        if (itemimage) hotbarslot.removeChild(itemimage);
        
        const hotbaritemamount = document.getElementById("hotbaritemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = "";
    }
}

export function clearInventory(){
    for(let i = 0; i < INVENTORY_SIZE; i++){
        if(inventory[i]){
            clearInventorySlot(i);
        }
    }
}