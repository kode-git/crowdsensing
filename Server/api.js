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
    pool.query('select * from loc_ref_points', (error, results) => {
        if(error){
            // not happen
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getLocationById = (request, response) => {
    const id = parseInt(request.body.id)
    pool.query('select * from loc_ref_points where id=$1', [id], (error, results) => {
        if(error) {
            // location not found => 404 page redirect
            throw error
        }
        response.status(200).json(results)
    })
}

const createLocation = (request, response) => {
    const { noise, point } = request.body

    pool.query('INSERT INTO loc_ref_points (noise, point) VALUES ($1, $2)', [noise, point], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Point added with ID: ${results.insertId}`)
    })
}

const updateLocation = (request, response) => {
    const id = parseInt(request.params.id)
    const { noise, point } = request.body
    // TODO: Define how to pass coordinates
    pool.query(
        'UPDATE loc_ref_points SET noise = $1, point = $2 WHERE id = $3',
        [noise, point, id],
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