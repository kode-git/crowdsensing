// this is a package of functions used for data manipulation

// given result as a set of loc_ref_points rows, returns data in geoJSON format
const convertLocations = (results) => {
    geoJSON = {
        "type" : "FeatureCollection",
        "features" : []
    }
    const rLength = results.rows.length
    for(let i = 0; i < rLength; i++){
        row = results.rows[i] //
        feature = {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
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
    // TODO
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
}