import Registry from './registry';
import Item from '../items/item';
import AttackComponent from '../components/itemcomponents/attackComponent';
import BuildComponent from '../components/itemcomponents/buildComponent';
import MineComponent from '../components/itemcomponents/mineComponent';

import BlockRegistry from './blockRegistry';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

const ItemRegistry = new Registry<Item>();

ItemRegistry.Register("sword", new Item("Sword", 1, null).componentHandler.addComponent(new AttackComponent(2)));
ItemRegistry.Register("pickaxe", new Item("Pickaxe", 1, null).componentHandler.addComponent(new MineComponent(1)));
ItemRegistry.Register("stone_block", new Item("Stone Block", 64, ASSETS.STONE_BLOCK).componentHandler.addComponent(new BuildComponent(BlockRegistry.Get("stone_block"))));

export default ItemRegistry;