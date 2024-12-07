document.getElementById('findUserForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;

    fetch('https://syllabus.jeffedu.site/user/finduser', { // Updated endpoint to /user/finduser
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('findUserMessage').innerText = 'Check your email for further instructions.';
    })
    .catch(error => {
        document.getElementById('findUserMessage').innerText = 'User not found.';
    });
});
