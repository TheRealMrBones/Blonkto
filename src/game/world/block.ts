import RegistryValue from '../registries/registryValue';
import ComponentHandler from '../components/componentHandler';

import Constants from '../../shared/constants';
const { ASSETS, SHAPES } = Constants;

class Block implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;
    scale: number = 1;
    shape: number = SHAPES.SQUARE;

    componentHandler: ComponentHandler<Block>;

    constructor(displayname: string, asset: string | null, scale?: number, shape?: number){
        this.displayname = displayname;
        if(asset != null) this.asset = asset;
        if(scale !== undefined) this.scale = scale;
        if(shape !== undefined) this.shape = shape;

        this.componentHandler = new ComponentHandler<Block>(this);
    }

    mapRegistryKey(key: string): void {
        this.name = key;
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
        }
    }

    serializeForWrite(){
        return {
            name: this.name,
        };
    }

    // #endregion
}

export default Block;