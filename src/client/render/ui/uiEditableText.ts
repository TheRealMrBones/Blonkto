import UiText from "client/render/ui/uiText.js";
import Rectangle from "shared/physics/rectangle.js";
import { Vector2D } from "shared/types.js";

/** An editable text element that accepts keyboard input */
class UiEditableText extends UiText {
    private selected: boolean;
    private cursorvisible: boolean;
    private cursorblinktime: number;
    private lastblinkupdate: number;
    private onsubmitcallbacks: ((text: string) => void)[];
    private cursorposition: number;
    private scrollmode: boolean;
    private scrolloffset: number;
    private selectionstart: number | null;
    private selectionend: number | null;

    constructor(text: string, fontsize: number){
        super(text, fontsize);

        this.selected = false;
        this.cursorvisible = true;
        this.cursorblinktime = 500;
        this.lastblinkupdate = Date.now();
        this.onsubmitcallbacks = [];
        this.cursorposition = text.length;
        this.scrollmode = false;
        this.scrolloffset = 0;
        this.selectionstart = null;
        this.selectionend = null;

        this.setupKeyboardListener();
    }

    // #region builder methods

    /** Enables scroll mode instead of text wrapping */
    setScrollMode(enabled: boolean): this {
        this.scrollmode = enabled;
        return this;
    }

    // #endregion

    // #region getters

    /** Returns if this text element is selected */
    isSelected(): boolean {
        return this.selected;
    }

    /** Returns the current cursor position */
    getCursorPosition(): number {
        return this.cursorposition;
    }

    /** Returns if there is an active selection */
    hasSelection(): boolean {
        return this.selectionstart !== null && this.selectionend !== null;
    }

    /** Returns the selected text */
    getSelectedText(): string {
        if(!this.hasSelection()) return "";
        const text = this.getText();
        const start = Math.min(this.selectionstart!, this.selectionend!);
        const end = Math.max(this.selectionstart!, this.selectionend!);
        return text.substring(start, end);
    }

    // #endregion

    // #region setters

    /** Sets the selected state */
    setSelected(selected: boolean): void {
        this.selected = selected;
        if(selected){
            this.cursorvisible = true;
            this.lastblinkupdate = Date.now();
        }else{
            this.scrolloffset = 0;
        }
    }

    /** Sets the cursor blink time in milliseconds */
    setCursorBlinkTime(time: number): void {
        this.cursorblinktime = time;
    }

    /** Sets the cursor position */
    setCursorPosition(position: number, extendselection: boolean = false): void {
        const text = this.getText();
        const oldposition = this.cursorposition;
        this.cursorposition = Math.max(0, Math.min(position, text.length));

        if(extendselection){
            if(this.selectionstart === null){
                this.selectionstart = oldposition;
            }
            this.selectionend = this.cursorposition;

            // Clear selection if start and end are the same
            if(this.selectionstart === this.selectionend){
                this.clearSelection();
            }
        }else{
            this.clearSelection();
        }

        this.updateScrollOffset();
    }

    /** Clears the current selection */
    clearSelection(): void {
        this.selectionstart = null;
        this.selectionend = null;
    }

    /** Deletes the selected text */
    private deleteSelection(): void {
        if(!this.hasSelection()) return;

        const text = this.getText();
        const start = Math.min(this.selectionstart!, this.selectionend!);
        const end = Math.max(this.selectionstart!, this.selectionend!);
        const newtext = text.slice(0, start) + text.slice(end);

        this.setText(newtext);
        this.cursorposition = start;
        this.clearSelection();
        this.updateScrollOffset();
    }

    // #endregion

    // #region event listeners

