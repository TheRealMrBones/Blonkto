import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";
import ILayerSpawner from "./ILayerSpawner.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";

import SharedConfig from "../../../configs/shared.js";
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** Spawner object for a cave layer to spawn entities */
class CaveLayerSpawner implements ILayerSpawner {
    constructor(){

    }

    /** Ticks spawning in the given layer */
    tickSpawning(layer: Layer, game: Game): void {
        const players = [...layer.entityManager.getPlayerEntities()];

        for(const p of players){
            if(Math.random() > .1) return;

            const dir = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(CELLS_HORIZONTAL * CELLS_HORIZONTAL + CELLS_VERTICAL * CELLS_VERTICAL) / 2 + 1;
            
            for(let triesdist = 0; triesdist < 5; triesdist++){
                const spawnx = p.x + Math.cos(dir) * (dist + triesdist);
                const spawny = p.y + Math.sin(dir) * (dist + triesdist);

                if(players.some(p2 => p2.id != p.id && p2.distanceTo({ x: spawnx, y: spawny }) < dist)) continue;

                const cellx = Math.floor(spawnx);
                const celly = Math.floor(spawny);

                const layer = game.world.getLayer(0)!;
                const cell = layer.getCell(cellx, celly, false);
                
                if(cell === null) continue;
                if(cell.block !== null) continue;

                if(layer.light.get([cellx,celly].toString()) !== undefined) continue;

                const zombie = new NonplayerEntity(layer, spawnx, spawny, 0, "zombie");
                layer.entityManager.addEntity(zombie);
                console.log("zombie spawned");

                break;
            }
        }
    }
    
    /** Populates the given newly generated chunk */
    populateChunk(chunk: Chunk, game: Game): void {
        
    }
    
    /** Does repopulate checks on the given loaded chunk */
    repopulateChunk(chunk: Chunk, game: Game, entitiesdata: any[]): void {
        
    }
}

export default CaveLayerSpawner;
