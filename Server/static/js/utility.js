// this is a package of functions used for data manipulation

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
                "neighbour": row.neighbour,
                "range": row.range
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
const convertClusters = (results, dataset) => {
    geoJSON = {
        "type" : "ClustersCollection",
        "locations" : [],
        "centroids" : [],
        "clusters" : []
    }

    // adding locations features as geometry points for geoJSON view
    const rLength = results.rows.length
    const clustsLength = dataset.clusters.length
    for(let i = 0; i < rLength; i++){
        // loop of rows
        cluster_id = 0
        row = results.rows[i] //
        for(let j = 0; j < clustLength; j++){
            // loop on clusters
            let locations = dataset.cluster[j].locations
            let locLength = locations.length
            for(let l = 0; l < locLength; l++ ){
                // loop of locations of cluster j
                if(locations[l].st_x == row.st_x && locations[l].st_y == row.st_y){
                    // location inside the cluster
                    cluster_id = dataset.cluster[j].cluster_id
                }
            }
        }
        feature = {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range,
                "cluster_id" : cluster_id
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
            }
        }

        geoJSON.locations.push(feature)
    }

    // adding centroids features as geometry colored points

    for(let i = 0; i < dataset.centroids.length; i++){
        geoJSON.centroids.push(dataset.centroids[i])
        geoJSON.centroids[i].cluster_id = i
    }

    // adding clusters as collection of polygon

    dbMean = calculateMeanDB(dataset)

    for(let i = 0; i < geoJSON.centroids.length; i++){
        // adding a number of clusters as well as centroids numbers
        cluster = {
            "type" : "Cluster",
            "properties" : {
                "cluster_id" : i,
                "db_mean" : dbMean[i],
            },
            "geometry" : {
                "type" : "Polygon",
                "coordinates" : [] // inverted respect postGIS data
            }
        }

        // adding locations coordinates in the coordinates attribute of the Polygon in geoJSON
        locations = dataset.locations
        for(let i = 0; i < locations.length; i++){
            if(locations[i].cluster_id == i){
                // location inside the cluster i, need to be considered
                coord = [ locations[i].st_y, locations[i].st_x]
                cluster.geometry.coordinates.push(coord) // pushing coordinates in the polygon attribute
            }
        }
        geoJSON.clusters.push(cluster)
    }

    return geoJSON

}


const calculateMeanDB = (dataset) => {
    meanDb = []
    countLoc = []
    locations = dataset.locations
    for(let x = 0; x < dataset.clusters.length; x++){
        meanDb.push(0.0) // init meanDb array
        countLoc.push(0)
    }

    // adding in the meanDb[j] the sum of locations with cluster_id = j
    for(let i = 0; i < locations.length; i++){
        for(let j = 0; j < locations.length; j++){
            if(locations[i].cluster_id == j){
                meanDb[j] = meanDb[j] + locations[i].db
                countLoc[j] = countLoc[j] + 1 // counting of locations of cluster j
            }
        }
    }

    // set means
    for(let i = 0; i < meanDb.length; i++){
        meanDb[i] = meanDb[i] / countLoc[i]
    }

    // return array of meanDb where meanDb[i] is the mean db of the cluster i
    return meanDb

}

// populate DB with dummy points in Bologna area
// range are 0 and 3000 with step 1
// DBs are between 20 to 50
const populateDB = (pool, n) => {

}

module.exports = {
    convertLocations,
    convertClusters,
    populateDB,
    calculateMeanDB,
}