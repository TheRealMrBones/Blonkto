import CeilingDefinition from "game/definitions/ceilingDefinition.js";
import Registry from "game/registries/registry.js";
import Logger from "server/logging/logger.js";
import Constants from "shared/constants.js";

const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing ceiling registry");

const CeilingRegistry = new Registry<CeilingDefinition>("CeilingRegistry");



export default CeilingRegistry;
