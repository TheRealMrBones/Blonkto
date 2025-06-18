import Registry from "./registry.js";
import Item from "../items/item.js";
import Logger from "../../server/logging/logger.js";

import AttackComponent from "../components/itemcomponents/attackComponent.js";
import BuildComponent from "../components/itemcomponents/buildComponent.js";
import BuildFloorComponent from "../components/itemcomponents/buildFloorComponent.js";
import MineComponent from "../components/itemcomponents/mineComponent.js";
import MineFloorComponent from "../components/itemcomponents/mineFloorComponent.js";
import EatComponent from "../components/itemcomponents/eatComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, MINE_TYPES, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing item registry");

const ItemRegistry = new Registry<Item>("ItemRegistry");

ItemRegistry.register("sword", new Item("Sword", 1, ASSETS.SWORD)
    .addComponent(new AttackComponent(3)));
ItemRegistry.register("pickaxe", new Item("Pickaxe", 1, ASSETS.PICKAXE)
    .addComponent(new MineComponent(1)));
ItemRegistry.register("axe", new Item("Axe", 1, ASSETS.AXE)
    .addComponent(new MineComponent(1, MINE_TYPES.CHOP))
    .addComponent(new AttackComponent(2)));
ItemRegistry.register("shovel", new Item("Shovel", 1, ASSETS.SHOVEL)
    .addComponent(new MineFloorComponent(1)));
    
ItemRegistry.register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));
ItemRegistry.register("raw_pork", new Item("Raw Pork", 64, ASSETS.RAW_PORK)
    .addComponent(new EatComponent(1)));

ItemRegistry.register("wood", new Item("Wood", 64, ASSETS.WOOD));
ItemRegistry.register("tree_trunk", new Item("Tree Trunk", 64, ASSETS.TREE_TRUNK)
    .addComponent(new BuildComponent("tree_trunk")));
ItemRegistry.register("wood_floor", new Item("Wood Floor", 64, ASSETS.WOOD_FLOOR)
    .addComponent(new BuildFloorComponent("wood_floor")));
ItemRegistry.register("wood_door", new Item("Wood Door", 64, ASSETS.WOOD_DOOR)
    .addComponent(new BuildComponent("wood_door")));

export default ItemRegistry;