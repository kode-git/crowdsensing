// Bridging with clustering.py python script
const bridgingClustering = (locations, k) =>{
    return new Promise(function(resolve) {
        const spawn = require("child_process").spawn;
       const pythonProcess = spawn('python',["static/py/clustering.py", locations, k]);


       pythonProcess.stdout.on('data', (data) => {
           //console.log(data.toString())
           resolve(data.toString());
       });


       pythonProcess.stderr.on('data', (data) => {
           console.error(`stderr: ${data}`);
         });

         pythonProcess.on('close', (code) => {
           console.log(`child process exited with code ${code}`);
         });




        });
}

module.exports = {
    bridgingClustering,
}