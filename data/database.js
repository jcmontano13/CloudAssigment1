// require import mongo DB
const mongodb = require('mongodb');

// create mongo client
const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
	// Local MongoDB connection string
	const MONGODB_URI = 'mongodb://127.0.0.1:27017';

	// Connect to MongoDB server
	const client = await MongoClient.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	// Select your database
	database = client.db('online-shop');
}

function getDb() {
	if (!database) {
		throw new Error('You must connect to database');
	}
	return database;
}

module.exports = { connectToDatabase, getDb }

