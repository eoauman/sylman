// --- Imports ---
// Importing functions and utilities used across the application.
// Each import is grouped by its source module to improve clarity.
import { addModule, removeModule, generateModules } from './moduleManager.js'; // For module-related operations.
import { submitSyllabus, saveFormData } from './formSubmit.js'; // Handles form submission and saving.
import { updateLearningOutcomesAndAssessments, addOutcomeInput } from './assessmentManager.js'; // For SLOs and assessments.
import {
    initializeQuillEditor,
    syncQuillEditors
} from './quillUtils.js'; // Manages Quill editor initialization and synchronization.
import {
    collectFormData,
    populateLearningOutcomes,
    updateWeightingDetailsAndAssignments,
    saveFormAfterProgramChange,
    saveProgramSelection,
    setDefaultPolicyTextForProgram,
    initializeProgramSelectListener,
    populateProgramAndSLOs,
    addSLOInput,
    sloMapping,
    relocateAddButton
} from './formUtils.js'; // Form utilities for managing field values and data handling.
import { waitForElementToExist } from './helper.js'; // Utility to wait for elements in the DOM.
import { createHtmlSyllabus } from './syllabusAPI.js'; // Function to generate HTML syllabus.
import { initializeModuleManager } from './moduleManager.js';
import { startAutosave, stopAutosave } from './formSubmit.js';

// --- Event Handler: Program Change ---
// Updates form placeholders and triggers actions when the program dropdown changes.
export function handleProgramChange(event) {
    if (!event?.target) {
        console.error('No valid event provided or target is missing.');
        return;
    }

    const program = event.target.value;
    console.log("Program changed to:", program);

    const placeholders = {
        BSN: { courseType: "Lecture, studio, or other (for BSN)", placement: "Year #, Semester # (for BSN)" },
        MSN: { courseType: "Lecture, lab, or seminar (for MSN)", placement: "Year #, Semester # (for MSN)" },
        DNP: { courseType: "Hybrid, online, or seminar (for DNP)", placement: "Year #, Semester # (for DNP)" },
        default: { courseType: "Lecture, studio, lab, seminar, or other", placement: "Year #, Semester #" }
    };

    const courseTypeField = document.getElementById('courseType');
    const placementField = document.getElementById('placement');

    if (courseTypeField && placementField) {
        const { courseType, placement } = placeholders[program] || placeholders.default;
        courseTypeField.placeholder = courseType;
        placementField.placeholder = placement;
        console.log(`Updated placeholders: courseType="${courseType}", placement="${placement}"`);
    } else {
        console.warn("Course type or placement fields not found.");
    }

    try {
        // Clear the Program Outcomes Table before populating to prevent duplication
        const progOutcomesTable = document.querySelector('#progStudentOutcomesTable tbody');
        if (progOutcomesTable) {
            progOutcomesTable.innerHTML = ''; // Clear all rows
        }

        // Set default policies for the selected program
        setDefaultPolicyTextForProgram(program);
        console.log(`Default policies set for program: ${program}`);
    } catch (error) {
        console.error('Error setting default policies:', error);
    }

    try {
        // Populate the Program & Student Learning Outcomes Table
        populateProgramAndSLOs(program);
        console.log('Program and SLO table populated successfully.');
    } catch (error) {
        console.error('Error populating Program and SLO table:', error);
    }

    try {
        // Add existing SLOs dynamically from sloMapping
        const sloData = sloMapping[program];
        if (sloData) {
            Object.keys(sloData).forEach(outcomeIndex => {
                const sloCell = document.querySelector(`.slo-cell[data-slo-index="${outcomeIndex}"]`);
                if (sloCell) {
                    sloData[outcomeIndex].forEach((slo, i) => {
                        const existingGroups = sloCell.querySelectorAll('.slo-group');
                        const newSloIndex = existingGroups.length + 1;
                        addSLOInput(sloCell, parseInt(outcomeIndex), newSloIndex, slo); // Add SLO with value
                    });
                }
            });
            console.log('Existing SLOs added dynamically.');
        } else {
            console.warn('No existing SLO data found for program:', program);
        }
    } catch (error) {
        console.error('Error adding existing SLOs dynamically:', error);
    }

    try {
        // Reinitialize SLO Listeners after table population and SLO addition
        initializeSLOListeners();
        console.log('SLO listeners reinitialized successfully.');
    } catch (error) {
        console.error('Error initializing SLO listeners:', error);
    }

    try {
        // Update Learning Outcomes and Assessments Table
        updateLearningOutcomesAndAssessments();
        console.log('Learning Outcomes and Assessments table updated successfully.');
    } catch (error) {
        console.error('Error updating Learning Outcomes and Assessments table:', error);
    }
}

