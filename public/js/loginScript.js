document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('https://syllabus.jeffedu.site/login', { // Updated endpoint to /user/login
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        console.log('Response received:', response); // Debugging
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json(); // Expecting the response to contain the user ID
    })
    .then(data => {
        console.log('Login data:', data); // Debugging
        // Store user ID in session storage (ensure the property name matches your server's response)
        sessionStorage.setItem('userId', data.userId);

        // Redirect to dashboard.html on successful login
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Login error:', error); // Debugging
        document.getElementById('loginMessage').innerText = 'Username or password incorrect.';
    });
});
