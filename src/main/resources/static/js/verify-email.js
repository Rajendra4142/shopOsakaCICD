// Email URL बाट लिन्छ
const verifyEmail = new URLSearchParams(
    window.location.search).get('email');

document.addEventListener('DOMContentLoaded', function() {
    if (!verifyEmail) {
        window.location.href = '/login';
        return;
    }
    // Email display गर्छ
    document.getElementById('emailDisplay')
            .textContent = verifyEmail;
    // पहिलो box मा focus
    document.getElementById('otp0').focus();
});

// OTP boxes — number type गर्दा next box मा जान्छ
function otpInput(index) {
    const current = document.getElementById(`otp${index}`);
    const value = current.value;

    // Number मात्र accept गर्छ
    current.value = value.replace(/[^0-9]/g, '');

    // Next box मा automatically जान्छ
    if (value && index < 5) {
        document.getElementById(`otp${index + 1}`).focus();
    }

    // 6 digits भए automatically verify गर्छ
    const fullOtp = getOtpValue();
    if (fullOtp.length === 6) verifyOtp();
}

// 6 boxes बाट OTP collect गर्छ
function getOtpValue() {
    return [0,1,2,3,4,5]
        .map(i => document.getElementById(`otp${i}`).value)
        .join('');
}

// OTP Verify गर्ने
async function verifyOtp() {
    const otp = getOtpValue();

    if (otp.length !== 6) {
        showMsg('error', 'Please enter 6-digit OTP');
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/auth/verify-otp?email=${verifyEmail}&otp=${otp}`,
            { method: 'POST' }
        );

        const data = await response.json();

        if (response.ok) {
            showMsg('success',
               'Email verified! 🎉 Please login');
            // 2 seconds पछि login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMsg('error', data.message || 'Invalid OTP');
        }
    } catch (error) {
        showMsg('error', 'Error! Try again.');
    }
}

// OTP Resend
async function resendOtp() {
    try {
        await fetch(
            `${API_URL}/auth/resend-otp?email=${verifyEmail}`,
            { method: 'POST' }
        );
        showMsg('success', 'OTP resent! 📧 Please check your email');
    } catch (error) {
        showMsg('error', 'Error resending OTP!');
    }
}

function showMsg(type, message) {
    document.getElementById('errorMsg')
            .classList.add('d-none');
    document.getElementById('successMsg')
            .classList.add('d-none');

    const el = document.getElementById(
        type === 'error' ? 'errorMsg' : 'successMsg');
    el.textContent = message;
    el.classList.remove('d-none');
}