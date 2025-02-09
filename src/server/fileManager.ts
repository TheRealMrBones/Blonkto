import fs from 'fs';

class FileManager {
    savelocation: string;
    
    constructor(){
        this.savelocation = "./data/";
    }

    // #region writing

    writeFile(filename: string, content: string){
        fs.writeFile(this.getFullFilePath(filename), content, 'utf8', (error) => {
            if (error) {
                console.error('An error occurred while writing to the file:', error);
                return;
            }
        });
    }

    deleteFile(filename: string){
        try{
            fs.unlinkSync(this.getFullFilePath(filename));
        } catch (error) {
            console.error('An error occurred while deleting the file:', error);
            return false
        }
    }

    // #endregion

    // #region reading

    fileExists(filename: string){
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), 'utf8');
            return true;
        } catch (error) {
            // Don't return error this is expected!
            return false;
        }
    }

    readFile(filename: string){
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), 'utf8');
            return data;
        } catch (error) {
            console.error('An error occurred while reading the file:', error);
            return false;
        }
    }

    // #endregion

    // #region helpers

    getFullFilePath(filename: string){
        return this.savelocation + filename + '.data'
    }

    // #endregion
}

export default FileManager;