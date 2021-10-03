    const execSync = require('child_process').execSync;

// Bridging with clustering.py python script
const bridgingClustering = (k) =>{
    console.log("Log: Clusters are " + k)
    execution = "python static/py/clustering.py "+ k

    // import { execSync } from 'child_process';  // replace ^ if using ES modules
    const output = execSync(execution, { encoding: 'utf-8' });  // the default is 'buffer'
    return output
}

module.exports = {
    bridgingClustering,
}