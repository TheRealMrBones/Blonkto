import Registry from "./registry.js";
import Item from "../items/item.js";
import AttackComponent from "../components/itemcomponents/attackComponent.js";
import BuildComponent from "../components/itemcomponents/buildComponent.js";
import BuildFloorComponent from "../components/itemcomponents/buildFloorComponent.js";
import MineComponent from "../components/itemcomponents/mineComponent.js";
import MineFloorComponent from "../components/itemcomponents/mineFloorComponent.js";
import EatComponent from "../components/itemcomponents/eatComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const ItemRegistry = new Registry<Item>();

ItemRegistry.register("sword", new Item("Sword", 1, ASSETS.SWORD)
    .addComponent(new AttackComponent(2)));
ItemRegistry.register("pickaxe", new Item("Pickaxe", 1, ASSETS.PICKAXE)
    .addComponent(new MineComponent(1)));
ItemRegistry.register("shovel", new Item("Shovel", 1, null)
    .addComponent(new MineFloorComponent(1)));
ItemRegistry.register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));
ItemRegistry.register("raw_pork", new Item("Raw Pork", 64, ASSETS.RAW_PORK)
    .addComponent(new EatComponent(1)));
ItemRegistry.register("wood_floor", new Item("Wood Floor", 64, null)
    .addComponent(new BuildFloorComponent("wood_floor")));

export default ItemRegistry;