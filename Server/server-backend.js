const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const route = require('./route-backend')
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
app.get('/populate', route.populate)

// Prediction API
app.get('/prd', route.prdCall)


app.listen(port, () => {
    console.log(`Log: Backend Server running on port ${port}.`)
    console.log(`Log: Waiting a request...`)
})


