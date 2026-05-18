// ===== Page Load =====
document.addEventListener('DOMContentLoaded', loadProfile);

// ===== Profile Load =====
async function loadProfile() {
    const email = getCurrentUser();
    if (!email) {
        window.location.href = '/login';
        return;
    }

    try {
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`
        );
        const user = await res.json();

        // Profile card update
        document.getElementById('profileName')
                .textContent = user.fullName;
        document.getElementById('profileEmail')
                .textContent = user.email;
        document.getElementById('profileRole')
                .textContent = user.role;

        // Verified badge
        document.getElementById('verifiedBadge').innerHTML =
            user.emailVerified
                ? '<span class="badge bg-success mt-1">✅ Verified</span>'
                : '<span class="badge bg-warning text-dark mt-1">⚠️ Unverified</span>';

        // Photo set — localStorage बाट पनि try गर्छ
        const savedPhoto = localStorage.getItem('userPhoto');
        const photoUrl = user.profilePhoto || savedPhoto || '';
        setProfilePhoto(photoUrl, user.fullName);

        // Photo localStorage मा save गर्छ
        if (user.profilePhoto) {
            localStorage.setItem('userPhoto',
                user.profilePhoto);
        }

        // Basic info form fill
        document.getElementById('editName').value =
            user.fullName || '';
        document.getElementById('editEmail').value =
            user.email || '';
        document.getElementById('editPhone').value =
            user.phone || '';

        // Address section
        if (user.postalCode && user.addressLine) {
            showSavedAddress(user);
        } else {
            // No address — form देखाउँछ
            document.getElementById('savedAddressDisplay')
                    .classList.add('d-none');
            document.getElementById('addressEditForm')
                    .classList.remove('d-none');
            // Cancel button hide
            document.getElementById('cancelAddressBtn')
                    .style.setProperty(
                        'display','none','important');
        }

        // Address form pre-fill
        document.getElementById('editPostalCode').value =
            user.postalCode || '';
        document.getElementById('editPrefecture').value =
            user.prefecture || '';
        document.getElementById('editCity').value =
            user.city || '';
        document.getElementById('editAddressLine').value =
            user.addressLine || '';

    } catch (err) {
        console.error('Profile load error:', err);
        showMsg('error', 'Profile load failed!');
    }
}

// ===== Photo Set =====
function setProfilePhoto(photoUrl, name) {
    const img = document.getElementById('profilePhotoImg');
    if (photoUrl && photoUrl.trim() !== '') {
        img.src = photoUrl;
        img.onerror = () => {
            img.src = getAvatarUrl(name);
        };
    } else {
        img.src = getAvatarUrl(name);
    }
}

function getAvatarUrl(name) {
    return `https://ui-avatars.com/api/` +
           `?name=${encodeURIComponent(name || 'User')}` +
           `&background=667eea&color=fff&size=120&bold=true`;
}

// ===== Photo Upload =====
async function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showMsg('error', 'Photo must be smaller than 5MB!');
        return;
    }

    // Loading show
    document.getElementById('uploadLoading')
            .style.display = 'flex';

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'profiles');

        const res = await fetch(`${API_URL}/upload/photo`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            // Photo update — everywhere!
            document.getElementById('profilePhotoImg')
                    .src = data.url;

            // Profile save गर्छ
            await savePhotoUrl(data.url);

            // localStorage update — Navbar मा पनि देखिन्छ!
            localStorage.setItem('userPhoto', data.url);
            updateAuthButtons(); // Navbar instant update

            showMsg('success', 'Photo updated! ✅');
        } else {
            showMsg('error', data.message || 'Upload failed!');
        }
    } catch (err) {
        showMsg('error', 'Upload error!');
    } finally {
        document.getElementById('uploadLoading')
                .style.display = 'none';
    }
}

