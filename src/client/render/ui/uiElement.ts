import Circle from "../../../shared/physics/circle.js";
import { checkCollision } from "../../../shared/physics/collision.js";
import CollisionObject from "../../../shared/physics/collisionObject.js";
import V2D from "../../../shared/physics/vector2d.js";
import { Vector2D } from "../../../shared/types.js";
import { MouseEventType } from "./mouseEventType.js";

/** An element of the games ui that has a position and shape on the screen */
abstract class UiElement {
    abstract body: CollisionObject;
    protected hidden: boolean;
    
    protected parent: UiElement | null;
    protected children: UiElement[];

    constructor(){
        this.hidden = false;
        
        this.parent = null;
        this.children = [];
    }

    // #region getters

    /** Returns the position of this ui element */
    getPosition(): Vector2D {
        return this.body.position;
    }

    /** Returns the absolute position of this ui element */
    getAbsolutePosition(): Vector2D {
        return this.parent === null ?this.body.position :
            V2D.add(this.body.position, this.parent.getAbsolutePosition());
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

    /** Sets the position of this ui element */
    setPosition(pos: Vector2D): void {
        this.body.position = pos;
    }

    /** Moves the position of this ui element the given amounts */
    movePosition(move: Vector2D): void {
        this.body.position = V2D.add(this.body.position, move);
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
    render(): void {
        for(const child of this.children){
            child.render();
        }
    }

    /** Checks if this ui element or its children are candidates for a mouse event and returns if the click is terminated */
    checkMouseEvent(pos: Vector2D, eventtype: MouseEventType): boolean {
        const newpos = V2D.subtract(pos, this.getPosition());

        if(checkCollision(this.body, new Circle(pos, 0))){
            switch(eventtype){
                case MouseEventType.MouseDown: this.onMouseDown(newpos);
                case MouseEventType.MouseUp: this.onMouseUp(newpos);
                case MouseEventType.MouseMove: this.onMouseMove(newpos);
                case MouseEventType.Hover: this.onHover(newpos);
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
    abstract onMouseDown(pos: Vector2D): void;

    /** Handles the mouse up event for this ui element */
    abstract onMouseUp(pos: Vector2D): void;

    /** Handles the mouse move event for this ui element */
    abstract onMouseMove(pos: Vector2D): void;

    /** Handles the hover event for this ui element */
    abstract onHover(pos: Vector2D): void;

    /** Handles the hover end event for this ui element */
    abstract onHoverEnd(pos: Vector2D): void;

    /** Handles the focus event for this ui element */
    abstract onFocus(): void;

    /** Handles the blur event for this ui element */
    abstract onBlur(): void;

    // #endregion
}

export default UiElement;
