const keys = require('./keys');
const redis = require('redis');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create a new Express application
const app = express();

// Allow cross-origin requests
app.use(cors());

// Parse incoming requests from the React app
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');

// Create a new Pool object
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,

    // This is the password for the postgres user in the postgres container
    password: keys.pgPassword,
    port: keys.pgPort

    // If we ever lose connection to Postgres, try to reconnect every 1 second
    // retry_strategy: () => 1000
});

// If we ever lose connection to Postgres, try to reconnect every 1 second
pgClient.on('connect', () => {
    pgClient
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch(err => console.log(err));
}
);

// Create a new Redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,

    // If we ever lose connection to Redis, try to reconnect every 1 second
    retry_strategy: () => 1000
});

// We need to duplicate the connection because according to the docs, when a
// connection is used for listening or subscribing, it cannot be used for
// other purposes. So we need to create a duplicate connection for publishing
// messages.
const redisPublisher = redisClient.duplicate();

// Express route handlers

// Return all values from Postgres
app.get('/', (req, res) => {
    res.send('Hi');
}
);

// Return all values from Postgres
app.get('/values/all', async (req, res) => {
    // Get all rows from the 'values' table
    const values = await pgClient.query('SELECT * FROM values');

    // Send back the rows
    res.send(values.rows);
}   
);

// Return all values from Redis
app.get('/values/current', async (req, res) => {
    // Get all hash values from the 'values' hash
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
}
);

// Receive a new value from the React app
app.post('/values', async (req, res) => {
    // Get the index from the request body
    const index = req.body.index;

    // If the index is greater than 40, send back an error
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // Store the index in the 'values' hash
    redisClient.hset('values', index, 'Nothing yet!');

    // Publish an insert event
    redisPublisher.publish('insert', index);

    // Insert the index into the 'values' table
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    // Send back an empty response
    res.send({ working: true });
}
);

// Listen on port 5000
app.listen(5000, err => {

    // If there was an error, log it
    console.log('Listening');
}
);

// Path: server\index.js
// Compare this snippet from server\keys.js: