import Registry from "./registry.js";
import EntityDefinition from "../entities/entityDefinition.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const EntityRegistry = new Registry<EntityDefinition>();

EntityRegistry.register("pig", new EntityDefinition("Pig", ASSETS.PIG, 3, .5));

export default EntityRegistry;