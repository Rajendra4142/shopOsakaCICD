async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login success — localStorage मा save
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.fullName);

            // Role अनुसार redirect
            if (data.role === 'ADMIN') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }

        } else {
            // Email verified छैन भने OTP page मा
            if (data.message === 'EMAIL_NOT_VERIFIED') {
                window.location.href =
                    `/verify-email?email=${email}`;
            } else {
                showError('Incorrect email or password');
            }
        }

    } catch (error) {
        showError('Server error!');
    }
}

function showError(message) {
    const el = document.getElementById('errorMsg');
    el.textContent = message;
    el.classList.remove('d-none');
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('password')
        .addEventListener('keypress', e => {
            if (e.key === 'Enter') login();
        });
});