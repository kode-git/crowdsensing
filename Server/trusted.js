const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('./api-trusted')
const path = require('path');
const port = 3000



app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use("/static", express.static('./static/'));

// Trusted API
app.post('/createLocation', api.createLocation)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})


