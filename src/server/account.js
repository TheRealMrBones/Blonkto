

class Account {
    constructor(accinfo){
        // defaults on creation
        this.username = accinfo[0];

        // add extra if from existing account
        if(accinfo.length > 1){

        }
    }

    // #region serialization

    serializeForWrite(){
        let data = this.username;

        return data;
    }

    serializeForSend(){
        return {
            username: this.username,
        }
    }

    // #endregion
}

module.exports = Account;