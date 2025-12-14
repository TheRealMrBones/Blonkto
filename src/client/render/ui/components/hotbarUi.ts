import HotbarSlotUi from "client/render/ui/components/hotbarSlotUi.js";
import UiDiv from "client/render/ui/elements/uiDiv.js";
import { AnchorDirection } from "shared/physics/anchorDirection.js";

/** The ui container for the players hotbar slots */
class HotbarUi extends UiDiv {
    override children: HotbarSlotUi[];

    constructor(){
        super(64 * 9 + 20 * 8, 64 + 10);

        this.setAnchorDirection(AnchorDirection.BOTTOM)
            .setPosition([0, 5]);

        this.children = [];
        for(let i = 0; i < 9; i++){
            const slot = new HotbarSlotUi()
                .setPosition([i * (64 + 20), 0]);
            slot.setParent(this);

            this.children.push(slot);
        }

        this.children[0].select();
    }

    // #region getters

    /** Returns the requested slot of the hotbar */
    getSlot(slot: number): HotbarSlotUi {
        return this.children[slot];
    }

    // #endregion
}

export default HotbarUi;
