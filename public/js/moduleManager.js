// Initializes the module manager functionality
export function initializeModuleManager() {
    console.log("Initializing Module Manager...");

    // Populate the module selection dropdown
    const moduleSelect = document.getElementById("moduleSelect");
    moduleSelect.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i} Module${i > 1 ? "s" : ""}`;
        moduleSelect.appendChild(option);
    }

    // Event listener to generate modules when the number of modules or date changes
    moduleSelect.addEventListener("change", generateModules);
    const datePicker = document.getElementById("datePicker");
    datePicker.addEventListener("change", generateModules);

    // Event listener to add modules manually
    const addModuleButton = document.getElementById("addModuleButton");
    addModuleButton.addEventListener("click", () => {
        const moduleCount = document.querySelectorAll(".module-block").length + 1;
        const startDate = document.getElementById("datePicker").value;

        if (moduleCount > 20) {
            alert("Maximum of 20 modules allowed.");
            return;
        }

        if (!startDate) {
            alert("Please select a valid start date before adding modules.");
            return;
        }

        addModule(moduleCount, new Date(startDate));
    });

    console.log("Module Manager Initialized.");
}

// Generates all modules based on user selection
export function generateModules() {
    console.log("Generating Modules...");

    const moduleCount = parseInt(document.getElementById("moduleSelect").value, 10);
    const startDateValue = document.getElementById("datePicker").value;

    if (!startDateValue) {
        alert("Please select a valid start date.");
        return;
    }

    const startDate = new Date(startDateValue);
    if (isNaN(startDate.getTime())) {
        alert("Invalid date selected.");
        return;
    }

    const modulesContainer = document.getElementById("modulesContainer");
    modulesContainer.innerHTML = ""; // Clear existing modules

    for (let i = 1; i <= moduleCount; i++) {
        addModule(i, startDate);
    }
}

// Adds a single module
export function addModule(moduleNumber, startDate) {
    console.log(`Adding Module ${moduleNumber}...`);

    const moduleStartDate = new Date(startDate);
    moduleStartDate.setDate(startDate.getDate() + (moduleNumber - 1) * 7);
    const moduleEndDate = new Date(moduleStartDate);
    moduleEndDate.setDate(moduleStartDate.getDate() + 6);

    const moduleStartDateFormatted = formatDate(moduleStartDate);
    const moduleEndDateFormatted = formatDate(moduleEndDate);

    const moduleDiv = document.createElement("div");
    moduleDiv.id = `module${moduleNumber}`;
    moduleDiv.classList.add("module-block", moduleNumber % 2 === 0 ? "module-block-gray" : "module-block-white");

    moduleDiv.innerHTML = `
        <h3>Module ${moduleNumber}</h3>
        <label for="module${moduleNumber}Title">Title:</label>
        <textarea id="module${moduleNumber}Title" name="module[${moduleNumber}][title]" placeholder="Module ${moduleNumber} Title" required></textarea>
        <label for="module${moduleNumber}Dates">Dates:</label>
        <textarea id="module${moduleNumber}Dates" name="module[${moduleNumber}][dates]" readonly>${moduleStartDateFormatted} - ${moduleEndDateFormatted}</textarea>
        <label for="module${moduleNumber}Assignments">Assignments:</label>
        <div class="assignments-container" id="module${moduleNumber}AssignmentsContainer"></div>
        <button type="button" class="add-assignment-button" data-module-number="${moduleNumber}">+ Add Assignment</button>
        <button type="button" class="remove-module-button" data-module-number="${moduleNumber}">Remove Module</button>
    `;

    document.getElementById("modulesContainer").appendChild(moduleDiv);

    // Add the first assignment by default
    addAssignment(moduleNumber);

    // Attach event listeners for dynamic buttons
    moduleDiv.querySelector(".add-assignment-button").addEventListener("click", () => addAssignment(moduleNumber));
    moduleDiv.querySelector(".remove-module-button").addEventListener("click", () => removeModule(moduleNumber));
}

// Adds an assignment to the specified module
export function addAssignment(moduleNumber) {
    console.log(`Adding Assignment to Module ${moduleNumber}...`);

    const container = document.getElementById(`module${moduleNumber}AssignmentsContainer`);
    const assignmentCount = container.querySelectorAll(".assignment-wrapper").length + 1;

    const assignmentDiv = document.createElement("div");
    assignmentDiv.className = "assignment-wrapper";

    assignmentDiv.innerHTML = `
        <textarea name="module[${moduleNumber}][assignments][]" placeholder="Assignment ${assignmentCount}" required></textarea>
        <button type="button" class="remove-assignment-button">Remove</button>
    `;

    container.appendChild(assignmentDiv);

    assignmentDiv.querySelector(".remove-assignment-button").addEventListener("click", () => removeAssignment(assignmentDiv));
}

// Removes a single assignment
export function removeAssignment(assignmentDiv) {
    console.log("Removing Assignment...");
    assignmentDiv.remove();
}

// Removes a module
export function removeModule(moduleNumber) {
    console.log(`Removing Module ${moduleNumber}...`);
    const moduleDiv = document.getElementById(`module${moduleNumber}`);
    if (moduleDiv) {
        moduleDiv.remove();
    }
}

// Formats a date as MM/DD/YYYY
function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Initialize module manager on page load
document.addEventListener("DOMContentLoaded", initializeModuleManager);
