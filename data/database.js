// require import mongo DB
const mongodb = require('mongodb');

// create mongo client
const MongoClient = mongodb.MongoClient;

let database;

async function connecToDatabse() {
    const MONGODB_URI = 'mongodb+srv://jeckmontano:cloudApplicationAIS@cloudapplicationais.ftzcy2s.mongodb.net/?retryWrites=true&w=majority&appName=CloudApplicationAIS'
    const client = await MongoClient.connect(MONGODB_URI); // default port
    database = client.db('online-shop');
}

function getDb() {
    if (!database) {
        throw new Error('You must connect to database');
    }
    return database;
}

module.exports = {
    connecToDatabse: connecToDatabse,
    getDb: getDb
}

