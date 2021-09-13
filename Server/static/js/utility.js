// library of functions used for data manipulation and visualization

const polygon = require('./polygon')
// given result as a set of loc_ref_points rows, returns data in geoJSON format
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

// convert clusters dataset into a geoJSON data format
// it's similar to the locations but there are like centroids
// and clusters as added attributes in circle geometry format
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
        polygonFeature.properties.db = db / count // TODO: Verify the db mean
        polygon.polySort(polygonFeature.geometry.coordinates)
        clusters[w] = polygonFeature
    
    }
    
    geoJSON.locations = locations
    geoJSON.centroids = centroids
    geoJSON.clusters = clusters
    
    return geoJSON

}

// populate DB with dummy points in Bologna area
// range are 0 and 3000 with step 1
// DBs are between 20 to 50
const populateDB = (pool, n) => {
    for(let i = 0; i < n; i++){
        maxDb = 90.0
        minDb = 40.0
        db = Math.floor(Math.random() * (maxDb - minDb) + minDb)
        long = Math.random() * (44.5226164783769 - 44.428249953517265) + 44.428249953517265;
        lat = Math.random() * (11.42506902374428 - 11.280186829752083) + 11.280186829752083
        pool.query('INSERT INTO public.loc_ref_points(db, coordinates)VALUES ($1, ST_Point($2, $3));', [db, long, lat], (error, results) => {
            if (error) {
                throw error
            }
        })

    }
}

// Aggregate data in the server trusted
const aggregate = (data, stack) => {
    stX = data.geometry.coordinates[0]
    stY = data.geometry.coordinates[1]
    stId = data.properties.userId

    var updated = false
    for(let i = 0; i < stack.size(); i++) {
        stackX = stack[i].geometry.coordinates[0]
        stackY = stack[i].geometry.coordinates[1]
        stackId = stack[i].properties.userId
        if(stX == stackX && stY == stackY && stackId == stId){
            // data is included in the stack at position i
            // update stack to not overlap the same point
            stack[i].properties.db = data.properties.db
            stack[i].properties.neighbour = data.properties.neighbour
            stack[i].properties.range = data.properties.range
            stack[i].properties.minutesTime = data.properties.minutesTime
            stack[i].properties.timestamp = data.properties.timestamp
            updated = true
            break;
        }
    }

    if(!updated){
        stack.push(data) // adding new point
    }

    return stack
}

module.exports = {
    convertLocations,
    convertClusters,
    populateDB,
    aggregate,
    //calculateMeanDB,
}