import Registry from './registry';
import Item from '../items/item';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

const ItemRegistry = new Registry<Item>();

ItemRegistry.Register("sword", new Item("Sword", 1, null));
ItemRegistry.Register("pickaxe", new Item("Pickaxe", 1, null));
ItemRegistry.Register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK));

export default ItemRegistry;