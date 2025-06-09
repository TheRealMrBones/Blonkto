import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { Pos } from "../../../shared/types.js";
import Player from "../../objects/player.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class SimpleAttackComponent extends Component<EntityDefinition> {
    private speedmultiplier: number;
    private distance: number;
    private damage: number;
    private delay: number;
    
    private targets: {[key: string]: Entity | null};
    private lasthits: {[key: string]: number};

    constructor(speedmultiplier?: number, distance?: number, damage?: number, delay?: number) {
        super();

        this.speedmultiplier = speedmultiplier || 1;
        this.distance = distance || 6;
        this.damage = damage || 1;
        this.delay = delay || 1000;

        this.targets = {};
        this.lasthits = {};
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("tick", (self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
        this.parent?.eventEmitter.on("collision", (self: NonplayerEntity, game: Game, entity: Entity, push: Pos) => this.attack(self, game, entity, push));
    }

    /** Defines the attack action of an entity with this component after colliding with another entity */
    attack(self: NonplayerEntity, game: Game, entity: Entity, push: Pos): void {
        if(!(entity instanceof Player)) return;

        if(Date.now() - this.lasthits[self.id] < this.delay) return;
        entity.takeHit(game, this.damage, this.parent?.displayname || "unknown", self as unknown as Entity);
        this.lasthits[self.id] = Date.now();
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        if(this.targets[self.id] === undefined) this.targets[self.id] = null;
        if(this.targets[self.id] !== self.lasthitby && self.hit) this.targets[self.id] = self.lasthitby as Entity;
        
        if(this.targets[self.id] === null){
            let mindist = this.distance;
            game.entityManager.getPlayerEntities().forEach(p => {
                const dist = self.distanceTo(p);
                if(dist < mindist){
                    this.targets[self.id] = p;
                    mindist = dist;
                }
            });
        }

        const target = this.targets[self.id];
        if(target === null) return;

        if(self.distanceTo(target) >= this.distance * 2){
            self.targetposqueue = [];
            self.speedmultiplier = 1;
            return;
        }
        
        self.speedmultiplier = this.speedmultiplier;
        self.targetposqueue = [this.getRunPosition(target)];
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