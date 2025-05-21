import Registry from "./registry.js";
import EntityDefinition from "../entities/entityDefinition.js";
import Drop from "../items/drop.js";
import WanderComponent from "../components/entitycomponents/wanderComponent.js";
import ScaredComponent from "../components/entitycomponents/scaredComponent.js";
import SimpleAttackComponent from "../components/entitycomponents/simpleAttackComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const EntityRegistry = new Registry<EntityDefinition>();

EntityRegistry.register("pig", new EntityDefinition("Pig", ASSETS.PIG, 5, 1, .5, new Drop("raw_pork", 1, 1, .25, 3))
    .addComponent(new WanderComponent())
    .addComponent(new ScaredComponent(1.8)));
EntityRegistry.register("zombie", new EntityDefinition("Zombie", ASSETS.PIG, 5, 1, .5)
    .addComponent(new WanderComponent())
    .addComponent(new SimpleAttackComponent(1.8)));

export default EntityRegistry;