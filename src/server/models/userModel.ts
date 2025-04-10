import crypto from "crypto";

const generateApiKey = () => crypto.randomUUID();

/** Returns if the requested user is an admin */
const isAdmin = async (userId: string): Promise<boolean> => {
    try {
        const user = {admin: false};//await prisma.user.findUnique({ where: { id: userId } });
        return user?.admin || false;
    } catch (error) {
        console.error("Error in isAdmin:", error);
        return false;
    }
};

/** Returns if the requested user is a mod */
const isMod = async (userId: string): Promise<boolean> => {
    try {
        const user = {mod: false};//await prisma.user.findUnique({ where: { id: userId } });
        return user?.mod || false;
    } catch (error) {
        console.error("Error in isMod:", error);
        return false;
    }
};

/** Sets the requested users admin status */
const setAdminStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        const updatedUser = null;/*await prisma.user.update({
            where: { id: userId },
            data: { admin: bool },
        });*/
        return updatedUser;
    } catch (error) {
        console.error("Error in setAdminStatus:", error);
        throw error;
    }
};

/** Sets the requested users mod status */
const setModStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        const updatedUser = null;/*await prisma.user.update({
            where: { id: userId },
            data: { mod: bool },
        });*/
        return updatedUser;
    } catch (error) {
        console.error("Error in setModStatus:", error);
        throw error;
    }
};

/** Returns the api key of the requested user */
const getApiKeyById = async (userId: string): Promise<any> => {
    try {
        const user = readAccount(userId);//await prisma.user.findUnique({ where: { id: userId } });
        return user?.apiKey;//.apiKey;
    } catch (error) {
        console.error("Error in getApiKeyById:", error);
        return null;
    }
};

/** Returns whether the requested api key is valid */
const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const user = readAccountByKey(apiKey);/*await prisma.user.findFirst({
            where: { apiKey: apiKey },
        });*/
        return !!user;
    } catch (error) {
        console.error("Error in verifyApiKey:", error);
        return false;
    }
};

/** Returns the user that currently uses the requested api key */
const getUserByApiKey = async (apiKey: string): Promise<any> => {
    try {
        return readAccountByKey(apiKey);/*await prisma.user.findFirst({
            where: { apiKey: apiKey },
        });*/
    } catch (error) {
        console.error("Error in getUserByApiKey:", error);
        return null;
    }
};

/** Returns a newly generated api key for the requested user */
const newApiKey = async (userId: string): Promise<any> => {
    try {
        const newApiKey = generateApiKey();
        const acc = readAccount(userId);
        if(!acc) return null;
        acc.apiKey = newApiKey;
        writeAccount(acc);/*await prisma.user.update({
            where: { id: userId },
            data: { apiKey: newApiKey },
        });*/
        return newApiKey;
    } catch (error) {
        console.error("Error in newApiKey:", error);
        return null;
    }
};

/** Returns the requested user from their username */
const getUserByUsername = async (username: string): Promise<any> => {
    try {
        return readAccount(username);//await prisma.user.findUnique({ where: { username: username }});
    } catch (error) {
        console.error("Error in getUserByUsername:", error);
        return null;
    }
};

/** Returns the requested users username from their id */
const getUsernameById = async (id: string): Promise<any> => {
    try {
        if (!id) return null;
        const user = {username: ""};/*await prisma.user.findUnique({
            where: {
                id: String(id)
            }
        });*/
        if (!user) throw new Error("User not found");
        return user.username;
    } catch (error) {
        console.error("Error in getUsernameById:", error);
        throw error;
    }
};

/** Returns the requested user from their id */
const getUserById = async (id: string): Promise<any> => {
    try {
        if (!id) return null;
        return readAccount(id);/*await prisma.user.findUnique({
            where: {
                id: String(id)
            }
        });*/
    } catch (error) {
        console.error("Error in getUserById:", error);
        throw error;
    }
};

/** Returns the list of all users */
const getAllUsers = async (): Promise<any> => {
    try {
        return null;//await prisma.user.findMany();
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return null;
    }
};

/** Creates a new user with the given username and password hash */
const createUser = async (username: string, hashedPw: string): Promise<any> => {
    try {
        const apiKey = generateApiKey();
        const user: Account = {
            username: username,
            id: username,
            hashedPw: hashedPw,
            apiKey: apiKey,
        };
        writeAccount(user);/*await prisma.user.create({
            data: { username, hashedPw, token },
            include: { Profile: true },
        });*/
        return user;
    } catch (error) {
        console.error("Error in createUser:", error);
        return null;
    }
};

/** Updates the requested users password hash to the new value */
const updateUserPassword = async (userId: string, hashedPassword: string): Promise<any> => {
    /*try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new Error("User not found");

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { hashedPw: hashedPassword },
        });

        return updatedUser;
    } catch (error) {
        console.error("Error in updateUserPassword:", error);
        return null;
    }*/
};

/** Deletes the requested user from the database */
const deleteUserById = async (userId: string): Promise<any> => {
    /*try {
        await prisma.user.delete({ where: { id: userId } });
        return { message: "User deleted successfully" };
    } catch (error) {
        console.error("Error in deleteUserById:", error);
        return { error: "Error deleting user" };
    }*/
};

// #region temp file based user management (will switch to database when project big enough)

import FileManager from "../fileManager.js";
const filemanager = new FileManager();

/** Base type for the attributes of a user account */
type Account = {
    username: string;
    id: string; // will make the id the same as the username for now
    hashedPw: string;
    apiKey: string;
}

/** Returns the account with the requested username if it exists */
function readAccount(username: string): Account | null {
    if(!filemanager.fileExists(getAccountFilePath(username))) return null;
    return JSON.parse(filemanager.readFile(getAccountFilePath(username))!) as Account;
}

/** Returns the account with the requested api key if it exists */
function readAccountByKey(apiKey: string): Account | null {
    const files = filemanager.listDirectory("accounts");
    for(const file of files){
        const acc = JSON.parse(filemanager.readFile(getAccountFilePath(file))!) as Account;
        if(acc.apiKey === apiKey) return acc;
    }
    return null;
}

/** Writes the requested account into the database */
function writeAccount(account: Account): void {
    filemanager.writeFile(getAccountFilePath(account.username), JSON.stringify(account));
}

/** Returns the relative file path to the given users save file */
const getAccountFilePath = (username: string): string => ("accounts/" + username);

// #endregion

export default {
    isAdmin,
    isMod,
    setAdminStatus,
    setModStatus,
    getApiKeyById,
    verifyApiKey,
    getUserByApiKey,
    newApiKey,
    getUserByUsername,
    getUsernameById,
    getUserById,
    getAllUsers,
    createUser,
    updateUserPassword,
    deleteUserById,
};