import Registry from "./registry.js";
import FloorDefinition from "../definitions/floorDefinition.js";
import Drop from "../items/drop.js";
import Logger from "../../server/logging/logger.js";

import OrganicComponent from "../components/floorcomponents/organicComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing floor registry");

const FloorRegistry = new Registry<FloorDefinition>("FloorRegistry");

FloorRegistry.register("grass_floor", new FloorDefinition("Grass Floor", ASSETS.GRASS_FLOOR)
    .addComponent(new OrganicComponent()));
FloorRegistry.register("stone_floor", new FloorDefinition("Stone Floor", ASSETS.STONE_FLOOR, new Drop("stone_floor")));
FloorRegistry.register("wood_floor", new FloorDefinition("Wood Floor", ASSETS.WOOD_FLOOR, new Drop("wood_floor")));

export default FloorRegistry;