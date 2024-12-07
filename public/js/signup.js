document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('https://syllabus.jeffedu.site/signup', { // Updated endpoint to /user/signup
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('message').innerText = 'Account created successfully! Please check your email for confirmation.';
            // Optionally redirect the user to another page after a successful sign up.
        })
        .catch(error => {
            if (error.message === 'User already exists. Please log in.') {
                // Redirect to the login page
                window.location.href = 'login.html';
            } else {
                document.getElementById('message').innerText = error.message;
            }
        });
    });
});
