import { AnchorDirection } from "shared/physics/anchorDirection.js";
import { MouseEventType } from "client/render/ui/mouseEventType.js";
import Circle from "shared/physics/circle.js";
import { checkCollision } from "shared/physics/collision.js";
import CollisionObject from "shared/physics/collisionObject.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** An element of the games ui that has a position and shape on the screen */
abstract class UiElement {
    abstract body: CollisionObject;
    private setposition: Vector2D;
    private topleftposition: Vector2D;
    private anchordirection: AnchorDirection;
    protected hidden: boolean;

    protected padding: number;
    protected backgroundcolor: string | null;

    protected parent: UiElement | null;
    protected children: UiElement[];

    constructor(){
        this.setposition = [0, 0];
        this.topleftposition = [0, 0];
        this.anchordirection = AnchorDirection.TOP_LEFT;
        this.hidden = false;

        this.padding = 0;
        this.backgroundcolor = null;

        this.parent = null;
        this.children = [];

        window.addEventListener("resize", () => this.setPosition());
    }

    // #region builder methods

    /** Sets the position of this ui element */
    setPosition(pos?: Vector2D): this {
        if(pos !== undefined) this.setposition = pos;

        const windowwidth = window.innerWidth;
        const windowheight = window.innerHeight;
        const halfwindowwidth = windowwidth / 2;
        const halfwindowheight = windowheight / 2;

        switch(this.anchordirection){
            case AnchorDirection.TOP_LEFT:
                this.body.setPosition([this.setposition[0], this.setposition[1]]);
                break;
            case AnchorDirection.TOP:
                this.body.setPosition([this.setposition[0] + halfwindowwidth, this.setposition[1]]);
                break;
            case AnchorDirection.TOP_RIGHT:
                this.body.setPosition([windowwidth - this.setposition[0], this.setposition[1]]);
                break;
            case AnchorDirection.LEFT:
                this.body.setPosition([this.setposition[0], this.setposition[1] + halfwindowheight]);
                break;
            case AnchorDirection.CENTER:
                this.body.setPosition([this.setposition[0] + halfwindowwidth, this.setposition[1] + halfwindowheight]);
                break;
            case AnchorDirection.RIGHT:
                this.body.setPosition([windowwidth - this.setposition[0], this.setposition[1] + halfwindowheight]);
                break;
            case AnchorDirection.BOTTOM_LEFT:
                this.body.setPosition([this.setposition[0], windowheight - this.setposition[1]]);
                break;
            case AnchorDirection.BOTTOM:
                this.body.setPosition([this.setposition[0] + halfwindowwidth, windowheight - this.setposition[1]]);
                break;
            case AnchorDirection.BOTTOM_RIGHT:
                this.body.setPosition([windowwidth - this.setposition[0], windowheight - this.setposition[1]]);
                break;
        }

        this.body.moveForAnchor(this.anchordirection);

        const rect = this.body.getContainingRect();

        const halfwidth = rect.width / 2;
        const halfheight = rect.height / 2;

        this.topleftposition = [rect.getPosition()[0] - halfwidth + this.padding, rect.getPosition()[1] - halfheight + this.padding];

        return this;
    }

    /** Sets the anchor direction of this ui element */
    setAnchorDirection(anchordirection: AnchorDirection): this {
        this.anchordirection = anchordirection;
        this.setPosition();
        return this;
    }

    /** Sets the padding */
    setPadding(padding: number): this {
        this.padding = padding;
        this.setPosition();
        return this;
    }

    /** Sets the background color */
    setBackgroundColor(color: string): this {
        this.backgroundcolor = color;
        return this;
    }

    // #endregion

    // #region getters

    /** Returns the position of this ui element always as top left */
    getPosition(): Vector2D {
        return this.topleftposition;
    }

    /** Returns the absolute position of this ui element always as top left */
    getAbsolutePosition(): Vector2D {
        return this.parent === null ? this.topleftposition :
            V2D.add(this.topleftposition, this.parent.getAbsolutePosition());
    }

