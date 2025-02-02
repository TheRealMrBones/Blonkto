import BlockRegistry from '../registries/blockRegistry';
import FloorRegistry from '../registries/floorRegistry';
import CeilingRegistry from '../registries/ceilingRegistry';
import Block from './block';
import Floor from './floor';
import Ceiling from './ceiling';

class Cell {
    block: Block | null;
    floor: Floor | null;
    ceiling: Ceiling | null;

    constructor(block: string | null, floor: string | null, ceiling: string | null){
        this.block = block ? BlockRegistry.Get(block) : null;
        this.floor = floor ? FloorRegistry.Get(floor) : null;
        this.ceiling = ceiling ? CeilingRegistry.Get(ceiling) : null;
    }

    // #region serialization

    serializeForLoad(){
        const data: any = {};

        if(this.block){
            data.block = this.block.serializeForLoad();
        }
        if(this.floor){
            data.floor = this.floor.serializeForLoad();
        }
        if(this.ceiling){
            data.ceiling = this.ceiling.serializeForLoad();
        }

        return data;
    }

    serializeForWrite(){
        const data: any = {};

        if(this.block){
            data.block = this.block.serializeForWrite();
        }
        if(this.floor){
            data.floor = this.floor.serializeForWrite();
        }
        if(this.ceiling){
            data.ceiling = this.ceiling.serializeForWrite();
        }

        return data;
    }

    // #endregion
}

export default Cell;