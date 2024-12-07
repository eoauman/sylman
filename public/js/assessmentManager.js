// assessmentManager.js

import { createMinusButton, createAddAssessmentButton } from './uiElements.js';

export function updateLearningOutcomesAndAssessments(syllabusData = {}) {
    console.log("Updating Learning Outcomes and Assessments with syllabusData:", syllabusData);

    const outcomesTable = document.getElementById('outcomesAssessmentTable').querySelector('tbody');
    const existingAssessments = {}; // Store existing assessments

    // Iterate through the existing table rows to extract the assessments before clearing
    outcomesTable.querySelectorAll('tr').forEach((row) => {
        const assessmentInputs = row.querySelectorAll('.assessment-cell input[type="text"]');
        const assessmentKey = row.getAttribute('data-slo-number');
        if (assessmentKey) {
            existingAssessments[assessmentKey] = Array.from(assessmentInputs).map(input => input.value);
        }
    });

    outcomesTable.innerHTML = ''; // Clear existing rows to repopulate everything

    // Check if syllabusData is defined and has assessments
    const assessmentsData = syllabusData.assessments || {};

    // Iterate over all SLO cells
    const sloCells = document.querySelectorAll('.slo-cell');

    sloCells.forEach((sloCell) => {
        const outcomeIndex = sloCell.dataset.sloIndex; // Program Outcome index
        const sloInputs = sloCell.querySelectorAll('textarea'); // Use `textarea` for SLO inputs

        sloInputs.forEach((sloInput, sloIndex) => {
            const sloNumber = `${outcomeIndex}.${sloIndex + 1}`;
            const row = document.createElement('tr');
            row.setAttribute('data-slo-number', sloNumber);

            // Learning Outcome Cell
            const outcomeCell = document.createElement('td');
            outcomeCell.className = 'outcome-cell';
            outcomeCell.textContent = `${sloNumber} ${sloInput.value}`;
            row.appendChild(outcomeCell);

            // Assessment Cell
            const assessmentCell = document.createElement('td');
            assessmentCell.className = 'assessment-cell';
            assessmentCell.setAttribute('data-assessment-index', sloNumber);

            // Determine the assessments to use: prefer data from syllabusData if available, otherwise use the existing data from the table
            const assessments = assessmentsData[sloNumber] || existingAssessments[sloNumber] || [];

            // Populate assessment inputs
            if (assessments.length > 0) {
                assessments.forEach((assessment, assessmentIndex) => {
                    const inputWrapper = document.createElement('div');
                    inputWrapper.className = 'assessment-input-wrapper';

                    const assessmentInput = document.createElement('input');
                    assessmentInput.type = 'text';
                    assessmentInput.name = `assessments${sloNumber}[]`;
                    assessmentInput.placeholder = `Assessment ${assessmentIndex + 1}`;
                    assessmentInput.value = assessment;
                    assessmentInput.required = true;

                    inputWrapper.appendChild(assessmentInput);

                    const minusButton = createMinusButton();
                    minusButton.addEventListener('click', () => {
                        inputWrapper.remove();
                        console.log(`Removed Assessment ${assessmentIndex + 1} for ${sloNumber}`);
                    });

                    inputWrapper.appendChild(minusButton);
                    assessmentCell.appendChild(inputWrapper);
                });
            } else {
                // If no assessments exist, add an empty input field
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'assessment-input-wrapper';

                const assessmentInput = document.createElement('input');
                assessmentInput.type = 'text';
                assessmentInput.name = `assessments${sloNumber}[]`;
                assessmentInput.placeholder = `Assessment 1`;
                assessmentInput.required = true;

                inputWrapper.appendChild(assessmentInput);

                assessmentCell.appendChild(inputWrapper);
            }

            // Add a button to add more assessments
            const addButton = createAddAssessmentButton(assessmentCell, sloNumber);
            assessmentCell.appendChild(addButton);

            row.appendChild(assessmentCell);

            // Append the new row to the outcomes table
            outcomesTable.appendChild(row);
        });
    });

    console.log('Learning Outcomes and Assessments updated.');
}

export function addAssessmentInput(cell, rowNumber) {
    const newAssessmentNumber = cell.querySelectorAll(`input[name="assessments${rowNumber}[]"]`).length + 1;

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'assessment-input-wrapper';

    const assessmentInput = document.createElement('input');
    assessmentInput.type = 'text';
    assessmentInput.name = `assessments${rowNumber}[]`;
    assessmentInput.placeholder = `Assessment ${newAssessmentNumber}`;
    assessmentInput.required = true;
    inputWrapper.appendChild(assessmentInput);

    const minusButton = createMinusButton();
    minusButton.addEventListener('click', () => {
        inputWrapper.remove();
        console.log(`Removed Assessment ${newAssessmentNumber} for Row ${rowNumber}`);
    });

    inputWrapper.appendChild(minusButton);

    cell.insertBefore(inputWrapper, cell.querySelector('.addAssessmentButton'));
}

export function populateLearningOutcomes(learningOutcomes) {
    const outcomesTableBody = document.getElementById('outcomesAssessmentTable').getElementsByTagName('tbody')[0];
    if (!outcomesTableBody) {
        console.error('Outcomes Assessment Table Body not found.');
        return;
    }
    outcomesTableBody.innerHTML = ''; // Clear existing rows

    if (learningOutcomes && Array.isArray(learningOutcomes)) {
        learningOutcomes.forEach((outcome, index) => {
            const row = outcomesTableBody.insertRow();
            const outcomeCell = row.insertCell(0);

            const learningOutcomeText = document.createElement('div');
            learningOutcomeText.textContent = outcome;
            outcomeCell.appendChild(learningOutcomeText);

            const assessmentCell = row.insertCell(1);
            assessmentCell.className = 'assessment-cell';

            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'assessment-input-wrapper';

            const assessmentInput = document.createElement('input');
            assessmentInput.type = 'text';
            assessmentInput.name = `assessments${index + 1}[]`;
            assessmentInput.placeholder = `Assessment 1`;
            assessmentInput.required = true;
            inputWrapper.appendChild(assessmentInput);

            assessmentCell.appendChild(inputWrapper);

            const addButton = createAddAssessmentButton(assessmentCell, index + 1);
            assessmentCell.appendChild(addButton);
        });
    }
}

// Function to add a new input field for an additional outcome
export function addOutcomeInput(sloCell) {
    // Create a new div to wrap the input and remove button
    const outcomeWrapper = document.createElement('div');
    outcomeWrapper.className = 'outcome-wrapper';

    // Create a new input/textarea for the outcome
    const sloIndex = sloCell.querySelectorAll('textarea').length + 1;
    const newOutcomeInput = document.createElement('textarea');
    newOutcomeInput.name = `${sloCell.dataset.sloIndex}[]`; // Use the slo index to identify related outcomes
    newOutcomeInput.placeholder = `Student Learning Outcome ${sloCell.dataset.sloIndex}.${sloIndex}`;
    newOutcomeInput.required = true;

    // Add the input/textarea to the wrapper
    outcomeWrapper.appendChild(newOutcomeInput);

    // Create a button to remove the outcome input
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'removeOutcomeButton';
    removeButton.textContent = 'Remove';

    // Add click event to remove button
    removeButton.addEventListener('click', () => {
        outcomeWrapper.remove();
        relocateAddButton(sloCell); // Ensure the Add button is properly positioned
    });

    // Add the remove button to the wrapper
    outcomeWrapper.appendChild(removeButton);

    // Append the wrapper to the sloCell
    sloCell.appendChild(outcomeWrapper);

    // Relocate the Add button to the end of the sloCell
    relocateAddButton(sloCell);
}