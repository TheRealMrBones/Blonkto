import Registry from './registry';
import Block from '../world/block';

import Constants from '../../shared/constants';
import ItemRegistry from './itemRegistry';
const { ASSETS } = Constants;

const BlockRegistry = new Registry<Block>();

BlockRegistry.Register("stone_block", new Block("Stone Block", ASSETS.STONE_BLOCK, ItemRegistry.Get("stone_block")));

export default BlockRegistry;