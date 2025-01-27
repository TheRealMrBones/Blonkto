#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const generatedpath = path.join(process.cwd(), 'generated');
const genserverconfigpath = path.join(generatedpath, 'serverconfig.js');
const genclientconfigpath = path.join(generatedpath, 'clientconfig.js');
const configspath = path.join(process.cwd(), 'config');

function genConfig(){
    // create generated folder if not already there
    fs.mkdir(generatedpath, { recursive: true }, (err) => {
        if (err) {
            console.error("An error occurred creating generated folder:", err);
        }
    });

    // discard old generated config.js files
    deleteConfigFile(genserverconfigpath);
    deleteConfigFile(genclientconfigpath);

    // generate new config data
    const newserverconfig = combineConfigs(true);
    const newclientconfig = combineConfigs(false);

    // write new configs to generated
    writeConfigFile(genserverconfigpath, JSON.stringify(newserverconfig));
    writeConfigFile(genclientconfigpath, JSON.stringify(newclientconfig));
}

function deleteConfigFile(filePath){
    try{
        fs.unlinkSync(filePath);
    }catch{}
}

function writeConfigFile(filePath, fileData){
    try{
        fs.writeFileSync(filePath, "module.exports = Object.freeze(" + fileData + ");");
    }catch{}
}

function readConfigJsonFile(filePath) {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error("Error reading or parsing JSON file:", error);
        return null;
    }
}

function getAllConfigFiles(dirPath) {
    const fileList = [];
    const files = fs.readdirSync(dirPath);
  
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
  
        if (stat.isDirectory()) {
            fileList.push(...getAllConfigFiles(filePath)); // Recursive call for subdirectories
        } else if (filePath.endsWith(".json")) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function combineConfigs(forserver){
    const finalConfig = {};
    const fileList = getAllConfigFiles(configspath);

    for(const file of fileList){
        // ignore configs not for this config type (server or client)
        if((forserver && file.endsWith("client.json")) || file.endsWith("server.json")){
            continue;
        }

        // read the config json into an object
        const config = readConfigJsonFile(file);

        // add config data to the final config by base group
        for(const group in config){
            if(!Object.hasOwn(finalConfig, group)){
                // Add new group
                finalConfig[group] = config[group];
            }else{
                // Append to existing group
                for(const key in config[group]){
                    finalConfig[group][key] = config[group][key];
                }
            }
        }
    }

    return finalConfig;
}

genConfig();