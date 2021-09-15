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

app.use("/static", express.static('./static/'));

// Trusted API
app.post('/createLocation', route.createLocation)


app.listen(port, () => {
    console.log(`Log: Trusted Server running on port ${port}.`)
    console.log(`Log: Waiting a request...`)
})


