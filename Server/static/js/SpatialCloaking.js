/*
----------------------------------------
          SPATIAL CLOAKING
This script is used to define the spatial
cloaking algorithm for the making points
in according to the stack collection using
inverse square law for the decibel management
and logarithmic summary for noise additions.
----------------------------------------

Declaration:
makePoint : function(data, stack) =>
- data : last aggregated location in the stack
- stack : collection of pending locations

Aim:
This function get the stack and the new data and try to make a point
using the spatial cloaking algorithm to preserve the privacy of the users
depending on parameters k and range

Return:
- null in case of pending locations
- point in case of spatial cloaking point making
*/
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
    console.log('Log: Invoke time...')
    stack = time(stack, timestamp)
    // consider only points in range, with different user_id and same or < k value
    console.log('Log: Invoke filter....')
    const [index, tmp] = filter(data, stack)
    if(index == null && tmp == null){
        return null
    } else {
        // we can make the point
        console.log('Log: spatialCloaking invoke...')
        point = spatialCloaking(tmp)
        console.log('Log: flush invoke...')
        console.log('Log: Index to remove: ' + index)
        flush(index, stack)
        console.log('Log: Stack status:\n' + JSON.stringify(stack))
        console.log('Log: Point : \n ' + JSON.stringify(point))
        return point
    }

}

/*
Declaration:
filter : function(data, stack) =>
- data : last aggregated location in the stack
- stack : collection of pending locations

Aim:
This function filter data and put into the tmp array the locations to satisfies the k-anonymity
relationship between points of stack considering user_id, k and range. In addition to the
tmp array, we make an index array for the flush function with the stack index of locations added to
tmp array itself.

Return:
- [null, null] in case of k-anonymity is not satisfied by points stack
- [index, tmp] otherwise
*/

const filter = (data, stack) => {
     var k = data.properties.neighbour
     var n = k - 1;
     maxDistance = data.properties.range
     var index = []
     index.push(stack.length - 1)
     console.log(index)
     var id = []
     id.push(data.properties.userId)
     tmp = []
     tmp.push(data)

     if(n <= 0){
        // no privacy location found
        return [index, tmp]
     }
     else {
        // n > 0
        for(let i = 0; i < stack.length; i++){
            if(n == 0) break; // k reached
                if(stack[i].properties.neighbour <= k){
                    var notIncluded = false
                    for(let z = 0; z < id.length; z++){
                        // we need to have k different users
                        if(stack[i].properties.userId == id[z]){
                           notIncluded = true
                           break;
                        }
                    }
                    if(!notIncluded){
                        maxDistance2 = stack[i].properties.range
                        x1 = data.geometry.coordinates[0]
                        y1 = data.geometry.coordinates[1]
                        x2 = stack[i].geometry.coordinates[0]
                        y2 = stack[i].geometry.coordinates[1]
                        dist = distance(x1,y1,x2,y2)
                        if(dist <= maxDistance && dist <= maxDistance2){
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
        } else {
            return [index, tmp]
        }
     }
}

/*
Declaration:
flush : function(index, stack) =>
- index : list of index of location to delete from the stack
- stack : collection of pending locations

Aim:
This function remove in the stack used locations after filter invocation to avoid duplicates
spatial cloaking locations or duplicated using of the same stack pending points.

Return:
- Nothing, update only the stack locations
*/

const flush = (index, stack) => {
    console.log('Log: stack length:' + stack.length)
    console.log('Index : ' + index[0] )
    for(let i = 0; i < index.length; i++){
        stack.slice(index[i], 1)
        console.log('Enter')
    }
    console.log('Log: stack length:' + stack.length)
}

/*
Declaration:
time : function(stack, timestamp) =>
- stack : collection of pending locations
- timestamp : timestamp of the last added location

Aim:
This function remove in the stack locations with the timeout over the timestamp values and
return the stack without these kinds of elements to preserve privacy.

Return:
- stack, updated and with no elements out of time
*/

const time = (stack, timestamp) => {
    let length = stack.length
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

/*
Declaration:
distance : function(x1, y1, x2, y2) =>
- x1, x2 : first coordinates of points
- y1, y2: second coordinates of points

Aim:
This function calculates the euclidean distance between two points using
coordinates passed as arguments and returns the their distance in meter.

Return:
- distance, between 2 coordinates of points
*/

const distance = (x1, y1, x2, y2) => {
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

/*
Declaration:
spatialCloaking : function(points) =>
- points: list of points used to make the spatial cloaking point

Aim:
This function make the point from a set of points in input and return
the spatial cloaking point with the mean of noise hit to the centroid (the point itself)
located in the center of the euclidean distance between 2 or more points (in according to the
length of the points array).

Return:
- point : geojSON of the point to insert into the database
*/
const spatialCloaking = (points) => {
    console.log('Spatial cloaking init...')
    // define point structure
    point = {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [] },
              properties: {
                db: 0
                }
             }
    var centroid = [0,0]
    // coordinates of the spatial point is referred to the centroids of points coordinates
    if (points.length > 0) {
      var x_acc = 0;
      var y_acc = 0;

      for (var i = 0; i < points.length; i++) {
        x_acc += points[i].geometry.coordinates[0];
        y_acc += points[i].geometry.coordinates[1];
      }

      const centroid_x = Math.round(x_acc * 100.0/ points.length) / 100;
      const centroid_y = Math.round(y_acc * 100.0 / points.length) / 100;
      centroid = [centroid_x, centroid_y]
      point.geometry.coordinates = centroid

    }

    // define the dB value with the pondering weight parameter
    // define spatial weight
    point.properties.db = defineDbMean(points, centroid)
    return point;
}

/*
Declaration:
defineDbMean  : function(points, centroid) =>
- points : list of noise sources
- centroid: point to define the calculation of the noise hit in according of points noise radius and intensity

Aim:
This function calculates the noise hit on centroid from the points noise sources
using inverse square law algorithm and logarithmic noise summary function.

Return:
- dbPoint, the noise in decibel of the centroid
*/
const defineDbMean = (points, centroid) => {
    dbHit = []
    console.log("Points: \n" + JSON.stringify(points))
    for(var i = 0; i < points.length; i++){
        dbHit.push(points[i].properties.db - inverseSquareLaw(points[i], centroid))
        console.log('DbHit ' + i + ": " + dbHit[i])
    }
    var dbPoint = 0
    for(var i = 0; i < points.length; i++){
        dbPoint = dbPoint + dbHit[i]
    }
   // Sum of different noise sources using logarithmically method
    sum = 0;
    for(var i = 0; i < dbHit.length; i++){
        sum = sum + Math.pow(10, dbHit[i]/10)
        console.log("Sum at " + i + ": " + sum)
    }
    dbPoint = 10 * (Math.log(sum) / Math.LN10)
    console.log('dbPoint ' + dbPoint)

    return dbPoint
}

/*
Declaration:
inverseSquareLaw : function(point, centroid) =>
- point : a source of noise
- centroid: the receiver of the point noise

Aim:
From the input, we can calculate the noise hitted by centroid from the point source
using the range between point and centroid (their current distance), Math.PI and noise intensity
on the source point:

x = I / 4 * 3.14 * range * range

Return:
- result of the equation
*/
const inverseSquareLaw = (point, centroid) => {
    range = distance(point.geometry.coordinates[0], point.geometry.coordinates[1], centroid[0], centroid[1])
    sourceDb = point.properties.db;
    return sourceDb / 4 * Math.PI * (range * range)
}

/*
module exports
*/

module.exports = {
    makePoint,
    filter,
    flush,
    time,
    spatialCloaking,
    distance,
    defineDbMean,

}

