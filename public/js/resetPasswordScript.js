document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    document.getElementById('resetToken').value = token;

    document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const resetToken = document.getElementById('resetToken').value;

        if (newPassword !== confirmPassword) {
            document.getElementById('message').innerText = 'Passwords do not match.';
            return;
        }

        const requestBody = JSON.stringify({ newPassword, resetToken });
        console.log("Request Body:", requestBody);

        fetch('https://syllabus.jeffedu.site/user/resetpwd', { // Updated endpoint to /user/resetpwd
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('message').innerText = 'Password has been reset successfully.';
        })
        .catch(error => {
            document.getElementById('message').innerText = error.message;
        });
    });
});
