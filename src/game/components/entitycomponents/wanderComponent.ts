import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";

/** An Entity Component that makes this entity type wander to random nearby positions */
class WanderComponent extends Component<EntityDefinition> {
    distance: number;

    constructor(distance?: number){
        super();

        this.distance = distance || 10;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("tick", (game: Game, dt: number, entity: Entity) => this.tick(game, dt, entity));
    }

    /** Defines the tick action of an entity with this component */
    tick(game: Game, dt: number, entity: Entity): void {
        if(entity.targetpos !== null) return;

        const movex = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
        const movey = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
        if(Math.random() < .001) entity.targetpos = {
            x: entity.x + movex,
            y: entity.y + movey
        }
    }
}

export default WanderComponent;