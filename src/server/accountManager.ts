import argon2 from 'argon2';
import validator from 'validator';

import Account from './account.js';
import FileManager from './fileManager.js';

class AccountManager {
    fileManager: FileManager;
    accountsloggedin: {[key: string]: Account}

    constructor(fm: FileManager){
        this.fileManager = fm;
        this.accountsloggedin = {};
    }

    // #region creation

    async createAccount(id: string, username: string, password: string){
        username = sanitizeInput(username);
        password = sanitizeInput(password);

        // Validate username
        if (username.length < 3 || username.length > 16 || !isAlphanumeric(username)) {
            return { error: 'Invalid username. It must be 3-16 characters only letters, numbers, and underscores.' };
        }

        // Validate password
        if (password.length < 8) {
            return { error: 'Invalid password. It must be at least 8 characters.' };
        }

        // Check if username already exists
        if(this.fileManager.fileExists(getAccountFilePath(username))){
            return { error: 'Invalid username. Account with that name already exists.' };
        }

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

    async login(id: string | number, username: string, password: string){
        username = sanitizeInput(username);
        password = sanitizeInput(password);
        
        // Check if account exists
        if(!this.fileManager.fileExists(getAccountFilePath(username))){
            return { error: 'Account does not exist' };
        }

        // Check if account is logged in
        if(this.isLoggedIn(username)){
            return { error: 'Account currently logged in' };
        }

        // read account data
        const request = this.fileManager.readFile(getAccountFilePath(username));
        if(!request) return { error: 'Failed to read data' };
        const data = request.split("|");

        // check if password matches
        if(!await argon2.verify(data[0], password)){
            return { error: 'Password Incorrect' };
        }

        let acc = new Account(data.slice(1));

        // add account to logged in
        this.accountsloggedin[id] = acc;
        
        // return the account
        return { account: acc.serializeForSend() };
    }

    logout(id: string | number){
        delete this.accountsloggedin[id];
    }

    // #endregion

    // #region getters

    isLoggedIn(username: string){
        username = sanitizeInput(username);

        return Object.values(this.accountsloggedin).some(acc => acc.username == username);
    }

    getAccount(id: string | number){
        return this.accountsloggedin[id];
    }

    // #endregion
}

// #region helpers

// Function to check if a string is alphanumeric
const isAlphanumeric = (str: string) => /^[a-zA-Z0-9_]*$/.test(str);

// Sanitize input
const sanitizeInput = (input: string) => validator.escape(input);

// Get account file path
const getAccountFilePath = (username: string) => ("accounts/" + username);

// #endregion

export default AccountManager;