/**
 * @file routes/userRoutes.js
 * @description Defines user-related routes for the SylMan application, including signup, login, and role management.
 * 
 * @version 1.0.0
 * @module Routes/User
 * 
 * @functions
 *   - POST /users/signup: Handles user registration. Defaults role to 'user' unless specified.
 *   - POST /users/login: Authenticates users based on username and password.
 *   - PUT /users/change-role: Allows admins to change the role of a specific user.
 * 
 * @requires
 *   - express: Express framework for creating the router.
 *   - User: Mongoose model for user data.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Mongoose User model

/**
 * POST /users/signup
 * @description Registers a new user in the system. Default role is 'user' unless specified.
 * @body {string} username - The username of the new user.
 * @body {string} password - The password for the new user.
 * @body {string} [role='user'] - The role for the user. Must be one of ['user', 'admin', 'ugadmin', 'gradmin', 'staff'].
 * @returns {201} Success message on user registration.
 * @returns {400} If required fields are missing.
 * @returns {409} If the username already exists.
 * @returns {500} If there is a server error.
 */
router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Set default role to 'user' if not provided
    const newUser = new User({
      username,
      password,
      role: role || 'user',
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /users/login
 * @description Authenticates a user using their username and password.
 * @body {string} username - The username of the user.
 * @body {string} password - The user's password.
 * @returns {200} Success message on successful authentication.
 * @returns {400} If required fields are missing.
 * @returns {401} If the username or password is incorrect.
 * @returns {500} If there is a server error.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({ message: 'Login successful.', role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /users/change-role
 * @description Allows an admin to change the role of a specific user.
 * @body {string} adminUsername - The username of the admin making the request.
 * @body {string} targetUsername - The username of the user whose role is being changed.
 * @body {string} newRole - The new role to assign to the user. Must be one of ['user', 'admin', 'ugadmin', 'gradmin', 'staff'].
 * @returns {200} Success message and updated user data.
 * @returns {400} If required fields are missing or role is invalid.
 * @returns {403} If the admin making the request does not have proper privileges.
 * @returns {404} If the target user is not found.
 * @returns {500} If there is a server error.
 */
router.put('/change-role', async (req, res) => {
  const { adminUsername, targetUsername, newRole } = req.body;

  if (!adminUsername || !targetUsername || !newRole) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const validRoles = ['user', 'admin', 'ugadmin', 'gradmin', 'staff'];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    // Verify admin privileges
    const admin = await User.findOne({ username: adminUsername });
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles.' });
    }

    // Update the target user's role
    const targetUser = await User.findOneAndUpdate(
      { username: targetUsername },
      { role: newRole },
      { new: true }
    );

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    res.status(200).json({ message: `User role updated to ${newRole}.`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
