const bcrypt = require('bcryptjs');
const validator = require('validator');

const Account = require('./account.js');

const saltRounds = 10;

class AccountManager {
    constructor(fm){
        this.fileManager = fm;
        this.accountsloggedin = {};
    }

    // #region creation

    createAccount(id, username, password){
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
        const hashedPw = bcrypt.hashSync(password, saltRounds);

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

    login(id, username, password){
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
        const data = this.fileManager.readFile(getAccountFilePath(username)).split("|");

        // check if password matches
        if(!bcrypt.compareSync(password, data[0])){
            return { error: 'Password Incorrect' };
        }

        let acc = new Account(data.slice(1));

        // add account to logged in
        this.accountsloggedin[id] = acc;
        
        // return the account
        return { account: acc.serializeForSend() };
    }

    logout(id){
        delete this.accountsloggedin[id];
    }

    // #endregion

    // #region getters

    isLoggedIn(username){
        username = sanitizeInput(username);

        return Object.values(this.accountsloggedin).some(acc => acc.username == username);
    }

    getAccount(id){
        return this.accountsloggedin[id];
    }

    // #endregion
}

// #region helpers

// Function to check if a string is alphanumeric
const isAlphanumeric = (str) => /^[a-zA-Z0-9_]*$/.test(str);

// Sanitize input
const sanitizeInput = (input) => validator.escape(input);

// Get account file path
const getAccountFilePath = (username) => ("accounts/" + username);

// #endregion

module.exports = AccountManager;