// Photo URL backend मा save गर्छ
async function savePhotoUrl(photoUrl) {
    const email = getCurrentUser();
    try {
        await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`,
            {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ profilePhoto: photoUrl })
            }
        );
    } catch (err) {
        console.error('Photo save error:', err);
    }
}

// ===== Save Basic Info =====
async function saveBasicInfo() {
    const email = getCurrentUser();
    const btn = document.getElementById('saveInfoBtn');

    btn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    btn.disabled = true;

    const dto = {
        fullName : document.getElementById('editName')
                           .value.trim(),
        phone    : document.getElementById('editPhone')
                           .value.trim()
    };

    if (!dto.fullName) {
        showMsg('error', 'Name cannot be empty!');
        btn.innerHTML =
            '<i class="fas fa-save me-2"></i>Save Changes';
        btn.disabled = false;
        return;
    }

    try {
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`,
            {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(dto)
            }
        );
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('userName', dto.fullName);
            document.getElementById('profileName')
                    .textContent = dto.fullName;
            updateAuthButtons(); // Navbar update
            showMsg('success', 'Profile saved! ✅');
        } else {
            showMsg('error', data.message || 'Save failed!');
        }
    } catch (err) {
        showMsg('error', 'Server error!');
    } finally {
        btn.innerHTML =
            '<i class="fas fa-save me-2"></i>Save Changes';
        btn.disabled = false;
    }
}

// ===== Address Display =====
function showSavedAddress(user) {
    document.getElementById('savedAddressDisplay')
            .classList.remove('d-none');
    document.getElementById('addressEditForm')
            .classList.add('d-none');

    document.getElementById('savedAddressText').innerHTML =
        `〒${user.postalCode}<br>
         ${user.prefecture || ''} ${user.city || ''}<br>
         ${user.addressLine}`;
}

// Edit/Cancel toggle
function toggleAddressEdit() {
    const form = document.getElementById('addressEditForm');
    const display = document.getElementById('savedAddressDisplay');
    const cancelBtn = document.getElementById('cancelAddressBtn');

    if (form.classList.contains('d-none')) {
        // Show form
        form.classList.remove('d-none');
        display.classList.add('d-none');
        cancelBtn.style.removeProperty('display');
    } else {
        // Hide form — reload गर्छ
        loadProfile();
    }
}

// ===== Postal Code Lookup (Profile) =====
async function profileLookupPostal() {
    const input = document.getElementById('editPostalCode');
    const btn = document.getElementById('profileAutoFillBtn');
    const code = input.value.replace(/[^0-9]/g,'');

    if (code.length !== 7) {
        input.classList.add('is-invalid');
        showMsg('error', 'Enter 7 digit code! e.g. 5300001');
        return;
    }

    btn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search` +
            `?zipcode=${code}`
        );
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const r = data.results[0];
            document.getElementById('editPrefecture')
                    .value = r.address1;
            document.getElementById('editCity')
                    .value = r.address2 + r.address3;

            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            showMsg('success', 'Address found! 📍');
            document.getElementById('editAddressLine').focus();
        } else {
            input.classList.add('is-invalid');
            showMsg('error', 'Postal code not found!');
        }
    } catch (err) {
        showMsg('error', 'Network error!');
    } finally {
        btn.innerHTML =
            '<i class="fas fa-search"></i> Auto Fill';
        btn.disabled = false;
    }
}

// ===== Save Address =====
async function saveAddress() {
    const email = getCurrentUser();
    const btn = document.getElementById('saveAddressBtn');

    const postalCode  = document.getElementById('editPostalCode')
                                .value.trim();
    const prefecture  = document.getElementById('editPrefecture')
                                .value.trim();
    const city        = document.getElementById('editCity')
                                .value.trim();
    const addressLine = document.getElementById('editAddressLine')
                                .value.trim();

    if (!postalCode || !addressLine) {
        showMsg('error', 'Please enter postal code and address!');
        return;
    }

    btn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    btn.disabled = true;

    try {
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`,
            {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    postalCode, prefecture, city, addressLine
                })
            }
        );
        const data = await res.json();

        if (res.ok) {
            showMsg('success', 'Address saved! ✅');
            loadProfile(); // Reload — saved address देखाउँछ
        } else {
            showMsg('error', data.message);
        }
    } catch (err) {
        showMsg('error', 'Server error!');
    } finally {
        btn.innerHTML =
            '<i class="fas fa-save me-2"></i>Save Address';
        btn.disabled = false;
    }
}

// ===== Messages =====
function showMsg(type, msg) {
    const ids = ['successMsg','errorMsg'];
    ids.forEach(id =>
        document.getElementById(id).classList.add('d-none'));

    const id = type === 'success' ? 'successMsg' : 'errorMsg';
    document.getElementById(id).textContent = msg;
    document.getElementById(id).classList.remove('d-none');

    setTimeout(() =>
        document.getElementById(id).classList.add('d-none'),
        4000);
}