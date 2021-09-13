const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('./api-backend')
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
app.post('/getLocations',api.getLocations )
app.post('/getMeanDb', api.getMeanDb)


// Clustering API
app.post('/showClusters', api.showClusters)
app.get('/populate', api.populateDB)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})


