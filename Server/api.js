// module of the app.js with every kinds of exportable REST Apis

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

// TODO: Setting geoJSON


// --- Locations API ---
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
    console.log("Server LOG: Send info: (" + long + ", " + lat + ")")
    pool.query('select avg(p1.db)s from loc_ref_points as p1 where ST_DWithin(p1.coordinates, ST_Point( $1, $2), $3, false)',[long, lat, range] , (error, results) => {
        console.log(results.rows[0].s)
        json = {"dbMean" : 0}
        if(results == null ){
            response.status(500).json(json)
        } else {
            json.dbMean = results.rows[0].s
            console.log("Sending...")
            console.log(json)
            response.status(200).json(json)
            
        }
        
    })
}

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

const createLocation = (request, response) => {
    
    data = request.body
    data = JSON.parse(JSON.stringify(data))
    Neighbour = data.properties.Neighbour
    Range = data.properties.Range
    Db = data.properties.Db
    Lat = data.geometry.coordinates[0]
    Long = data.geometry.coordinates[1]
    pool.query('INSERT INTO public.loc_ref_points(neighbour, range, db, coordinates)VALUES ($1, $2, $3, ST_Point($4, $5));', [Neighbour, Range, Db, Long, Lat], (error, results) => {
        if (error) {
            throw error
        }
        // temporal response, we don't know yet what we need on it
        response.status(201).send(`Point on coordinates (${Long}, ${Lat}) added with ID: ${results.insertId}`)
    })
}

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


const deleteLocation = (request, response) => {
    const id = parseInt(request.params.id)
    
    pool.query('DELETE FROM loc_ref_points WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Location deleted with ID: ${id}`)
    })
}

// temporal API
const populate = (request, response) => {
    utility.populateDB(pool, 100)
    response.status(200).send('populate : success status')
}


module.exports = {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    showClusters,
    getMeanDb,
    populate,
}