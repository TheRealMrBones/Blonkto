import Registry from "./registry.js";
import Block from "../world/block.js";
import Drop from "../items/drop.js";
import Logger from "../../server/logging/logger.js";

import ChangeComponent from "../components/blockcomponents/changeComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing block registry");

const BlockRegistry = new Registry<Block>("BlockRegistry");

BlockRegistry.register("stone_block", new Block("Stone Block", ASSETS.STONE_BLOCK, new Drop("stone_block"), MINE_TYPES.MINE));
BlockRegistry.register("tree_trunk", new Block("Tree Trunk", ASSETS.TREE_TRUNK, new Drop("wood", 1, 1, .5, 3), MINE_TYPES.CHOP, 1, .8, SHAPES.CIRCLE));
BlockRegistry.register("wood_door", new Block("Wood Door", ASSETS.WOOD_DOOR, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door_open", true)));
BlockRegistry.register("wood_door_open", new Block("Wood Door (Open)", ASSETS.WOOD_DOOR_OPEN, new Drop("wood_door"), MINE_TYPES.CHOP)
    .addComponent(new ChangeComponent("wood_door"))
    .setFloorVisible(true)
    .setWalkThrough(true)
    .setBlockCell(false));

export default BlockRegistry;