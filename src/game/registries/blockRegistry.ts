import Registry from "./registry.js";
import Block from "../world/block.js";
import Drop from "../items/drop.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES } = Constants;

const BlockRegistry = new Registry<Block>();

BlockRegistry.register("stone_block", new Block("Stone Block", ASSETS.STONE_BLOCK, new Drop("stone_block")));
BlockRegistry.register("tree_trunk", new Block("Tree Trunk", ASSETS.TREE_TRUNK, new Drop("wood", 1, 1, .5, 3), MINE_TYPES.CHOP, .8, SHAPES.CIRCLE));

export default BlockRegistry;