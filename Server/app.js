const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('./api')
const path = require('path');
const port = 3000



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
app.post('/getLocation',api.getLocationById )
app.post('/createLocation', api.createLocation)
app.put('/updateLocation/:id', api.updateLocation)
app.delete('/deleteLocation/:id', api.deleteLocation)

// Clustering API
app.get('/showClustering', api.showClustering)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})


