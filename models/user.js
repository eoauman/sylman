/**
 * @file models/user.js
 * @description Mongoose schema and model definition for users in the SylMan application.
 * 
 * @version 1.0.0
 * @module Models/User
 * 
 * @schema User
 *   - username: String, required, unique.
 *   - password: String, required.
 *   - role: String, required, enum ['user', 'admin', 'ugadmin', 'gradmin', 'staff'], defaults to 'user'.
 * 
 * @requires
 *   - mongoose: Mongoose library for schema and model creation.
 */

const mongoose = require('mongoose');

/**
 * User Schema
 * @description Schema definition for user documents in the database.
 * @field {String} username - The username of the user. Must be unique and is required.
 * @field {String} password - The hashed password for the user. Required for authentication.
 * @field {String} role - The role of the user in the system. Must be one of:
 *                        ['user', 'admin', 'ugadmin', 'gradmin', 'staff'].
 *                        Defaults to 'user'.
 */
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['user', 'admin', 'ugadmin', 'gradmin', 'staff'],
    default: 'user', // Default role is 'user'
  },
});

/**
 * User Model
 * @description Exports the compiled Mongoose model for user documents.
 * @returns {Model} A Mongoose model for the User schema.
 */
module.exports = mongoose.model('User', userSchema);
