import Registry from './registry';
import Floor from '../world/floor';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

const FloorRegistry = new Registry<Floor>();

FloorRegistry.Register("grass_floor", new Floor("Grass Floor", ASSETS.GRASS_FLOOR));

export default FloorRegistry;