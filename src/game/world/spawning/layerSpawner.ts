import SharedConfig from "configs/shared.js";
import Game from "game/game.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import Chunk from "game/world/chunk.js";
import Layer from "game/world/layer.js";
import ILayerSpawner from "game/world/spawning/ILayerSpawner.js";
import multiNumberHash from "shared/random/multiNumberHash.js";
import SeededRandom from "shared/random/seededRandom.js";

const { CHUNK_SIZE, CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** Spawner object for a layer to spawn entities */
class LayerSpawner implements ILayerSpawner {
    constructor(){

    }

    /** Ticks spawning in the given layer */
    tickSpawning(layer: Layer, game: Game): void {
        if(game.world.isDay()) return;

        const players = [...layer.entityManager.getPlayerEntities()];

        for(const p of players){
            if(Math.random() > .01) return;

            const dir = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(CELLS_HORIZONTAL * CELLS_HORIZONTAL + CELLS_VERTICAL * CELLS_VERTICAL) / 2 + 1;

            for(let triesdist = 0; triesdist < 5; triesdist++){
                const spawnx = p.x + Math.cos(dir) * (dist + triesdist);
                const spawny = p.y + Math.sin(dir) * (dist + triesdist);

                if(players.some(p2 => p2.id != p.id && p2.distanceTo([spawnx, spawny]) < dist)) continue;

                const cellx = Math.floor(spawnx);
                const celly = Math.floor(spawny);
                const cell = layer.getCell(cellx, celly, false);

                if(cell === null) continue;
                if(cell.block !== null) continue;

                if(layer.light.get([cellx,celly].toString()) !== undefined) continue;

                if(Math.random() > .05){
                    const zombie = new NonplayerEntity(layer, spawnx, spawny, 0, "zombie");
                    layer.entityManager.addEntity(zombie);
                }else{
                    const megazombie = new NonplayerEntity(layer, spawnx, spawny, 0, "mega_zombie");
                    layer.entityManager.addEntity(megazombie);
                }
                break;
            }
        }
    }

    /** Populates the given newly generated chunk */
    populateChunk(chunk: Chunk, game: Game): void {
        const seed = multiNumberHash(chunk.chunkx, chunk.chunky, chunk.layer.seed, 2);
        const rng = new SeededRandom(seed);

        for(let x = 0; x < CHUNK_SIZE; x++){
            for(let y = 0; y < CHUNK_SIZE; y++){
                const cell = chunk.cells[x][y];
                if(cell.block !== null) return;

                if(rng.next() < .005){
                    const pig = new NonplayerEntity(chunk.layer, chunk.chunkx * CHUNK_SIZE + x + .5, chunk.chunky * CHUNK_SIZE + y + .5, 0, "pig");
                    chunk.layer.entityManager.addEntity(pig);
                }
            }
        }
    }

    /** Does repopulate checks on the given loaded chunk */
    repopulateChunk(chunk: Chunk, game: Game, entitiesdata: any[]): void {
        const minentities = 1;
        for(let i = minentities - entitiesdata.filter((e: any) => e.type == "entity").length; i > 0; i--){
            const x = Math.floor(Math.random() * CHUNK_SIZE);
            const y = Math.floor(Math.random() * CHUNK_SIZE);

            const cell = chunk.cells[x][y];
            if(cell.block !== null) continue;

            const pig = new NonplayerEntity(chunk.layer, chunk.chunkx * CHUNK_SIZE + x + .5, chunk.chunky * CHUNK_SIZE + y + .5, 0, "pig");
            chunk.layer.entityManager.addEntity(pig);
        }
    }
}

export default LayerSpawner;
