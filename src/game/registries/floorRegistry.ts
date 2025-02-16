import Registry from "./registry.js";
import Floor from "../world/floor.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const FloorRegistry = new Registry<Floor>();

FloorRegistry.Register("grass_floor", new Floor("Grass Floor", ASSETS.GRASS_FLOOR));

export default FloorRegistry;