const bcrypt = require('bcryptjs');
const validator = require('validator');

const saltRounds = 10;

class AccountManager {
    constructor(fm){
        this.fileManager = fm;
    }

    async createAccount(username, password){
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

        const hashedPw = await bcrypt.hash(password, 10);
    }

    login(username, password){
        username = sanitizeInput(username);
        password = sanitizeInput(password);
        

    }
}

// #region helpers

// Function to check if a string is alphanumeric
const isAlphanumeric = (str) => /^[a-zA-Z0-9_]*$/.test(str);

// Sanitize input
const sanitizeInput = (input) => validator.escape(input);

// #endregion

module.exports = AccountManager;