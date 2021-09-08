
// given a set of point,
// return the spatial cloaking point to store or
// pass in case of not minimum k-anonimity reached
const makePoint = (data, stack) => {
    // load initial parameters

    // neighbour is the number of k user used for k-anonymity
    let k = data.properties.neighbour
    // range is the range from point about stack locations considering for spatial cloaking
    let range = data.properties.range
    // current dB value of the location
    let db = data.properties.db
    // owner of the point, this is used only in the trusted server and not in database
    let userId = data.properties.userId
    // timestamp on when the point was sent to the trusted server
    let timestamp = data.properties.timestamp
    // time to rest in server stack
    let minutesTime = data.properties.minutesTime
    // coordinates of the point
    let lat = data.geometry.coordinates[0]
    let long = data.geometry.coordinates[1]


    //
    stack = time(stack, timestamp)
   // consider only points in range, with different user_id and same k value
    tmp = filter(data, stack)
    if(stack.size >= k){
        // adding in a temporal stack every stack location with the same neighbour
        /*
        tmp = []
        for(let i = 0; i < stack.size; i++){
            if(stack[i])
                tmp.push(stack[i])
        }

           */
    
    } else {
        // control timestamp for flush stack
    }

    return [k, range, db, lat, long]
}


// returns the list of points that respect the k-anonymity spatial cloaking
const filter = (data, stack) => {

}

// flush stack from used points
const flush = (stack, collection) => {
}




module.exports = {
    makePoint,
    filter,
    flush,
}