import Registry from "./registry.js";
import Item from "../items/item.js";
import Logger from "../../server/logging/logger.js";

import OrganicComponent from "../components/floorcomponents/organicComponent.js";

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
    .addComponent(new MineComponent(MINE_TYPES.MINE)));
ItemRegistry.register("axe", new Item("Axe", 1, ASSETS.AXE)
    .addComponent(new MineComponent(MINE_TYPES.CHOP))
    .addComponent(new AttackComponent(2)));
ItemRegistry.register("shovel", new Item("Shovel", 1, ASSETS.SHOVEL)
    .addComponent(new MineFloorComponent(1)));
    
ItemRegistry.register("stone", new Item("Stone", 64, ASSETS.STONE));
ItemRegistry.register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));
ItemRegistry.register("stone_wall", new Item("Stone Wall", 64, ASSETS.STONE_WALL)
    .addComponent(new BuildComponent("stone_wall")));
ItemRegistry.register("stone_floor", new Item("Stone Floor", 64, ASSETS.STONE_FLOOR)
    .addComponent(new BuildFloorComponent("stone_floor")));

ItemRegistry.register("wood", new Item("Wood", 64, ASSETS.WOOD));
ItemRegistry.register("tree_trunk", new Item("Tree Trunk", 64, ASSETS.TREE_TRUNK)
    .addComponent(new BuildComponent("tree_trunk")));
ItemRegistry.register("wood_wall", new Item("Wood Wall", 64, ASSETS.WOOD_WALL)
    .addComponent(new BuildComponent("wood_wall")));
ItemRegistry.register("wood_floor", new Item("Wood Floor", 64, ASSETS.WOOD_FLOOR)
    .addComponent(new BuildFloorComponent("wood_floor")));
ItemRegistry.register("wood_door", new Item("Wood Door", 64, ASSETS.WOOD_DOOR)
    .addComponent(new BuildComponent("wood_door")));
ItemRegistry.register("pine_cone", new Item("Pine Cone", 64, ASSETS.PINE_CONE)
    .addComponent(new BuildComponent("sapling", [OrganicComponent])));
    
ItemRegistry.register("raw_pork", new Item("Raw Pork", 64, ASSETS.RAW_PORK)
    .addComponent(new EatComponent(1)));

export default ItemRegistry;