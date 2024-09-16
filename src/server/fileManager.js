const fs = require('fs');

class FileManager {
    constructor(){
        this.savelocation = "./data/";
    }

    // #region writing

    writeFile(filename, content){
        fs.writeFile(this.getFullFilePath(filename), content, 'utf8', (error) => {
            if (error) {
                console.error('An error occurred while writing to the file:', error);
                return;
            }
        });
    }

    // #endregion

    // #region reading

    fileExists(filename){
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    }

    readFile(filename){
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), 'utf8');
            return data;
        } catch (err) {
            console.error('An error occurred while reading the file:', error);
            return false;
        }
    }

    // #endregion

    // #region helpers

    getFullFilePath(filename){
        return this.savelocation + filename + '.data'
    }

    // #endregion
}

module.exports = FileManager;