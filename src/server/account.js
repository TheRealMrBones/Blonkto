

class Account {
    constructor(username){
        this.username = username;
    }

    // #region serialization

    serializeForWrite(){
        let data = this.username;

        return data;
    }

    // #endregion
}

module.exports = Account;