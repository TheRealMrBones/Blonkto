import ItemRegistry from '../registries/itemRegistry';
import Item from './item';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

ItemRegistry.Register("sword", new Item("Sword", 1, null));
ItemRegistry.Register("pickaxe", new Item("Pickaxe", 1, null));
ItemRegistry.Register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK));