import Registry from "./registry.js";
import BlockDefinition from "../definitions/blockDefinition.js";
import Drop from "../items/drops/drop.js";
import Drops from "../items/drops/drops.js";
import Logger from "../../server/logging/logger.js";

import ChangeComponent from "../components/blockcomponents/changeComponent.js";
import RandomChangeComponent from "../components/blockcomponents/randomChangeComponent.js";
import PickupComponent from "../components/blockcomponents/pickupComponent.js";
import PickComponent from "../components/blockcomponents/pickComponent.js";
import TimeChangeComponent from "../components/blockcomponents/timeChangeComponent.js";
import StationComponent from "../components/blockcomponents/stationComponent.js";
import LightComponent from "../components/blockcomponents/lightComponent.js";
import ContainerComponent from "../components/blockcomponents/containerComponent.js";
import StairsComponent from "../components/blockcomponents/stairsComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, ANIMATIONS, SHAPES, MINE_TYPES, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing block registry");

const BlockRegistry = new Registry<BlockDefinition>("BlockRegistry");

BlockRegistry.register(new BlockDefinition("stone_block", "Stone Block", ASSETS.STONE_BLOCK, new Drop("stone", 2), MINE_TYPES.MINE));
BlockRegistry.register(new BlockDefinition("stone_wall", "Stone Wall", ASSETS.STONE_WALL, new Drop("stone_wall"), MINE_TYPES.MINE));
BlockRegistry.register(new BlockDefinition("tree_trunk", "Tree Trunk", ASSETS.TREE_TRUNK, new Drops(new Drop("wood", 1, 1, .66, 3), new Drop("pine_cone", 1, 1, .5, 2)), MINE_TYPES.CHOP, 1, .8, SHAPES.CIRCLE));
BlockRegistry.register(new BlockDefinition("wood_wall", "Wood Wall", ASSETS.WOOD_WALL, new Drop("wood_wall"), MINE_TYPES.CHOP));
BlockRegistry.register(new BlockDefinition("wood_door", "Wood Door", ASSETS.WOOD_DOOR, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door_open", true)));
BlockRegistry.register(new BlockDefinition("wood_door_open", "Wood Door", ASSETS.WOOD_DOOR_OPEN, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door"))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setBlockCell(false));
BlockRegistry.register(new BlockDefinition("sapling", "Sapling", ASSETS.SAPLING, undefined, MINE_TYPES.ANY, 0)
    .addComponent(new TimeChangeComponent("tree_trunk", 9000, 9000))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("planted_carrots", "Planted Carrots", ASSETS.PLANTED_CARROTS, undefined, MINE_TYPES.ANY, 0)
    .addComponent(new TimeChangeComponent("grown_carrots", 9000, 9000))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("grown_carrots", "Grown Carrots", ASSETS.GROWN_CARROTS, new Drop("carrot", 2, 1, .5, 3), MINE_TYPES.ANY, 0)
    .addComponent(new PickComponent())
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("work_bench", "Work Bench", ASSETS.WORK_BENCH, new Drop("work_bench"), MINE_TYPES.CHOP, 1, .8)
    .addComponent(new StationComponent()));
BlockRegistry.register(new BlockDefinition("torch", "Torch", ANIMATIONS.TORCH_ANIMATION, new Drop("torch"), MINE_TYPES.ANY, 0, .8)
    .addComponent(new LightComponent(5))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("chest", "Chest", ASSETS.CHEST, new Drop("chest"), MINE_TYPES.CHOP, 1, .8)
    .addComponent(new StationComponent(ASSETS.CHEST_OPEN))
    .addComponent(new ContainerComponent(27)));
BlockRegistry.register(new BlockDefinition("wood_stairs_down", "Wood Stairs", ASSETS.WOOD_STAIRS_DOWN, new Drop("wood_stairs"), MINE_TYPES.CHOP)
    .addComponent(new StairsComponent(true, "wood_stairs_up"))
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("wood_stairs_up", "Wood Stairs", ASSETS.WOOD_STAIRS_UP)
    .addComponent(new StairsComponent(false, "wood_stairs_down"))
    .setWalkThrough(true)
    .setUnderEntities(true));
BlockRegistry.register(new BlockDefinition("copper_ore_block", "Copper Ore Block", ASSETS.COPPER_ORE_BLOCK, new Drop("copper_ore", 1, 1, .5, 2), MINE_TYPES.MINE));

export default BlockRegistry;
