const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

// Middleware to authenticate and attach user to the request
module.exports.authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password'); // Exclude password from user info

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        req.user = user; // Attach user to the request
        next();
    } catch (err) {
        console.error('Invalid token:', err);
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Middleware to check if the user is an admin
module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};

// Optional: Middleware to validate MongoDB ObjectId
module.exports.validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    next();
};
