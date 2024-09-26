const bcrypt = require('bcryptjs');
const validator = require('validator');

const Account = require('./account.js');

const saltRounds = 10;

class AccountManager {
    constructor(fm){
        this.fileManager = fm;
    }

    // #region creation

    createAccount(username, password){
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
        if(this.fileManager.fileExists(getPlayerFilePath(username))){
            return { error: 'Invalid username. Account with that name already exists.' };
        }

        // create account
        const hashedPw = bcrypt.hashSync(password, saltRounds);

        const acc = new Account(username);

        // write account file (with hashed password)
        const data = hashedPw + "|" + acc.serializeForWrite();

        this.fileManager.writeFile(getPlayerFilePath(username), data);

        // return the account
        return { success: acc };
    }

    // #endregion

    // #region login

    login(username, password){
        username = sanitizeInput(username);
        password = sanitizeInput(password);
        
        // Check if account exists
        if(!this.fileManager.fileExists(getPlayerFilePath(username))){
            return { error: 'Account does not exist' };
        }

        // read account data
        const data = this.fileManager.readFile(getPlayerFilePath(username)).split("|");

        // check if password matches
        if(!bcrypt.compareSync(password, data[0])){
            return { error: 'Password Incorrect' };
        }
        
        // return the account
        return { success: acc };
    }

    // #endregion
}

// #region helpers

// Function to check if a string is alphanumeric
const isAlphanumeric = (str) => /^[a-zA-Z0-9_]*$/.test(str);

// Sanitize input
const sanitizeInput = (input) => validator.escape(input);

// Get player file path
const getPlayerFilePath = (username) => ("accounts/" + username);

// #endregion

module.exports = AccountManager;