// API for trusted server used for spatial cloaking and data backend forwarding

const utility = require('./static/js/utility')
const sc = require('./static/js/spatialCloaking')
const automatic = require('./static/js/automatic')
const http = require("http");

// This is the stack for spatial cloaking
const backend = 4000

// stack initialization
const stack = new Array()
exports.stack= stack;

// Server initial logs
console.log('Log: Stack initialization...')
console.log('Log: Starting server...')


// create a new location with trusted way
const createLocation = (request, response) => {
    let data = request.body
    // pushing data in the stack
    // Aggregate/Update data with the same userId and same location

    // Automatic management
    //TODO: Automatic control

    /*
    if(data.properties.automatic != null && data.properties.automatic == true){
            console.log("Log: Optimization of automatic point...")
            data = automatic.opt(stack, data)
            console.log("Log: Automatic point range and k optimized!")
    }
     */

    let point = makePoint(data)

    // Point pending or forwarding management
    if(point == null){
        console.log('Log: Point pending, waiting other locations for k-anonymity...')
        response.status(200).json('')
    } else {
        forwardBackend(point)
    }
    console.log('Log: the current stack status include ' + stack.length + ' elements ')

}


const makeRequest = (point) => {
    // making data request
    const dataRequest = new TextEncoder().encode(
        JSON.stringify({
            db : point.properties.db,
            st_X : point.geometry.coordinates[0],
            st_Y : point.geometry.coordinates[1],
            QoS : point.properties.QoS,
            privacy : point.properties.privacy,
        })
    )

    // making options of the requests
    const options = {
        hostname: 'localhost',
        port: backend,
        path: '/createLocation',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataRequest.length
        }
    }

    return [dataRequest, options]
}

const forwardBackend = (point) => {
    // listening on the server backend
    let [dataRequest, options] = makeRequest(point)

    // create request
    const req = http.request(options, res => {
        console.log(`Data sent with response: ${res.statusCode}`)

        // managing of sending data
        res.on('dataRequest', d => {
            process.stdout.write(d)
        })
    })

    // managing in case of error
    req.on('error', error => {
        console.error(error)
    })

    // write data in the request
    req.write(dataRequest)
    // send and close channel
    req.end()
}



const makePoint = (data) => {
    // Privacy Management
    let point = null
    if(data.properties.neighbour === 1) {
        // k = 1 or privacy is off
        console.log("Log: Privacy off, forwarding the current location to the backend server")
        point = sc.makeDirectPoint(data, stack)
    } else {
        // k > 1 or privacy is on
        utility.aggregate(data, stack)
        // spatial cloaking
        point = sc.makePoint(data, stack)
    }

    return point
}



// TODO: Remove, it's useless
// Define the default settings for the location sending
const getSettingsUpd = (request, response) => {
    // getting location
    data = request.body
    range = 1000
    k = 1 // no privacy for default
    time = 1 // 1 minute is the stack timeout because k = 1
    json = {
        neigh : k,
        time : time,
        range : range,
    }
    response.status(200).json(json)
}



// Exports module for app.js
module.exports = {
    createLocation,
    getSettingsUpd
}
