


function predictionDb(dataPoint){
    return new Promise(function(resolve) {
        pointLng = dataPoint[0]
        pointLat = dataPoint[1]
        const spawn = require("child_process").spawn;
       const pythonProcess = spawn('python',["static/js/predictor.py", pointLng,pointLat]);
    
   
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
    predictionDb,
}