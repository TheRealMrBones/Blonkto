import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { Pos } from "../../../shared/types.js";
import Player from "../../objects/player.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";
import ComponentData from "../componentData.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class SimpleAttackComponent extends Component<EntityDefinition> {
    private speedmultiplier: number;
    private distance: number;
    private damage: number;
    private delay: number;

    constructor(speedmultiplier?: number, distance?: number, damage?: number, delay?: number) {
        super();

        this.speedmultiplier = speedmultiplier || 1;
        this.distance = distance || 6;
        this.damage = damage || 1;
        this.delay = delay || 1000;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(SimpleAttackComponentData);

        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
        this.getParent().registerCollisionListener((self: NonplayerEntity, game: Game, entity: Entity, push: Pos) => this.attack(self, game, entity, push));
    }

    /** Defines the attack action of an entity with this component after colliding with another entity */
    attack(self: NonplayerEntity, game: Game, entity: Entity, push: Pos): void {
        const data = self.getComponentData<SimpleAttackComponentData>(SimpleAttackComponentData);

        if(!(entity instanceof Player)) return;
        if(Date.now() - data.lasthit < this.delay) return;

        entity.takeHit(game, this.damage, this.getParent().displayname || "unknown", self as unknown as Entity);
        data.lasthit = Date.now();
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const data = self.getComponentData<SimpleAttackComponentData>(SimpleAttackComponentData);

        if(data.target === undefined) data.target = null;
        if(data.target !== self.lasthitby && self.hit) data.target = self.lasthitby as Entity;
        
        if(data.target === null){
            let mindist = this.distance;
            game.entityManager.getPlayerEntities().forEach(p => {
                const dist = self.distanceTo(p);
                if(dist < mindist){
                    data.target = p;
                    mindist = dist;
                }
            });
        }

        const target = data.target;
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

export class SimpleAttackComponentData implements ComponentData {
    target: Entity | null = null;
    lasthit: number = 0;

    /** Returns an object representing this component data for writing to the save */
    readFromSave(data: any): this {
        throw new Error("Method not implemented.");
    }

    /** Returns an object representing this component data for a game update to the client */
    serializeForUpdate() {
        throw new Error("Method not implemented.");
    }

    /** Returns an object representing this component data for writing to the save */
    serializeForWrite() {
        throw new Error("Method not implemented.");
    }
}

export default SimpleAttackComponent;