// public/js/uiElements.js

export function addOutcomeButtonHandler() {
    document.querySelectorAll('.addOutcomeButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const parent = event.target.parentElement;
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.name = `${parent.dataset.sloIndex}[]`;
            newInput.placeholder = `Student Learning Outcome ${parent.dataset.sloIndex}`;
            parent.insertBefore(newInput, event.target);
        });
    });
}

export function setupNavTabs() {
    document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.addEventListener('click', (event) => {
            event.preventDefault();

            const targetStep = event.target.dataset.step;

            // Remove 'active' class from all tabs and steps
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.form-step').forEach(step => step.style.display = 'none');

            // Add 'active' class to the selected tab and show the corresponding form step
            event.target.classList.add('active');
            document.getElementById(`step${targetStep}`).style.display = 'block';
        });
    });
}

export function addModuleButtonHandler() {
    const addModuleButton = document.getElementById('addModuleButton');
    addModuleButton.addEventListener('click', () => {
        const modulesContainer = document.getElementById('modulesContainer');
        const newModuleDiv = document.createElement('div');
        newModuleDiv.classList.add('module');
        newModuleDiv.innerHTML = `
            <label>Module Title:</label>
            <input type="text" name="moduleTitle[]" required>
            <label>Module Description:</label>
            <textarea name="moduleDescription[]" required></textarea>
        `;
        modulesContainer.appendChild(newModuleDiv);
    });
}

export function addAssignmentButtonHandler() {
    const addButton = document.getElementById('addAssessedElementButton');
    const assignmentsWrapper = document.getElementById('assignmentsWrapper');

    addButton.addEventListener('click', () => {
        const newAssignmentDiv = document.createElement('div');
        newAssignmentDiv.classList.add('assignment-entry');
        newAssignmentDiv.innerHTML = `
            <label>Assignment Title:</label>
            <input type="text" name="assignmentTitle[]" required>
            <label>Weight (%):</label>
            <input type="number" name="assignmentWeight[]" min="0" max="100" required>
        `;
        assignmentsWrapper.appendChild(newAssignmentDiv);
    });
}

export function addGradingElementButtonHandler() {
    const addButton = document.getElementById('addGradingElementButton');
    const gradingWrapper = document.getElementById('gradingWrapper');

    addButton.addEventListener('click', () => {
        const newGradingElementDiv = document.createElement('div');
        newGradingElementDiv.classList.add('grading-element');
        newGradingElementDiv.innerHTML = `
            <label>Grading Element:</label>
            <input type="text" name="gradingElement[]" required>
            <label>Description:</label>
            <textarea name="gradingDescription[]" required></textarea>
        `;
        gradingWrapper.appendChild(newGradingElementDiv);
    });
}

export function calculateTotalWeight() {
    const weightInputs = document.querySelectorAll('input[name="assignmentWeight[]"]');
    let totalWeight = 0;

    weightInputs.forEach(input => {
        input.addEventListener('input', () => {
            totalWeight = Array.from(weightInputs).reduce((total, element) => {
                return total + (parseFloat(element.value) || 0);
            }, 0);

            document.getElementById('totalWeight').innerText = `${totalWeight}%`;
        });
    });
}

export function saveSectionHandler() {
    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionId = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            const editor = document.querySelector(`#editor-${sectionId}`);
            const textarea = document.querySelector(`#${sectionId}`);
            textarea.value = editor.innerHTML; // Sync editor content to textarea

            // Here, you would also send this data to the server if needed
            alert(`${sectionId} has been saved.`);
        });
    });
}

export function setupQuillEditors() {
    const quillElements = [
        { selector: '#editor-leadOfficeHours', textarea: '#leadOfficeHours' },
        { selector: '#editor-courseDescription', textarea: '#courseDescription' },
        { selector: '#editor-requiredMaterials', textarea: '#requiredMaterials' },
        { selector: '#editor-instructionalMethods', textarea: '#instructionalMethods' },
        { selector: '#editor-courseCommunications', textarea: '#courseCommunications' },
        // Add more sections here as needed...
    ];

    quillElements.forEach(({ selector, textarea }) => {
        const quill = new Quill(selector, {
            theme: 'snow'
        });
        quill.on('text-change', () => {
            document.querySelector(textarea).value = quill.root.innerHTML;
        });
    });
}

// Creates a minus button to remove an assessment input
export function createMinusButton() {
    const minusButton = document.createElement('button');
    minusButton.type = 'button';
    minusButton.className = 'minus-button';
    minusButton.innerHTML = '-'; // You could use an icon here if desired

    minusButton.addEventListener('click', (event) => {
        event.preventDefault();
        const inputWrapper = event.target.closest('.assessment-input-wrapper');
        if (inputWrapper) {
            inputWrapper.remove();
        }
    });

    return minusButton;
}

// Creates a button to add more assessment inputs under a specific learning outcome
export function createAddAssessmentButton(cell, rowNumber) {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'addAssessmentButton';
    addButton.innerHTML = 'Add Assessment';

    addButton.addEventListener('click', () => {
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
        inputWrapper.appendChild(minusButton);

        cell.insertBefore(inputWrapper, addButton);
    });

    return addButton;
}
