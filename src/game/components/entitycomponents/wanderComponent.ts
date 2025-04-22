import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { pathfind } from "../../world/pathfind.js";

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
        this.parent?.eventEmitter.on("tick", (game: Game, dt: number, entity: Entity) => this.tick(game, dt, entity));
    }

    /** Defines the tick action of an entity with this component */
    tick(game: Game, dt: number, entity: Entity): void {
        if(entity.targetposqueue.length > 0){
            if(entity.startofcurrenttarget === null) return;
            
            const lasttarget = entity.targetposqueue[entity.targetposqueue.length - 1];
            const currenttarget = entity.targetposqueue[0];

            if(entity.blocked){
                entity.blocked = false;
                return;
            }

            if(Date.now() - entity.startofcurrenttarget > entity.getSpeed() * 2000){
                entity.blocked = true;

                const lasttargetcell = {
                    x: Math.floor(lasttarget.x),
                    y: Math.floor(lasttarget.y),
                };
                const currenttargetcell = {
                    x: Math.floor(currenttarget.x),
                    y: Math.floor(currenttarget.y),
                };
                
                const path = pathfind({ x: Math.floor(entity.x), y: Math.floor(entity.y) }, { x: lasttargetcell.x, y: lasttargetcell.y }, game.world, [currenttargetcell]);

                entity.targetposqueue = [];
                if(path !== null){
                    entity.targetposqueue.push(...path.map(pos => ({
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
                cellx = Math.floor(entity.x) + movex;
                celly = Math.floor(entity.y) + movey;
                const cell = game.world.getCell(cellx, celly, false);
                if(cell !== null){
                    if(cell.block === null){
                        found = true;
                        break;
                    }
                }
            }
            if(!found) return;
            
            const path = pathfind({ x: Math.floor(entity.x), y: Math.floor(entity.y) }, { x: cellx, y: celly }, game.world);
            if(path === null) return;

            entity.targetposqueue.push(...path.map(pos => ({
                x: pos.x + .5 + (Math.random() * this.randomness - this.randomness / 2),
                y: pos.y + .5 + (Math.random() * this.randomness - this.randomness / 2),
            })));
        }
    }
}

export default WanderComponent;