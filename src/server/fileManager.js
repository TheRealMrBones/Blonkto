const fs = require('fs');

class FileManager {
    constructor(){
        this.savelocation = "./data/";
    }

    writeFile(filename, content){
        fs.writeFile(this.getFullFilePath(filename), content, 'utf8', (error) => {
            if (error) {
                console.error('An error occurred while writing to the file:', error);
                return;
            }
        });
    }

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

    getFullFilePath(filename){
        return this.savelocation + filename + '.data'
    }
}

module.exports = FileManager;