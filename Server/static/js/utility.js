// library of functions used for data manipulation and visualization
const polygon = require('./polygon')

/**
 * convertLocations(results), given a set of rows of the table locations, return the equivalent geoJSON
 * @param results is the rows of locations taken from the database
 * @returns {*|{features: *[], type: string}} is the geoJSON format of the database data
 */
const convertLocations = (results) => {
    geoJSON = {
        "type" : "FeatureCollection",
        "features" : []
    }
    const rLength = results.rows.length
    for(let i = 0; i < rLength; i++) {
        row = results.rows[i] //
        feature = {
            "type": "Feature",
            "properties": {
                "id": row.id,
                "db": row.db,
                "qos" : row.qos,
                "privacy" : row.privacy
            },
            "geometry": {
                "type": "Point",
                "coordinates": [row.st_y, row.st_x] // inverted respect postGIS data

            }

        }

        geoJSON.features.push(feature)
    }
    return geoJSON
}

/**
 * convertClusters(featureCollection, j), taken a set of locations in geoJSON format, return them with the properties based on the clustering algorithm (kmeans)
 * @param featureCollection is the list of geoJSON locations
 * @param k is the k parameter for determinate the number of clusters
 * @returns {*|{centroids: *[], locations: *[], type: string, clusters: *[]}} is the list of geoJSON with clusters properties.
 */
const convertClusters = (featureCollection, k) => {
    geoJSON = {
        "type" : "FeaturesCollection",
        "locations" : [],
        "centroids" : [],
        "clusters" : [],
    }

    // locations
    let features = featureCollection.features.length
    locations = []
    for(let i = 0; i < features; i++){
        locations.push(featureCollection.features[i])
    }
    
    // centroids
    centroids = new Array(k) // array of k centroids
    for(let j = 0; j < features; j++){
        cluster = featureCollection.features[j].properties.cluster
        centroid = featureCollection.features[j].properties.centroid // Array(2)
        centroidFeature = {
            "properties" : {
                "cluster" : cluster
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [centroid[0], centroid[1]] // inverted respect postGIS data
            }
        }
        centroids[cluster] = centroidFeature
    }
    
    // clusters
    clusters = new Array(k)
    for(let w = 0; w < k; w++) {
        polygonFeature = {
            "properties" : {
                "cluster" : w,
                "db" : 0
            },
            "geometry" : {
                "type" : "Polygon",
                "coordinates" : []
            }
        
        }
        db = 0
        count = 0
        for (let z = 0; z < features; z++) {
            feature = featureCollection.features[z]
            if(feature.properties.cluster == w){
                // adding in the cluster the feature point
                count++
                polygonFeature.geometry.coordinates.push(feature.geometry.coordinates) // Array(2)
                db = db + feature.properties.db
            }
        }
        polygonFeature.properties.db = db / count
        polygon.polySort(polygonFeature.geometry.coordinates)
        clusters[w] = polygonFeature
    
    }
    
    geoJSON.locations = locations
    geoJSON.centroids = centroids
    geoJSON.clusters = clusters
    
    return geoJSON

}

/**
 * convertClustersOnDb(locations, clusters) is a function where we can add clusters properties to locations geoJSON considering noise parameter too
 * @param locations is the list of locations
 * @param clusters is the list of assignments number that determinate for the position i the cluster of the location i
 * @returns {*} is the geoJSON with updated clusters properties
 */
const convertClustersOnDb = (locations, clusters) => {
    clusters = JSON.parse(clusters)
    for(i in clusters){
        console.log(clusters[i])
    }
    clusterCollection = clusters['cluster']

    console.log(clusterCollection)
    length = locations.features.length
    for(let i = 0; i < length; i++){
        locations.features[i].properties.cluster = clusterCollection[i]
    }
    console.log(locations.features[0].properties)
    return locations
}

/**
 * populate(pool,n) is a function to populate the database with n random points
 * @param pool is the pool used to do the query on the postgres database
 * @param n is the number of random rows to insert inside the database
 */
const populate = (pool, n) => {
    for(let i = 0; i < n; i++){
        maxDb = 90.0
        minDb = 40.0
        db = Math.floor(Math.random() * (maxDb - minDb) + minDb)
        qos = Math.random() * 12.0
        privacy = Math.random() * 10
        long = Math.random() * (44.5226164783769 - 44.428249953517265) + 44.428249953517265;
        lat = Math.random() * (11.42506902374428 - 11.280186829752083) + 11.280186829752083
        pool.query('INSERT INTO public.loc_ref_points(db, coordinates, qos, privacy)VALUES ($1, ST_Point($2, $3), $4, $5);', [db, long, lat, qos, privacy], (error, results) => {
            if (error) {
                throw error
            }
        })

    }
}

/**
 * aggregate(data, stack) verify if in the stack there is an equivalent location passed by the same user
 * @param data is the data to verify
 * @param stack is the collection of locations to compare
 * @returns {boolean} is true if we have aggregated locations, false otherwise
 */
const aggregate = (data, stack) => {
    console.log("Log: Aggregate init.....")
    stX = data.geometry.coordinates[0]
    stY = data.geometry.coordinates[1]
    stId = data.properties.userId

    let updated = false
    for(let i = 0; i < stack.length; i++) {
        stackX = stack[i].geometry.coordinates[0]
        stackY = stack[i].geometry.coordinates[1]
        stackId = stack[i].properties.userId
        if(stX == stackX && stY == stackY && stackId == stId){
            // data is included in the stack at position i
            // update stack to not overlap the same point
            stack[i].properties.db = data.properties.db
            stack[i].properties.minutesTime = data.properties.minutesTime
            stack[i].properties.timestamp = data.properties.timestamp
            stack[i].properties.automatic = data.properties.automatic
            stack[i].properties.drift = data.properties.drift
            if(data.properties.automatic == true) {
                stack[i].properties.tradeOff = data.properties.tradeOff;
            } else{
                stack[i].properties.neighbour = data.properties.neighbour
                stack[i].properties.range = data.properties.range
            }
            updated = true
            break;
        }
    }

    if(!updated){
        stack.push(data) // adding new point
    }



    return updated

}

/**
 * getIndex(stack, data) is a function that returns the current index of the data in the stack
 * @param stack is the collection of locations
 * @param data is the data to find in the stack
 * @returns {number} is the index of data in the stack, -1 if it is not present
 */
const getIndex = (stack, data) =>{
    for(let i = 0; i < stack.length; i++){
        if(stack[i].geometry.coordinates == data.geometry.coordinates){
            return i
        }
    }

    return -1
}

// module exports

module.exports = {
    convertLocations,
    convertClusters,
    convertClustersOnDb,
    populate,
    aggregate,
    getIndex
    //calculateMeanDB,
}

