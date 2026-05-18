// ===== Global State =====
// सबै cart items यहाँ store हुन्छ
let cartItems = [];

// User को saved address
let savedAddress = null;

// ===== Page Load =====
document.addEventListener('DOMContentLoaded', async function() {
    await loadCart();
    await loadUserAddress();
});

// ===== Cart Load =====
async function loadCart() {
    const email = getCurrentUser();
    if (!email) { showSection('notLoggedIn'); return; }

    try {
        const res = await fetch(
            `${API_URL}/cart?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) { showSection('emptyCart'); return; }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            showSection('emptyCart');
            updateCartCount();
            return;
        }

        // Global state मा save गर्छ
        cartItems = data;

        showSection('cartContent');
        displayCartItems(cartItems);
        updateSummary();

    } catch (err) {
        console.error('Cart error:', err);
        showSection('emptyCart');
    }
}

// ===== Section Control =====
function showSection(id) {
    ['notLoggedIn','emptyCart','cartContent']
        .forEach(s => document.getElementById(s)
                               .classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');
}

// ===== Display Cart Items =====
function displayCartItems(items) {
    document.getElementById('cartItemsList').innerHTML =
        items.map((item, i) => `
            <div class="p-3 ${i > 0 ? 'border-top' : ''}"
                 id="cartItem-${item.cartId}">
                <div class="d-flex align-items-start gap-3">

                    <!-- Checkbox — select गर्न -->
                    <div class="pt-1">
                        <input type="checkbox"
                               class="form-check-input item-checkbox"
                               style="width:18px;height:18px;cursor:pointer;"
                               id="check-${item.cartId}"
                               checked
                               onchange="onItemCheckChange()">
                    </div>

                    <!-- Product Image -->
                    <img src="${item.imageUrl ||
                        getAvatar(item.productName)}"
                         class="rounded-3 flex-shrink-0"
                         style="width:75px;height:75px;object-fit:cover;"
                         onerror="this.src='${getAvatar(item.productName)}'">

                    <!-- Product Info -->
                    <div class="flex-grow-1">
                        <div class="fw-bold mb-1">
                            ${item.productName}
                        </div>
                        <div class="text-danger fw-bold mb-2">
                            ¥${Number(item.price).toLocaleString()}
                        </div>

                        <!-- Quantity Controls — product page जस्तै -->
                        <div class="d-flex align-items-center gap-2">
                            <div class="input-group"
                                 style="width:120px;">
                                <button class="btn btn-outline-secondary btn-sm"
                                        type="button"
                                        onclick="changeQty(${item.cartId}, -1)">
                                    <i class="fas fa-minus"
                                       style="font-size:10px;"></i>
                                </button>
                                <input type="number"
                                       class="form-control form-control-sm
                                              text-center fw-bold"
                                       id="qty-${item.cartId}"
                                       value="${item.quantity}"
                                       min="1"
                                       style="font-size:14px;"
                                       onchange="onQtyInputChange(${item.cartId}, this.value)">
                                <button class="btn btn-outline-secondary btn-sm"
                                        type="button"
                                        onclick="changeQty(${item.cartId}, 1)">
                                    <i class="fas fa-plus"
                                       style="font-size:10px;"></i>
                                </button>
                            </div>

                            <!-- Delete button -->
                            <button class="btn btn-sm btn-link text-danger p-0"
                                    onclick="removeItem(${item.cartId})">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    </div>

                    <!-- Subtotal -->
                    <div class="text-end flex-shrink-0">
                        <div class="fw-bold"
                             id="subtotal-${item.cartId}">
                            ¥${Number(item.subtotal).toLocaleString()}
                        </div>
                    </div>

                </div>
            </div>
        `).join('');

    // Initial check count update
    onItemCheckChange();
}

// ===== Checkbox: Single Item =====
function onItemCheckChange() {
    const allCheckboxes = document.querySelectorAll(
        '.item-checkbox');
    const checkedBoxes = document.querySelectorAll(
        '.item-checkbox:checked');

    // Select All checkbox state update
    const selectAll = document.getElementById('selectAll');
    selectAll.checked =
        checkedBoxes.length === allCheckboxes.length;
    selectAll.indeterminate =
        checkedBoxes.length > 0 &&
        checkedBoxes.length < allCheckboxes.length;

    // Selected count update
    document.getElementById('selectedCount').textContent =
        `(${checkedBoxes.length} items selected)`;

    // Delete Selected button show/hide
    const delBtn = document.getElementById('deleteSelectedBtn');
    checkedBoxes.length > 0
        ? delBtn.classList.remove('d-none')
        : delBtn.classList.add('d-none');

    // Summary update — selected items मात्र
    updateSummary();
}

// ===== Select All =====
function toggleSelectAll() {
    const checked =
        document.getElementById('selectAll').checked;
    document.querySelectorAll('.item-checkbox')
            .forEach(cb => cb.checked = checked);
    onItemCheckChange();
}

// ===== Summary Update — Selected items मात्र =====
function updateSummary() {
    let total = 0;
    let count = 0;

    cartItems.forEach(item => {
        const cb = document.getElementById(
            `check-${item.cartId}`);
        if (cb && cb.checked) {
            // cartItems array बाट latest quantity लिन्छ
            const qtyEl = document.getElementById(
                `qty-${item.cartId}`);
            const qty = qtyEl
                ? parseInt(qtyEl.value) || 1
                : item.quantity;
            const subtotal = Number(item.price) * qty;
            total += subtotal;
            count++;
        }
    });

    // Display update
    document.getElementById('selectedItemCount')
            .textContent = `(${count} items)`;
    document.getElementById('subtotal')
            .textContent = `¥${total.toLocaleString()}`;
    document.getElementById('totalAmount')
            .textContent = `¥${total.toLocaleString()}`;
}

// ===== Quantity: +/- Button =====
async function changeQty(cartId, delta) {
    const qtyInput = document.getElementById(`qty-${cartId}`);
    const currentQty = parseInt(qtyInput.value) || 1;
    const newQty = currentQty + delta;

    if (newQty < 1) {
        // Confirm गरेर remove गर्छ
       if (confirm('Remove item from cart?')){
            removeItem(cartId);
        }
        return;
    }

    await updateCartQty(cartId, newQty);
}

// ===== Quantity: Manual Input =====
async function onQtyInputChange(cartId, value) {
    const newQty = parseInt(value);
    if (!newQty || newQty < 1) {
        // Invalid value भए 1 set गर्छ
        document.getElementById(`qty-${cartId}`)
                .value = 1;
        return;
    }
    await updateCartQty(cartId, newQty);
}

// ===== Cart Qty Update — Backend Call =====
async function updateCartQty(cartId, newQty) {
    const email = getCurrentUser();

    try {
        const res = await fetch(
            `${API_URL}/cart/${cartId}` +
            `?email=${encodeURIComponent(email)}` +
            `&quantity=${newQty}`,
            { method: 'PUT' }
        );

        if (res.ok) {
            const updated = await res.json();

            // Input value update
            document.getElementById(`qty-${cartId}`)
                    .value = updated.quantity;

            // Subtotal update
            document.getElementById(`subtotal-${cartId}`)
                    .textContent =
                `¥${Number(updated.subtotal).toLocaleString()}`;

            // cartItems array update
            const idx = cartItems.findIndex(
                i => i.cartId === cartId);
            if (idx !== -1) {
                cartItems[idx].quantity = updated.quantity;
                cartItems[idx].subtotal = updated.subtotal;
            }

            // Summary recalculate
            updateSummary();

        } else {
            showToast('Not enough stock!', 'warning');
            // Original value restore
            const original = cartItems.find(
                i => i.cartId === cartId);
            if (original) {
                document.getElementById(`qty-${cartId}`)
                        .value = original.quantity;
            }
        }
    } catch (err) {
        showToast('Error updating!', 'danger');
    }
}

// ===== Remove Item =====
async function removeItem(cartId) {
    const email = getCurrentUser();

    try {
        await fetch(
            `${API_URL}/cart/${cartId}` +
            `?email=${encodeURIComponent(email)}`,
            { method: 'DELETE' }
        );

        // DOM बाट हटाउँछ
        document.getElementById(
            `cartItem-${cartId}`)?.remove();

        // cartItems array बाट पनि हटाउँछ
        cartItems = cartItems.filter(
            i => i.cartId !== cartId);

        updateCartCount();

        if (cartItems.length === 0) {
            showSection('emptyCart');
        } else {
            onItemCheckChange();
        }

        showToast('Removed!', 'success');

    } catch (err) {
        showToast('Error!', 'danger');
    }
}

// ===== Delete Selected =====
async function deleteSelected() {
    const checked = document.querySelectorAll(
        '.item-checkbox:checked');
    if (checked.length === 0) return;

    if (!confirm(`${checked.length} items delete गर्ने?`))
        return;

    for (const cb of checked) {
        const cartId = parseInt(
            cb.id.replace('check-', ''));
        await removeItem(cartId);
    }
}

// ============================================
// ===== ADDRESS SYSTEM — Amazon Style =====
// ============================================

// User को address load गर्छ
async function loadUserAddress() {
    const email = getCurrentUser();
    if (!email) return;

    try {
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;

        const user = await res.json();

        // Address छ भने
        if (user.postalCode && user.addressLine) {
            savedAddress = {
                name        : user.fullName,
                postalCode  : user.postalCode,
                prefecture  : user.prefecture || '',
                city        : user.city || '',
                addressLine : user.addressLine
            };
            renderSavedAddress();
        } else {
            // First time — address form देखाउँछ
            renderAddressForm();
        }

    } catch (err) {
        renderAddressForm();
    }
}

// ===== Saved Address देखाउँछ — Amazon Style =====
function renderSavedAddress() {
    if (!savedAddress) { renderAddressForm(); return; }

    document.getElementById('addressSection').innerHTML = `
        <div class="border rounded-3 p-3 bg-light mb-2">

            <!-- "Deliver to" header -->
            <div class="d-flex align-items-center
                        justify-content-between mb-2">
                <div>
                    <i class="fas fa-map-marker-alt
                               text-danger me-1"></i>
                    <span class="fw-bold small">
                        Delivering to
                        ${savedAddress.name}
                    </span>
                </div>
                <!-- Change Address button -->
                <button class="btn btn-sm btn-link p-0
                               text-primary text-decoration-none"
                        onclick="showAddressModal()">
                    Change
                </button>
            </div>

            <!-- Full Address -->
            <div class="small text-muted">
                〒${savedAddress.postalCode}<br>
                ${savedAddress.prefecture}
                ${savedAddress.city}<br>
                ${savedAddress.addressLine}
            </div>

        </div>
    `;
}

// ===== No Address — Form देखाउँछ =====
function renderAddressForm() {
    document.getElementById('addressSection').innerHTML = `
        <div class="border border-warning rounded-3 p-3 mb-2">
            <p class="text-muted small mb-2">
                <i class="fas fa-map-marker-alt
                           text-danger me-1"></i>
                Add your delivery address:
            </p>
            <button class="btn btn-outline-primary btn-sm w-100"
                    onclick="showAddressModal()">
                <i class="fas fa-plus me-1"></i>
                Add Delivery Address
            </button>
        </div>
    `;
}

// ===== Address Modal खोल्छ =====
function showAddressModal() {
    // Existing address छ भने pre-fill गर्छ
    if (savedAddress) {
        document.getElementById('modalPostalCode')
                .value = savedAddress.postalCode || '';
        document.getElementById('modalPrefecture')
                .value = savedAddress.prefecture || '';
        document.getElementById('modalCity')
                .value = savedAddress.city || '';
        document.getElementById('modalAddressLine')
                .value = savedAddress.addressLine || '';
    } else {
        // Clear fields
        ['modalPostalCode','modalPrefecture',
         'modalCity','modalAddressLine']
            .forEach(id => {
                document.getElementById(id).value = '';
            });
    }

    const modal = new bootstrap.Modal(
        document.getElementById('addressModal'));
    modal.show();
}

// ===== Modal — Postal Code Lookup =====
async function modalLookupPostal() {
    const input = document.getElementById('modalPostalCode');
    const btn = document.getElementById('modalAutoFillBtn');
    const code = input.value.replace(/[^0-9]/g, '');

    if (code.length !== 7) {
        input.classList.add('is-invalid');
        showToast('7 digit code! Example: 5300001', 'warning');
        return;
    }

    btn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    input.classList.remove('is-invalid');

    try {
        const res = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search` +
            `?zipcode=${code}`
        );
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const r = data.results[0];
            document.getElementById('modalPrefecture')
                    .value = r.address1;
            document.getElementById('modalCity')
                    .value = r.address2 + r.address3;

            // Valid style
            input.classList.add('is-valid');
            ['modalPrefecture','modalCity'].forEach(id => {
                document.getElementById(id)
                    .classList.add('is-valid');
            });

            showToast('Address found! 📍', 'success');
            document.getElementById('modalAddressLine')
                    .focus();

        } else {
            input.classList.add('is-invalid');
           showToast('Postal code not found!', 'warning');
        }
    } catch (err) {
        showToast('Network error! Please enter manually.', 'warning');
    } finally {
        btn.innerHTML =
            '<i class="fas fa-search"></i> Auto Fill';
        btn.disabled = false;
    }
}

