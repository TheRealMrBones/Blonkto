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

ItemRegistry.register(new ItemDefinition("sword", "Sword", 1, ASSETS.SWORD)
    .addComponent(new AttackComponent(2, .5, .2, .5)));
ItemRegistry.register(new ItemDefinition("pickaxe", "Pickaxe", 1, ASSETS.PICKAXE)
    .addComponent(new MineComponent(MINE_TYPES.MINE)));
ItemRegistry.register(new ItemDefinition("axe", "Axe", 1, ASSETS.AXE)
    .addComponent(new MineComponent(MINE_TYPES.CHOP)));
ItemRegistry.register(new ItemDefinition("shovel", "Shovel", 1, ASSETS.SHOVEL)
    .addComponent(new MineFloorComponent()));

ItemRegistry.register(new ItemDefinition("stone", "Stone", 64, ASSETS.STONE));
ItemRegistry.register(new ItemDefinition("stone_block", "Stone Block", 64, ASSETS.STONE_BLOCK)
    .addComponent(new BuildComponent("stone_block")));
ItemRegistry.register(new ItemDefinition("stone_wall", "Stone Wall", 64, ASSETS.STONE_WALL)
    .addComponent(new BuildComponent("stone_wall")));
ItemRegistry.register(new ItemDefinition("stone_floor", "Stone Floor", 64, ASSETS.STONE_FLOOR)
    .addComponent(new BuildFloorComponent("stone_floor")));

ItemRegistry.register(new ItemDefinition("wood", "Wood", 64, ASSETS.WOOD));
ItemRegistry.register(new ItemDefinition("tree_trunk", "Tree Trunk", 64, ASSETS.TREE_TRUNK)
    .addComponent(new BuildComponent("tree_trunk")));
ItemRegistry.register(new ItemDefinition("wood_wall", "Wood Wall", 64, ASSETS.WOOD_WALL)
    .addComponent(new BuildComponent("wood_wall")));
ItemRegistry.register(new ItemDefinition("wood_floor", "Wood Floor", 64, ASSETS.WOOD_FLOOR)
    .addComponent(new BuildFloorComponent("wood_floor")));
ItemRegistry.register(new ItemDefinition("wood_door", "Wood Door", 64, ASSETS.WOOD_DOOR)
    .addComponent(new BuildComponent("wood_door")));
ItemRegistry.register(new ItemDefinition("pine_cone", "Pine Cone", 64, ASSETS.PINE_CONE)
    .addComponent(new BuildComponent("sapling", [OrganicComponent])));

ItemRegistry.register(new ItemDefinition("raw_pork", "Raw Pork", 64, ASSETS.RAW_PORK)
    .addComponent(new EatComponent(1)));
ItemRegistry.register(new ItemDefinition("carrot", "Carrot", 64, ASSETS.CARROT)
    .addComponent(new BuildComponent("planted_carrots", [OrganicComponent]))
    .addComponent(new EatComponent(2)));

ItemRegistry.register(new ItemDefinition("work_bench", "Work Bench", 64, ASSETS.WORK_BENCH)
    .addComponent(new BuildComponent("work_bench")));
ItemRegistry.register(new ItemDefinition("torch", "Torch", 64, ASSETS.TORCH)
    .addComponent(new BuildComponent("torch")));
ItemRegistry.register(new ItemDefinition("chest", "Chest", 64, ASSETS.CHEST)
    .addComponent(new BuildComponent("chest")));
ItemRegistry.register(new ItemDefinition("wood_stairs", "Wood Stairs", 64, ASSETS.WOOD_STAIRS_DOWN)
    .addComponent(new BuildComponent("wood_stairs_down")));

ItemRegistry.register(new ItemDefinition("copper_ore_block", "Copper Ore Block", 64, ASSETS.COPPER_ORE_BLOCK)
    .addComponent(new BuildComponent("copper_ore_block")));
ItemRegistry.register(new ItemDefinition("copper_ore", "Copper Ore", 64, ASSETS.COPPER_ORE));
ItemRegistry.register(new ItemDefinition("copper_bar", "Copper Bar", 64, ASSETS.COPPER_BAR));

export default ItemRegistry;