/**
 * Updates the active state of the navigation tab corresponding to the given step.
 * 
 * @param {number|string} step - The step number to activate.
 */
export function updateActiveTab(step) {
    // Fetch all navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navLinks.length) {
        console.warn('No navigation links found.');
        return;
    }

    // Deactivate all navigation tabs
    navLinks.forEach(navLink => navLink.classList.remove('active'));

    // Activate the tab corresponding to the current step
    const activeLink = document.querySelector(`.nav-link[data-step="${step}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else {
        console.error(`Navigation link with data-step="${step}" not found.`);
    }
}
/**
 * Displays the form step corresponding to the given number.
 * @param {number|string} step - The step number to display.
 */
export function showStep(step) {
    // Hide all steps and remove 'active' class
    document.querySelectorAll('.form-step').forEach((stepDiv) => {
        stepDiv.classList.remove('active');
        stepDiv.style.display = 'none';
    });

    // Show the specified step and add 'active' class
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
        stepElement.style.display = 'block';
    } else {
        console.error(`Step element with id "step${step}" not found`);
    }

    // Update navigation tab highlighting
    document.querySelectorAll('.nav-link').forEach((navLink) => {
        navLink.classList.remove('active');
        if (navLink.getAttribute('data-step') === String(step)) {
            navLink.classList.add('active');
        }
    });
}

// Ensure the initializeEventListeners is called when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

export function initializeAutosaveListeners() {
    console.log("Autosave listeners initialized.");
}
/**
 * Initializes all event listeners for dynamic form interactions.
 * This function orchestrates calls to modularized initialization functions.
 */
export function initializeEventListeners() {
    console.log('Initializing all event listeners...');

    // Modularized event listener initializations
    try {
        initializeInstructorFieldListeners();    // Instructor input field logic
        console.log('Instructor field listeners initialized.');
    } catch (error) {
        console.error('Error initializing instructor field listeners:', error);
    }

    try {
        initializeWeightingTable();             // Weighting table logic
        console.log('Weighting table listeners initialized.');
    } catch (error) {
        console.error('Error initializing weighting table listeners:', error);
    }

    try {
        initializeSLOListeners();               // SLO input listeners
        console.log('SLO listeners initialized.');
    } catch (error) {
        console.error('Error initializing SLO listeners:', error);
    }

    try {
        initializeDynamicAssessmentListener();  // Assessment table updates
        console.log('Dynamic assessment listeners initialized.');
    } catch (error) {
        console.error('Error initializing dynamic assessment listeners:', error);
    }

    try {
        initializeAddOutcomeListeners();        // Add new SLO outcome
        console.log('Add outcome listeners initialized.');
    } catch (error) {
        console.error('Error initializing add outcome listeners:', error);
    }

    try {
        initializeProgramSelectListener();      // Program selection logic
        console.log('Program select listeners initialized.');
    } catch (error) {
        console.error('Error initializing program select listeners:', error);
    }

    try {
        initializeSaveButtonListeners();        // Save buttons
        console.log('Save button listeners initialized.');
    } catch (error) {
        console.error('Error initializing save button listeners:', error);
    }

    try {
        initializeModuleListeners();            // Module and date pickers
        console.log('Module listeners initialized.');
    } catch (error) {
        console.error('Error initializing module listeners:', error);
    }

    try {
        initializeNavigationListeners();        // Navigation buttons and links
        console.log('Navigation listeners initialized.');
    } catch (error) {
        console.error('Error initializing navigation listeners:', error);
    }

    try {
        initializeFormSubmissionListener();     // Form submission handling
        console.log('Form submission listeners initialized.');
    } catch (error) {
        console.error('Error initializing form submission listeners:', error);
    }

    try {
        initializeCreateHtmlListener();         // HTML syllabus generation
        console.log('HTML syllabus generation listeners initialized.');
    } catch (error) {
        console.error('Error initializing HTML syllabus generation listeners:', error);
    }

    try {
        initializeModuleManager();              // Dynamic module creation
        console.log('Dynamic module creation listeners initialized.');
    } catch (error) {
        console.error('Error initializing module manager:', error);
    }

    // Initialize autosave functionality
    try {
        initializeAutosaveListeners();          // Autosave handling
        console.log('Autosave listeners initialized.');
    } catch (error) {
        console.error('Error initializing autosave listeners:', error);
    }

    console.log('All event listeners initialized successfully.');
}

/**
 * Initializes autosave when the user starts interacting with the form
 * and stops it when the form is submitted.
 */
export function initializeForm() {
    console.log('Initializing form...');

    const syllabusId = sessionStorage.getItem('syllabusId') || getSyllabusIdFromDOM();
    if (!syllabusId) {
        console.error('Syllabus ID not found during initialization.');
        alert('Unable to initialize the form. Missing syllabus ID.');
        return;
    }
    console.log(`Syllabus ID: ${syllabusId}`);

    loadSyllabusData(syllabusId)
        .then((data) => {
            if (!data) {
                throw new Error('No syllabus data returned.');
            }
            console.log('Syllabus data loaded:', data);
            populateForm(data);
        })
        .catch((error) => {
            console.error('Error during form initialization:', error.message || error);
            alert('Failed to load syllabus data. Please try again.');
        });
}

function getSyllabusIdFromDOM() {
    const element = document.getElementById('syllabusId');
    return element ? element.value : null;
}


/**
 * Initializes the form submission event listener for `syllabusForm`.
 * Validates the form, syncs editor values, and submits the form data.
 */
function initializeFormSubmissionListener() {
    const syllabusForm = document.getElementById('syllabusForm');
    if (!syllabusForm) {
        console.warn('Syllabus form not found.');
        return;
    }

    syllabusForm.addEventListener('submit', event => {
        event.preventDefault();

        console.log('Form submission triggered.');

        // Ensure hidden fields are not marked as required
        validateFormFields();
        syncQuillEditors();

        const formData = collectFormData();
        console.log('Collected Form Data:', formData);

        // Submit the form data using `submitSyllabus` API
        submitSyllabus(formData);
    });
}

/**
 * Initializes navigation event listeners for links and buttons.
 * Links and buttons trigger step navigation via the `showStep` function.
 */
function initializeNavigationListeners() {
    // Ensure the `showStep` function exists
    if (typeof showStep !== 'function') {
        console.error('showStep function is not defined.');
        return;
    }

    // Helper function to add navigation listener
    const addNavigationListener = (element, type) => {
        const stepToShow = element.getAttribute('data-step');
        if (stepToShow) {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`Navigating to step: ${stepToShow}`);
                showStep(parseInt(stepToShow, 10)); // Ensure step is treated as a number
            });
        } else {
            console.warn(`${type} is missing the "data-step" attribute.`);
        }
    };

    // Step 1: Initialize navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length) {
        navLinks.forEach(link => addNavigationListener(link, 'Navigation link'));
        console.log(`${navLinks.length} navigation links initialized.`);
    } else {
        console.warn('No navigation links found to initialize.');
    }

    // Step 2: Initialize navigation buttons
    const navButtons = document.querySelectorAll('.nav-button');
    if (navButtons.length) {
        navButtons.forEach(button => addNavigationListener(button, 'Navigation button'));
        console.log(`${navButtons.length} navigation buttons initialized.`);
    } else {
        console.warn('No navigation buttons found to initialize.');
    }
}

/**
 * Initializes event listeners for SLO (Student Learning Outcomes) input fields.
 * Ensures proper behavior for "Add Outcome" and "Remove Outcome" buttons.
 */
export function initializeSLOListeners() {
    const addOutcomeButtons = document.querySelectorAll('.addOutcomeButton');

    // Exit early if no buttons found
    if (!addOutcomeButtons.length) {
        console.warn('No "Add Outcome" buttons found. Ensure buttons are created before calling this function.');
        return;
    }

    console.log('Add Outcome Buttons Found:', addOutcomeButtons);

    // Remove any pre-existing event listeners by replacing nodes
    addOutcomeButtons.forEach(button => {
        const newButton = button.cloneNode(true); // Clone to remove listeners
        button.parentNode.replaceChild(newButton, button);
    });

    // Re-add listeners to the newly cloned buttons
    const updatedButtons = document.querySelectorAll('.addOutcomeButton');
    updatedButtons.forEach(button => {
        button.addEventListener('click', event => {
            const sloCell = event.target.closest('.slo-cell');
            if (sloCell) {
                const index = sloCell.getAttribute('data-slo-index');
                addSLOInput(sloCell, index);
            }
        });
    });

    console.log('SLO listeners reinitialized.');
}
export function reinitializeSLOListeners() {
    try {
        const addOutcomeButtons = document.querySelectorAll('.addOutcomeButton');
        if (!addOutcomeButtons.length) {
            console.warn('No "Add Outcome" buttons found.');
            return;
        }

        addOutcomeButtons.forEach(button => {
            button.addEventListener('click', event => {
                const sloCell = event.target.closest('.slo-cell');
                if (sloCell) {
                    const index = sloCell.dataset.sloIndex;
                    addOutcomeInput(sloCell, index);
                } else {
                    console.error('Failed to determine SLO cell for the clicked button.');
                }
            });
        });
        console.log('Reinitialized "Add Outcome" listeners successfully.');
    } catch (error) {
        console.error('Error while reinitializing SLO listeners:', error);
    }
}

/**
 * Handles adding a new SLO input when the "Add Outcome" button is clicked.
 * @param {Event} event - The click event triggered by the "Add Outcome" button.
 */
function addOutcomeHandler(event) {
    event.preventDefault();
    const sloCell = event.target.closest('.slo-cell');
    const outcomeIndex = parseInt(sloCell.dataset.slo-index);

    if (sloCell && outcomeIndex) {
        addSLOInput(sloCell, outcomeIndex);
    }
}

/**
 * Initializes event listeners for dynamically created Add Outcome buttons.
 * Ensures proper behavior for all buttons in the DOM.
 * @param {NodeList} buttons - The Add Outcome buttons to initialize.
 */
export function initializeAddOutcomeButtons(buttons) {
    buttons.forEach(button => {
        button.removeEventListener('click', addOutcomeHandler); // Remove existing listeners
        button.addEventListener('click', addOutcomeHandler); // Attach the new listener
    });
}


/**
 * Handles the "Add Outcome" button click event.
 * Dynamically adds a new SLO input and repositions the button.
 */
function handleAddOutcomeClick(event) {
    event.preventDefault();

    // Find the SLO cell where the button was clicked
    const sloCell = event.target.closest('.slo-cell');
    if (sloCell) {
        addOutcomeInput(sloCell); // Use the updated function to add the new input
    } else {
        console.error('SLO cell not found for Add Outcome button.');
    }
}

/**
 * Initializes the weighting table, allowing dynamic addition of rows.
 * Adds listener for "Add Assignment" button and ensures validation and total weight tracking.
 */
export function initializeWeightingTable() {
    const weightingTable = document.getElementById('weightingDetailsTable');
    const addAssignmentButton = document.getElementById('addAssessedElementButton');

    if (!weightingTable) {
        console.warn('Weighting table element not found.');
        return;
    }

    if (!addAssignmentButton) {
        console.warn('"Add Assignment" button not found.');
        return;
    }

    addAssignmentButton.addEventListener('click', () => {
        const tbody = weightingTable.querySelector('tbody');
        if (!tbody) {
            console.error('Table body for weighting table not found.');
            return;
        }

        // Create a new row for the weighting element
        const row = document.createElement('tr');
        row.appendChild(createTableCellWithInput('text', 'assessedElements[]', 'Assignment Title', true));
        row.appendChild(createTableCellWithInput('number', 'weight[]', 'Weight (%)', true, { min: '0', max: '100' }));

        tbody.appendChild(row);

        // Add listener for updating the total weight dynamically
        const weightInput = row.querySelector('input[name="weight[]"]');
        weightInput.addEventListener('input', updateTotalWeight);

        console.log('New assessment row added to weighting table.');
    });
}

/**
 * Validates the total weight value and updates the display color.
 * @param {HTMLElement} element - The element displaying the total weight.
 * @param {number} totalWeight - The total weight value.
 */
function validateTotalWeight(element, totalWeight) {
    if (totalWeight > 100) {
        element.style.color = 'red';
        console.warn(`Total weight exceeds 100%: ${totalWeight}%`);
    } else {
        element.style.color = '';
    }
}

/**
 * Initializes listener for dynamically adding assessments when SLOs (Student Learning Outcomes) are updated.
 */
function initializeDynamicAssessmentListener() {
    const progStudentOutcomesTable = document.getElementById('progStudentOutcomesTable');
    if (!progStudentOutcomesTable) {
        console.warn('Program Student Outcomes table not found.');
        return;
    }

    progStudentOutcomesTable.addEventListener('input', event => {
        const target = event.target;
        if (target && target.matches('input[name^="slo"]')) {
            const sloIndex = target.closest('.slo-cell')?.getAttribute('data-slo-index');
            if (sloIndex) {
                console.log(`SLO input changed for index ${sloIndex}. Updating learning outcomes.`);
                updateLearningOutcomesAndAssessments(window.syllabusData);
            } else {
                console.warn('SLO index not found for the updated input.');
            }
        }
    });
}
/**
 * Initializes event listeners for "Add Outcome" buttons.
 * Adds new outcomes dynamically and triggers updates to learning outcomes and assessments.
 */
function initializeAddOutcomeListeners() {
    const addOutcomeButtons = document.querySelectorAll('.addOutcomeButton');

    if (!addOutcomeButtons.length) {
        console.warn('No "Add Outcome" buttons found.');
        return;
    }

    addOutcomeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cell = button.parentNode;
            const rowNumber = cell.getAttribute('data-slo-index');
            if (rowNumber) {
                console.log(`Adding new outcome input for SLO index: ${rowNumber}`);
                addOutcomeInput(cell, rowNumber);
                updateLearningOutcomesAndAssessments(window.syllabusData);
            } else {
                console.warn('Unable to determine SLO index for "Add Outcome" button.');
            }
        });
    });
}
/**
 * Sets up the listener for the "Create HTML Syllabus" button.
 * Triggers the syllabus generation logic on click.
 */
function initializeHtmlButtonListener() {
    const createHtmlButton = document.getElementById('createHtmlButton');

    if (!createHtmlButton) {
        console.warn('"Create HTML Syllabus" button not found.');
        return;
    }

    createHtmlButton.addEventListener('click', () => {
        console.log('HTML Syllabus generation triggered.');
        createHtmlSyllabus();
    });
}
/**
 * Initializes listeners for all save buttons to handle section-saving functionality.
 */
function initializeSaveButtonListeners() {
    const saveButtons = document.querySelectorAll('.save-button');

    if (!saveButtons.length) {
        console.warn('No save buttons found.');
        return;
    }

    saveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('onclick')?.split("'")[1];

            if (sectionId) {
                console.log(`Save button clicked for section: ${sectionId}`);
                syncQuillEditorContent(sectionId);
                saveSection(sectionId);
            } else {
                console.warn('Unable to determine section ID for save button.');
            }
        });
    });
}

/**
 * Synchronizes the content of a Quill editor with its hidden textarea.
 * @param {string} sectionId - The ID of the section being saved.
 */
function syncQuillEditorContent(sectionId) {
    const editorContainer = document.getElementById(`editor-${sectionId}`);
    if (editorContainer) {
        const quillInstance = Quill.find(editorContainer);
        const hiddenTextarea = document.getElementById(sectionId);

        if (quillInstance && hiddenTextarea) {
            hiddenTextarea.value = quillInstance.root.innerHTML.trim();
            console.log(`Quill content synced for section: ${sectionId}`);
        } else {
            console.warn(`Failed to sync Quill content for section: ${sectionId}`);
        }
    } else {
        console.warn(`Editor container not found for section: ${sectionId}`);
    }
}
/**
 * Initializes listeners for dynamically managing instructor input fields.
 * Creates and synchronizes instructor-related Quill editors as needed.
 */
function initializeInstructorFieldListeners() {
    const addInstructorsElement = document.getElementById('addInstructors');

    if (!addInstructorsElement) {
        console.warn('Add Instructors element not found.');
        return;
    }

    addInstructorsElement.addEventListener('change', () => {
        const numberOfInstructors = parseInt(addInstructorsElement.value, 10);
        const instructorsContainer = document.getElementById('instructorsContainer');

        if (!instructorsContainer) {
            console.error('Instructor container not found.');
            return;
        }

        instructorsContainer.innerHTML = '';
        console.log(`Creating ${numberOfInstructors} instructor input fields`);

        for (let i = 1; i <= numberOfInstructors; i++) {
            const instructorDiv = createInstructorDiv(i);
            instructorsContainer.appendChild(instructorDiv);

            waitForElementToExist(`editor-instructor${i}OfficeHours`, () => {
                initializeQuillEditor(`instructor${i}OfficeHours`, {
                    theme: 'snow',
                    placeholder: 'Enter text...',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['link'],
                            ['clean']
                        ]
                    }
                });
            });
        }
    });
}

/**
 * Creates an instructor input field block as a div element.
 * @param {number} index - The instructor index.
 * @returns {HTMLDivElement} - A div containing the instructor input fields.
 */
function createInstructorDiv(index) {
    const instructorDiv = document.createElement('div');
    instructorDiv.className = index % 2 === 0 ? 'instructor-block-white' : 'instructor-block-gray';

    instructorDiv.innerHTML = `
        <label for="instructor${index}Name">Course Instructor ${index}:</label>
        <input type="text" id="instructor${index}Name" name="instructors[${index}][name]" placeholder="Course Instructor ${index} Name, Credentials" required>
        <label for="instructor${index}Email">Email:</label>
        <input type="email" id="instructor${index}Email" name="instructors[${index}][email]" placeholder="name@jefferson.edu" required>
        <label for="instructor${index}Phone">Phone:</label>
        <input type="tel" id="instructor${index}Phone" name="instructors[${index}][phone]" placeholder="###-###-####" required>
        <label for="instructor${index}Office">Office:</label>
        <input type="text" id="instructor${index}Office" name="instructors[${index}][office]" placeholder="Building, Room Number" required>
        <label for="instructor${index}OfficeHours">Office Hours:</label>
        <div id="editor-instructor${index}OfficeHours" style="height: 100px;"></div>
        <textarea id="instructor${index}OfficeHours" name="instructors[${index}][officeHours]" style="display:none;" required></textarea>
    `;
    return instructorDiv;
}

/**
 * Adds a new row to the weighting table with fields for assessed elements and weight.
 * @param {HTMLElement} weightingTable - The weighting table element.
 */
function addNewWeightingRow(weightingTable) {
    const tbody = weightingTable.querySelector('tbody');
    if (!tbody) {
        console.error('Table body for weighting table not found.');
        return;
    }

    const row = document.createElement('tr');

    const assessedElementCell = createTableCellWithInput('text', 'assessedElements[]', 'Assignment Title', true);
    const weightCell = createTableCellWithInput('number', 'weight[]', 'Weight (%)', true, { min: '0', max: '100' });

    row.appendChild(assessedElementCell);
    row.appendChild(weightCell);
    tbody.appendChild(row);

    const weightInput = weightCell.querySelector('input');
    weightInput.addEventListener('input', updateTotalWeight);

    console.log('New row added to weighting table.');
}

/**
 * Creates a table cell containing an input field with specified attributes.
 * @param {string} type - The input type (e.g., 'text', 'number').
 * @param {string} name - The name attribute for the input.
 * @param {string} placeholder - The placeholder text for the input.
 * @param {boolean} required - Whether the input is required.
 * @param {Object} [attributes={}] - Additional attributes for the input.
 * @returns {HTMLTableCellElement} - The created table cell element.
 */
function createTableCellWithInput(type, name, placeholder, required, attributes = {}) {
    const cell = document.createElement('td');
    const input = document.createElement('input');

    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    if (required) input.required = true;

    Object.entries(attributes).forEach(([key, value]) => input.setAttribute(key, value));

    cell.appendChild(input);
    return cell;
}

/**
 * Updates the total weight displayed in the form.
 * Validates and highlights if the total weight exceeds 100%.
 */
export function updateTotalWeight() {
    const weightingDetailsTableBody = document.querySelector('#weightingDetailsTable tbody');
    if (!weightingDetailsTableBody) {
        console.error('Weighting details table body not found.');
        return;
    }

    const totalWeight = Array.from(weightingDetailsTableBody.querySelectorAll('input[name="weight"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);

    const totalWeightElement = document.getElementById('totalWeight');
    if (!totalWeightElement) {
        console.warn('Total weight element not found.');
        return;
    }

    totalWeightElement.textContent = `${totalWeight}%`;

    if (totalWeight > 100) {
        totalWeightElement.style.color = 'red';
        console.warn(`Total weight exceeds 100%: ${totalWeight}%`);
    } else {
        totalWeightElement.style.color = '';
    }
}

/**
 * Handles the click event for a save button.
 * Syncs Quill editor content and saves the corresponding section.
 * @param {HTMLElement} button - The save button element.
 */
function handleSaveButtonClick(button) {
    const sectionId = button.getAttribute('onclick').split("'")[1];
    console.log(`Save button clicked for section: ${sectionId}`);

    syncEditorContent(sectionId);
    saveSection(sectionId);
}

/**
 * Synchronizes the Quill editor content with its corresponding hidden textarea.
 * @param {string} sectionId - The ID of the section to sync.
 */
function syncEditorContent(sectionId) {
    const editorContainer = document.getElementById(`editor-${sectionId}`);
    if (!editorContainer) {
        console.warn(`Editor container not found for section: ${sectionId}`);
        return;
    }

    const quillInstance = Quill.find(editorContainer);
    if (!quillInstance) {
        console.warn(`Quill editor instance not found for section: ${sectionId}`);
        return;
    }

    const hiddenTextarea = document.getElementById(sectionId);
    if (!hiddenTextarea) {
        console.warn(`Hidden textarea not found for section: ${sectionId}`);
        return;
    }

    hiddenTextarea.value = quillInstance.root.innerHTML.trim();
    console.log(`Quill content synced for section: ${sectionId}`);
}

/**
 * Creates instructor input fields with appropriate structure and placeholders.
 * @param {number} index - The instructor index.
 * @returns {HTMLElement} - The created instructor input container.
 */
function createInstructorInputFields(index) {
    const instructorDiv = document.createElement('div');
    instructorDiv.className = index % 2 === 0 ? 'instructor-block-white' : 'instructor-block-gray';

    instructorDiv.innerHTML = `
        <label for="instructor${index}Name">Course Instructor ${index}:</label>
        <input type="text" id="instructor${index}Name" name="instructors[${index}][name]" placeholder="Course Instructor ${index} Name, Credentials" required>
        <label for="instructor${index}Email">Email:</label>
        <input type="email" id="instructor${index}Email" name="instructors[${index}][email]" placeholder="name@jefferson.edu" required>
        <label for="instructor${index}Phone">Phone:</label>
        <input type="tel" id="instructor${index}Phone" name="instructors[${index}][phone]" placeholder="###-###-####" required>
        <label for="instructor${index}Office">Office:</label>
        <input type="text" id="instructor${index}Office" name="instructors[${index}][office]" placeholder="Building, Room Number" required>
        <label for="instructor${index}OfficeHours">Office Hours:</label>
        <div id="editor-instructor${index}OfficeHours" style="height: 100px;"></div>
        <textarea id="instructor${index}OfficeHours" name="instructors[${index}][officeHours]" style="display:none;" required></textarea>
    `;
    return instructorDiv;
}

/**
 * Initializes the Quill editor for the specified instructor's Office Hours field.
 * @param {number} index - The instructor index.
 */
function initializeQuillEditorForInstructor(index) {
    waitForElementToExist(`editor-instructor${index}OfficeHours`, () => {
        initializeQuillEditor(`instructor${index}OfficeHours`, {
            theme: 'snow',
            placeholder: 'Enter text...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link'],
                    ['clean']
                ]
            }
        });
    });
}

/**
 * Adds a new row to the weighting table with dynamic input fields.
 * @param {HTMLElement} table - The table to which the row is added.
 */
export function addWeightingRow(table) {
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('Table body not found.');
        return;
    }

    const row = document.createElement('tr');
    row.appendChild(createTableCellWithInput('text', 'assessedElements[]', 'Assignment Title', true));
    row.appendChild(createTableCellWithInput('number', 'weight[]', 'Weight (%)', true, { min: '0', max: '100' }));
    tbody.appendChild(row);

    const weightInput = row.querySelector('input[name="weight[]"]');
    weightInput.addEventListener('input', updateTotalWeight);

    console.log('New assessment row added.');
}

/**
 * Handles form submission logic, including validation, editor sync, and data submission.
 * @param {HTMLFormElement} form - The syllabus form being submitted.
 */
function handleFormSubmission(form) {
    validateFormFields();
    syncQuillEditors();

    const formData = collectFormData(form);
    console.log('Collected Form Data:', formData);

    submitSyllabus(formData);
}
export function validateSyllabusId() {
    const syllabusId = sessionStorage.getItem('syllabusId') || getSyllabusIdFromDOM();
    if (!syllabusId) {
        console.error('Syllabus ID is missing. Please ensure it is set in session storage or the DOM.');
        alert('Failed to initialize the form. Syllabus ID is required.');
        return null;
    }
    return syllabusId;
}

/**
 * Validates form fields to ensure only visible inputs are required.
 */
function validateFormFields() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.style.display === 'none' || input.disabled || input.hidden) {
            input.removeAttribute('required');
        } else {
            input.setAttribute('required', 'true');
        }
    });
    console.log('Form fields validated.');
}
/**
 * Initializes event listeners for module selection and date picker changes.
 */
function initializeModuleAndDateListeners() {
    const moduleSelect = document.getElementById('moduleSelect');
    const datePicker = document.getElementById('datePicker');

    if (moduleSelect) {
        moduleSelect.addEventListener('change', handleModuleChange);
        console.log('Module selection listener initialized.');
    } else {
        console.warn('Module selection dropdown not found.');
    }

    if (datePicker) {
        datePicker.addEventListener('change', handleDateChange);
        console.log('Date picker listener initialized.');
    } else {
        console.warn('Date picker element not found.');
    }
}

function initializeModuleListeners() {
    const moduleSelect = document.getElementById('moduleSelect');
    if (moduleSelect) {
        console.log('Initializing module selection listener.');
        moduleSelect.addEventListener('change', generateModules);
    } else {
        console.warn('Module selection dropdown not found.');
    }

    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
        console.log('Initializing date picker listener.');
        datePicker.addEventListener('change', generateModules);
    } else {
        console.warn('Date picker element not found.');
    }
}

/**
 * Initializes listener for creating an HTML syllabus.
 * Triggers syllabus generation on button click.
 */
function initializeCreateHtmlListener() {
    const createHtmlButton = document.getElementById('createHtmlButton');
    if (createHtmlButton) {
        console.log('Initializing "Create HTML Syllabus" button listener.');
        createHtmlButton.addEventListener('click', createHtmlSyllabus);
    } else {
        console.warn('"Create HTML Syllabus" button not found.');
    }
}

/**
 * Handles changes to the module selection dropdown.
 */
export function handleModuleChange() {
    console.log('Module selection changed.');
    generateModules();
}

/**
 * Handles changes to the date picker.
 */
export function handleDateChange() {
    console.log('Date picker value changed.');
    generateModules();
}

/**
 * Handles changes to the number of instructors and updates the UI accordingly.
 * @param {HTMLElement} input - The input element for the number of instructors.
 * @param {HTMLElement} container - The container for instructor fields.
 */
export function handleInstructorInputChange(input, container) {
    const numInstructors = parseInt(input.value, 10) || 0;
    container.innerHTML = '';

    for (let i = 1; i <= numInstructors; i++) {
        const instructorDiv = createInstructorHTML(i);
        container.appendChild(instructorDiv);
        initializeInstructorQuill(i);
    }
    console.log(`Generated ${numInstructors} instructor fields.`);
}

// Ensure consistent references and minimize DOM lookups.
const DOM_IDS = {
    syllabusForm: 'syllabusForm',
    moduleSelect: 'moduleSelect',
    datePicker: 'datePicker',
    createHtmlButton: 'createHtmlButton',
    weightingTable: 'weightingDetailsTable',
    addAssignmentButton: 'addAssessedElementButton',
    addInstructors: 'addInstructors',
    instructorsContainer: 'instructorsContainer',
    totalWeight: 'totalWeight'
};

/**
 * Initializes autosave when the user starts interacting with the form.
 */
export function initializeAutosaveOnFormInteraction() {
    const formElement = document.getElementById('syllabusForm');
    
    if (formElement) {
        formElement.addEventListener('focusin', () => {
            console.log('Form interaction detected. Starting autosave...');
            startAutosave(60000); // Autosave every 60 seconds
        }, { once: true }); // Ensures this listener runs only once
    } else {
        console.error('Syllabus form element not found.');
    }
}

/**
 * Stops autosave when the form is successfully submitted.
 */
export function initializeAutosaveStopOnSubmit() {
    const formElement = document.getElementById('syllabusForm');

    if (formElement) {
        formElement.addEventListener('submit', () => {
            console.log('Form submitted. Stopping autosave...');
            stopAutosave(); // Stop autosave on form submission
        });
    } else {
        console.error('Syllabus form element not found.');
    }
}