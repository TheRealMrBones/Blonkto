import UiElement from "client/render/ui/elements/uiElement.js";
import Rectangle from "shared/physics/rectangle.js";

/** A ui element that displays an offscreen canvas image */
class UiImage extends UiElement {
    override body: Rectangle;

    private image: OffscreenCanvas | null;

    constructor(image: OffscreenCanvas | null){
        super();

        this.image = image;
        this.body = new Rectangle([0, 0], image === null ? 0 : image.width, image === null ? 0 : image.height);
    }

    // #region getters

    /** Returns the image of this ui element */
    getImage(): OffscreenCanvas | null {
        return this.image;
    }

    // #endregion

    // #region setters

    /** Sets the image of this ui element */
    setImage(image: OffscreenCanvas | null): void {
        this.image = image;
        this.body = new Rectangle([0, 0], image === null ? 0 : image.width, image === null ? 0 : image.height);
        this.setPosition();
    }

    // #endregion

    // #region events

    /** Renders this ui element and its children */
    render(context: CanvasRenderingContext2D): void {
        this.renderBackground(context);

        const pos = this.getAbsolutePosition();

        if(this.image !== null){
            context.save();
            context.drawImage(this.image, pos[0], pos[1]);
            context.restore();
        }

        this.renderChildren(context);
    }

    // #endregion
}

export default UiImage;
