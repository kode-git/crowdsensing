/*
----------------------------------------
          SPATIAL CLOAKING
This script is used to define the spatial
cloaking algorithm for the making points
in according to the stack collection using
inverse square law for the decibel management
and logarithmic summary for noise additions.
----------------------------------------

*/

/**
 * makePoint(data,stack) tries to make a point with the adding of data into the stack
 * @param data
 * @param stack
 * @returns {[undefined, (*|{geometry: {coordinates: *[], type: string}, type: string, properties: {QoS: number, privacy: number, db: number}})]|[undefined, null]}
 */
const makePoint = (data, stack) => {
    // load initial parameters
    let timestamp = Date.parse(data.properties.timestamp)
    // remove from stack elements with out-time
    stack = time(stack, timestamp)
    // consider only points in range, with different user_id and same or < k value
    const [index, tmp] = filter(data, stack)
    let point;
    if (index == null && tmp == null) {
        return [stack, null]
    } else {
        // we can make the point
        point = spatialCloaking(tmp)
        stack = flush(index, stack)
        return [stack, point]
    }

}

/**
 * filter(data,stack) is used to filters locations and group them to select a subset of nodes used for centroids
 * generator
 * @param data is the data that changes the static status of the stack
 * @param stack is the list of locations without the data
 * @returns {[null, null]|[*[], []]}, in the first case when data didn't change the pending state, second case when is possible to select a subset and return the subset and index of locations selected on the stack
 */
const filter = (data, stack) => {
     var k = data.properties.neighbour
     var n = k - 1;
     maxDistance = data.properties.range
     var index = []
     index.push(stack.length - 1)
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


/**
 * Remove the element in index into the stack
 * @param index is the position of the element to delete
 * @param stack is list of locations
 * @returns {*}, the list of elements updated
 */
const flush = (index, stack) => {
    for(let i = 0; i < index.length; i++){
        stack = stack.slice(index[i], 1)
    }
    return stack
}

/**
 * time(stack, timestamp) calculates and delete locations in the stack out-of-time
 * @param stack is the collection of locations
 * @param timestamp used to determinate if a point is out-of-time or not
 * @returns {*} is the list of stack updated
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
            var index = stack.indexOf(stack[i]);
            if (index > -1) {
              stack.splice(index, 1); // removing and shift the elements of the array
            }
        }

    }

    return stack
    
}

/**
 * distance(x1,y1,x2,y2) calculate the euclidean distance between 2 points
 * @param x1 is the first coordinate of the point 1
 * @param y1 is the second coordinate of the point 1
 * @param x2 is the first coordinate of the point 2
 * @param y2 is the second coordinate of the point 1
 * @returns {number} equal to the distance between the 2 points
 */
const distance = (x1, y1, x2, y2) => {
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;
    return Math.round(Math.sqrt(xDiff * xDiff + yDiff * yDiff) * 1000.0) / 1000;
}

/**
 * geographical(lat,lon1,lat2,lon2) calculate the geographical distance between 2 points
 * @param lat1 is the first coordinate of the point 1
 * @param lon1 is the second coordinate of the point 1
 * @param lat2 is the first coordinate of the point 2
 * @param lon2 is the second coordinate of the point 1
 * @returns {number} equal to the geographical distance between the 2 points
 */
const geographicalDistance = (lat1,lon1,lat2,lon2) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radLat1 = Math.PI * lat1 / 180;
        var radLat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radTheta = Math.PI * theta / 180;
        var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = (dist * 1.609344) // convert in kilometers
        return dist;
    }

}


/**
 * spatialCloaking(points) return the centroid generated using the list of points
 * @param points is the list of real points selected to make a centroid
 * @returns {*|{geometry: {coordinates: *[], type: string}, type: string, properties: {QoS: number, privacy: number, db: number}}}
 */
const spatialCloaking = (points) => {
    // define point structure
    point = {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [] },
              properties: {
                db: 0,
                QoS : 0,
                privacy : 0,
                alpha : 0.5,
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

      const centroid_x = Math.round(x_acc * 10000.0/ points.length) / 10000;
      const centroid_y = Math.round(y_acc * 10000.0 / points.length) / 10000;
      centroid = [centroid_x, centroid_y]
      point.geometry.coordinates = centroid

    }

    // define the dB value with the pondering weight parameter
    // define spatial weight
    point.properties.db = defineDbMean(points, centroid)
    // define QoS and Privacy
    point.properties.QoS = makeQoS(points, point)
    point.properties.privacy = makePrivacy(points, point)
    point.properties.alpha = makeAlpha(points)
    return point;
}

