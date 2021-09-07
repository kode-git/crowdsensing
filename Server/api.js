// module of the app.js with every kinds of exportable REST Apis

const Pool = require('pg').Pool
const pg = require('pg')
const utility = require('./static/js/utility')
const turf = require('@turf/turf')
const sc = require('./static/js/spatial-cloaking')
// connection at the init

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'csdb',
    password: 'blockchain',
    port: 5432,
})

// This is the stack for spatial cloaking
const stack = []

// --- Locations API ---
// Get Locations from the database
// using for data visualization inside the dashboard
const getLocations = (request, response) => {
    pool.query('select neighbour, range, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points', (error, results) => {
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
        json = {"dbMean" : undefined}
        if(results == null ){
            response.status(500).json(json)
        } else {
            json.dbMean = results.rows[0].s
            response.json(json)
            
            
        }
        
    })
    
}

// Build a geoJSON and send to the dashboard to visualize polygons
// centroids and points inside a Leaftlet map on the front-end (dashboard side)
const showClusters = (request, response) => {
    const k = parseInt(request.body.k)
    pool.query('select id, neighbour, range, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points', (error, results) => {
        if (error) {
            // not happen
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

// get a location based on the id of location, this is a CRUD operation
const getLocationById = (request, response) => {
    const id = parseInt(request.body.properties.id)
    pool.query('select neighbour, range, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points where id=$1', [id], (error, results) => {
        if (error) {
            // location not found => 404 page redirect
            throw error
        }
        response.status(200).json(results)
    })
}

// create a new location with not trusted way
const createLocation = (request, response) => {
    
    data = request.body
    data = JSON.parse(JSON.stringify(data))
    stack.push(data)
    // TODO: Manage userId and timestamp from the app inside data from request.body
    // spatial cloaking
    {k, range, db, lat, long} = sc.makePoint(data, stack)
    if(stack.size > k){
        // flush stack
        for(let i = 0; i < k; i++) {
            stack.pop()
        }
    }
    
    pool.query('INSERT INTO public.loc_ref_points(neighbour, range, db, coordinates)VALUES ($1, $2, $3, ST_Point($4, $5));', [k, range, db, long, lat], (error, results) => {
        if (error) {
            throw error
        }
        // temporal response, we don't know yet what we need on it
        response.status(201).send(`Point on coordinates (${Long}, ${Lat}) added with ID: ${results.insertId}`)
    })
}

// update a location based on data given by the front-end
// this is a CRUD operation
const updateLocation = (request, response) => {
    const {id, Neighbour, Range, Db, Long, Lat} = request.body
    // TODO: Define data referent for update operation
    pool.query(
        'UPDATE loc_ref_points SET neighbour = $1, range = $2, db = $3, coordinates = st_point($4, $5), WHERE id = $6 ',
        [Neighbour, Range, Db, Long, Lat, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Point modified with ID: ${id}`)
        }
    )
}


// delete a location by an id given by the front-end
// this is a CRUD operation
const deleteLocation = (request, response) => {
    const id = parseInt(request.params.id)
    
    pool.query('DELETE FROM loc_ref_points WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Location deleted with ID: ${id}`)
    })
}

// Exports module for app.js

module.exports = {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    showClusters,
    getMeanDb,
}