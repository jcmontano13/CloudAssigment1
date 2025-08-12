const mongoDbStore = require('connect-mongodb-session');
const expressSession = require('express-session');
// require('dotenv').config(); // For local development only, to load .env file

// const MONGODB_URI = process.env.MONGODB_URI;
function createSessionStore() {
    const MongoDBStore = mongoDbStore(expressSession);

    // Local MongoDB connection string
    const MONGODB_URI = 'mongodb://127.0.0.1:27017';

    console.log('---- starting db -----');
    console.log('connecting:' + MONGODB_URI);
    console.log('----------');
    if (!MONGODB_URI) {
        console.error('ERROR: MONGODB_URI environment variable is not set.');
        process.exit(1); // Exit if critical variable is missing
    }

    const store = new MongoDBStore({
        uri: MONGODB_URI,
        getDb: 'online-shop',
        collection: 'sessions'
    });

    // Handle connection errors for the session store
    store.on('error', function (error) {
        console.error('MongoDB Session Store Error:', error);
    });

    return store;
}

function createSessionConfig() {
    return {
        // secret: 'super-secret',
        secret: process.env.SESSION_SECRET || 'super-secret',
        resave: false,
        saveUninitialized: false,
        store: createSessionStore(),
        cookie: {
            maxAge: 2 * 24 * 60 * 60 * 1000 // 2days
        }
    };
}


module.exports = createSessionConfig;