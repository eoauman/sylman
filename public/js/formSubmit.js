// formSubmit.js

import { collectFormData } from './formUtils.js';
import { syncQuillEditors } from './quillUtils.js';
import { submitSyllabus as submitSyllabusToServer, retrieveSyllabi, createHtmlSyllabus } from './syllabusAPI.js';

let autoSaveIntervalId; // To manage the autosave interval

// Helper function to sync Quill editors and collect form data
function prepareFormDataForSubmission() {
    // Sync Quill editors with their respective hidden textareas
    syncQuillEditors();

    // Collect form data
    const formData = collectFormData();
    console.log('Collected Form Data:', formData);

    return formData;
}

// Sets the syllabus ID in sessionStorage
export function setSyllabusId(id) {
    if (id) {
        sessionStorage.setItem('syllabusId', id); // Store the syllabus ID
    } else {
        sessionStorage.removeItem('syllabusId'); // Clear the ID if null
    }
    console.log(`Syllabus ID set to: ${id}`);
}

let previousFormData = null; // Initialize previousFormData globally

// Function to save form data (used for both manual save and autosave)
export async function saveFormData(isAutosave = false) {
    const statusElement = document.getElementById('autosave-status'); // Element for displaying autosave status

    try {
        // Notify user of autosave progress
        if (isAutosave && statusElement) {
            statusElement.textContent = 'Autosaving...';
        }

        const formData = prepareFormDataForSubmission(); // Collect and prepare form data
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            throw new Error('User ID missing. Please log in again.');
        }

        // Retrieve syllabusId from sessionStorage or fallback to the DOM
        let syllabusId = sessionStorage.getItem('syllabusId');
        if (!syllabusId) {
            const syllabusIdElement = document.getElementById('syllabusId'); // Fallback to a hidden input field
            syllabusId = syllabusIdElement ? syllabusIdElement.value : null;
        }

        // Avoid autosaving unchanged data
        if (isAutosave && JSON.stringify(previousFormData) === JSON.stringify(formData)) {
            console.log('No changes detected. Autosave skipped.');
            return;
        }
        previousFormData = { ...formData }; // Update the saved state

        // Skip required field validation entirely for autosave
        if (!isAutosave) {
            const requiredFields = Object.keys(formData).filter(
                key => formData[key] === '' || formData[key] == null
            );

            if (requiredFields.length > 0) {
                console.error('Validation failed: Missing required fields:', requiredFields);
                throw new Error(`Missing required fields: ${requiredFields.join(', ')}`);
            }
        }

        // Determine the request method and URL
        const method = syllabusId ? 'PUT' : 'POST';
        const url = syllabusId ? `/syllabus/update/${syllabusId}` : '/syllabus';

        // Add `lastEdited` timestamp and autosave flag to the payload
        const lastEdited = new Date().toISOString();
        const payload = {
            userId,
            formData,
            lastEdited,
            autosave: isAutosave,
        };

        if (syllabusId) {
            payload.syllabusId = syllabusId; // Add syllabusId explicitly if it exists
        }

        // Log the payload for debugging
        console.log(`Preparing to save data. Method: ${method}, URL: ${url}`, JSON.stringify(payload, null, 2));

        // Send the request to the backend
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Server error during save:', errorDetails);

            // Handle cases where syllabus is not found during updates
            if (response.status === 404) {
                console.warn('Syllabus not found. Clearing stored ID.');
                sessionStorage.removeItem('syllabusId'); // Clear invalid `syllabusId`
            }

            throw new Error(`Failed to save form data: ${errorDetails.error || 'Unknown server error'}`);
        }

        const responseData = await response.json();
        console.log(isAutosave ? 'Autosave response:' : 'Save response:', responseData);

        // Handle newly created syllabus ID
        if (!syllabusId && responseData.syllabusId) {
            syllabusId = responseData.syllabusId;
            sessionStorage.setItem('syllabusId', syllabusId);
            console.log('New syllabus created. Syllabus ID set to:', syllabusId);
        }

        // Update autosave status UI
        if (isAutosave && statusElement) {
            statusElement.textContent = `Autosaved at: ${new Date().toLocaleTimeString()}`;
            setTimeout(() => { statusElement.textContent = ''; }, 5000); // Clear after 5 seconds
        }

        console.log(isAutosave ? 'Autosave successful.' : 'Form data successfully saved.');
    } catch (error) {
        console.error(isAutosave ? 'Error during autosave:' : 'Error saving form data:', error.message || error);

        // Update UI for autosave failure
        if (isAutosave && statusElement) {
            statusElement.textContent = 'Autosave failed. Please check your connection.';
        }
    }
}

