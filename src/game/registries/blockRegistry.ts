import Registry from "./registry.js";
import Block from "../world/block.js";
import ItemRegistry from "./itemRegistry.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const BlockRegistry = new Registry<Block>();

BlockRegistry.Register("stone_block", new Block("Stone Block", ASSETS.STONE_BLOCK, ItemRegistry.Get("stone_block")));

export default BlockRegistry;