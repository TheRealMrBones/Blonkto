import argon2 from "argon2";
import validator from "validator";

import Account from "./account.js";
import FileManager from "./fileManager.js";

/** Manages user accounts for the game servers */
class AccountManager {
    fileManager: FileManager;
    accountsloggedin: {[key: string]: Account};

    constructor(fileManager: FileManager){
        this.fileManager = fileManager;
        this.accountsloggedin = {};
    }

    // #region creation

    /** Creates and returns an account with the information provided and adds it to the database */
    async createAccount(id: string, username: string, password: string): Promise<any>{
        username = sanitizeInput(username);
        password = sanitizeInput(password);

        // Validate username
        if(username.length < 3 || username.length > 16 || !isAlphanumeric(username))
            return { error: "Invalid username. It must be 3-16 characters only letters, numbers, and underscores." };

        // Validate password
        if(password.length < 8)
            return { error: "Invalid password. It must be at least 8 characters." };

        // Check if username already exists
        if(this.fileManager.fileExists(getAccountFilePath(username)))
            return { error: "Invalid username. Account with that name already exists." };

        // create account
        const hashedPw = await argon2.hash(password);

        const acc = new Account([username]);

        // write account file (with hashed password)
        const data = hashedPw + "|" + acc.serializeForWrite();

        this.fileManager.writeFile(getAccountFilePath(username), data);

        // add account to logged in
        this.accountsloggedin[id] = acc;

        // return the account
        return { account: acc.serializeForSend() };
    }

    // #endregion

    // #region login

    /** Tries to log in the given user and returns the message either confiming login or error */
    async login(id: string, username: string, password: string): Promise<any> {
        username = sanitizeInput(username);
        password = sanitizeInput(password);
        
        // Check if account exists
        if(!this.fileManager.fileExists(getAccountFilePath(username))) return { error: "Account does not exist" };

        // Check if account is logged in
        if(this.isLoggedIn(username)) return { error: "Account currently logged in" };

        // read account data
        const request = this.fileManager.readFile(getAccountFilePath(username));
        if(!request) return { error: "Failed to read data" };
        const data = request.split("|");

        // check if password matches
        if(!await argon2.verify(data[0], password)) return { error: "Password Incorrect" };

        const acc = new Account(data.slice(1));

        // add account to logged in
        this.accountsloggedin[id] = acc;
        
        // return the account
        return { account: acc.serializeForSend() };
    }

    /** Logs the given user out of their session */
    logout(id: string): void {
        delete this.accountsloggedin[id];
    }

    // #endregion

    // #region getters

    /** Returns if the given user is currently logged in to a session */
    isLoggedIn(username: string): boolean {
        username = sanitizeInput(username);

        return Object.values(this.accountsloggedin).some(acc => acc.username == username);
    }

    /** Gets the logged in account wiht the given id if it exists/is logged in */
    getAccount(id: string): Account {
        return this.accountsloggedin[id];
    }

    // #endregion
}

// #region helpers

/** Returns if the given string is alphanumeric */
const isAlphanumeric = (str: string): boolean => /^[a-zA-Z0-9_]*$/.test(str);

/** Returns the sanitized version of the given string */
const sanitizeInput = (input: string): string => validator.escape(input);

/** Returns the relative file path to the given users save file */
const getAccountFilePath = (username: string): string => ("accounts/" + username);

// #endregion

export default AccountManager;