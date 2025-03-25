import { Pos } from "../../shared/types.js";
import World from "./world.js";

/** Returns the fastest path to get from start to end as an array of positions */
export function pathfind(start: Pos, end: Pos, world: World): Pos[] | null {
    const openSet = new Set<string>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Pos>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = posToKey(start);
    const endKey = posToKey(end);

    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, end));

    while (openSet.size > 0) {
        const currentKey = getLowestFScore(openSet, fScore);
        const current = keyToPos(currentKey);

        if (currentKey === endKey) {
            return getParentsInOrder(cameFrom, startKey, endKey);
        }

        openSet.delete(currentKey);
        closedSet.add(currentKey);

        for (const neighbor of getNeighbors(current, world)) {
            const neighborKey = posToKey(neighbor);
            if (closedSet.has(neighborKey)) {
                continue;
            }

            const tentativeGScore = gScore.get(currentKey)! + 1;
            if (!openSet.has(neighborKey)) {
                openSet.add(neighborKey);
            } else if (tentativeGScore >= gScore.get(neighborKey)!) {
                continue;
            }

            cameFrom.set(neighborKey, current);
            gScore.set(neighborKey, tentativeGScore);
            fScore.set(neighborKey, gScore.get(neighborKey)! + heuristic(neighbor, end));
        }
    }

    return null;
}

/** Returns the position in the open set with the lowest fScore */
function getLowestFScore(openSet: Set<string>, fScore: Map<string, number>): string {
    let lowest: string | null = null;
    let lowestScore = Infinity;

    for (const key of Array.from(openSet)) {
        const score = fScore.get(key) ?? Infinity;
        if (score < lowestScore) {
            lowestScore = score;
            lowest = key;
        }
    }

    return lowest!;
}

/** Converts the cameFrom map to an array of parents in order */
export function getParentsInOrder(cameFrom: Map<string, Pos>, startKey: string, endKey: string): Pos[] {
    const path: Pos[] = [];
    let currentKey: string | undefined = endKey;

    while (currentKey && currentKey !== startKey) {
        const current = keyToPos(currentKey);
        path.unshift(current);
        currentKey = posToKey(cameFrom.get(currentKey)!);
    }

    if (currentKey === startKey) {
        path.unshift(keyToPos(startKey));
    }

    return path;
}

/** Returns all neighbors of a cell that are not blocked (8 directional) */
function getNeighbors(pos: Pos, world: World): Pos[] {
    const neighbors: Pos[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            const neighbor = { x: pos.x + dx, y: pos.y + dy };
            const cell = world.getCell(neighbor.x, neighbor.y, false);
            if (cell === null) continue;
            if (cell.block !== null) continue;

            if (dx != 0 && dy != 0) {
                const neighborX = { x: pos.x + dx, y: pos.y };
                const neighborY = { x: pos.x, y: pos.y + dy };

                const cellX = world.getCell(neighborX.x, neighborX.y, false);
                if (cellX === null) continue;
                if (cellX.block !== null) continue;

                const cellY = world.getCell(neighborY.x, neighborY.y, false);
                if (cellY === null) continue;
                if (cellY.block !== null) continue;
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
    const [x, y] = key.split(',').map(Number);
    return { x, y };
}