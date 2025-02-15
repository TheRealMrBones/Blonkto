class Account {
    username: string;

    constructor(accinfo: any){
        // defaults on creation
        this.username = accinfo[0];

        // add extra if from existing account
        if(accinfo.length > 1){

        }
    }

    // #region serialization

    serializeForWrite(){
        const data = this.username;

        return data;
    }

    serializeForSend(){
        return {
            username: this.username,
        };
    }

    // #endregion
}

export default Account;