import Registry from "./registry.js";
import ItemDefinition from "../definitions/itemDefinition.js";
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

const ItemRegistry = new Registry<ItemDefinition>("ItemRegistry");

ItemRegistry.register("sword", new ItemDefinition("Sword", 1, ASSETS.SWORD)
    .addComponent(new AttackComponent(3)));
ItemRegistry.register("pickaxe", new ItemDefinition("Pickaxe", 1, ASSETS.PICKAXE)
    .addComponent(new MineComponent(MINE_TYPES.MINE)));
ItemRegistry.register("axe", new ItemDefinition("Axe", 1, ASSETS.AXE)
    .addComponent(new MineComponent(MINE_TYPES.CHOP))
    .addComponent(new AttackComponent(2)));
ItemRegistry.register("shovel", new ItemDefinition("Shovel", 1, ASSETS.SHOVEL)
    .addComponent(new MineFloorComponent(1)));
    
ItemRegistry.register("stone", new ItemDefinition("Stone", 64, ASSETS.STONE));
ItemRegistry.register("stone_block", new ItemDefinition("Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));
ItemRegistry.register("stone_wall", new ItemDefinition("Stone Wall", 64, ASSETS.STONE_WALL)
    .addComponent(new BuildComponent("stone_wall")));
ItemRegistry.register("stone_floor", new ItemDefinition("Stone Floor", 64, ASSETS.STONE_FLOOR)
    .addComponent(new BuildFloorComponent("stone_floor")));

ItemRegistry.register("wood", new ItemDefinition("Wood", 64, ASSETS.WOOD));
ItemRegistry.register("tree_trunk", new ItemDefinition("Tree Trunk", 64, ASSETS.TREE_TRUNK)
    .addComponent(new BuildComponent("tree_trunk")));
ItemRegistry.register("wood_wall", new ItemDefinition("Wood Wall", 64, ASSETS.WOOD_WALL)
    .addComponent(new BuildComponent("wood_wall")));
ItemRegistry.register("wood_floor", new ItemDefinition("Wood Floor", 64, ASSETS.WOOD_FLOOR)
    .addComponent(new BuildFloorComponent("wood_floor")));
ItemRegistry.register("wood_door", new ItemDefinition("Wood Door", 64, ASSETS.WOOD_DOOR)
    .addComponent(new BuildComponent("wood_door")));
ItemRegistry.register("pine_cone", new ItemDefinition("Pine Cone", 64, ASSETS.PINE_CONE)
    .addComponent(new BuildComponent("sapling", [OrganicComponent])));
    
ItemRegistry.register("raw_pork", new ItemDefinition("Raw Pork", 64, ASSETS.RAW_PORK)
    .addComponent(new EatComponent(1)));

export default ItemRegistry;