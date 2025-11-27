import BreedComponent from "game/components/entitycomponents/breedComponent.js";
import DayDespawnComponent from "game/components/entitycomponents/dayDespawnComponent.js";
import MoveTargetComponent from "game/components/entitycomponents/moveTargetComponent.js";
import PlayerWanderComponent from "game/components/entitycomponents/playerWanderComponent.js";
import ScaredComponent from "game/components/entitycomponents/scaredComponent.js";
import SimpleAttackComponent from "game/components/entitycomponents/simpleAttackComponent.js";
import TimeChangeComponent from "game/components/entitycomponents/timeChangeComponent.js";
import WanderComponent from "game/components/entitycomponents/wanderComponent.js";
import EntityDefinition from "game/definitions/entityDefinition.js";
import Drop from "game/items/drops/drop.js";
import Registry from "game/registries/registry.js";
import Logger from "server/logging/logger.js";
import Constants from "shared/constants.js";

const { ASSETS, LOG_CATEGORIES } = Constants;

const logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);
logger.info("Initializing entity registry");

const EntityRegistry = new Registry<EntityDefinition>("EntityRegistry");

EntityRegistry.register(new EntityDefinition("pig", "Pig", ASSETS.PIG, 5, 1, .5, new Drop("raw_pork", 1, 1, .5, 2))
    .addComponent(new MoveTargetComponent())
    .addComponent(new WanderComponent())
    .addComponent(new ScaredComponent(1.8))
    .addComponent(new BreedComponent("carrot", "baby_pig")));
EntityRegistry.register(new EntityDefinition("baby_pig", "Pig", ASSETS.PIG, 5, 1.5, .4)
    .addComponent(new MoveTargetComponent())
    .addComponent(new WanderComponent())
    .addComponent(new ScaredComponent(1.8))
    .addComponent(new TimeChangeComponent("pig", 18000, 9000)));
EntityRegistry.register(new EntityDefinition("zombie", "Zombie", ASSETS.ZOMBIE, 5, 1, .55)
    .addComponent(new MoveTargetComponent())
    .addComponent(new PlayerWanderComponent(true))
    .addComponent(new SimpleAttackComponent(1.8))
    .addComponent(new DayDespawnComponent()));
EntityRegistry.register(new EntityDefinition("mega_zombie", "Mega Zombie", ASSETS.ZOMBIE, 20, .8, 1.15)
    .addComponent(new MoveTargetComponent())
    .addComponent(new PlayerWanderComponent(true))
    .addComponent(new SimpleAttackComponent(1.8, 9, 5))
    .addComponent(new DayDespawnComponent()));

export default EntityRegistry;
