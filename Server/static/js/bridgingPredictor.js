/**
 * bridgingPredictor(dataPoint) using a regressor to predict the location noise based on the actual ranged noises
 * @param dataPoint is the location to determinate the predicted noise
 * @returns {Promise<unknown>} is the Promise of the response where is the predicted noise or an error
 */
const bridgingPredictor = (dataPoint) =>{
    return new Promise(function(resolve) {
        pointLng = dataPoint[0]
        pointLat = dataPoint[1]
        const spawn = require("child_process").spawn;
       const pythonProcess = spawn('python',["static/py/predictor.py", pointLng,pointLat]);
    
   
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



module.exports={
    bridgingPredictor,
}