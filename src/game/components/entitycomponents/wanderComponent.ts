import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../entities/entityDefinition.js";
import Entity from "../../objects/entity.js";
import { pathfind } from "../../world/pathfind.js";

/** An Entity Component that makes this entity type wander to random nearby positions */
class WanderComponent extends Component<EntityDefinition> {
    distance: number;
    cellposrandomness: number;

    constructor(distance?: number, cellposrandomness?: number) {
        super();

        this.distance = distance || 5;
        this.cellposrandomness = cellposrandomness || .2;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("tick", (game: Game, dt: number, entity: Entity) => this.tick(game, dt, entity));
    }

    /** Defines the tick action of an entity with this component */
    tick(game: Game, dt: number, entity: Entity): void {
        if(entity.targetposqueue.length > 0) return;

        if(Math.random() < .01){
            let movex, movey, cellx, celly;
            while(true){
                movex = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
                movey = Math.floor(Math.random() * this.distance * 2) + 1 - this.distance;
                cellx = Math.floor(entity.x) + movex;
                celly = Math.floor(entity.y) + movey;
                const cell = game.world.getCell(cellx, celly, false);
                if(cell)
                    if(cell.block === null) break;
            }
            
            const path = pathfind({ x: Math.floor(entity.x), y: Math.floor(entity.y) }, { x: cellx, y: celly }, game.world);
            if(path === null) return;

            entity.targetposqueue.push(...path.map(pos => ({
                x: pos.x + .5 + (Math.random() * this.cellposrandomness - this.cellposrandomness / 2),
                y: pos.y + .5 + (Math.random() * this.cellposrandomness - this.cellposrandomness / 2),
            })));
        }
    }
}

export default WanderComponent;