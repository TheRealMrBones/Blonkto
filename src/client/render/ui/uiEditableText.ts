import UiText from "client/render/ui/uiText.js";
import { Vector2D } from "shared/types.js";

/** An editable text element that accepts keyboard input */
class UiEditableText extends UiText {
    private selected: boolean;
    private cursorvisible: boolean;
    private cursorblinktime: number;
    private lastblinkupdate: number;
    private onsubmitcallbacks: ((text: string) => void)[];

    constructor(text: string, fontsize: number){
        super(text, fontsize);

        this.selected = false;
        this.cursorvisible = true;
        this.cursorblinktime = 500;
        this.lastblinkupdate = Date.now();
        this.onsubmitcallbacks = [];

        this.setupKeyboardListener();
    }

    // #region getters

    /** Returns if this text element is selected */
    isSelected(): boolean {
        return this.selected;
    }

    // #endregion

    // #region setters

    /** Sets the selected state */
    setSelected(selected: boolean): void {
        this.selected = selected;
        if(selected){
            this.cursorvisible = true;
            this.lastblinkupdate = Date.now();
        }
    }

    /** Sets the cursor blink time in milliseconds */
    setCursorBlinkTime(time: number): void {
        this.cursorblinktime = time;
    }

    // #endregion

    // #region event listeners

    /** Sets up keyboard event listener */
    private setupKeyboardListener(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if(!this.selected) return;

            if(e.key === 'Enter'){
                this.selected = false;
                this.emitSubmit();
                e.preventDefault();
            }else if(e.key === 'Backspace'){
                const currenttext = this.getText();
                if(currenttext.length > 0){
                    this.setText(currenttext.slice(0, -1));
                }
                e.preventDefault();
            }else if(e.key === 'Escape'){
                this.selected = false;
                e.preventDefault();
            }else if(e.key.length === 1){
                this.setText(this.getText() + e.key);
                e.preventDefault();
            }
        });
    }

    /** Adds a callback for when text is submitted */
    onSubmit(callback: (text: string) => void): void {
        this.onsubmitcallbacks.push(callback);
    }

    /** Emits the submit event to all listeners */
    private emitSubmit(): void {
        const text = this.getText();
        for(const callback of this.onsubmitcallbacks){
            callback(text);
        }
    }

    // #endregion

    // #region event handlers

    /** Handles the mouse down event for this ui element */
    override onMouseDown(pos: Vector2D): void {
        this.setSelected(true);
    }

    // #endregion

    // #region events

    /** Updates cursor blink state */
    private updateCursor(): void {
        if(!this.selected) return;

        const now = Date.now();
        if(now - this.lastblinkupdate >= this.cursorblinktime){
            this.cursorvisible = !this.cursorvisible;
            this.lastblinkupdate = now;
        }
    }

    /** Renders this ui element and its children */
    override render(context: CanvasRenderingContext2D): void {
        this.updateCursor();

        const pos = this.getAbsolutePosition();

        context.save();
        context.fillStyle = this.getColor();
        context.font = `${this.getFontSize()}px ${this.getFont()}`;
        context.textAlign = "left";
        context.textBaseline = "top";

        const text = this.getText();
        const lines = text.split("\n");

        for(let i = 0; i < lines.length; i++){
            context.fillText(lines[i], pos[0], pos[1] + i * this.lineheight);
        }

        // Render cursor
        if(this.selected && this.cursorvisible){
            const lastline = lines[lines.length - 1];
            const textwidth = context.measureText(lastline).width;
            const cursorx = pos[0] + textwidth;
            const cursory = pos[1] + (lines.length - 1) * this.lineheight;

            context.fillRect(cursorx, cursory, 2, this.getFontSize());
        }

        context.restore();

        super.render(context);
    }

    // #endregion
}

export default UiEditableText;
