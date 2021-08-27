// module of the app.js with every kinds of exportable REST Apis

const Pool = require('pg').Pool

// connection at the init
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'csdb',
    password: 'blockchain',
    port: 5432,
})

// --- Locations API ---
const getLocations = (request, response) => {
    pool.query('select neighbour, range, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points', (error, results) => {
        if(error){
            // not happen
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getLocationById = (request, response) => {
    const id = parseInt(request.body.id)
    pool.query('select neighbour, range, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points where id=$1', [id], (error, results) => {
        if(error) {
            // location not found => 404 page redirect
            throw error
        }
        response.status(200).json(results)
    })
}

const createLocation = (request, response) => {
    const { Neighbour, Range, Db, Long, Lat } = request.body

    pool.query('INSERT INTO public.loc_ref_points(neighbour, range, db, coordinates)VALUES ($1, $2, $3, Point($4, $5));', [Neighbour, Range, Db, Long, Lat], (error, results) => {
        if (error) {
            throw error
        }
        // temporal response, we don't know yet what we need on it
        response.status(201).send(`Point on coordinates (${Long}, ${Lat}) added with ID: ${results.insertId}`)
    })
}

const updateLocation = (request, response) => {
    const { id, Neighbour, Range, Db, Long, Lat } = request.body
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


module.exports = {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
}