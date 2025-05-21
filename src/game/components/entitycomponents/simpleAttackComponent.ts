import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { Pos } from "../../../shared/types.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class SimpleAttackComponent extends Component<EntityDefinition> {
    private speedmultiplier: number;
    private distance: number;
    private targets: {[key: string]: Entity | null};

    constructor(speedmultiplier?: number, distance?: number) {
        super();

        this.speedmultiplier = speedmultiplier || 1;
        this.distance = distance || 6;
        this.targets = {};
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("tick", (game: Game, dt: number, entity: Entity) => this.tick(game, dt, entity));
    }

    /** Defines the tick action of an entity with this component */
    tick(game: Game, dt: number, entity: Entity): void {
        if(this.targets[entity.id] === undefined) this.targets[entity.id] = null;
        if(this.targets[entity.id] !== entity.lasthitby && entity.hit) this.targets[entity.id] = entity.lasthitby as Entity;
        
        if(this.targets[entity.id] === null){
            let mindist = this.distance;
            game.entityManager.getPlayerEntities().forEach(p => {
                const dist = entity.distanceTo(p);
                if(dist < mindist){
                    this.targets[entity.id] = p;
                    mindist = dist;
                }
            });
        }

        const target = this.targets[entity.id];
        if(target === null) return;

        if(entity.distanceTo(target) >= this.distance * 2){
            entity.targetposqueue = [];
            entity.speedmultiplier = 1;
            return;
        }
        
        entity.speedmultiplier = this.speedmultiplier;
        entity.targetposqueue = [this.getRunPosition(target)];
    }

    /** Returns a new run target postion given the current target */
    getRunPosition(target: Entity): Pos {
        return {
            x: target.x,
            y: target.y,
        };
    }
}

export default SimpleAttackComponent;