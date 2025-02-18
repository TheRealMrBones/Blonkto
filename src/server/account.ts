/** A user account that holds credentials and identification */
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

    /** Return an object representing this accounts data for writing to the save */
    serializeForWrite(): string {
        const data = this.username;

        return data;
    }

    /** Return an object representing this accounts data for a message to the client */
    serializeForSend(): any {
        return {
            username: this.username,
        };
    }

    // #endregion
}

export default Account;