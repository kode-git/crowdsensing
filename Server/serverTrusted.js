const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const route = require('./routeTrusted')
const path = require('path');
const port = 3000

const stack = route.stack



app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
// static directory used to the app
app.use("/static", express.static('./static/'));

// Trusted createLocation API
app.post('/createLocation', route.createLocation)

// default listening
app.listen(port, () => {
    console.log(`Log: Trusted Server running on port ${port}.`)
    console.log(`Log: Waiting a request...`)
})


