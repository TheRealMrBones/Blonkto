import Item from './item.js';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class PickaxeItem extends Item {
    static itemid = 2;

    constructor(id){
        super(id);

        this.name = "Pickaxe";
        this.break = true;
        this.asset = ASSETS.MISSING_TEXTURE;
    }
}

export default PickaxeItem;