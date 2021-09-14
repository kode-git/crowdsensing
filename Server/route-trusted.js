// API for trusted server used for spatial cloaking and data backend forwarding

const utility = require('./static/js/utility')
const sc = require('./static/js/spatial-cloaking')


// This is the stack for spatial cloaking
const stack = new Array()
exports.stack= stack;
console.log('Log: Stack initialization...')
console.log('Log: Starting server...')

// TODO Pass the point to the backend server
// create a new location with trusted way
const createLocation = (request, response) => {

    data = request.body
    data = JSON.parse(JSON.stringify(data))
    // pushing data in the stack
    // Aggregate/Update data with the same userId and same location
    utility.aggregate(data, stack)
    // spatial cloaking
    var point = sc.makePoint(data, stack)
    if(point == null){
        // send the status to the back-end
        // back-end need to wait and avoid the insert
        console.log('Pending...')
        response.status(201).send('Point in pending...')
    }
    // TODO: Send point to the back-end server (not trusted) and not do directly the query
    // send(point, back-end)
    /*
    db = point.properties.db
    st_X = point.geometry.coordinates[0]
    st_Y = point.geometry.coordinates[1]
    */
    /*
    pool.query('insert into public.loc_ref_points(db, coordinates)values ($1, ST_Point($2, $3));', [db, st_X, st_Y], (error, results) => {
        if (error) {
            throw error
        }
        // temporal response, we don't know yet what we need on it
        response.status(201).send('Sent Point')
    })
    */
}


// Exports module for app.js

module.exports = {
    createLocation,
}