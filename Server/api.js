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
    const data = request.body
    Lat = data.geometry.coordinates[0]
    Long = data.geometry.coordinates[1]
    range = 200 // prefixed range
    
    pool.query('select avg(p1.db)\n' +
        'from loc_ref_points as p1\n' +
        'where ST_DWithin(p1.coordinates, ST_Point( ?, ?), ?, false)',[long, lat, range] , (error, results) => {
        if (error) {
            // not happen
            throw error
        }
        if(results.rows[0] == null || results.row[0] < 0){
            response.status(200).json({"dbMean": 0}) // error value to manage in client side
        } else {
            response.status(200).json({"dbMean": results.rows[0]}) // dummy response, return the first db not the near dbs mean
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
    
    const data = request.body
    console.log(JSON.stringify(data))
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