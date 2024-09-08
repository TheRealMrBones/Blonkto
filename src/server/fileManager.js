const fs = require('fs');

class FileManager {
    constructor(){
        this.savelocation = "./data/";
    }

    writeFile(filename, content){
        fs.writeFile(this.savelocation + filename + '.data', content, 'utf8', (error) => {
            if (error) {
                console.error('An error occurred while writing to the file:', error);
                return;
            }
            console.log('File has been written successfully.');
        });
    }

    fileExists(filename){
        fs.readFile(this.savelocation + filename + '.data', 'utf8', (error, data) => {
            if (error) {
                return false;
            }
            return true;
        });
    }

    readFile(filename){
        fs.readFile(this.savelocation + filename + '.data', 'utf8', (error, data) => {
            if (error) {
                console.error('An error occurred while reading the file:', error);
                return false;
            }
            
            return data
        });
    }
}

module.exports = FileManager;