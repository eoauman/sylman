/**
 * @file server.js
 * @description Entry point for the SylMan application. Configures and starts the Express server, connects to the database, and sets up API routes.
 * 
 * @version 1.0.0
 * @module Server/Index
 * 
 * @functions
 *   - Express App: Configures middleware, routes, and server settings.
 *   - MongoDB Connection: Connects to the MongoDB database using Mongoose.
 * 
 * @requires
 *   - express: Express framework for building the server.
 *   - dotenv: Loads environment variables from a .env file.
 *   - userRoutes: Routes for user-related operations.
 *   - connectDB: Function to establish a database connection.
 */

// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); // User routes for authentication and management
const connectDB = require('./db/db'); // Database connection function

// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Establish MongoDB connection
 * @description Initializes the connection to the database using the connectDB function.
 */
connectDB();

// Create an instance of an Express app
const app = express();

/**
 * Middleware for parsing JSON requests
 * @description Parses incoming JSON payloads and makes them available on req.body.
 */
app.use(express.json());

/**
 * User Routes
 * @description Defines the route prefix '/users' for user-related operations.
 */
app.use('/users', userRoutes);

/**
 * Basic Route
 * @description A simple route for testing server availability.
 * @route GET /
 * @returns {string} A welcome message for the SylMan application.
 */
app.get('/', (req, res) => {
  res.send('Welcome to SylMan!');
});

// Set up the server to listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
