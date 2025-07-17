import Registry from "./registry.js";
import FloorDefinition from "../definitions/floorDefinition.js";
import Drop from "../items/drops/drop.js";
import Logger from "../../server/logging/logger.js";

import OrganicComponent from "../components/floorcomponents/organicComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing floor registry");

const FloorRegistry = new Registry<FloorDefinition>("FloorRegistry");

FloorRegistry.register(new FloorDefinition("grass_floor", "Grass Floor", ASSETS.GRASS_FLOOR)
    .addComponent(new OrganicComponent()));
FloorRegistry.register(new FloorDefinition("stone_floor", "Stone Floor", ASSETS.STONE_FLOOR, new Drop("stone_floor")));
FloorRegistry.register(new FloorDefinition("wood_floor", "Wood Floor", ASSETS.WOOD_FLOOR, new Drop("wood_floor")));

export default FloorRegistry;