/**
 * makePrivacy(points, centroids) return the mean distance between the real position and predicted one
 * @param points is the list of points in input to the spatial cloaking
 * @param centroid is the predicted point
 * @returns number of the mean distance between points and centroid
 */
const makePrivacy = (points, centroid) => {
    let total = points.length
    let dist = 0

    const cx = centroid.geometry.coordinates[0]
    const cy = centroid.geometry.coordinates[1]
    for (let i = 0; i < total; i++) {
        const px = points[i].geometry.coordinates[0]
        const py = points[i].geometry.coordinates[1]
        dist += geographicalDistance(cx, cy, px, py)
        console.log("Dist at " + i + ", is:" + dist)
    }

    let meanDistance = dist / total
     // convert kilometers in meters
    meanDistance = meanDistance * 1000
    return +(meanDistance.toFixed(2))
}


/**
 * makeQoS(points, centroids) return the Mean Squared Error of points on centroid represented the error in the db propagation
 * @param points is the list of points in input to the spatial cloaking
 * @param centroid is the predicted point
 * @returns number of the squared mean error for decibels variation
 */
const makeQoS = (points, centroid) =>{
    let error = 0;
    let totalError = 0
    let total = points.length


    for(let i = 0; i < total; i++){
        let dbPoint = points[i].properties.db
        let dbCentroid = centroid.properties.db
        error = Math.pow((dbPoint - dbCentroid),2)
        totalError += error
    }
    let mseError = Math.round(totalError * 100.0 / total) / 100
    return +(mseError.toFixed(2))

}

/**
 * defineDbMean(points, centroid) define the mean noise for the centroid based on the inverse square law
 * @param points is the list of points that generate the centroid, possible sources of the ISL
 * @param centroid is the element destination of the ISL
 * @returns {number} is the noise of the centroid
 */
const defineDbMean = (points, centroid) => {
    dbHit = []
    for(var i = 0; i < points.length; i++){
        dbHit.push(points[i].properties.db - inverseSquareLaw(points[i], centroid))
    }
    var dbPoint = 0
    for(var i = 0; i < points.length; i++){
        dbPoint = dbPoint + dbHit[i]
    }
   // Sum of different noise sources using logarithmically method
    sum = 0;
    for(var i = 0; i < dbHit.length; i++){
        sum = sum + Math.pow(10, dbHit[i]/10)
    }
    dbPoint = 10 * (Math.log(sum) / Math.LN10)

    return dbPoint
}

/**
 * Implement the Inverse Square Law
 * @param point is the source
 * @param centroid is the destination
 * @returns {number} is the propagated noise touched by destination
 */
const inverseSquareLaw = (point, centroid) => {
    range = distance(point.geometry.coordinates[0], point.geometry.coordinates[1], centroid[0], centroid[1])
    sourceDb = point.properties.db;
    return sourceDb / 4 * Math.PI * (range * range)
}

/**
 * makeDirectPoint(data) is an alternative geoJSON point element made when k = 1, it is the no-privacy location
 * @param data is collection of informations to generate the geoJSON element
 * @returns {{geometry: {coordinates: ([]|[*, *]|[*, *]|[*, *]|*), type: string}, type: string, properties: {QoS: number, privacy: number, db: any}}} is the output geoJSON point
 */
const makeDirectPoint = (data) => {
    // define point structure
    let point = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: data.geometry.coordinates },
        properties: {
            db: data.properties.db,
            QoS : 0,
            privacy : 0,
            alpha : 0,
        }
    }
    // we don't need to manage stack, because the point avoid it
    return point

}

/**
 * makeAlpha(points) calculate the centroid alpha based on the arithmetic mean of their values
 * @param points
 * @returns {number}
 */
const makeAlpha = (points) => {
    let length = points.length;
    let alpha = 0
    for(let i = 0; i < length; i++){
        alpha += points[i].properties.alpha
    }
    // TradeOff = Privacy * Alpha + QoS * (1 - Alpha)
    return +((alpha / length).toFixed(2))

}

// module exports

module.exports = {
    makePoint,
    makeDirectPoint,
    filter,
    flush,
    time,
    spatialCloaking,
    distance,
    defineDbMean,
}

