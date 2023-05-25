const keys = require('./keys');
const redis = require('redis');

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
const sub = redisClient.duplicate();

// This is the actual Fibonacci calculation. It's recursive, so it's not
// particularly efficient, but it's a good example of a CPU-intensive task.
function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// Whenever we get a new message, run the callback function
sub.on('message', (channel, message) => {
    // Store the calculated value in Redis
    redisClient.hset('values', message, fib(parseInt(message)));
});

// Subscribe to any insert events
sub.subscribe('insert');

// Path: server\index.js
// Compare this snippet from server\keys.js:
