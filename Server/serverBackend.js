const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const route = require('./routeBackend')
const path = require('path');
const port = 4000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use("/static", express.static('./static/'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../Dashboard/index/index.html'));
})

// Locations API
app.post('/getLocations',route.getLocations )
app.post('/getMeanDb', route.getMeanDb)


// Clustering API
app.post('/showClusters', route.showClusters)
app.post('/showClustersOnDb/', route.showClustersOnDb)
app.get('/populate', route.populate)

app.post('/createBackendLocation', function(request, response){
        // forwarding the request and the response
        route.createBackendLocation(request, response)
        // no manage the response because the user doesn't know when the
        // point is processing on the database
        // response is detected in the trusteds console
});

// Prediction API
app.post('/prd', route.prdCall)


app.listen(port, () => {
    console.log(`Log: Backend Server running on port ${port}.`)
    console.log(`Log: Waiting a request...`)
})


