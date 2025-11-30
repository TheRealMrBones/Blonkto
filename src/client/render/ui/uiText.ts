import UiElement from "client/render/ui/uiElement.js";
import Rectangle from "shared/physics/rectangle.js";

/** A text element for rendering text on the game screen */
class UiText extends UiElement {
    override body: Rectangle;

    private text: string;
    private color: string;
    private backgroundcolor: string | null;
    private font: string;
    private fontsize: number;
    private textalign: CanvasTextAlign;
    private textbaseline: CanvasTextBaseline;
    private maxwidth: number | null;
    protected lineheight: number;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(text: string, fontsize: number){
        super();

        this.text = text;
        this.color = "black";
        this.backgroundcolor = null;
        this.font = "Arial";
        this.fontsize = fontsize;
        this.textalign = "left";
        this.textbaseline = "top";
        this.maxwidth = null;
        this.lineheight = fontsize * 1.2;

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d")!;

        this.body = new Rectangle([0, 0], 0, 0).setCornerPivot();
        this.updateBodyDimensions();
    }

    // #region builder methods

    /** Sets the text color */
    setColor(color: string): this {
        this.color = color;
        return this;
    }

    /** Sets the background color */
    setBackgroundColor(color: string): this {
        this.backgroundcolor = color;
        return this;
    }

    /** Sets the font family */
    setFont(font: string): this {
        this.font = font;
        this.updateBodyDimensions();
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
        const lines = this.maxwidth === null ? 
            this.text.split("\n") :
            this.wrapText(this.text, this.maxwidth);

        this.context.font = `${this.fontsize}px ${this.font}`;

        let maxwidth = 0;
        if(this.maxwidth === null){
            for(const line of lines){
                const width = this.context.measureText(line).width;
                if(width > maxwidth) maxwidth = width;
            }
        }else{
            maxwidth = this.maxwidth;
        }
        const height = lines.length * this.lineheight;

        this.body = new Rectangle(this.body.position, maxwidth, height);
    }

    /** Wraps text into lines based on max width and newline characters */
    private wrapText(text: string, maxwidth: number): string[] {
        this.context.font = `${this.fontsize}px ${this.font}`;

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
                const width = this.context.measureText(testline).width;

                if(width > maxwidth && currentline !== ''){
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

        if(this.backgroundcolor !== null){
            context.fillStyle = this.backgroundcolor;
            context.fillRect(pos[0], pos[1], this.body.width, this.body.height);
        }

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
