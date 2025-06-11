import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import { pathfind } from "../../world/pathfind.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";

/** An Entity Component that makes this entity type wander to random nearby positions */
class WanderComponent extends Component<EntityDefinition> {
    private distance: number;
    private randomness: number;

    constructor(distance?: number, cellposrandomness?: number) {
        super();

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
        if(self.targetposqueue.length > 0){
            if(self.startofcurrenttarget === null) return;
            
            const lasttarget = self.targetposqueue[self.targetposqueue.length - 1];
            const currenttarget = self.targetposqueue[0];

            if(self.blocked){
                self.blocked = false;
                return;
            }

            if(Date.now() - self.startofcurrenttarget > self.getSpeed() * 2000){
                self.blocked = true;

                const lasttargetcell = {
                    x: Math.floor(lasttarget.x),
                    y: Math.floor(lasttarget.y),
                };
                const currenttargetcell = {
                    x: Math.floor(currenttarget.x),
                    y: Math.floor(currenttarget.y),
                };
                
                const path = pathfind({ x: Math.floor(self.x), y: Math.floor(self.y) }, { x: lasttargetcell.x, y: lasttargetcell.y }, game.world, [currenttargetcell]);

                self.targetposqueue = [];
                if(path !== null){
                    self.targetposqueue.push(...path.map(pos => ({
                        x: pos.x + .5 + (Math.random() * this.randomness - this.randomness / 2),
                        y: pos.y + .5 + (Math.random() * this.randomness - this.randomness / 2),
                    })));
                }
            }

            return;
        }

        if(Math.random() < .01){
            let movex, movey, cellx = 0, celly = 0;

            let found = false;
            for(let tries = 10; tries > 0; tries--){
                movex = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
                movey = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
                cellx = Math.floor(self.x) + movex;
                celly = Math.floor(self.y) + movey;
                const cell = game.world.getCell(cellx, celly, false);
                if(cell !== null){
                    if(cell.block === null){
                        found = true;
                        break;
                    }
                }
            }
            if(!found) return;
            
            const path = pathfind({ x: Math.floor(self.x), y: Math.floor(self.y) }, { x: cellx, y: celly }, game.world);
            if(path === null) return;

            self.targetposqueue.push(...path.map(pos => ({
                x: pos.x + .5 + (Math.random() * this.randomness - this.randomness / 2),
                y: pos.y + .5 + (Math.random() * this.randomness - this.randomness / 2),
            })));
        }
    }
}

export default WanderComponent;