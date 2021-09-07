
// given a set of point, return
const makePoint = (data, stack) => {
    // load initial parameters
    let k = data.properties.Neighbour
    let range = data.properties.Range
    let db = data.properties.Db
    let lat = data.geometry.coordinates[0]
    let long = data.geometry.coordinates[1]
    if(stack.size >= k){
        // do spatial cloaking
        
    
    } else {
        // control timestamp for flush stack
    }
    return k, range, db, lat, long
}


module.exports = {
    makePoint,
}