// helper.js

export function setDownloadLink(syllabusId) {
    if (!syllabusId) {
        console.warn('No syllabus ID provided for download link.');
        return;
    }

    const downloadLink = document.getElementById('downloadSyllabusLink');
    if (downloadLink) {
        downloadLink.href = `/download/syllabus/${syllabusId}`;
        downloadLink.style.display = 'block'; // Show the link if it's hidden
    } else {
        console.warn('Download link element not found.');
    }
}

export function getValueById(id) {
    const element = document.getElementById(id);
    if (element) {
        console.log(`Getting value for element with id: ${id}`); // Added for logging
        return element.value;
    } else {
        console.warn(`Element with id ${id} not found.`); // Added warning if element is not found
        return '';
    }
}

export function setValueById(id, value) {
    const element = document.getElementById(id);
    if (element) {
        console.log(`Setting value for element with id: ${id} to value: ${value}`);
        if (element.tagName === "SELECT") {
            const optionExists = Array.from(element.options).some(option => option.value === value);
            if (optionExists) {
                element.value = value;
            } else {
                console.warn(`No option found in select element ${id} with value "${value}"`);
            }
        } else if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.value = value;
        }
    } else {
        console.error(`Element with id ${id} not found`);
    }
}

export function waitForElementToExist(id, callback, timeout = 5000) {
    const interval = setInterval(() => {
        if (document.getElementById(id)) {
            clearInterval(interval);
            clearTimeout(timeoutId);
            callback();
        }
    }, 100);

    const timeoutId = setTimeout(() => {
        clearInterval(interval);
        console.error(`Element with id "${id}" did not appear within the expected time.`);
    }, timeout);
}

export function validateQuillContent(requiredQuillFields) {
    let formValid = true;
    requiredQuillFields.forEach(id => {
        const quillContent = document.getElementById(`editor-${id}`).firstChild.innerHTML.trim();
        if (!quillContent || quillContent === '<p><br></p>') {
            alert(`Please fill in the required field: ${id}`);
            formValid = false;
        }
    });
    return formValid;
}
