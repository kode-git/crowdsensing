// API for trusted server used for spatial cloaking and data backend forwarding

const utility = require('./static/js/utility')
const sc = require('./static/js/spatialCloaking')
const automatic = require('./static/js/automatic')
const http = require("http");

// This is the stack for spatial cloaking
const backend = 4000

// stack initialization
let stack = new Array()
exports.stack= stack;


// Server initial logs
console.log('Log: Stack initialization...')
console.log('Log: Starting server...')


// create a new location with trusted way
const createLocation = (request, response) => {
    let data = request.body
    // setting of k and range based on the alpha parameter
    console.log(data)
    data = automatic.opt(data)
    console.log("Log: Data received are:\n " + JSON.stringify(data))
    // Aggregate/Update data with the same userId and same location
    let point = makeSpatialPoint(data)

    // Point pending or forwarding management
    if(point == null){
        console.log('Log: Point pending, waiting other locations for k-anonymity...')
        response.status(200).json('')
    } else {
        forwardBackend(point)
        response.status(200).json('')
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
        path: '/createBackendLocation',
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



const makeSpatialPoint = (data) => {
    // Privacy Management
    let point = null
    if(data.properties.neighbour === 1 || !data.properties.privacyOnOff) {
        // k = 1 or privacy is off
        point = sc.makeDirectPoint(data, stack)
    } else {
        // k > 1 or privacy is on
        utility.aggregate(data, stack)
        // spatial cloaking
        let stackAndPoint = sc.makePoint(data, stack)
        // data splitting
        stack = stackAndPoint[0]
        point = stackAndPoint[1]
    }

    return point
}



// Exports module for app.js
module.exports = {
    createLocation,
}

