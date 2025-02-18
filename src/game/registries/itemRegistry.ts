import Registry from "./registry.js";
import Item from "../items/item.js";
import AttackComponent from "../components/itemcomponents/attackComponent.js";
import BuildComponent from "../components/itemcomponents/buildComponent.js";
import MineComponent from "../components/itemcomponents/mineComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const ItemRegistry = new Registry<Item>();

ItemRegistry.register("sword", new Item("Sword", 1, null)
    .addComponent(new AttackComponent(2)));
ItemRegistry.register("pickaxe", new Item("Pickaxe", 1, null)
    .addComponent(new MineComponent(1)));
ItemRegistry.register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));

export default ItemRegistry;