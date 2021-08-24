// module of the app.js with every kinds of exportable REST Api


// This is a dummy object
// meanwhile we don't have a real json
// object to send/receive

const {Pool} = require("pg");
const dummies = [
    {
        "name": 'dummy_zero',
        "id" : 0
    },
    {
        "name" : 'dummy_one',
        "id" : 1
    }
];

//adding dotenv to protect the database credentials (dummy privacy)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

//query to take all the database locations with the linked values
// TODO Change the table dependencies linked to the pgAdmin database table definition
let query = `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(coordinates)::jsonb,
      'properties', jsonb_build_object(
          'user_id', user_id,
          'value', value,
          'description', description
      )
    ) AS feature
    FROM location
  ) features`

// data Display from Postgres database on
const dataDisplay = async(request,response) => {
    (async () => {
        const { rows } = await pool.query(query)
        let dataframeJSON = JSON.stringify(rows[0].jsonb_build_object.features)
        if(Object.values(dataframeJSON).length){
            res.status(200).json(dataframeJSON)
        } else if(!Object.values(dataframeJSON).length){
            res.status(400).json('Data not available from the database')
        }
    })().catch(err =>
        setImmediate(() => {
            throw err
        })
    )
};



// Dummy Dashboard REST API

const dashboard = async(request, response) => {
    response.sendFile(path.join(__dirname + '/../Dashboard/index.html'));
}

// Objects REST API

// Dummy REST CRUD methods
// Get
const getDummies = async(request, response) => {
    response.status(200).json(dummies);
};


// Insert
const addDummy = async(request,response) => {
    const { name, id} = request.body
    dummies.push({ name, id});
    response.status(201).send('Added dummy')
};

// Update
const updateDummy = async(request, response) => {
    const {name, id } = request.body
    dummies[id] = {name, id}
    response.status(200).send("Dummy " + id + " updated")
};

// Delete
const deleteDummy = (request, response) => {
    dummies.shift();
    response.status(200).send("first dummy deleted")
};

// export APIs for app.js
module.exports = {
    dataDisplay,
    dashboard,
    getDummies,
    addDummy,
    updateDummy,
    deleteDummy
};


