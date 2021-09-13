// API for backend server (not trusted calls)

const Pool = require('pg').Pool
const pg = require('pg')
const utility = require('./static/js/utility')
const turf = require('@turf/turf')

// connection at the init

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'csdb',
    password: 'blockchain',
    port: 5432,
})


// --- Locations API ---
// Get Locations from the database
// using for data visualization inside the dashboard
const getLocations = (request, response) => {
    pool.query('select db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points', (error, results) => {
        if (error) {
            // not happen
            throw error
        }
        dataset = utility.convertLocations(results)
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
    pool.query('select id, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points', (error, results) => {
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


// TODO Make it passed from the trusted server
const createLocation = (request, response) => {

    data = request.body
    data = JSON.parse(JSON.stringify(data))
    // pushing data in the stack
    // Aggregate/Update data with the same userId and same location
    stack = utility.aggregate(data, stack)
    // spatial cloaking
    const [point, stack] = sc.makePoint(data, stack)
    if(point == null){
        // send the status to the back-end
        // back-end need to wait and avoid the insert
        response.status(201).send('Point in pending...')
    }
    // TODO: Send point to the back-end server (not trusted) and not do directly the query
    // send(point, back-end)
    db = point.properties.db
    st_X = point.geometry.coordinates[0]
    st_Y = point.geometry.coordinates[1]
    pool.query('insert into public.loc_ref_points(db, coordinates)values ($1, ST_Point($2, $3));', [db, st_X, st_Y], (error, results) => {
        if (error) {
            throw error
        }
        // temporal response, we don't know yet what we need on it
        response.status(201).send('Sent Point')
    })
}

const populate = (request, response) => {
    utility.populate(pool, 30)
    response.sendStatus(200).send('Populate execustion: done')
}

// Exports module for app.js

module.exports = {
    getLocations,
    showClusters,
    getMeanDb,
    populate,
}