// ===== New Address Save गर्छ =====
async function saveNewAddress() {
    const postalCode = document.getElementById(
        'modalPostalCode').value.trim();
    const prefecture = document.getElementById(
        'modalPrefecture').value.trim();
    const city = document.getElementById(
        'modalCity').value.trim();
    const addressLine = document.getElementById(
        'modalAddressLine').value.trim();

    // Validation
    let valid = true;
    [
        ['modalPostalCode',  postalCode],
        ['modalPrefecture',  prefecture],
        ['modalCity',        city],
        ['modalAddressLine', addressLine]
    ].forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!val) {
            el.classList.add('is-invalid');
            valid = false;
        } else {
            el.classList.remove('is-invalid');
        }
    });

    if (!valid) {
        showToast('Please fill all fields!', 'warning');
        return;
    }

    const email = getCurrentUser();

    try {
        // Profile मा save गर्छ
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`,
            {
                method  : 'PUT',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({
                    postalCode,
                    prefecture,
                    city,
                    addressLine
                })
            }
        );

        if (res.ok) {
            // Local state update
            const userName = localStorage.getItem('userName')
                || email;
            savedAddress = {
                name : userName,
                postalCode, prefecture,
                city, addressLine
            };

            // Modal बन्द गर्छ
            bootstrap.Modal.getInstance(
                document.getElementById('addressModal'))
                .hide();

            // Address section update
            renderSavedAddress();

            showToast('Address saved! ✅', 'success');
        }
    } catch (err) {
        showToast('Error saving address!', 'danger');
    }
}

// ===== Place Order =====
async function placeOrder() {
    const email = getCurrentUser();
    if (!email) {
        window.location.href = '/login';
        return;
    }

    // Selected items check
    const checked = document.querySelectorAll(
        '.item-checkbox:checked');
    if (checked.length === 0) {
        showToast('Please select items to order!', 'warning');
        return;
    }

    // Address check
    if (!savedAddress || !savedAddress.addressLine) {
        showToast('Please add a delivery address!', 'warning');
        showAddressModal();
        return;
    }

    // Full address string
    const fullAddress =
        `〒${savedAddress.postalCode} ` +
        `${savedAddress.prefecture} ` +
        `${savedAddress.city} ` +
        `${savedAddress.addressLine}`;

    // Selected cart IDs collect
    const selectedIds = Array.from(checked).map(cb =>
        parseInt(cb.id.replace('check-', ''))
    );

    // Button loading
    const btn = document.getElementById('placeOrderBtn');
    btn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Placing...';
    btn.disabled = true;

    try {
        // Selected items मात्र order गर्छ
        // OrderController मा cartIds parameter थप्नुपर्छ
        const res = await fetch(
            `${API_URL}/orders/place` +
            `?email=${encodeURIComponent(email)}` +
            `&shippingAddress=${encodeURIComponent(fullAddress)}` +
            `&cartIds=${selectedIds.join(',')}`,
            { method: 'POST' }
        );

        if (res.ok) {
            // Success modal
            const modal = new bootstrap.Modal(
                document.getElementById('successModal'));
            modal.show();
            updateCartCount();

            // Selected items DOM बाट हटाउँछ
            selectedIds.forEach(id => {
                document.getElementById(
                    `cartItem-${id}`)?.remove();
                cartItems = cartItems.filter(
                    i => i.cartId !== id);
            });

        } else {
            let msg = 'Order failed!';
            try {
                const err = await res.json();
                msg = err.message || msg;
            } catch (_) {}
            showToast(msg, 'danger');
        }

    } catch (err) {
        showToast('Server error!', 'danger');
    } finally {
        btn.innerHTML =
            '<i class="fas fa-check-circle me-2"></i>Place Order';
        btn.disabled = false;
    }
}

// ===== Avatar Helper =====
function getAvatar(name) {
    return `https://ui-avatars.com/api/` +
           `?name=${encodeURIComponent(name || 'P')}` +
           `&background=667eea&color=fff&size=75`;
}