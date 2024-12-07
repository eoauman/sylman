document.addEventListener('DOMContentLoaded', function () {
    fetchSyllabi();

    document.getElementById('newSyllabusButton').addEventListener('click', async function () {
        try {
            const response = await fetch('https://syllabus.jeffedu.site/syllabus/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: sessionStorage.getItem('userId'),
                    formData: {}, // Send empty syllabus data initially
                    autosave: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create new syllabus. HTTP status: ${response.status}`);
            }

            const data = await response.json();
            console.log('New syllabus created:', data);

            if (data.syllabusId) {
                sessionStorage.setItem('syllabusId', data.syllabusId);
                window.location.href = `form.html?syllabusId=${data.syllabusId}`; // Redirect with new syllabus ID
            } else {
                throw new Error('Syllabus ID not returned from the server.');
            }
        } catch (error) {
            console.error('Error creating new syllabus:', error);
            alert('Failed to create a new syllabus. Please try again.');
        }
    });
});

async function fetchSyllabi() {
    try {
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        console.log('Is Admin:', isAdmin);

        let fetchUrl = 'https://syllabus.jeffedu.site/syllabus/';
        if (!isAdmin) {
            const userId = sessionStorage.getItem('userId');
            console.log('User ID:', userId);

            if (!userId) {
                console.error('User ID is not set in sessionStorage.');
                throw new Error('User ID is missing from sessionStorage.');
            }

            fetchUrl += userId; // Append user ID for user-specific data
        }

        console.log('Fetching syllabi from URL:', fetchUrl);

        // Fetch syllabi data
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch syllabi. HTTP status: ${response.status}`);
        }

        const syllabi = await response.json();
        console.log('Fetched syllabi data:', syllabi);

        // Verify timestamps and log any issues
        syllabi.forEach((syllabus, index) => {
            if (!syllabus.syllabusData?.lastEdited && !syllabus.updatedAt && !syllabus.createdAt) {
                console.warn(`Syllabus ${index + 1} is missing timestamp data.`);
            }
        });

        // Populate the table with the fetched syllabi
        populateTable(syllabi);

    } catch (error) {
        console.error('Error fetching syllabi:', error);

        // Display an error message in the UI if fetching fails
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent =
                'An error occurred while fetching your syllabi. Please try again later.';
        }
    }
}

function populateTable(syllabi) {
    const tableBody = document.getElementById('syllabusTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear the table body

    syllabi.forEach((syllabus, index) => {
        const row = tableBody.insertRow();

        console.log(`Syllabus ${index + 1}:`, syllabus);

        // Set Course Title or default to 'Untitled'
        const courseTitle = syllabus.syllabusData?.courseTitle || 'Untitled';
        row.insertCell(0).textContent = courseTitle;

        // Determine the "Last Updated" date
        let lastUpdated = syllabus.syllabusData?.lastEdited || syllabus.updatedAt || syllabus.createdAt;
        let formattedDate = 'No Date Provided';

        if (lastUpdated) {
            try {
                const date = new Date(lastUpdated);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                } else {
                    console.warn(`Invalid date for syllabus ${index + 1}:`, lastUpdated);
                }
            } catch (error) {
                console.error(`Error formatting date for syllabus ${index + 1}:`, error);
            }
        }

        row.insertCell(1).textContent = formattedDate;

        // Add action buttons (Edit, Copy, Delete)
        const actionsCell = row.insertCell(2);
        actionsCell.appendChild(createButton('Edit', () => editSyllabus(syllabus._id)));
        actionsCell.appendChild(createButton('Copy', () => copySyllabus(syllabus._id)));
        actionsCell.appendChild(createButton('Delete', () => deleteSyllabus(syllabus._id)));
    });

    // If no syllabi found, display a message
    if (syllabi.length === 0) {
        console.warn('No syllabi found to populate the table.');
        const emptyRow = tableBody.insertRow();
        const emptyCell = emptyRow.insertCell(0);
        emptyCell.colSpan = 3;
        emptyCell.textContent = 'No syllabi available.';
        emptyCell.style.textAlign = 'center';
    }
}

function createButton(text, onClickFunction) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClickFunction);
    return button;
}

function editSyllabus(id) {
    window.location.href = `form.html?syllabusId=${id}`;
}

function copySyllabus(id) {
    fetch('https://syllabus.jeffedu.site/syllabus/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabusId: id }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            handleCopySyllabus();
            window.location.href = `form.html?syllabusId=${data.newId}`;
        })
        .catch((error) => console.error('Error:', error));
}

function handleCopySyllabus() {
    sessionStorage.removeItem('syllabusId');
    alert('You are now working on a copy of the syllabus. Changes will save as a new version.');
}

function deleteSyllabus(id) {
    if (confirm('Are you sure you want to delete this syllabus?')) {
        const fetchUrl = `https://syllabus.jeffedu.site/syllabus/${id}`;
        console.log('Attempting to delete syllabus with URL:', fetchUrl);

        fetch(fetchUrl, { method: 'DELETE' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
            })
            .catch((error) => console.error('Error:', error));
    }
}
