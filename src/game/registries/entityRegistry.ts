import Registry from "./registry.js";
import EntityDefinition from "../entities/entityDefinition.js";
import Drop from "../items/drop.js";

import Constants from "../../shared/constants.js";
import WanderComponent from "../components/entitycomponents/wanderComponent.js";
const { ASSETS } = Constants;

const EntityRegistry = new Registry<EntityDefinition>();

EntityRegistry.register("pig", new EntityDefinition("Pig", ASSETS.PIG, 3, .5, new Drop("raw_pork", 1, 1, .25, 3))
    .addComponent(new WanderComponent()));

export default EntityRegistry;