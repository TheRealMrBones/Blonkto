import argon2 from "argon2";
import jwt from "jsonwebtoken";
import validator from "validator";

import userModel from "../models/userModel.js";

import ServerConfig from "../../configs/server.js";
const { DEV_LOGON } = ServerConfig.DEV;

/** Returns if the requested user is an admin */
const isAdmin = async (userId: string): Promise<boolean> => {
    try {
        const user = await userModel.isAdmin(userId);
        return user;
    } catch (error) {
        console.error("Error in isAdmin:", error);
        return false;
    }
};

/** Returns if the requested user is a mod */
const isMod = async (userId: string): Promise<boolean> => {
    try {
        const user = await userModel.isMod(userId);
        return user;
    } catch (error) {
        console.error("Error in isMod:", error);
        return false;
    }
};

/** Sets the requested users admin status */
const setAdminStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        return await userModel.setAdminStatus(userId, bool);
    } catch (error) {
        console.error("Error in setAdminStatus controller:", error);
        throw error;
    }
};

/** Sets the requested users mod status */
const setModStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        return await userModel.setModStatus(userId, bool);
    } catch (error) {
        console.error("Error in setModStatus controller:", error);
        throw error;
    }
};

/** Returns the api key of the requested user */
const getApiKeyById = async (userId: string): Promise<any> => {
    try {
        const apiKey = await userModel.getApiKeyById(userId);
        return apiKey;
    } catch (error) {
        console.error("Error in getApiKeyById:", error);
        return null;
    }
};

/** Returns whether the requested api key is valid */
const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const isValid = await userModel.verifyApiKey(apiKey);
        return isValid;
    } catch (error) {
        console.error("Error in verifyApiKey:", error);
        return false;
    }
};

/** Returns the requested user from their id */
const getUserById = async (userId: string): Promise<any> => {
    try {
        const user = await userModel.getUserById(userId);
        return user;
    } catch (error) {
        console.error("Error in getUserById:", error);
        return null;
    }
};

/** Returns the requested users username from their id */
const getUsernameById = async (userId: string): Promise<any> => {
    try {
        const user = await userModel.getUsernameById(userId);
        return user;
    } catch (error) {
        console.error("Error in getUserById:", error);
        return null;
    }
};

/** Returns the requested user from their username */
const getUserByUsername = async (username: string): Promise<any> => {
    try {
        const user = await userModel.getUserByUsername(username);
        return user;
    } catch (error) {
        console.error("Error in getUserByUsername:", error);
        throw error;
    }
};

/** Returns the list of all users */
const getAllUsers = async (): Promise<any> => {
    try {
        return await userModel.getAllUsers();
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        throw error;
    }
};

/** Registers a new user with the given username and password */
const registerUser = async (username: string, password: string): Promise<any> => {
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    // Validate username
    if (username.length < 3 || username.length > 16 || !isAlphanumeric(username))
        return { error: "Invalid username. It must be 3-16 characters only letters, numbers, and underscores." };

    // Validate password
    //if (password.length < 8)
    //    return { error: "Invalid password. It must be at least 8 characters." };

    const existingUser = await userModel.getUserByUsername(username);

    if (existingUser) return { error: "Username already exists" };

    try {
        const hashedPw = await argon2.hash(password);
        // Create the user
        const user = await userModel.createUser(username, hashedPw);

        return { message: "User registered successfully" };
    } catch (error) {
        console.error("Error in registerUser:", error);
        return { error: "Error registering user" };
    }
};

/** Logins in with the given credentials and returns the api key */
const loginUser = async (username: string, password: string): Promise<any> => {
    // Sanitize inputs
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    if(username.includes("testuser") && !DEV_LOGON) return { error: "Dev logon disabled" };

    try {
        const user = await userModel.getUserByUsername(username);
        if (!user) return { error: "Invalid username or password" };

        const passwordMatch = await argon2.verify(user.hashedPw, password);
        if (!passwordMatch) return { error: "Invalid username or password" };
        
        const token = jwt.sign({ username }, process.env.SECRET_KEY!, { expiresIn: "24h" });
        return { token };
    } catch (error) {
        console.error("Error in loginUser:", error);
        throw error;
    }
};

/** Returns if the requested token is valid */
const verifyToken = (token: string): any => {
    try {
        const decoded: any = jwt.verify(token, process.env.SECRET_KEY!);
        return { valid: true, username: decoded.username, token: token };
    } catch (error) {
        console.error("Error verifying token:", error);
        return { valid: false, error: error };
    }
};

/** Updates the requested users password to the new value */
const updateUserPassword = async (userId: string, password: string): Promise<any> => {
    try {
        const newHashedPw = await argon2.hash(password);

        const user = await getUserById(userId);
        if (user.discordId !== null) {
            return { error: "Skipping password update for Discord user!" };
        } else {
            return await userModel.updateUserPassword(userId, newHashedPw);
        }
    } catch (error) {
        console.error("Error in updateUserPassword:", error);
        throw error;
    }
};

/** Returns the user that currently uses the requested api key */
const getUserByApiKey = async (apiKey: string): Promise<any> => {
    try {
        return await userModel.getUserByApiKey(apiKey);
    } catch (error) {
        console.error("Error in getUserByApiKey:", error);
        throw error;
    }
};

/** Deletes the requested user from the database */
const deleteUserById = async (userId: string): Promise<any> => {
    try {
        const result = await userModel.deleteUserById(userId);
        return result;
    } catch (error) {
        console.error("Error in deleteUserById:", error);
        return { error: "Error deleting user" };
    }
};

/** Returns the id of the requested user from their username */
const getIdFromUsername = async (username: string): Promise<any> => {
    try {
        const user = await userModel.getUserByUsername(username);
        return user ? user.id : null;
    } catch (error) {
        console.error("Error in getIdFromUsername:", error);
        throw error;
    }
};

// #region helpers

/** Returns if a string is alphanumeric */
const isAlphanumeric = (str: string) => /^[a-zA-Z0-9_]*$/.test(str);

/** Returns the sanitized version of the input */
const sanitizeInput = (input: string) => validator.escape(input);

// #endregion

export default {
    isAdmin,
    isMod,
    setAdminStatus,
    setModStatus,
    getApiKeyById,
    verifyApiKey,
    getUserById,
    getUsernameById,
    getUserByUsername,
    getAllUsers,
    registerUser,
    loginUser,
    updateUserPassword,
    verifyToken,
    getUserByApiKey,
    deleteUserById,
    getIdFromUsername,
};