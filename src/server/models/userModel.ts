import crypto from "crypto";

const generateApiKey = () => crypto.randomUUID();

const isAdmin = async (userId: string): Promise<boolean> => {
    try {
        const user = {admin: false};//await prisma.user.findUnique({ where: { id: userId } });
        return user?.admin || false;
    } catch (error) {
        console.error("Error in isAdmin:", error);
        return false;
    }
};

const isMod = async (userId: string): Promise<boolean> => {
    try {
        const user = {mod: false};//await prisma.user.findUnique({ where: { id: userId } });
        return user?.mod || false;
    } catch (error) {
        console.error("Error in isMod:", error);
        return false;
    }
};

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

const getApiKeyById = async (userId: string): Promise<any> => {
    try {
        const user = readAccount(userId);//await prisma.user.findUnique({ where: { id: userId } });
        return user?.token;//.apiKey;
    } catch (error) {
        console.error("Error in getApiKeyById:", error);
        return null;
    }
};

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

const newApiKey = async (userId: string): Promise<any> => {
    try {
        const newApiKey = generateApiKey();
        const acc = readAccount(userId);
        if(!acc) return null;
        acc.token = newApiKey;
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

const getUserByUsername = async (username: string): Promise<any> => {
    try {
        return readAccount(username);//await prisma.user.findUnique({ where: { username: username }});
    } catch (error) {
        console.error("Error in getUserByUsername:", error);
        return null;
    }
};

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

const getAllUsers = async (): Promise<any> => {
    try {
        return null;//await prisma.user.findMany();
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return null;
    }
};

const createUser = async (username: string, hashedPw: string): Promise<any> => {
    try {
        const apiKey = generateApiKey();
        const user: Account = {
            username: username,
            id: username,
            hashedPw: hashedPw,
            token: "",
        };
        writeAccount(user);/*await prisma.user.create({
            data: { username, hashedPw, apiKey },
            include: { Profile: true },
        });*/
        return user;
    } catch (error) {
        console.error("Error in createUser:", error);
        return null;
    }
};

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

type Account = {
    username: string;
    id: string; // will make the id the same as the username for now
    hashedPw: string;
    token: string;
}

function readAccount(username: string): Account | null {
    if(!filemanager.fileExists(getAccountFilePath(username))) return null;
    return JSON.parse(filemanager.readFile(getAccountFilePath(username))!) as Account;
}

function readAccountByKey(key: string): Account | null {
    const files = filemanager.listDirectory("accounts");
    for(const file of files){
        const acc = JSON.parse(filemanager.readFile(getAccountFilePath(file))!) as Account;
        if(acc.token === key) return acc;
    }
    return null;
}

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