import Component from "game/components/component.js";
import MoveTargetComponent, { MoveTargetComponentData } from "game/components/entitycomponents/moveTargetComponent.js";
import EntityDefinition from "game/definitions/entityDefinition.js";
import Game from "game/game.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import { Vector2D } from "shared/types.js";

/** An Entity Component that makes this entity type run away from attacking entities */
class ScaredComponent extends Component<EntityDefinition> {
    private speedmultiplier: number;
    private distance: number;

    constructor(speedmultiplier?: number, distance?: number) {
        super();
        this.setRequirements([MoveTargetComponent]);

        this.speedmultiplier = speedmultiplier || 1;
        this.distance = distance || 3;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const targetdata = self.getComponentData(MoveTargetComponentData);

        const lasthitter = self.getLastHitter();

        if(!targetdata.queueEmpty() && self.distanceTo(targetdata.targetposqueue[0]) > this.distance && lasthitter !== null){
            if(self.distanceTo([lasthitter.x, lasthitter.y]) < this.distance){
                targetdata.setQueue(10, [this.getRunPosition(self)]);
            }else{
                targetdata.clearQueue();
                self.setSpeedMultiplier(1);
            }
        }

        if(self.getHit() && lasthitter !== null) targetdata.setQueue(10, [this.getRunPosition(self)]);
    }

    /** Returns a new run target postion given the current entity */
    private getRunPosition(self: NonplayerEntity): Vector2D {
        const lasthitter = self.getLastHitter();

        if(lasthitter === null) return [self.x, self.y];

        self.setSpeedMultiplier(this.speedmultiplier);

        const dir = Math.atan2(lasthitter.x - self.x, self.y - lasthitter.y);
        const movex = -Math.sin(dir) * this.distance * 2;
        const movey = Math.cos(dir) * this.distance * 2;

        return [self.x + movex, self.y + movey];
    }
}

export default ScaredComponent;
