import express from "express";
import validator from "validator";

import userController from "../controllers/userController.js";

const router = express.Router();

/** Registers a new account with the given information */
router.post("/register", async (req: any, res: any) => {
    let { username, password } = req.body;

    // Sanitize and validate username
    username = validator.trim(username);
    username = (typeof username === "string") ? username.toLowerCase() : "";

    // Sanitize password
    password = validator.trim(password);

    // Check if username or password are empty after trimming
    if(!username || !password) return res.status(400).json({ error: "Username and password are required." });

    // Proceed with registration
    const result = await userController.registerUser(username, password);
    return res.status(result.error ? 400 : 201).json(result);
});

/** Logs into an existing account with the given information */
router.post("/login", async (req: any, res: any) => {
    let { username, password } = req.body;

    // Sanitize username
    username = validator.trim(username);
    username = validator.escape(username);

    // Sanitize password
    password = validator.trim(password);
    password = validator.escape(password);

    const lowercaseUsername = username.toLowerCase();
    const result = await userController.loginUser(lowercaseUsername, password);

    // Set cookie and update visit
    if(result.token) res.cookie("token", result.token);

    return res.status(result.error ? 401 : 200).json(result);
});

/** Logs into an existing account with the given information */
router.post("/verify", async (req: any, res: any) => {
    let { token } = req.body;

    // Sanitize token
    token = validator.trim(token);
    token = validator.escape(token);

    const result = await userController.verifyToken(token);

    return res.status(result.error ? 401 : 200).json(result);
});

/** Logs out of the current account */
router.post("/logout", (req: any, res: any) => {
    res.clearCookie("token");
    return res.status(200).json();
});

export default router;
