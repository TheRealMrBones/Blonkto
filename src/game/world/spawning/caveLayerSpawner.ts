import SharedConfig from "configs/shared.js";
import Game from "game/game.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import Chunk from "game/world/chunk.js";
import Layer from "game/world/layer.js";
import ILayerSpawner from "game/world/spawning/ILayerSpawner.js";

const { CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** Spawner object for a cave layer to spawn entities */
class CaveLayerSpawner implements ILayerSpawner {
    constructor(){

    }

    /** Ticks spawning in the given layer */
    tickSpawning(layer: Layer, game: Game): void {
        const players = [...layer.entityManager.getPlayerEntities()];

        if([...layer.entityManager.getNonplayerEntities()]
            .filter(e => e.definition.key == "zombie").length >= 15 * players.length) return;

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

                const zombie = new NonplayerEntity(layer, spawnx, spawny, 0, "zombie");
                layer.entityManager.addEntity(zombie);

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
