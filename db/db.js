/**
 * @file db/db.js
 * @description Establishes a connection to the MongoDB database for the SylMan application using Mongoose.
 * 
 * @version 1.0.0
 * @module Database/Connection
 * 
 * @functions
 *   - connectDB: Asynchronous function to connect to MongoDB and handle connection errors.
 * 
 * @requires
 *   - mongoose: Mongoose library for MongoDB object modeling.
 *   - dotenv: Library to load environment variables from a .env file.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * @function connectDB
 * @description Connects to the MongoDB database using the connection string defined in the .env file.
 * @returns {Promise<void>} Logs a success message if the connection is successful.
 * @throws {Error} Logs an error message and terminates the process if the connection fails.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error and exit process
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Export the connection function for use in other parts of the application
module.exports = connectDB;
