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


app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname+"/../Dashboard/index.html"));
})

// Locations API
app.get('/getLocations',api.getLocations )
app.get('/getLocation/:id',api.getLocationById )
app.post('/createLocation', api.createLocation)
app.put('/updateLocation/:id', api.updateLocation)
app.delete('/deleteLocation/:id', api.deleteLocation)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})