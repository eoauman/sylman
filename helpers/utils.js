//helpers/utils.js
const path = require('path');
const fs = require('fs-extra');

// --- File Utility Functions ---

// Helper function to sanitize file names
const sanitizeFileName = (name) => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// Function to save HTML content locally
const saveHtmlLocally = async (htmlContent, fileName) => {
  const filePath = path.join(__dirname, '..', 'public', 'syllabi', fileName);
  console.log('Attempting to save file at path:', filePath);
  await fs.outputFile(filePath, htmlContent);
  console.log('File successfully saved at path:', filePath);
  return filePath;
};

// --- DOM Utility Functions ---

/**
 * Sets the value of an element by its ID
 * @param {string} id - The ID of the element
 * @param {string} value - The value to set
 */
const setElementValue = (id, value = '') => {
  const element = document.getElementById(id);
  if (element) element.value = value;
  else console.warn(`Element with id "${id}" not found.`);
};

/**
 * Dynamically populates fields from a list
 * @param {string[]} fields - The fields to populate
 * @param {Object} data - The data object containing field values
 * @param {Object} defaults - The default values for fields
 */
const populateFields = (fields, data, defaults = {}) => {
  fields.forEach((field) => {
    const value = data[field] ?? defaults[field] ?? '';
    setElementValue(field, value);
  });
};

// Exporting all functions
module.exports = {
  sanitizeFileName,
  saveHtmlLocally,
  setElementValue,
  populateFields,
};
