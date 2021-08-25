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
    pool.query('select * from loc_detections', (error, results) => {
        if(error){
            // not happen
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getLocationById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('select * from loc_detections where id=$1', [id], (error, results) => {
        if(error) {
            // location not found => 404 page redirect
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createLocation = (request, response) => {
    const { user_id, avg_noise, cur_noise, coordinates } = request.body

    pool.query('INSERT INTO loc_detections (user_id, avg_noise, cur_noise, coordinates) VALUES ($1, $2, $3, $4)', [user_id, avg_noise, cur_noise, coordinates], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Location added with ID: ${results.insertId}`)
    })
}

const updateLocation = (request, response) => {
    const id = parseInt(request.params.id)
    const { avg_noise, cur_noise, coordinates } = request.body
    // TODO: Define how to pass coordinates
    pool.query(
        'UPDATE loc_detections SET avg_noise = $1, cur_noise = $2, coordinates = $3 WHERE id = $4',
        [avg_noise, cur_noise, coordinates, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Location modified with ID: ${id}`)
        }
    )
}


const deleteLocation = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM loc_detections WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Location deleted with ID: ${id}`)
    })
}


// --- Users API ---
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            // user not found => 404 page redirect
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${results.insertId}`)
    })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}

module.exports = {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}