import { Pos } from "../../shared/types.js";
import World from "./world.js";

/** Returns the fastest path to get from start to end as an array of positions */
export function pathfind(start: Pos, end: Pos, world: World): Pos[] | null {
    const maxdistfromstart = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y)) * 2;

    const openset = new Set<string>();
    const closedset = new Set<string>();
    const camefrom = new Map<string, Pos>();
    const gscore = new Map<string, number>();
    const fscore = new Map<string, number>();

    const startkey = posToKey(start);
    const endkey = posToKey(end);

    openset.add(startkey);
    gscore.set(startkey, 0);
    fscore.set(startkey, heuristic(start, end));

    while(openset.size > 0){
        const currentkey = getLowestFScore(openset, fscore);
        const current = keyToPos(currentkey);

        if(currentkey === endkey) return getParentsInOrder(camefrom, startkey, endkey);

        openset.delete(currentkey);
        closedset.add(currentkey);

        for(const neighbor of getNeighbors(current, world)){
            const neighborkey = posToKey(neighbor);
            if(closedset.has(neighborkey)) continue;
            if(maxdistfromstart < Math.max(Math.abs(start.x - neighbor.x), Math.abs(start.y - neighbor.y))) continue;

            const tentativegscore = gscore.get(currentkey)! + 1;
            if(!openset.has(neighborkey)){
                openset.add(neighborkey);
            }else if(tentativegscore >= gscore.get(neighborkey)!) {
                continue;
            }

            camefrom.set(neighborkey, current);
            gscore.set(neighborkey, tentativegscore);
            fscore.set(neighborkey, gscore.get(neighborkey)! + heuristic(neighbor, end));
        }
    }

    return null;
}

/** Returns the position in the open set with the lowest fScore */
function getLowestFScore(openset: Set<string>, fscore: Map<string, number>): string {
    let lowest: string | null = null;
    let lowestscore = Infinity;

    for(const key of Array.from(openset)){
        const score = fscore.get(key) ?? Infinity;
        if(score < lowestscore){
            lowestscore = score;
            lowest = key;
        }
    }

    return lowest!;
}

/** Converts the cameFrom map to an array of parents in order */
export function getParentsInOrder(camefrom: Map<string, Pos>, startkey: string, endkey: string): Pos[] {
    const path: Pos[] = [];
    let currentkey: string | undefined = endkey;

    while(currentkey && currentkey !== startkey){
        const current = keyToPos(currentkey);
        path.unshift(current);
        currentkey = posToKey(camefrom.get(currentkey)!);
    }

    return path;
}

/** Returns all neighbors of a cell that are not blocked (8 directional) */
function getNeighbors(pos: Pos, world: World): Pos[] {
    const neighbors: Pos[] = [];
    for(let dx = -1; dx <= 1; dx++){
        for (let dy = -1; dy <= 1; dy++) {
            if(dx === 0 && dy === 0) continue;

            const neighbor = { x: pos.x + dx, y: pos.y + dy };
            const cell = world.getCell(neighbor.x, neighbor.y, false);
            if(cell === null) continue;
            if(cell.block !== null) continue;

            if(dx != 0 && dy != 0){
                const neighborx = { x: pos.x + dx, y: pos.y };
                const neighbory = { x: pos.x, y: pos.y + dy };

                const cellx = world.getCell(neighborx.x, neighborx.y, false);
                if(cellx === null) continue;
                if(cellx.block !== null) continue;

                const celly = world.getCell(neighbory.x, neighbory.y, false);
                if(celly === null) continue;
                if(celly.block !== null) continue;
            }

            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

/** Returns the value corresponding to how close the start point is to the end (lower = closer) */
function heuristic(start: Pos, end: Pos): number {
    const dx = Math.abs(start.x - end.x);
    const dy = Math.abs(start.y - end.y);
    return Math.min(dx, dy) * 14 + Math.abs(dx - dy) * 10;
}

/** Converts a position to a unique string key */
function posToKey(pos: Pos): string {
    return `${pos.x},${pos.y}`;
}

/** Converts a unique string key back to a position */
function keyToPos(key: string): Pos {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
}