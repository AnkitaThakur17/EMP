const mongoose = require('mongoose');
// mongoose.set('debug', true); // Enable Mongoose debug mode
require('dotenv').config(); // Load environment variables

mongoose.Promise = global.Promise;

let uri = process.env.MONGOURI;
let addOnUri =  process.env.ADDONURI;

/**
 * Checking the environment for the server for MongoDB connection
 */
if (process.env.NODE_ENV === 'production') {
    uri = uri + process.env.DB_NAME;
} else if (process.env.NODE_ENV === 'staging') {
    uri = uri + process.env.DB_NAME;
} else if (process.env.NODE_ENV === 'development') {
    uri = uri + process.env.DB_NAME;
} else {
    console.log('No database environment specified');
    process.exit(1);
}

//Adding add on uri to mongouri to access all db
uri = uri + addOnUri;

// Function to connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

module.exports = {
    connectToDatabase
};
