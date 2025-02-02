import Component from '../component';
import Item from '../../items/item';
import Block from '../../world/block';

class BuildComponent implements Component<Item> {
    static cid: string = "build_component";
    block: Block;

    constructor(block: Block){
        this.block = block;
    }

    getcid(): string {
        return BuildComponent.cid;
    }
}

export default BuildComponent;