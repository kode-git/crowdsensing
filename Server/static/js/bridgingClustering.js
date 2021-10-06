    const execSync = require('child_process').execSync;

    /**
     * bridgingClustering(k) connects the express.js API with clustering.py script and produce the clustering division using sklearn
     * @param k is the parameter passed to the script
     * @returns {*} the list of clusters associated to locations
     */
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