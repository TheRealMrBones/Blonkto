import Component from '../component';
import Item from '../../items/item';

class BuildComponent implements Component<Item> {
    static cid: string = "build_component";
    block: string;

    constructor(block: string){
        this.block = block;
    }

    getcid(): string {
        return BuildComponent.cid;
    }
}

export default BuildComponent;