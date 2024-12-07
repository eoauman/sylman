const mongoose = require('mongoose');

// Middleware to validate userId
const validateUserId = (req, res, next) => {
    const userId = req.params.userId || req.body.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    next();
};

// Middleware to validate syllabusId
const validateSyllabusId = (req, res, next) => {
    const syllabusId = req.params.id || req.body.syllabusId;
    console.log('Validating Syllabus ID:', syllabusId); // Add logging
    if (!syllabusId || !mongoose.Types.ObjectId.isValid(syllabusId)) {
        console.error('Invalid syllabus ID:', syllabusId);
        return res.status(400).json({ error: 'Invalid syllabus ID' });
    }
    next();
};

// Middleware to validate required fields
const validateRequiredFields = (req, res, next) => {
    const { autosave, formData: syllabusData } = req.body;

    if (!autosave) {
        const requiredFields = ['courseTitle', 'programSelect', 'courseNumber'];
        const missingFields = requiredFields.filter((field) => !syllabusData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }
    }

    next();
};

module.exports = { validateUserId, validateSyllabusId, validateRequiredFields };
