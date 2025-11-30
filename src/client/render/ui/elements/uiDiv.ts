import UiElement from "client/render/ui/elements/uiElement.js";
import Rectangle from "shared/physics/rectangle.js";

/** An empty frame for new ui elements to be put into */
class UiDiv extends UiElement {
    override body: Rectangle;

    private color: string;

    constructor(width: number, height: number, color: string){
        super();

        this.body = new Rectangle([0, 0], width, height);
        this.color = color;
    }

    // #region events

    /** Renders this ui element and its children */
    override render(context: CanvasRenderingContext2D): void {
        this.renderBackground(context);

        const pos = this.getAbsolutePosition();

        context.save();
        context.fillStyle = this.color;
        context.fillRect(pos[0], pos[1], this.body.width, this.body.height);
        context.restore();

        this.renderChildren(context);
    }

    // #endregion
}

export default UiDiv;
