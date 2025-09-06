import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../definitions/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { Vector2D } from "../../../shared/types.js";
import Player from "../../objects/player.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";
import ComponentData from "../componentData.js";
import MoveTargetComponent, { MoveTargetComponentData } from "./moveTargetComponent.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class SimpleAttackComponent extends Component<EntityDefinition> {
    private speedmultiplier: number;
    private distance: number;
    private damage: number;
    private delay: number;

    constructor(speedmultiplier?: number, distance?: number, damage?: number, delay?: number) {
        super();
        this.setRequirements([MoveTargetComponent]);

        this.speedmultiplier = speedmultiplier || 1;
        this.distance = distance || 6;
        this.damage = damage || 1;
        this.delay = delay || 1000;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(SimpleAttackComponentData, this);

        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
        this.getParent().registerCollisionListener((self: NonplayerEntity, game: Game, entity: Entity, push: Vector2D) => this.attack(self, game, entity, push));
    }

    /** Defines the attack action of an entity with this component after colliding with another entity */
    attack(self: NonplayerEntity, game: Game, entity: Entity, push: Vector2D): void {
        const data = self.getComponentData(SimpleAttackComponentData);

        if(!(entity instanceof Player)) return;
        if(Date.now() - data.lasthit < this.delay) return;

        entity.takeHit(game, this.damage, this.getParent().displayname || "unknown", self as unknown as Entity);
        data.lasthit = Date.now();
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const data = self.getComponentData(SimpleAttackComponentData);
        const targetdata = self.getComponentData(MoveTargetComponentData);

        if(data.target !== self.lasthitby && self.hit) data.target = self.lasthitby as Entity;

        if(data.target !== null){
            if(![...self.layer.entityManager.getPlayerEntities()].some(p => p.id === data.target?.id)){
                this.resetTarget(self, data, targetdata);
            }

            if(!data.target?.isValidTarget()){
                this.resetTarget(self, data, targetdata);
            }
        }
        
        if(data.target === null){
            let mindist = this.distance;
            for(const p of self.layer.entityManager.getPlayerEntities()){
                const dist = self.distanceTo(p);
                if(dist < mindist && p.isValidTarget()){
                    data.target = p;
                    mindist = dist;
                }
            }
        }

        const target = data.target;
        if(target === null) return;

        if(self.distanceTo(target) >= this.distance * 2){
            this.resetTarget(self, data, targetdata);
            return;
        }
        
        self.speedmultiplier = this.speedmultiplier;
        this.setRunQueue(target, targetdata);
    }

    /** Resets the current target */
    resetTarget(self: NonplayerEntity, data: SimpleAttackComponentData, targetdata: MoveTargetComponentData): void {
        targetdata.clearQueue();
        self.speedmultiplier = 1;
        data.target = null;
    }

    /** Sets the run queue to move towards the targeted entity */
    setRunQueue(target: Entity, targetdata: MoveTargetComponentData): void {
        targetdata.setQueue(10, [{
            x: target.x,
            y: target.y,
        }]);
    }
}

class SimpleAttackComponentData extends ComponentData<SimpleAttackComponent> {
    target: Entity | null = null;
    lasthit: number = 0;
}

export default SimpleAttackComponent;
