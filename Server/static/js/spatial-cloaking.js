
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
    // we parsing it to the Unix Date to manage in Javascript
    let timestamp = Date.parse(data.properties.timestamp)
    // time to rest in server stack
    let minutesTime = data.properties.minutesTime
    // coordinates of the point
    let lat = data.geometry.coordinates[0]
    let long = data.geometry.coordinates[1]


    // remove from stack elements with out-time
    stack = time(stack, timestamp)
    // consider only points in range, with different user_id and same k value
    const [index, tmp] = filter(data, stack)
    if(index == null && tmp == null){
        return null;
    } else {
        // we can make the point
        point = spatialCloaking(tmp)
        stack = flush(index, stack)
        return [k, range, db, lat, long]
    }


}


// returns the list of points that respect the k-anonymity spatial cloaking
const filter = (data, stack) => {
     var k = data.properties.neighbour
     var n = k - 1;
     maxDistance = data.properties.range
     var index = [].push(stack.size - 1)
     var id = [].push(data.properties.userId)
     tmp = [].push(data)

     if(n <= 0){
        // no privacy location found
        return [index, tmp]
     }
     else {
        // n > 0
        for(let i = 0; i < stack.size; i++){
            if(n == 0) break; // k reached
                if(stack[i].properties.neighbour == k){
                    var included = false
                    for(let z = 0; z < id.size; z++){
                        // we need to have k different users
                        if(stack[i].properties.userId == id[z]){
                           included = true
                           break;
                        }
                    }
                    if(!included){
                        maxDistance2 = stack[i].properties.range
                        x1 = data.geometry.coordinates[0]
                        y1 = data.geometry.coordinates[1]
                        x2 = stack[i].geometry.coordinates[0]
                        y2 = stack[i].geometry.coordinates[1]
                        dist = distance(x1,y1,x2,y2)
                        if(dist > maxDistance && dist > maxDistance2){
                            n = n - 1 // counting stack pop
                            index.push(i) // adding pop index from the stack
                            id.push(stack[i].properties.userId)
                            tmp.push(stack[i])
                        }
                    }
                }
        }

        if(n != 0) {
           // we need to wait other locations
           return [null, null]
        }
     }
}

// flush stack from used points
const flush = (index, stack) => {
    for(let i = 0; i < index.size; i++){
    stack.slice(index[i], 1)
    }
    return stack
}

// remove from the stack out-timing locations
const time = (stack, timestamp) => {
    console.log("Stack size: "  + stack.size)
    let length = stack.size
    for(let i = 0; i < length; i++){
        // Stack timestamp
        let stackTime = Date.parse(stack[i].properties.timestamp)
        // Life in minutes of the location i
        let stackMinutes = stack[i].properties.minutesTime
        // Date difference
        let diffMs = timestamp - stackTime
        // Rouding in minutes
        let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        if(diffMins > stackMinutes){
            console.log("Removing element..")
            var index = stack.indexOf(stack[i]);
            if (index > -1) {
              stack.splice(index, 1); // removing and shift the elements of the array
            }
        }

    }

    return stack
    
}

const distance = (x1, y1, x2, y2) => {
    var xDiff:Number = x1 - x2;
    var yDiff:Number = y1 - y2;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}


const spatialCloaking = (array) => {
    // define point structure
    point = {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [] },
              properties: {
              // TODO: Remove neighbour and range from the point data
                neighbour: 0,
                range: 0,
                db: 0
                }
             }
    // TODO: Make points properties and coordinates based on array points
}
module.exports = {
    makePoint,
    filter,
    flush,
    time,
    spatialCloaking,
    distance,
}