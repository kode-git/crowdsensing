
const pynode = require('pynode');


function predictionDb(point){

    data = point 
  
    
    pynode.exec('predictor.py', 1)
    .then(function(data){
        data = JSON.parse(data);
        console.log(data);
    })
    .catch(function(err){
        console.log(err)
    })




}
//just for testing
predictionDb(1)
module.exports={
    predictionDb,
}