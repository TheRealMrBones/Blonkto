import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../definitions/entityDefinition.js";
import { pathfind } from "../../world/helpers/pathfind.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";
import MoveTargetComponent, { MoveTargetComponentData } from "./moveTargetComponent.js";
import { Vector2D } from "../../../shared/types.js";

/** An Entity Component that makes this entity type wander to random nearby positions */
class WanderComponent extends Component<EntityDefinition> {
    private distance: number;
    private randomness: number;

    constructor(distance?: number, cellposrandomness?: number) {
        super();
        this.setRequirements([MoveTargetComponent]);

        this.distance = distance || 5;
        this.randomness = cellposrandomness || .2;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const targetdata = self.getComponentData(MoveTargetComponentData);

        if(targetdata.queueBlocked() && targetdata.currentpriotity == 1){
            const lasttarget = targetdata.targetposqueue[targetdata.targetposqueue.length - 1];
            const currenttarget = targetdata.targetposqueue[0];

            const lasttargetcell: Vector2D = [Math.floor(lasttarget[0]), Math.floor(lasttarget[1])];
            const currenttargetcell: Vector2D = [Math.floor(currenttarget[0]), Math.floor(currenttarget[1])];

            const path = pathfind([Math.floor(self.x), Math.floor(self.y)], lasttargetcell, self.layer, [currenttargetcell]);

            targetdata.clearQueue();
            if(path !== null){
                targetdata.setQueue(1, path.map(pos => ([
                    pos[0] + .5 + (Math.random() * this.randomness - this.randomness / 2),
                    pos[1] + .5 + (Math.random() * this.randomness - this.randomness / 2),
                ])));
                targetdata.startofcurrenttarget = Date.now();
            }

            return;
        }

        if(Math.random() < .01 && targetdata.queueEmpty()){
            let movex, movey, cellx = 0, celly = 0;

            let found = false;
            for(let tries = 10; tries > 0; tries--){
                movex = Math.floor(Math.random() * (this.distance * 2 + 1)) - this.distance;
                movey = Math.floor(Math.random() * (this.distance * 2 + 1)) - this.distance;
                cellx = Math.floor(self.x) + movex;
                celly = Math.floor(self.y) + movey;
                const cell = self.layer.getCell(cellx, celly, false);
                if(cell !== null){
                    if(cell.block === null){
                        found = true;
                        break;
                    }
                }
            }
            if(!found) return;

            const path = pathfind([Math.floor(self.x), Math.floor(self.y)], [cellx, celly], self.layer);
            if(path === null) return;

            targetdata.setQueue(1, path.map(pos => ([
                pos[0] + .5 + (Math.random() * this.randomness - this.randomness / 2),
                pos[1] + .5 + (Math.random() * this.randomness - this.randomness / 2),
            ])));
        }
    }
}

export default WanderComponent;
