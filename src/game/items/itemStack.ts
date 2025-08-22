import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import ItemRegistry from "../registries/itemRegistry.js";
import ItemDefinition from "../definitions/itemDefinition.js";
import { ClickContentExpanded } from "../managers/socketManager.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";

/** An in game instance of an item/stack of multiple of the same item */
class ItemStack implements IRegistryDefinedWithComponents<ItemDefinition> {
    readonly definition: ItemDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();

    private amount: number = 1;

    constructor(item: string, amount?: number){
        this.definition = ItemRegistry.get(item);
        this.initComponentData();

        if(amount !== undefined) this.setAmount(amount);
    }

    /** Returns the item stack from its save data */
    static readFromSave(data: any): ItemStack {
        const stack = new ItemStack(data.name, data.amount);
        stack.loadComponentData(data.componentdata);
        return stack;
    }

    // #region getters

    /** Get the amount of the item this stack contains */
    getAmount(): number{
        return this.amount;
    }

    // #endregion

    // #region setters

    /** Sets the amount of the item this stack contains */
    setAmount(amount: number): void {
        this.amount = Math.min(Math.max(amount, 0), this.definition.getStackSize());
    }

    /** Adds to the amount of the item this stack contains */
    addAmount(amount: number): boolean {
        const oldamount = this.amount;
        this.setAmount(this.amount + amount);
        return (this.amount == oldamount + amount);
    }

    /** Removes from the amount of the item this stack contains */
    removeAmount(amount: number): boolean {
        this.setAmount(this.amount - amount);
        return (this.amount == 0);
    }

    /** Merges this stack with another stack if it is of the same item */
    mergeStack(otherstack: ItemStack): boolean {
        if(otherstack.definition.key != this.definition.key || this.amount == 0) return false;

        const oldamount = this.amount;
        this.addAmount(otherstack.amount);
        const diff = this.amount - oldamount;

        return otherstack.removeAmount(diff);
    }

    // #endregion

    // #region events

    /** sends the use event to all listeners for this stacks item type and returns if default action */
    use(game: Game, player: Player, info: ClickContentExpanded): boolean {
        return this.definition.emitUseEvent(this, game, player, info);
    }

    /** sends the interact event to all listeners for this stacks item type and returns if default action */
    interact(game: Game, player: Player, info: ClickContentExpanded): boolean {
        return this.definition.emitInteractEvent(this, game, player, info);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this items data for a game update to the client */
    serializeForUpdate(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            displayname: this.definition.getDisplayName(),
            name: this.definition.key,
            asset: this.definition.getAsset(),
            amount: this.amount,
            ...componentdata,
        };
    }

    /** Returns an object representing this items data for writing to the save */
    serializeForWrite(): SerializedWriteItemStack {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteItemStack = {
            name: this.definition.key,
            amount: this.amount,
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion

    // #region component helpers

    /** Returns this stacks instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata.get(componentDataType.name) as T2;
    }

    /** Initializes this stacks required component data instances */
    private initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata.set(c.componentdata.name, new c.componentdata(c.parent));
        });
    }

    /** Loads this stacks required component data instances with the given data */
    private loadComponentData(data?: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata.get(componentdataloaded[0]) as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns an object representing this stacks component data for a game update to the client */
    private serializeComponentDataForUpdate(): any {
        let data: { [key: string]: any } = {};

        for(const componentdata of this.componentdata.values()){
            const cd = componentdata as unknown as ISerializableForUpdate;
            if(cd.serializeForUpdate === undefined) continue;

            const serialized = cd.serializeForUpdate();
            data = { ...data, ...serialized };
        }

        return data;
    }

    /** Returns an object representing this stacks component data for writing to the save */
    private serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of this.componentdata.entries()){
            const cd = componentdata[1] as unknown as ISerializableForWrite;
            if(cd.serializeForWrite === undefined) continue;

            const serialized = cd.serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion
}

/** Defines the format for serialized writes of an item stack */
export type SerializedWriteItemStack = {
    name: string,
    amount: number,
    componentdata?: any,
};

export default ItemStack;
