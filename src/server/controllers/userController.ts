import argon2 from "argon2";
import jwt from "jsonwebtoken";
import validator from "validator";

import userModel from "../models/userModel.js";

const isAdmin = async (userId: string): Promise<boolean> => {
    try {
        const user = await userModel.isAdmin(userId);
        return user;
    } catch (error) {
        console.error("Error in isAdmin:", error);
        return false;
    }
};

const isMod = async (userId: string): Promise<boolean> => {
    try {
        const user = await userModel.isMod(userId);
        return user;
    } catch (error) {
        console.error("Error in isMod:", error);
        return false;
    }
};
  
const setAdminStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        return await userModel.setAdminStatus(userId, bool);
    } catch (error) {
        console.error("Error in setAdminStatus controller:", error);
        throw error;
    }
};
  
const setModStatus = async (userId: string, bool: boolean): Promise<any> => {
    try {
        return await userModel.setModStatus(userId, bool);
    } catch (error) {
        console.error("Error in setModStatus controller:", error);
        throw error;
    }
};
  
const getApiKeyById = async (userId: string): Promise<any> => {
    try {
        const apiKey = await userModel.getApiKeyById(userId);
        return apiKey;
    } catch (error) {
        console.error("Error in getApiKeyById:", error);
        return null;
    }
};
  
const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const isValid = await userModel.verifyApiKey(apiKey);
        return isValid;
    } catch (error) {
        console.error("Error in verifyApiKey:", error);
        return false;
    }
};
  
const getUserById = async (userId: string): Promise<any> => {
    try {
        const user = await userModel.getUserById(userId);
        return user;
    } catch (error) {
        console.error("Error in getUserById:", error);
        return null;
    }
};
  
const getUsernameById = async (userId: string): Promise<any> => {
    try {
        const user = await userModel.getUsernameById(userId);
        return user;
    } catch (error) {
        console.error("Error in getUserById:", error);
        return null;
    }
};
  
const getUserByUsername = async (username: string): Promise<any> => {
    try {
        const user = await userModel.getUserByUsername(username);
        return user;
    } catch (error) {
        console.error("Error in getUserByUsername:", error);
        throw error;
    }
};

const getAllUsers = async (): Promise<any> => {
    try {
        return await userModel.getAllUsers();
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        throw error;
    }
};
  
const registerUser = async (username: string, password: string): Promise<any> => {
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    // Validate username
    if (username.length < 3 || username.length > 16 || !isAlphanumeric(username))
        return { error: "Invalid username. It must be 3-16 characters only letters, numbers, and underscores." };

    // Validate password
    if (password.length < 8)
        return { error: "Invalid password. It must be at least 8 characters." };

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
  
const loginUser = async (username: string, password: string): Promise<any> => {
    // Sanitize inputs
    username = sanitizeInput(username);
    password = sanitizeInput(password);

    try {
        const user = await userModel.getUserByUsername(username);

        if (!user) return { error: "Invalid username or password" };

        const passwordMatch = await argon2.verify(user.hashedPw, password);
        if (!passwordMatch) return { error: "Invalid username or password" };

        const token = jwt.sign({ username }, "process.env.SECRET_KEY", { expiresIn: "24h" });
        return { token };
    } catch (error) {
        console.error("Error in loginUser:", error);
        throw error;
    }
};
  
const verifyToken = (token: string): any => {
    try {
        const decoded: any = jwt.verify(token, "process.env.SECRET_KEY");
        return { valid: true, username: decoded.username, token: token };
    } catch (error) {
        console.error("Error verifying token:", error);
        return { valid: false, error: error };
    }
};

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
  
const getUserByApiKey = async (apiKey: string): Promise<any> => {
    try {
        return await userModel.getUserByApiKey(apiKey);
    } catch (error) {
        console.error("Error in getUserByApiKey:", error);
        throw error;
    }
};
  
const deleteUserById = async (userId: string): Promise<any> => {
    try {
        const result = await userModel.deleteUserById(userId);
        return result;
    } catch (error) {
        console.error("Error in deleteUserById:", error);
        return { error: "Error deleting user" };
    }
};

// Get userId from username
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