// Function to update the autosave timestamp in the UI
function updateAutosaveTimestamp() {
    const timestamp = new Date().toLocaleTimeString();
    const statusElement = document.getElementById('autosave-status');
    if (statusElement) {
        statusElement.textContent = `Last autosaved at: ${timestamp}`;
    }
}

// Function to start autosaving at regular intervals
export function startAutosave(interval = 30000) { // Default to 30 seconds
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId); // Clear any existing interval
    }

    autoSaveIntervalId = setInterval(() => {
        saveFormData(true); // Call saveFormData with autosave flag
    }, interval);

    console.log(`Autosave started with an interval of ${interval}ms.`);
}

// Function to stop autosaving
export function stopAutosave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
        console.log('Autosave stopped.');
    }
}

// Update submitSyllabus function to accommodate both create and update
export async function submitSyllabus(userId, formData, syllabusId = null) {
    try {
        console.log('Submitting Syllabus:', formData);
        const method = syllabusId ? 'PUT' : 'POST';
        const url = syllabusId ? `/syllabus/update/${syllabusId}` : '/syllabus';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, syllabusData: formData }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit syllabus');
        }

        console.log('Syllabus submitted successfully.');
    } catch (error) {
        console.error('Error submitting syllabus:', error);
    }
}

// Ensure that the form data is collected and synchronized before submission
export function handleFormSubmission() {
    const syllabusForm = document.getElementById('syllabusForm');
    if (syllabusForm) {
        syllabusForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            try {
                const formData = prepareFormDataForSubmission();
                const userId = sessionStorage.getItem('userId');
                const syllabusId = getSyllabusId();

                if (userId) {
                    if (syllabusId) {
                        // Update existing syllabus
                        await submitSyllabus(userId, formData, syllabusId);
                    } else {
                        // Create new syllabus
                        await submitSyllabus(userId, formData);
                    }
                    stopAutosave(); // Stop autosave after successful submission
                } else {
                    console.error('User ID missing. Please log in again.');
                }
            } catch (error) {
                console.error('Error during form submission:', error);
            }
        });
    } else {
        console.error('Syllabus form element not found.');
    }
}

export function getSyllabusId() {
    const syllabusIdElement = document.getElementById('syllabusId'); // Assuming there is a hidden input field holding the ID
    return syllabusIdElement ? syllabusIdElement.value : null;
}

// Initializes event listeners for creating HTML syllabus
export function initializeHtmlButton() {
    const createHtmlButton = document.getElementById('createHtmlButton');
    if (createHtmlButton) {
        createHtmlButton.addEventListener('click', function () {
            const formData = prepareFormDataForSubmission();
            createHtmlSyllabus(formData);
        });
    } else {
        console.error('Create HTML button element not found.');
    }
}

// Initializes event listeners for retrieving syllabi data
export function initializeRetrieveSyllabi() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        retrieveSyllabi(userId);
    } else {
        console.error('User ID missing. Please log in again.');
    }
}

// Initialize form submission and autosave functionality
document.addEventListener('DOMContentLoaded', () => {
    handleFormSubmission();
    initializeHtmlButton();
    initializeRetrieveSyllabi();
    startAutosave(60000); // Start autosaving every 60 seconds
});
