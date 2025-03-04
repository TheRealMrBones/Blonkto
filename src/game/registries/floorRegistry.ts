import Registry from "./registry.js";
import Floor from "../world/floor.js";
import Drop from "../items/drop.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const FloorRegistry = new Registry<Floor>();

FloorRegistry.register("grass_floor", new Floor("Grass Floor", ASSETS.GRASS_FLOOR));
FloorRegistry.register("wood_floor", new Floor("Wood Floor", ASSETS.WOOD_FLOOR, new Drop("wood_floor")));

export default FloorRegistry;