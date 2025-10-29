/** Defines the format for serialized updates of a recipe */
export type SerializedRecipe = {
    ingredients: SerializedIngredient[],
    result: string,
    resultcount: number,
    station: string | null,
    asset: string,
};

/** Defines the format for serialized updates of a recipes ingredient */
export type SerializedIngredient = {
    item: string,
    amount: number,
    asset: string,
};
