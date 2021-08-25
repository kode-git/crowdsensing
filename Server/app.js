const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('./api')
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', api.getUsers)
app.get('/users/:id', api.getUserById)
app.post('/users', api.createUser)
app.put('/users/:id', api.updateUser)
app.delete('/users/:id', api.deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})