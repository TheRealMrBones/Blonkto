import { Pos } from "../shared/types.js";
import Entity from "./objects/entity.js";

/** Defines the format of the click and interact message after being parsed */
export type ClickContentExpanded = {
    dir: number;
    cellpos: Pos;
    dist: number;
    entity: Entity | null;
};