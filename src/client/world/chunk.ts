import { Cell } from "./cell.js";

/** The data of a chunk saved in the client world */
export type Chunk = {
    x: number;
    y: number;
    cells: Cell[][];
};
