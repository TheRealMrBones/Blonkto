import UiElement from "client/render/ui/uiElement.js";
import Rectangle from "shared/physics/rectangle.js";

/** A text element for rendering text on the game screen */
class UiText extends UiElement {
    override body: Rectangle;

    private text: string;
    private color: string;
    private font: string;
    private fontsize: number;
    private textalign: CanvasTextAlign;
    private textbaseline: CanvasTextBaseline;
    private maxwidth: number | null;
    protected lineheight: number;

    constructor(text: string, fontsize: number){
        super();

        this.text = text;
        this.color = "black";
        this.font = "Arial";
        this.fontsize = fontsize;
        this.textalign = "left";
        this.textbaseline = "top";
        this.maxwidth = null;
        this.lineheight = fontsize * 1.2;

        const estimatedwidth = text.length * fontsize * 0.6;
        const estimatedheight = fontsize * 1.2;
        this.body = new Rectangle([0, 0], estimatedwidth, estimatedheight);
    }

    // #region builder methods

    /** Sets the text color */
    setColor(color: string): this {
        this.color = color;
        return this;
    }

    /** Sets the font family */
    setFont(font: string): this {
        this.font = font;
        return this;
    }

    /** Sets the maximum width for text wrapping */
    setMaxWidth(maxwidth: number | null): this {
        this.maxwidth = maxwidth;
        this.updateBodyDimensions();
        return this;
    }

    /** Sets the line height */
    setLineHeight(lineheight: number): this {
        this.lineheight = lineheight;
        this.updateBodyDimensions();
        return this;
    }

    // #endregion

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
        return this.fontsize;
    }

    // #endregion

    // #region setters

    /** Sets the text content */
    setText(text: string): void {
        this.text = text;
        this.updateBodyDimensions();
    }

    /** Sets the font size */
    setFontSize(fontsize: number): void {
        this.fontsize = fontsize;
        this.updateBodyDimensions();
    }

    /** Sets the text alignment */
    setTextAlign(align: CanvasTextAlign): void {
        this.textalign = align;
    }

    /** Sets the text baseline */
    setTextBaseline(baseline: CanvasTextBaseline): void {
        this.textbaseline = baseline;
    }

    // #endregion

    // #region private methods

    /** Updates the body dimensions based on text size */
    private updateBodyDimensions(): void {
        if(this.maxwidth === null){
            const estimatedwidth = this.text.length * this.fontsize * 0.6;
            const estimatedheight = this.fontsize * 1.2;
            this.body = new Rectangle(this.body.position, estimatedwidth, estimatedheight);
        } else {
            const lines = this.wrapText(this.text, this.maxwidth);
            const estimatedheight = lines.length * this.lineheight;
            this.body = new Rectangle(this.body.position, this.maxwidth, estimatedheight);
        }
    }

    /** Wraps text into lines based on max width and newline characters */
    private wrapText(text: string, maxwidth: number): string[] {
        const lines: string[] = [];
        const paragraphs = text.split('\n');

        for(const paragraph of paragraphs){
            if(paragraph === ''){
                lines.push('');
                continue;
            }

            const words = paragraph.split(' ');
            let currentline = '';

            for(const word of words){
                const testline = currentline === '' ? word : `${currentline} ${word}`;
                const estimatedwidth = testline.length * this.fontsize * 0.6;

                if(estimatedwidth > maxwidth && currentline !== ''){
                    lines.push(currentline);
                    currentline = word;
                }else{
                    currentline = testline;
                }
            }

            if(currentline !== ''){
                lines.push(currentline);
            }
        }

        return lines;
    }

    // #endregion

    // #region events

    /** Renders this ui element and its children */
    override render(context: CanvasRenderingContext2D): void {
        const pos = this.getAbsolutePosition();

        context.save();
        context.fillStyle = this.color;
        context.font = `${this.fontsize}px ${this.font}`;
        context.textAlign = this.textalign;
        context.textBaseline = this.textbaseline;

        const lines = this.maxwidth === null ? 
            this.text.split("\n") :
            this.wrapText(this.text, this.maxwidth);

        for(let i = 0; i < lines.length; i++){
            context.fillText(lines[i], pos[0], pos[1] + i * this.lineheight);
        }

        context.restore();

        super.render(context);
    }

    // #endregion
}

export default UiText;
