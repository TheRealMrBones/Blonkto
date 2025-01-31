import Item from './item.js';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class SwordItem extends Item {
    static itemid = 3;

    constructor(id){
        super(id);
        
        this.name = "Sword";
        this.attack = 2;
        this.asset = ASSETS.MISSING_TEXTURE;
    }
}

export default SwordItem;