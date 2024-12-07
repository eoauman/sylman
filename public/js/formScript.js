// formScript.js

import { initializeEventListeners, updateTotalWeight, initializeWeightingTable } from './eventInit.js';
import { initializeForm, loadSyllabusData, collectFormData, initializeProgramSelectListener, populateForm, populateWeightingDetailsFromAssessments, populateGradingElements, populateModules, updateWeightingDetailsAndAssignments } from './formUtils.js';
import { initializeQuillEditors, syncQuillEditors } from './quillUtils.js';
import { updateLearningOutcomesAndAssessments} from './assessmentManager.js';
import { generateModules } from './moduleManager.js';
import { submitSyllabus } from './formSubmit.js';
import { createHtmlSyllabus } from './syllabusAPI.js';
import { setDownloadLink, validateQuillContent } from './helper.js';

// Function to initialize the form script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Initialize form and other components
    initializeForm(); // General setup
    loadSyllabusData()
        .then((data) => {
            console.log('Syllabus data loaded:', data);

            // Ensure the form is fully populated before running other dependent functions
            initializeQuillEditors();
            populateForm(data);
            updateLearningOutcomesAndAssessments(data);
            updateWeightingDetailsAndAssignments(data);
            initializeWeightingTable();
            updateTotalWeight();
        })
        .catch((error) => {
            console.error('Error loading syllabus data:', error);
        });

    initializeEventListeners(); // Run event listeners setup
});

// Function to handle form submission
export const syllabusForm = document.getElementById('syllabusForm');
if (syllabusForm) {
    syllabusForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Sync all Quill editors with their respective hidden textareas
        syncQuillEditors();

        const formData = collectFormData();
        console.log('Form Data:', formData);

        // Submit the collected syllabus data
        submitSyllabus(formData);
    });
}

// Generate modules based on the number of modules and start date selected
export const moduleSelect = document.getElementById('moduleSelect');
const datePicker = document.getElementById('datePicker');
if (moduleSelect && datePicker) {
    moduleSelect.addEventListener('change', generateModules);
    datePicker.addEventListener('change', generateModules);
}
