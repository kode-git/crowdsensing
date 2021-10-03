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

// --- Locations API ---
// Get Locations from the database
// using for data visualization inside the dashboard
const getLocations = (request, response) => {
    pool.query('select db, ST_X(coordinates), ST_Y(coordinates), qos, privacy from loc_ref_points', (error, results) => {
        if (error) {
            // not happen
            throw error
        }
        dataset = utility.convertLocations(results)
        console.log(dataset.features[0].properties);
        response.status(200).json(dataset)
    })
}

// Given coordinates and a range, return a list of geometry
// points near the given coordinates and inside the specified range
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

const showClustersOnDb = (request, response) => {
    // const k = parseInt(request.body.k)
    const k = request.params.k
    console.log(k)
    pool.query('select id, db, ST_X(coordinates), ST_Y(coordinates), qos, privacy from loc_ref_points', (error, results) => {
        if (error) {
            throw error
        }

        // locations setting to manage
        locations = utility.convertLocations(results)
        // taking dataset as a geoJSON clustering on decibels
        result = clustering.bridgingClustering(k)
        console.log("RESULTS TAKEN IS: " + JSON.parse(JSON.stringify(result)))
        dataset = utility.convertClustersOnDb(locations, result)
        response.status(200).json(dataset)

    })
}

const createBackendLocation = (request, response) => {

    let point = request.body
    if(duplicated != request.body){
        let db = point.db
        let st_X = point.st_X
        let st_Y = point.st_Y
        let QoS = point.QoS
        let privacy = point.privacy
        console.log(point)
        pool.query('insert into public.loc_ref_points(db, coordinates, qos, privacy)values ($1, ST_Point($2, $3), $4, $5);', [db, st_X, st_Y, QoS, privacy], (error, results) => {
            if (error) {
                throw error
            }
            console.log('Log: Status success - Successful point insert in the database')
            response.status(201).send('')
        })
    } else {
        duplicated = request.body
    }

}

const populate = (request, response) => {
    utility.populate(pool, 30)
    response.sendStatus(200).send('Populate execution: done')
}

const prdCall = (request, response) => {
        point = request.body.myPoint.geometry.coordinates
         predictor.bridgingPredictor(point).then(function successCallback(result) {
           console.log(result)
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