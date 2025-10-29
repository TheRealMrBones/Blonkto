import { SerializedUpdateEntity, SerializedWriteEntity } from "./serializedEntity.js";

/** Defines the format for serialized updates of a nonplayer entity */
export type SerializedUpdateNonplayerEntity = SerializedUpdateEntity & {};

/** Defines the format for serialized writes of a nonplayer entity */
export type SerializedWriteNonplayerEntity = SerializedWriteEntity & {
    type: string,
    entitydefinition: string,
    componentdata?: { [key: string]: any },
};
