import Component from "game/components/component.js";
import ComponentData from "game/components/componentData.js";
import MoveTargetComponent, { MoveTargetComponentData } from "game/components/entitycomponents/moveTargetComponent.js";
import EntityDefinition from "game/definitions/entityDefinition.js";
import Game from "game/game.js";
import Entity from "game/objects/entity.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import Player from "game/objects/player.js";
import { Vector2D } from "shared/types.js";

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

        if(data.target !== self.getLastHitter() && self.getHit()) data.target = self.getLastHitter() as Entity;

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
                const dist = self.distanceTo([p.x, p.y]);
                if(dist < mindist && p.isValidTarget()){
                    data.target = p;
                    mindist = dist;
                }
            }
        }

        const target = data.target;
        if(target === null) return;

        if(self.distanceTo([target.x, target.y]) >= this.distance * 2){
            this.resetTarget(self, data, targetdata);
            return;
        }

        self.setSpeedMultiplier(this.speedmultiplier);
        this.setRunQueue(target, targetdata);
    }

    /** Resets the current target */
    resetTarget(self: NonplayerEntity, data: SimpleAttackComponentData, targetdata: MoveTargetComponentData): void {
        targetdata.clearQueue();
        self.setSpeedMultiplier(1);
        data.target = null;
    }

    /** Sets the run queue to move towards the targeted entity */
    setRunQueue(target: Entity, targetdata: MoveTargetComponentData): void {
        targetdata.setQueue(10, [[target.x, target.y]]);
    }
}

class SimpleAttackComponentData extends ComponentData<SimpleAttackComponent> {
    target: Entity | null = null;
    lasthit: number = 0;
}

export default SimpleAttackComponent;
