import Registry from "./registry.js";
import Ceiling from "../world/ceiling.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing ceiling registry");

const CeilingRegistry = new Registry<Ceiling>("CeilingRegistry");



export default CeilingRegistry;