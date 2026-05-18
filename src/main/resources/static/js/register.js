async function register() {
    const fullName = document.getElementById('fullName')
                             .value.trim();
    const email = document.getElementById('email')
                          .value.trim();
    const password = document.getElementById('password')
                             .value.trim();
    const confirmPassword = document
        .getElementById('confirmPassword').value.trim();

    if (!fullName || !email || !password || !confirmPassword) {
        showError('Please fill all fields!');
        return;
    }
    if (password.length < 6) {
        showError('Password must be at least 6 characters!');
        return;
    }
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(
                'Account created! 🎉 Please verify your email!');
            // OTP page मा redirect
            setTimeout(() => {
                window.location.href =
                    `/verify-email?email=${email}`;
            }, 1500);
        } else {
            showError(data.message || 'Registration failed!');
        }

    } catch (error) {
        showError('Server error!');
    }
}

function showError(message) {
    document.getElementById('errorMsg').textContent = message;
    document.getElementById('errorMsg')
            .classList.remove('d-none');
    document.getElementById('successMsg')
            .classList.add('d-none');
}

function showSuccess(message) {
    document.getElementById('successMsg').textContent = message;
    document.getElementById('successMsg')
            .classList.remove('d-none');
    document.getElementById('errorMsg')
            .classList.add('d-none');
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}