    /** Returns the position of this ui element as set on build */
    getSetPosition(): Vector2D {
        return this.setposition;
    }

    /** Returns if this ui element is on the base layer (has no parent) */
    isBaseElement(): boolean {
        return (this.parent === null);
    }

    /** Returns the parent element of this ui element */
    getParent(): UiElement | null {
        return this.parent;
    }

    /** Returns the children elements of this ui element */
    getChildren(): UiElement[] {
        return this.children;
    }

    /** Returns the padding */
    getPadding(): number {
        return this.padding;
    }

    /** Returns the background color */
    getBackgroundColor(): string | null {
        return this.backgroundcolor;
    }

    /** Returns if this ui element is hidden or not */
    isHidden(): boolean {
        return this.hidden;
    }

    /** Returns if this ui element has event passthrough */
    eventPassthrough(): boolean {
        return false;
    }

    // #endregion

    // #region setters

    /** Moves the position of this ui element the given amounts */
    movePosition(move: Vector2D): void {
        this.setPosition(V2D.add(this.setposition, move));
    }

    /** Sets the parent element of this ui element */
    setParent(parent: UiElement | null): void {
        this.parent = parent;
    }

    /** Hides this ui element */
    hide(): void {
        this.hidden = true;
    }

    /** Shows this ui element */
    show(): void {
        this.hidden = false;
    }

    /** Toggles this ui elements hidden property */
    toggleHidden(): void {
        this.hidden = !this.hidden;
    }

    // #endregion

    // #region events

    /** Renders this ui element and its children */
    abstract render(context: CanvasRenderingContext2D): void;

    /** Checks if this ui element or its children are candidates for a mouse event and returns if the click is terminated */
    checkMouseEvent(pos: Vector2D, eventtype: MouseEventType): boolean {
        const newpos = V2D.subtract(pos, this.getPosition());

        if(checkCollision(this.body, new Circle(pos, 0))){
            switch(eventtype){
                case MouseEventType.MOUSE_DOWN:
                    this.onMouseDown(newpos);
                    break;
                case MouseEventType.MOUSE_UP:
                    this.onMouseUp(newpos);
                    break;
                case MouseEventType.MOUSE_MOVE:
                    this.onMouseMove(newpos);
                    break;
                case MouseEventType.HOVER:
                    this.onHover(newpos);
                    break;
            }

            if(!this.eventPassthrough()) return true;
        }

        for(const child of this.children){
            if(child.checkMouseEvent(newpos, eventtype)) return true;
        }

        return false;
    }

    // #endregion

    // #region event handlers

    /** Handles the mouse down event for this ui element */
    onMouseDown(pos: Vector2D): void {

    }

    /** Handles the mouse up event for this ui element */
    onMouseUp(pos: Vector2D): void {

    }

    /** Handles the mouse move event for this ui element */
    onMouseMove(pos: Vector2D): void {

    }

    /** Handles the hover event for this ui element */
    onHover(pos: Vector2D): void {

    }

    /** Handles the hover end event for this ui element */
    onHoverEnd(pos: Vector2D): void {

    }

    /** Handles the focus event for this ui element */
    onFocus(): void {

    }

    /** Handles the blur event for this ui element */
    onBlur(): void {

    }

    // #endregion

    // #region helpers

    /** Renders the background on the given canvas */
    protected renderBackground(context: CanvasRenderingContext2D): void {
        context.save();

        const rect = this.body.getContainingRect();
        const pos = V2D.subtract(this.topleftposition, [this.padding, this.padding]);

        if(this.backgroundcolor !== null){
            context.fillStyle = this.backgroundcolor;
            context.fillRect(pos[0], pos[1], rect.width + this.padding * 2, rect.height + this.padding * 2);
        }

        context.restore();
    }

    /** Renders the children of this ui element on the given canvas */
    protected renderChildren(context: CanvasRenderingContext2D): void {
        for(const child of this.children){
            if(!child.isHidden()) child.render(context);
        }
    }

    // #endregion
}

export default UiElement;
