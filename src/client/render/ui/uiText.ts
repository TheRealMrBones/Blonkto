import UiElement from "client/render/ui/uiElement.js";
import Rectangle from "shared/physics/rectangle.js";

/** A text element for rendering text on the game screen */
class UiText extends UiElement {
    override body: Rectangle;

    private text: string;
    private color: string;
    private font: string;
    private fontSize: number;
    private textAlign: CanvasTextAlign;
    private textBaseline: CanvasTextBaseline;

    constructor(text: string, fontSize: number, color: string, font: string = "Arial"){
        super();

        this.text = text;
        this.color = color;
        this.font = font;
        this.fontSize = fontSize;
        this.textAlign = "left";
        this.textBaseline = "top";

        // Create a rectangular body based on approximate text dimensions
        // This is a rough estimate - actual text width will be measured during render
        const estimatedWidth = text.length * fontSize * 0.6;
        const estimatedHeight = fontSize * 1.2;
        this.body = new Rectangle([0, 0], estimatedWidth, estimatedHeight);
    }

    // #region getters

    /** Returns the text content */
    getText(): string {
        return this.text;
    }

    /** Returns the text color */
    getColor(): string {
        return this.color;
    }

    /** Returns the font family */
    getFont(): string {
        return this.font;
    }

    /** Returns the font size */
    getFontSize(): number {
        return this.fontSize;
    }

    // #endregion

    // #region setters

    /** Sets the text content */
    setText(text: string): void {
        this.text = text;
        this.updateBodyDimensions();
    }

    /** Sets the text color */
    setColor(color: string): void {
        this.color = color;
    }

    /** Sets the font family */
    setFont(font: string): void {
        this.font = font;
    }

    /** Sets the font size */
    setFontSize(fontSize: number): void {
        this.fontSize = fontSize;
        this.updateBodyDimensions();
    }

    /** Sets the text alignment */
    setTextAlign(align: CanvasTextAlign): void {
        this.textAlign = align;
    }

    /** Sets the text baseline */
    setTextBaseline(baseline: CanvasTextBaseline): void {
        this.textBaseline = baseline;
    }

    // #endregion

    // #region private methods

    /** Updates the body dimensions based on text size */
    private updateBodyDimensions(): void {
        const estimatedWidth = this.text.length * this.fontSize * 0.6;
        const estimatedHeight = this.fontSize * 1.2;
        this.body = new Rectangle([0, 0], estimatedWidth, estimatedHeight);
    }

    // #endregion

    // #region events

    /** Renders this ui element and its children */
    override render(context: CanvasRenderingContext2D): void {
        const pos = this.getAbsolutePosition();

        context.save();
        context.fillStyle = this.color;
        context.font = `${this.fontSize}px ${this.font}`;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;
        context.fillText(this.text, pos[0], pos[1]);
        context.restore();

        super.render(context);
    }

    // #endregion
}

export default UiText;
