import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { pathfind } from "../../world/pathfind.js";
import { Pos } from "../../../shared/types.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class ScaredComponent extends Component<EntityDefinition> {
    distance: number;
    randomness: number;

    constructor(distance?: number, randomness?: number) {
        super();

        this.distance = distance || 3;
        this.randomness = randomness || .1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("tick", (game: Game, dt: number, entity: Entity) => this.tick(game, dt, entity));
    }

    /** Defines the tick action of an entity with this component */
    tick(game: Game, dt: number, entity: Entity): void {
        if(entity.targetposqueue.length > 0){
            if(entity.distanceTo(entity.targetposqueue[0]) > this.distance && entity.lasthitby !== undefined){
                if(entity.distanceTo(entity.lasthitby) < this.distance){
                    entity.targetposqueue = [this.getRunPosition(entity)];
                }else{
                    entity.targetposqueue = [];
                }
            }
        }

        if(entity.hit && entity.lasthitby !== undefined) entity.targetposqueue = [this.getRunPosition(entity)];
    }

    /** Returns a new run target postion given the current entity */
    getRunPosition(entity: Entity): Pos {
        if(entity.lasthitby === undefined) return {x: entity.x, y: entity.y};

        let dir = Math.atan2(entity.lasthitby.x - entity.x, entity.y - entity.lasthitby.y);
        dir += Math.random() * this.randomness - (this.randomness / 2);

        const movex = -Math.sin(dir) * this.distance * 2;
        const movey = Math.cos(dir) * this.distance * 2;

        return {
            x: entity.x + movex,
            y: entity.y + movey,
        }
    }
}

export default ScaredComponent;