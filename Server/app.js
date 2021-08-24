const express = require('express');
const app = express();
const port = 5000;
const api = require('./api');
const {Pool} = require("pg");
const hbs  = require('express-handlebars');
require('dotenv').config()

// parsing data in json form, so express use it
app.use(express.json());

// setting on a static folder for express
app.use(express.static(`${__dirname}/public`));


//adding dotenv to protect the database credentials (dummy privacy)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});


//using handlebars
app.engine('hbs', hbs({defaultLayout:'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

// mapdessin
app.get('/', (request, response) => {
    response.render('mapdessin')
})

// data display from postgres using hbs page
app.get('/data/', api.dataDisplay)

// dummy dashboard main request
app.get('/dashboard/', api.dashboard);

// Dummy object management
app.get('/getDummies/', api.getDummies);
app.post('/addDummy/', api.addDummy);
app.put('/updateDummy/', api.updateDummy);
app.delete('/deleteDummy/', api.deleteDummy);



app.listen(port, () => {
    console.log(`app.js is running on port ${port}.`);
});

