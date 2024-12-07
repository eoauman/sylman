// quillUtils.js

const options = {
    theme: 'snow',
    placeholder: 'Enter text...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['link'],
            ['clean']
        ]
    }
};

export const quillInstances = [];
let quillEditorsInitialized = false;

/**
 * Initializes all Quill editors for predefined IDs.
 * Ensures editors are not re-initialized if already initialized.
 */
export function initializeQuillEditors() {
    if (quillEditorsInitialized) {
        console.warn("Quill editors are already initialized.");
        return;
    }

    console.log("Initializing Quill editors...");
    quillEditorsInitialized = true;

    const editors = [
        'leadOfficeHours', 'courseDescription', 'requiredMaterials',
        'instructionalMethods', 'courseCommunications', 'generalPolicies',
        'courseMinimumGrade', 'lateMakeupWork', 'attendance', 'incomplete',
        'withdrawal', 'academicRights', 'academicIntegrity', 'netiquette',
        'diversityInclusion', 'chosenName', 'religiousObservance',
        'academicSupport', 'disabilityDisclosure', 'informationTechnologies',
        'counselingServices', 'titleIX', 'continuityInstruction'
    ];

    editors.forEach(id => initializeQuillEditor(id));
}
export function safeInitializeQuillEditor(editorId, options) {
    const editorContainer = document.getElementById(editorId);
    if (!editorContainer) {
        console.warn(`Quill editor container not found: ${editorId}`);
        return;
    }

    initializeQuillEditor(editorId, options);
    console.log(`Quill editor initialized for: ${editorId}`);
}

/**
 * Initializes a single Quill editor for a given element ID.
 * Prevents duplicate initialization by checking existing instances.
 * 
 * @param {string} id - The ID of the hidden textarea and editor container.
 * @param {Object} customOptions - Optional custom configuration for Quill.
 */
export function initializeQuillEditor(id, customOptions = options) {
    const existingInstance = quillInstances.find(instance => instance.id === id);
    if (existingInstance) {
        console.warn(`Quill editor for "${id}" is already initialized. Skipping re-initialization.`);
        return existingInstance.quill; // Return the existing instance
    }

    const editorElement = document.getElementById(`editor-${id}`);
    if (!editorElement) {
        console.warn(`Editor element #editor-${id} not found.`);
        return null;
    }

    const textarea = document.getElementById(id);
    if (!textarea) {
        console.warn(`Textarea element #${id} not found to sync with Quill editor.`);
        return null;
    }

    // Initialize the Quill editor
    const quill = new Quill(editorElement, customOptions);

    // Set initial value in the editor from the textarea
    quill.root.innerHTML = textarea.value;

    // Sync editor changes to the textarea
    quill.on('text-change', () => {
        textarea.value = quill.root.innerHTML.trim(); // Avoid unnecessary whitespace
    });

    // Track the initialized instance
    quillInstances.push({ id, quill });
    console.log(`Quill editor initialized for "${id}".`);
    return quill;
}


/**
 * Synchronizes all Quill editors with their corresponding textareas.
 */
export function syncQuillEditors() {
    quillInstances.forEach(({ id, quill }) => {
        const textarea = document.getElementById(id);
        if (textarea) {
            textarea.value = quill.root.innerHTML.trim();
        } else {
            console.warn(`Textarea element #${id} not found during synchronization.`);
        }
    });
}

/**
 * Waits for an element to exist in the DOM before running a callback.
 * 
 * @param {string} id - The ID of the element to wait for.
 * @param {Function} callback - The function to execute once the element exists.
 * @param {number} timeout - Maximum time to wait (in milliseconds).
 */
export function waitForElementToExist(id, callback, timeout = 5000) {
    const interval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
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
/**
 * Destroys the Quill editor instance associated with the given ID.
 * Removes the instance from the global quillInstances array and detaches event listeners.
 *
 * @param {string} id - The ID of the editor to destroy.
 */
export function destroyQuillEditor(id) {
    const instanceIndex = quillInstances.findIndex(instance => instance.id === id);
    if (instanceIndex !== -1) {
        const { quill } = quillInstances[instanceIndex];
        quillInstances.splice(instanceIndex, 1); // Remove from instances list
        quill.off('text-change'); // Remove event listeners
        console.log(`Quill editor for "${id}" destroyed.`);
    } else {
        console.warn(`No Quill editor found for "${id}".`);
    }
}

