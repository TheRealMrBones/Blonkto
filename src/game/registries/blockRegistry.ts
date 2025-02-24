import Registry from "./registry.js";
import Block from "../world/block.js";
import Drop from "../items/drop.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const BlockRegistry = new Registry<Block>();

BlockRegistry.register("stone_block", new Block("Stone Block", ASSETS.STONE_BLOCK, new Drop("stone_block")));

export default BlockRegistry;