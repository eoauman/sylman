// public/js/syllabusApi.js

// Fetches a specific syllabus by ID
export async function getSyllabus(id) {
    try {
        const response = await fetch(`/syllabus/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch syllabus');
        }
        const syllabus = await response.json();
        console.log('Fetched syllabus:', syllabus);
        return syllabus;
    } catch (error) {
        console.error('Error fetching syllabus:', error);
    }
}

// Saves a new syllabus (standard save or autosave)
export async function saveSyllabus(data, autosave = false) {
    try {
        const payload = { ...data, autosave }; // Attach autosave flag
        console.log('Sending save request with payload:', JSON.stringify(payload, null, 2));
        const response = await fetch('/syllabus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save syllabus: ${errorText}`);
        }
        const result = await response.json();
        console.log('Syllabus saved successfully:', result);
        return result;
    } catch (error) {
        console.error('Error saving syllabus:', error);
    }
}

// Updates an existing syllabus
export async function updateSyllabus(id, formData, autosave = true) {
    try {
        if (!id || !formData || typeof formData !== 'object') {
            throw new Error('Invalid parameters: ID and formData are required and must be valid.');
        }

        const payload = { syllabusData: formData, autosave };
        console.log('Preparing to send update request:', {
            id,
            autosave,
            payload: JSON.stringify(payload, null, 2),
        });

        const response = await fetch(`/syllabus/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Handle non-OK responses
        if (!response.ok) {
            const errorDetails = await response.json().catch(() => ({
                error: 'Unable to parse error details from response',
            }));
            console.error('Server responded with an error:', {
                status: response.status,
                statusText: response.statusText,
                details: errorDetails,
            });

            if (response.status === 400) {
                throw new Error(`Validation error: ${errorDetails.error || 'Invalid data provided'}`);
            } else if (response.status === 404) {
                throw new Error('Syllabus not found. It may have been deleted or the ID is incorrect.');
            } else {
                throw new Error(
                    `Unexpected error occurred: ${errorDetails.error || response.statusText}`
                );
            }
        }

        // Parse the response
        const result = await response.json();
        console.log('Syllabus updated successfully. Response data:', result);

        return result;
    } catch (error) {
        console.error('Error updating syllabus:', error.message || error);
        throw error; // Re-throw the error for the calling function to handle, if needed
    }
}


// Submits a syllabus (when the entire form is finalized)
export async function submitSyllabus(userId, formData) {
    try {
        const payload = { userId, formData };
        console.log('Submitting syllabus with payload:', JSON.stringify(payload, null, 2));
        const response = await fetch('/syllabus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit syllabus: ${errorText}`);
        }
        const result = await response.json();
        console.log('Syllabus submitted successfully:', result);
        return result;
    } catch (error) {
        console.error('Error submitting syllabus:', error);
    }
}

// Retrieves all syllabi for a specific user
export async function retrieveSyllabi(userId) {
    try {
        const response = await fetch(`/syllabi/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to retrieve syllabi');
        }
        const syllabi = await response.json();
        console.log('Retrieved syllabi:', syllabi);
        return syllabi;
    } catch (error) {
        console.error('Error retrieving syllabi:', error);
    }
}

// Creates an HTML version of the syllabus
export function createHtmlSyllabus(formData) {
    try {
        const htmlContent = `
            <html>
                <head><title>${formData.courseTitle}</title></head>
                <body>
                    <h1>${formData.courseTitle}</h1>
                    <p>Credits: ${formData.credits}</p>
                    <!-- Add more content here as needed -->
                </body>
            </html>
        `;
        const newWindow = window.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        console.log('HTML syllabus created successfully');
    } catch (error) {
        console.error('Error creating HTML syllabus:', error);
    }
}
