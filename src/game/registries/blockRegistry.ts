import Registry from "./registry.js";
import BlockDefinition from "../definitions/blockDefinition.js";
import Drop from "../items/drop.js";
import Drops from "../items/drops.js";
import Logger from "../../server/logging/logger.js";

import ChangeComponent from "../components/blockcomponents/changeComponent.js";
import RandomChangeComponent from "../components/blockcomponents/randomChangeComponent.js";
import PickupComponent from "../components/blockcomponents/pickupComponent.js";
import PickComponent from "../components/blockcomponents/pickComponent.js";
import TimeChangeComponent from "../components/blockcomponents/timeChangeComponent.js";
import StationComponent from "../components/blockcomponents/stationComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing block registry");

const BlockRegistry = new Registry<BlockDefinition>("BlockRegistry");

BlockRegistry.register("stone_block", new BlockDefinition("Stone Block", ASSETS.STONE_BLOCK, new Drop("stone", 4), MINE_TYPES.MINE));
BlockRegistry.register("stone_wall", new BlockDefinition("Stone Wall", ASSETS.STONE_WALL, new Drop("stone_wall"), MINE_TYPES.MINE));
BlockRegistry.register("tree_trunk", new BlockDefinition("Tree Trunk", ASSETS.TREE_TRUNK, new Drops(new Drop("wood", 2, 1, .66, 5), new Drop("pine_cone", 1, 1, .33, 3)), MINE_TYPES.CHOP, 1, .8, SHAPES.CIRCLE));
BlockRegistry.register("wood_wall", new BlockDefinition("Wood Wall", ASSETS.WOOD_WALL, new Drop("wood_wall"), MINE_TYPES.CHOP));
BlockRegistry.register("wood_door", new BlockDefinition("Wood Door", ASSETS.WOOD_DOOR, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door_open", true)));
BlockRegistry.register("wood_door_open", new BlockDefinition("Wood Door (Open)", ASSETS.WOOD_DOOR_OPEN, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door"))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setBlockCell(false));
BlockRegistry.register("sapling", new BlockDefinition("Sapling", ASSETS.SAPLING, undefined, MINE_TYPES.ANY, 0)
    .addComponent(new TimeChangeComponent("tree_trunk", 9000, 9000))
    .setFloorVisible(true)
    .setWalkThrough(true));
BlockRegistry.register("planted_carrots", new BlockDefinition("Planted Carrots", ASSETS.PLANTED_CARROTS, undefined, MINE_TYPES.ANY, 0)
    .addComponent(new TimeChangeComponent("grown_carrots", 9000, 9000))
    .setFloorVisible(true)
    .setWalkThrough(true));
BlockRegistry.register("grown_carrots", new BlockDefinition("Grown Carrots", ASSETS.GROWN_CARROTS, new Drop("carrot", 2, 1, .5, 3), MINE_TYPES.ANY, 0)
    .addComponent(new PickComponent())
    .setFloorVisible(true)
    .setWalkThrough(true));
BlockRegistry.register("work_bench", new BlockDefinition("Work Bench", ASSETS.WORK_BENCH, new Drop("work_bench"), MINE_TYPES.CHOP, 1, .8)
    .addComponent(new StationComponent()));

export default BlockRegistry;