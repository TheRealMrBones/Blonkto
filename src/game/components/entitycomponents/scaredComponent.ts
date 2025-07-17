import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../definitions/entityDefinition.js";
import { Pos } from "../../../shared/types.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";
import MoveTargetComponent, { MoveTargetComponentData } from "./moveTargetComponent.js";

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

        if(!targetdata.queueEmpty() && self.distanceTo(targetdata.targetposqueue[0]) > this.distance && self.lasthitby !== undefined){
            if(self.distanceTo(self.lasthitby) < this.distance){
                targetdata.setQueue(10, [this.getRunPosition(self)]);
            }else{
                targetdata.clearQueue();
                self.speedmultiplier = 1;
            }
        }

        if(self.hit && self.lasthitby !== undefined) targetdata.setQueue(10, [this.getRunPosition(self)]);
    }

    /** Returns a new run target postion given the current entity */
    getRunPosition(self: NonplayerEntity): Pos {
        if(self.lasthitby === undefined) return {x: self.x, y: self.y};
        
        self.speedmultiplier = this.speedmultiplier;

        const dir = Math.atan2(self.lasthitby.x - self.x, self.y - self.lasthitby.y);
        const movex = -Math.sin(dir) * this.distance * 2;
        const movey = Math.cos(dir) * this.distance * 2;

        return {
            x: self.x + movex,
            y: self.y + movey,
        };
    }
}

export default ScaredComponent;
