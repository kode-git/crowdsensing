// API for backend server (not trusted calls)

const Pool = require('pg').Pool
const pg = require('pg')
const utility = require('./static/js/utility')
const predictor = require('./static/js/bridgingPredictor')
const clustering = require('./static/js/bridgingClustering')
const turf = require('@turf/turf')



// connection at the init

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'csdb',
    password: 'blockchain',
    port: 5432,
})

// duplicated is used to avoid double insert from a double click on app
var duplicated = {}

/**
 * getLocations(request,response) don't consider request and give in response the geoJSON of database locations
 * @param request is not considered
 * @param response is the geoJSON to returns
 */
const getLocations = (request, response) => {
    pool.query('select db, ST_X(coordinates), ST_Y(coordinates), qos, privacy, alpha from loc_ref_points', (error, results) => {
        if (error) {
            // not happen
            throw error
        }
        dataset = utility.convertLocations(results)
        response.status(200).json(dataset)
    })
}

/**
 * getMeanDb(request, response) gives the location in the request and return the mean noise on range of 3 kilometers in response
 * @param request is the location
 * @param response is the mean noise around 3 kilometers from the location
 */
const getMeanDb = (request, response) => {
    // getting location
    data = request.body
    data = JSON.parse(JSON.stringify(data))
    lat = data.geometry.coordinates[0]
    long = data.geometry.coordinates[1]
    range = 3000 // prefixed range
    pool.query('select avg(p1.db)s from loc_ref_points as p1 where ST_DWithin(p1.coordinates, ST_Point( $1, $2), $3, false)',[long, lat, range] , (error, results) => {
        json = {"mean" : undefined}
        if(results == null ){
            response.status(500).json(json)
        } else {
            json.mean = results.rows[0].s
            response.json(json)
        }
        
    })
    
}

// Build a geoJSON and send to the dashboard to visualize polygons
// centroids and points inside a Leaftlet map on the front-end (dashboard side)
/**
 * showClusters(request, response) gives the number of clusters in the request and returns the geoJSON polygons in the response
 * @param request is the number of clusters to classify using kmeans algorithm
 * @param response i
 */
const showClusters = (request, response) => {
    const k = parseInt(request.body.k)
    pool.query('select id, db, ST_X(coordinates), ST_Y(coordinates), qos, privacy from loc_ref_points', (error, results) => {
        if (error) {
            throw error
        }
        
        dataset = {
            "length": results.rows.length,
            "locations": results.rows,
            "clusters": [],
            "centroids": [],
        }
        
        var options = {numberOfClusters: k};
        arr = []
        for (let i = 0; i < results.rows.length; i++) {
            arr.push(turf.point([results.rows[i].st_x, results.rows[i].st_y], {db: results.rows[i].db}))
        }
        collection = turf.featureCollection(arr)
        var clustered = turf.clustersKmeans(collection, options);
        res = utility.convertClusters(clustered, options.numberOfClusters)
        console.log(res)
        response.status(200).json(res)
    })
}

/**
 * showClustersOnDb(request, response) gives the number of clusters in the request and returns the geoJSON polygons in the response considering noise parameter too
 * @param request is the number of clusters to classify using kmeans algorithm
 * @param response i
 */
const showClustersOnDb = (request, response) => {
    // const k = parseInt(request.body.k)
    const k = parseInt(request.body.k)
    pool.query('select id, db, ST_X(coordinates), ST_Y(coordinates), qos, privacy from loc_ref_points', (error, results) => {
        if (error) {
            throw error
        }

        // locations setting to manage
        let locations = utility.convertLocations(results)
        // taking dataset as a geoJSON clustering on decibels
        let result = clustering.bridgingClustering(k)
        let dataset = utility.convertClustersOnDb(locations, result)
        response.status(200).json(dataset)

    })
}

/**
 * createBackendLocation(request, response) is the backend insert directly in the database
 * @param request is the location to insert
 * @param response is 200 or not in according to the success of the insert
 */
const createBackendLocation = (request, response) => {

    let point = request.body

    let db = point.db
    let st_X = point.st_X
    let st_Y = point.st_Y
    let QoS = point.QoS
    let privacy = point.privacy
    let alpha = point.alpha
    console.log(point)
    pool.query('insert into public.loc_ref_points(db, coordinates, qos, privacy, alpha) values ($1, ST_Point($3, $2), $4, $5, $9) on conflict(coordinates) do update set db=$6, qos=$7, privacy=$8;', [db, st_X, st_Y, QoS, privacy, db, QoS, privacy, alpha], (error, results) => {
        if (error) {
            throw error
        }
        console.log('Log: Status success - Successful point insert in the database')
        response.status(201).send('')
    })

}

/**
 * populate(request, response) is the populate API that insert 30 random positions
 * @param request is void
 * @param response is 200 or 500 in according to the success of populate
 */
const populate = (request, response) => {
    utility.populate(pool, 30)
    response.sendStatus(200).send('Populate execution: done')
}

/**
 * prdCall(request, response) is the API to call the bridging of the prediction python algorithm
 * @param request gives the coordinates to determinate the predicted noise
 * @param response is 200 or 500 in
 */
const prdCall = (request, response) => {
    let point = request.body.myPoint.geometry.coordinates
    predictor.bridgingPredictor(point).then(function successCallback(result) {
        result=JSON.parse(JSON.stringify(result));
        response.status(200).json(result)
          })
}





// Exports module for app.js

module.exports = {
    getLocations,
    showClusters,
    showClustersOnDb,
    getMeanDb,
    populate,
    createBackendLocation,
    prdCall,
}