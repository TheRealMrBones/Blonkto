import Registry from "./registry.js";
import EntityDefinition from "../definitions/entityDefinition.js";
import Drop from "../items/drop.js";
import Logger from "../../server/logging/logger.js";

import MoveTargetComponent from "../components/entitycomponents/moveTargetComponent.js";
import WanderComponent from "../components/entitycomponents/wanderComponent.js";
import PlayerWanderComponent from "../components/entitycomponents/playerWanderComponent.js";
import ScaredComponent from "../components/entitycomponents/scaredComponent.js";
import SimpleAttackComponent from "../components/entitycomponents/simpleAttackComponent.js";
import DayDespawnComponent from "../components/entitycomponents/dayDespawnComponent.js";
import TimeChangeComponent from "../components/entitycomponents/timeChangeComponent.js";

import Constants from "../../shared/constants.js";
const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing entity registry");

const EntityRegistry = new Registry<EntityDefinition>("EntityRegistry");

EntityRegistry.register("pig", new EntityDefinition("Pig", ASSETS.PIG, 5, 1, .5, new Drop("raw_pork", 1, 1, .5, 2))
    .addComponent(new MoveTargetComponent())
    .addComponent(new WanderComponent())
    .addComponent(new ScaredComponent(1.8)));
EntityRegistry.register("baby_pig", new EntityDefinition("Pig", ASSETS.PIG, 5, 1.5, .4)
    .addComponent(new MoveTargetComponent())
    .addComponent(new WanderComponent())
    .addComponent(new ScaredComponent(1.8))
    .addComponent(new TimeChangeComponent("pig", 18000, 9000)));
EntityRegistry.register("zombie", new EntityDefinition("Zombie", ASSETS.ZOMBIE, 5, 1, .55)
    .addComponent(new MoveTargetComponent())
    .addComponent(new PlayerWanderComponent(true))
    .addComponent(new SimpleAttackComponent(1.8))
    .addComponent(new DayDespawnComponent()));
EntityRegistry.register("mega_zombie", new EntityDefinition("Mega Zombie", ASSETS.ZOMBIE, 20, .8, 1.15)
    .addComponent(new MoveTargetComponent())
    .addComponent(new PlayerWanderComponent(true))
    .addComponent(new SimpleAttackComponent(1.8, 9, 5))
    .addComponent(new DayDespawnComponent()));

export default EntityRegistry;