    /** Sets up keyboard event listener */
    private setupKeyboardListener(): void {
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if(!this.selected) return;

            const isshift = e.shiftKey;
            const isctrl = e.ctrlKey || e.metaKey;

            if(e.key === "Enter"){
                this.selected = false;
                this.emitSubmit();
                e.preventDefault();
            }else if(e.key === "Backspace"){
                if(this.hasSelection()){
                    this.deleteSelection();
                }else{
                    const currenttext = this.getText();
                    if(this.cursorposition > 0){
                        const newtext = currenttext.slice(0, this.cursorposition - 1) +
                                       currenttext.slice(this.cursorposition);
                        this.setText(newtext);
                        this.cursorposition--;
                        this.updateScrollOffset();
                    }
                }
                e.preventDefault();
            }else if(e.key === "Delete"){
                if(this.hasSelection()){
                    this.deleteSelection();
                }else{
                    const currenttext = this.getText();
                    if(this.cursorposition < currenttext.length){
                        const newtext = currenttext.slice(0, this.cursorposition) +
                                       currenttext.slice(this.cursorposition + 1);
                        this.setText(newtext);
                        this.updateScrollOffset();
                    }
                }
                e.preventDefault();
            }else if(e.key === "ArrowLeft"){
                this.setCursorPosition(this.cursorposition - 1, isshift);
                this.cursorvisible = true;
                this.lastblinkupdate = Date.now();
                e.preventDefault();
            }else if(e.key === "ArrowRight"){
                this.setCursorPosition(this.cursorposition + 1, isshift);
                this.cursorvisible = true;
                this.lastblinkupdate = Date.now();
                e.preventDefault();
            }else if(e.key === "Home"){
                this.setCursorPosition(0, isshift);
                this.cursorvisible = true;
                this.lastblinkupdate = Date.now();
                e.preventDefault();
            }else if(e.key === "End"){
                this.setCursorPosition(this.getText().length, isshift);
                this.cursorvisible = true;
                this.lastblinkupdate = Date.now();
                e.preventDefault();
            }else if(e.key === "a" && isctrl){
                this.selectionstart = 0;
                this.selectionend = this.getText().length;
                this.cursorposition = this.getText().length;
                e.preventDefault();
            }else if(e.key === "c" && isctrl){
                if(this.hasSelection()){
                    const selectedtext = this.getSelectedText();
                    navigator.clipboard.writeText(selectedtext).catch(err => {
                        console.error("Failed to copy to clipboard:", err);
                    });
                }
                e.preventDefault();
            }else if(e.key === "x" && isctrl){
                if(this.hasSelection()){
                    const selectedtext = this.getSelectedText();
                    navigator.clipboard.writeText(selectedtext).then(() => {
                        this.deleteSelection();
                    }).catch(err => {
                        console.error("Failed to cut to clipboard:", err);
                    });
                }
                e.preventDefault();
            }else if(e.key === "v" && isctrl){
                navigator.clipboard.readText().then(clipboardtext => {
                    if(this.hasSelection()){
                        this.deleteSelection();
                    }

                    const currenttext = this.getText();
                    const newtext = currenttext.slice(0, this.cursorposition) +
                                   clipboardtext +
                                   currenttext.slice(this.cursorposition);
                    this.setText(newtext);
                    this.cursorposition += clipboardtext.length;
                    this.updateScrollOffset();
                }).catch(err => {
                    console.error("Failed to read from clipboard:", err);
                });
                e.preventDefault();
            }else if(e.key === "Escape"){
                this.selected = false;
                this.clearSelection();
                e.preventDefault();
            }else if(e.key.length === 1 && !isctrl){
                if(this.hasSelection()){
                    this.deleteSelection();
                }

                const currenttext = this.getText();
                const newtext = currenttext.slice(0, this.cursorposition) +
                               e.key +
                               currenttext.slice(this.cursorposition);
                this.setText(newtext);
                this.cursorposition++;
                this.updateScrollOffset();
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

        // Calculate cursor position based on click location
        this.context.font = `${this.getFontSize()}px ${this.getFont()}`;

        const text = this.getText();
        const clickx = pos[0] + (this.scrollmode ? this.scrolloffset : 0);

        let closestposition = 0;
        let closestdistance = Math.abs(clickx);

        for(let i = 0; i <= text.length; i++){
            const textwidth = this.context.measureText(text.substring(0, i)).width;
            const distance = Math.abs(clickx - textwidth);

            if(distance < closestdistance){
                closestdistance = distance;
                closestposition = i;
            }
        }

        this.setCursorPosition(closestposition);
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
        this.renderBackground(context);

        this.updateCursor();

        const pos = this.getAbsolutePosition();

        context.save();

        context.fillStyle = this.getColor();
        context.font = `${this.getFontSize()}px ${this.getFont()}`;
        context.textAlign = "left";
        context.textBaseline = "top";

        const text = this.getText();

        if(this.scrollmode){
            // Render with scrolling in scroll mode - ALWAYS clip, not just when selected
            context.save();
            context.beginPath();
            context.rect(pos[0], pos[1], this.body.width, this.body.height);
            context.clip();

            // Render selection highlight (only when selected)
            if(this.selected && this.hasSelection()){
                const start = Math.min(this.selectionstart!, this.selectionend!);
                const end = Math.max(this.selectionstart!, this.selectionend!);

                const textbeforestart = text.substring(0, start);
                const selectedtext = text.substring(start, end);

                const startx = pos[0] + context.measureText(textbeforestart).width - this.scrolloffset;
                const selectionwidth = context.measureText(selectedtext).width;

                context.fillStyle = "rgba(100, 150, 255, 0.4)";
                context.fillRect(startx, pos[1], selectionwidth, this.getFontSize());
                context.fillStyle = this.getColor();
            }

            context.fillText(text, pos[0] - this.scrolloffset, pos[1]);

            // Render cursor (only when selected)
            if(this.selected && this.cursorvisible && !this.hasSelection()){
                const textbeforecursor = text.substring(0, this.cursorposition);
                const cursorx = pos[0] + context.measureText(textbeforecursor).width - this.scrolloffset;
                context.fillRect(cursorx, pos[1], 2, this.getFontSize());
            }

            context.restore();
        }else{
            // Render normally (with wrapping if parent class handles it)
            const lines = text.split("\n");

            // Render selection highlight (only for single line for now)
            if(this.selected && this.hasSelection() && lines.length === 1){
                const start = Math.min(this.selectionstart!, this.selectionend!);
                const end = Math.max(this.selectionstart!, this.selectionend!);

                const textbeforestart = text.substring(0, start);
                const selectedtext = text.substring(start, end);

                const startx = pos[0] + context.measureText(textbeforestart).width;
                const selectionwidth = context.measureText(selectedtext).width;

                context.fillStyle = "rgba(100, 150, 255, 0.4)";
                context.fillRect(startx, pos[1], selectionwidth, this.getFontSize());
                context.fillStyle = this.getColor();
            }

            for(let i = 0; i < lines.length; i++){
                context.fillText(lines[i], pos[0], pos[1] + i * this.lineheight);
            }

            // Render cursor at end if selected and not in scroll mode
            if(this.selected && this.cursorvisible && !this.scrollmode && !this.hasSelection()){
                const lastline = lines[lines.length - 1];
                const textwidth = context.measureText(lastline).width;
                const cursorx = pos[0] + textwidth;
                const cursory = pos[1] + (lines.length - 1) * this.lineheight;

                context.fillRect(cursorx, cursory, 2, this.getFontSize());
            }
        }

        context.restore();

        this.renderChildren(context);
    }

    // #endregion

    // #region helpers

    /** Updates the body dimensions based on text size */
    override updateBodyDimensions(): void {
        if(!this.scrollmode) super.updateBodyDimensions();
    }

    /** Updates scroll offset to keep cursor visible */
    private updateScrollOffset(): void {
        if(!this.scrollmode || this.body.width === 0) return;

        const text = this.getText();
        this.context.font = `${this.getFontSize()}px ${this.getFont()}`;

        const textbeforecursor = text.substring(0, this.cursorposition);
        const cursorx = this.context.measureText(textbeforecursor).width;

        const maxwidth = this.body.width;

        // Scroll right if cursor is beyond visible area
        if(cursorx - this.scrolloffset > maxwidth){
            this.scrolloffset = cursorx - maxwidth;
        }

        // Scroll left if cursor is before visible area
        if(cursorx - this.scrolloffset < 0){
            this.scrolloffset = cursorx;
        }

        // Don't scroll past the beginning
        if(this.scrolloffset < 0){
            this.scrolloffset = 0;
        }
    }

    // #endregion
}

export default UiEditableText;
