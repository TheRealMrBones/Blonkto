import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../definitions/entityDefinition.js";
import { Pos } from "../../../shared/types.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";
import ComponentData from "../componentData.js";

/** An Entity Component that allows an entity to set a target pos queue to move towards */
class MoveTargetComponent extends Component<EntityDefinition> {
    constructor() {
        super();
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(MoveTargetComponentData);

        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        const data = self.getComponentData<MoveTargetComponentData>(MoveTargetComponentData);

        // make sure all states are null if empty queue
        if(data.queueEmpty()){
            if(data.currenttarget !== null) data.currenttarget = null;
            if(data.startofcurrenttarget !== null) data.startofcurrenttarget = null;
            return;
        }

        // check for blocked status
        if(data.startofcurrenttarget !== null){
            if(Date.now() - data.startofcurrenttarget > self.getSpeed() * 2000){
                data.blocked = true;
                return;
            }
        }

        // actually move towards targets
        let movedist = self.getSpeed() * dt;

        while(data.targetposqueue.length > 0 && movedist > 0){
            const targetpos = data.targetposqueue[0];
            if(targetpos !== data.currenttarget){
                data.currenttarget = targetpos;
                data.startofcurrenttarget = Date.now();
                data.blocked = false;
            }

            self.dir = Math.atan2(targetpos.x - self.x, self.y - targetpos.y);
            const dist = self.distanceTo(targetpos);
            
            if(dist <= movedist){
                self.x = targetpos.x;
                self.y = targetpos.y;
                movedist -= dist;
                data.targetposqueue.shift();
            }else{
                self.x += Math.sin(self.dir) * movedist;
                self.y -= Math.cos(self.dir) * movedist;
                movedist = 0;
            }
        }
    }
}

export class MoveTargetComponentData implements ComponentData {
    targetposqueue: Pos[] = [];
    currenttarget: Pos | null = null;
    startofcurrenttarget: number | null = null;
    blocked: boolean = false;
    currentpriotity: number = 0;

    /** Sets this simple attack component data objects values with the given save data */
    readFromSave(data: any): void {
        
    }

    /** Returns an object representing this simple attack component data for a game update to the client */
    serializeForUpdate(): any {
        return null;
    }

    /** Returns an object representing this simple attack component data for writing to the save */
    serializeForWrite(): any {
        return null;
    }

    /** Sets the targetposqueue if priority is higher or equal */
    setQueue(priority: number, queue: Pos[]): boolean {
        if(priority < this.currentpriotity && !this.queueEmpty()) return false;
        this.currentpriotity = priority;

        this.targetposqueue = queue;

        return true;
    }

    /** Clears the targetposqueue */
    clearQueue(): void {
        this.targetposqueue = [];
        this.currentpriotity = 0;
    }

    /** Returns if the targetposqueue is empty or not */
    queueEmpty(): boolean {
        return this.targetposqueue.length == 0;
    }

    /** Returns if the targetposqueue is not empty but is blocked */
    queueBlocked(): boolean {
        return !this.queueEmpty() && this.blocked;
    }
}

export default MoveTargetComponent;