import Item from "client/inventory/item.js";
import UiImage from "client/render/ui/elements/uiImage.js";
import UiText from "client/render/ui/elements/uiText.js";
import { AnchorDirection } from "shared/physics/anchorDirection.js";

/** The ui component of a single slot in the player hotbar at the bottom of the screen */
class HotbarSlotUi extends UiImage {
    private item: Item | null = null;
    private readonly sizetext: UiText;

    constructor(){
        super(null, [64, 64]);

        this.setBackgroundColor("rgba(128, 128, 128, 0.5)")
            .setPadding(5);

        this.sizetext = new UiText("", 30)
            .setAnchorDirection(AnchorDirection.BOTTOM_LEFT)
            .setPosition([0, 5]);
        this.sizetext.setParent(this);

        this.children = [this.sizetext];
    }

    // #region update

    /** Updates the item in this hotbar slot */
    updateItem(item: Item | null, asset?: OffscreenCanvas): void {
        this.item = item;

        if(asset === undefined){
            this.setImage(null);
        }else{
            this.setImage(asset);
        }

        if(this.item !== null) this.sizetext.setText(`${this.item.amount}`);
    }

    /** Selects this hotbar slot */
    select(): void {
        this.setBorderColor("black");
    }

    /** Unselects this hotbar slot */
    unselect(): void {
        this.setBorderColor(null);
    }

    // #endregion
}

export default HotbarSlotUi;
