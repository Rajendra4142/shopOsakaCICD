// सबै products store गर्न (filter को लागि)
let allAdminProducts = [];
let allAdminOrders = [];

// ===== Page Load =====
document.addEventListener('DOMContentLoaded', function() {

    // Admin check
    const role = localStorage.getItem('userRole');
    if (role !== 'ADMIN') {
       alert('Admin access only!');
        window.location.href = '/';
        return;
    }

    // Admin email navbar मा देखाउँछ
    document.getElementById('adminEmail').textContent =
        localStorage.getItem('userEmail');

    // Dashboard load गर्छ
    loadDashboard();
});

// ===== Tab Switch =====
function showTab(tabName) {
    // सबै tabs hide गर्छ
    ['dashboard','products','addProduct','orders','users']
        .forEach(tab => {
            document.getElementById(`tab-${tab}`)
                    .classList.add('d-none');
        });

    // सबै sidebar buttons inactive गर्छ
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active-sidebar');
    });

    // चाहिने tab देखाउँछ
    document.getElementById(`tab-${tabName}`)
            .classList.remove('d-none');

    // Sidebar button active गर्छ
    const activeBtn = document.getElementById(`btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active-sidebar');

    // Tab अनुसार data load गर्छ
    if (tabName === 'products') loadAdminProducts();
    if (tabName === 'orders')   loadAdminOrders();
    if (tabName === 'users')    loadAdminUsers();
    if (tabName === 'addProduct') resetForm();
	
	
}

// ===== Dashboard Load =====
async function loadDashboard() {
    try {
        // Stats र Orders दुवै एकैसाथ
        const [statsRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/admin/stats`),
            fetch(`${API_URL}/admin/orders`)
        ]);

        const stats  = await statsRes.json();
        const orders = await ordersRes.json();

        // Stats cards update
        document.getElementById('statProducts')
                .textContent = stats.totalProducts || 0;
        document.getElementById('statOrders')
                .textContent = stats.totalOrders || 0;
        document.getElementById('statUsers')
                .textContent = stats.totalUsers || 0;

        const revenue = stats.totalRevenue || 0;
        document.getElementById('statRevenue')
                .textContent =
            `¥${Number(revenue).toLocaleString()}`;

        // Recent Orders — latest 5
        if (Array.isArray(orders) && orders.length > 0) {
            displayRecentOrders(orders.slice(0, 5));
        } else {
            document.getElementById('recentOrders')
                    .innerHTML =
                '<p class="text-muted">No orders yet!</p>';
        }

    } catch (err) {
        console.error('Dashboard error:', err);
        ['statProducts','statOrders',
         'statUsers','statRevenue']
            .forEach(id =>
                document.getElementById(id).textContent = '0');
    }
}

// Recent Orders Table
function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>
                                <div class="fw-bold">#${o.id}</div>
                                <small class="text-muted">
                                    ${o.orderedAt
                                        ? new Date(o.orderedAt)
                                            .toLocaleDateString()
                                        : '-'}
                                </small>
                            </td>
                            <td>
                                <div class="small fw-semibold">
                                    ${o.user?.fullName || '-'}
                                </div>
                                <small class="text-muted">
                                    ${o.user?.email || '-'}
                                </small>
                            </td>
                            <td>
                                <div class="d-flex gap-1">
                                    ${(o.orderItems || [])
                                        .slice(0,2).map(item =>`
                                        <img src="${
                                            item.product?.imageUrl ||
                                            getProdAvatar(
                                                item.product?.name)}"
                                             title="${item.product?.name||''}"
                                             style="width:30px;height:30px;
                                                    object-fit:cover;
                                                    border-radius:4px;">
                                    `).join('')}
                                </div>
                            </td>
                            <td class="fw-bold text-danger">
                                ¥${Number(o.totalAmount||0)
                                    .toLocaleString()}
                            </td>
                            <td>
                                <span class="badge ${getStatusColor(o.status)}">
                                    ${getStatusIcon(o.status)}
                                    ${o.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== PRODUCTS =====
async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allAdminProducts = await response.json();
        displayAdminProducts(allAdminProducts);
    } catch (error) {
        console.error('Products load error:', error);
    }
}

function displayAdminProducts(products) {
    const container = document.getElementById('adminProductsList');

    if (products.length === 0) {
        container.innerHTML =
            '<p class="text-muted p-4">No products available!</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr id="productRow-${p.id}">
                            <td>
                                <img src="${p.imageUrl ||
                                    'https://via.placeholder.com/50'}"
                                     style="width:50px; height:50px;
                                            object-fit:cover;"
                                     class="rounded-3">
                            </td>
                            <td>
                                <span class="fw-semibold">${p.name}</span>
                                <small class="text-muted d-block">
                                    ${(p.description||'').substring(0,40)}
                                </small>
                            </td>
                            <td>
                                <span class="badge bg-secondary">
                                    ${p.category}
                                </span>
                            </td>
                            <td class="text-danger fw-bold">
                                ¥${p.price.toLocaleString()}
                            </td>
                            <td>
                                <span class="badge ${p.stock > 5 ?
                                    'bg-success' : p.stock > 0 ?
                                    'bg-warning text-dark' : 'bg-danger'}">
                                    ${p.stock}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex gap-1">
                                    <!-- Edit button -->
                                    <button class="btn btn-sm btn-outline-primary"
                                            onclick='editProduct(${JSON.stringify(p)})'>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <!-- Delete button -->
                                    <button class="btn btn-sm btn-outline-danger"
                                            onclick="deleteProduct(${p.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Products search/filter
function filterAdminProducts() {
    const keyword = document.getElementById('productSearch')
                            .value.toLowerCase();
    const filtered = allAdminProducts.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );
    displayAdminProducts(filtered);
}

// ===== ADD / EDIT PRODUCT =====
async function saveProduct() {
    const editId = document.getElementById('editProductId').value;

    const product = {
        name        : document.getElementById('pName').value.trim(),
        category    : document.getElementById('pCategory').value,
        price       : document.getElementById('pPrice').value,
        stock       : document.getElementById('pStock').value,
        imageUrl    : document.getElementById('pImage').value.trim(),
        description : document.getElementById('pDesc').value.trim()
    };

    // Validation
    if (!product.name || !product.price || !product.stock) {
        showToast('Please fill Name, Price, and Stock!', 'warning');
        return;
    }

    try {
        // Edit mode छ भने PUT, नयाँ भए POST
        const method = editId ? 'PUT' : 'POST';
        const url = editId
            ? `${API_URL}/products/${editId}`
            : `${API_URL}/products`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            showToast(
                editId ? 'Product updated! ✅' : 'Product added! 🎉',
                'success'
            );
            resetForm();
            showTab('products'); // Products tab मा जान्छ
        }
    } catch (error) {
        showToast('Error saving product!', 'danger');
    }
}

// Edit mode — form मा data fill गर्छ
function editProduct(product) {
    // Form tab देखाउँछ
    showTab('addProduct');

    // Title र button text बदल्छ
    document.getElementById('formTitle').textContent =
        'Edit Product';
    document.getElementById('saveBtnText').textContent =
        'Update Product';

    // Form मा data fill गर्छ
    document.getElementById('editProductId').value = product.id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pCategory').value = product.category;
    document.getElementById('pPrice').value = product.price;
    document.getElementById('pStock').value = product.stock;
    document.getElementById('pImage').value = product.imageUrl || '';
    document.getElementById('pDesc').value = product.description || '';
    previewImage();
}

// Form reset गर्छ
function resetForm() {
    document.getElementById('editProductId').value = '';

    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('saveBtnText').textContent = 'Add Product';

    ['pName','pPrice','pStock','pImage','pDesc','pCategory']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

    const previewArea = document.getElementById('imagePreviewArea');
    if (previewArea) {
        previewArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-2 d-block"></i>
            <p class="text-muted mb-1">
                Click or Drag & Drop here
            </p>
            <small class="text-muted">
                JPG, PNG, WEBP — Max 5MB
            </small>
        `;
    }
}

function cancelEdit() {
    resetForm();
    showTab('products');
}

// Image preview
function previewImage() {
    const url = document.getElementById('pImage').value;
    const preview = document.getElementById('imagePreviewArea');
    if (url) {
        preview.src = url;
        preview.classList.remove('d-none');
    } else {
        preview.classList.add('d-none');
    }
}

// Delete product — reload नगरी DOM बाट हटाउँछ!
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            // DOM बाट directly हटाउँछ — reload चाहिँदैन!
            document.getElementById(`productRow-${id}`).remove();
            showToast('Product deleted!', 'success');
        }
    } catch (error) {
        showToast('Error!', 'danger');
    }
}

// ===== ORDERS =====
async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`);
        allAdminOrders = await response.json();
        displayAdminOrders(allAdminOrders);
    } catch (error) {
        console.error('Orders load error:', error);
    }
}

// ===== Admin Orders Display — Complete Fix =====
function displayAdminOrders(orders) {
    const container = document.getElementById('adminOrdersList');

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3 d-block"></i>
                <p class="text-muted">No orders found!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Products</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Update</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr id="adminOrderRow-${o.id}">

                            <!-- Order ID + Date -->
                            <td>
                                <div class="fw-bold">#${o.id}</div>
                                <small class="text-muted">
                                    ${o.orderedAt
                                        ? new Date(o.orderedAt)
                                            .toLocaleDateString()
                                        : '-'}
                                </small>
                            </td>

                            <!-- Customer -->
                            <td>
                                <div class="fw-semibold small">
                                    ${o.user?.fullName || '-'}
                                </div>
                                <small class="text-muted">
                                    ${o.user?.email || '-'}
                                </small>
                            </td>

                            <!-- Product Images + Names -->
                            <td style="max-width:200px;">
                                ${(o.orderItems || [])
                                    .map(item => `
                                    <div class="d-flex
                                                align-items-center
                                                gap-2 mb-1">
                                        <img src="${
                                            item.product?.imageUrl ||
                                            getProdAvatar(
                                                item.product?.name)}"
                                             style="width:32px;
                                                    height:32px;
                                                    object-fit:cover;
                                                    border-radius:4px;
                                                    flex-shrink:0;"
                                             onerror="this.src='${
                                                getProdAvatar(
                                                    item.product?.name)}'">
                                        <small class="text-truncate">
                                            ${item.product?.name||'-'}
                                            ×${item.quantity}
                                        </small>
                                    </div>
                                `).join('')}
                            </td>

                            <!-- Amount -->
                            <td class="fw-bold text-danger">
                                ¥${Number(o.totalAmount||0)
                                    .toLocaleString()}
                            </td>

                            <!-- Status Badge -->
                            <td>
                                <span class="badge ${getStatusColor(o.status)}"
                                      id="adminStatusBadge-${o.id}">
                                    ${getStatusIcon(o.status)}
                                    ${o.status}
                                </span>
                            </td>

                            <!-- Update Dropdown -->
                            <td>
                                <select class="form-select
                                               form-select-sm"
                                        style="width:130px;"
                                        onchange="updateAdminOrderStatus(
                                            ${o.id},
                                            this.value,
                                            this)">
                                    <option value="">
                                        Change...
                                    </option>
                                    <option value="CONFIRMED"
                                        ${o.status==='CONFIRMED'||
                                          o.status==='SHIPPING'||
                                          o.status==='DELIVERED'
                                            ? 'disabled' : ''}>
                                        ✅ Confirm
                                    </option>
                                    <option value="SHIPPING"
                                        ${o.status==='SHIPPING'||
                                          o.status==='DELIVERED'
                                            ? 'disabled' : ''}>
                                        🚚 Ship
                                    </option>
                                    <option value="DELIVERED"
                                        ${o.status==='DELIVERED'
                                            ? 'disabled' : ''}>
                                        🎉 Delivered
                                    </option>
                                    <option value="CANCELLED"
                                        ${o.status==='DELIVERED'||
                                          o.status==='CANCELLED'
                                            ? 'disabled' : ''}>
                                        ❌ Cancel
                                    </option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Order status filter
function filterOrders(status) {
    if (status === 'ALL') {
        displayAdminOrders(allAdminOrders);
    } else {
        const filtered = allAdminOrders.filter(
            o => o.status === status
        );
        displayAdminOrders(filtered);
    }
}

// Order status update — reload नगरी badge update गर्छ!
async function updateOrderStatus(orderId, status) {
    if (!status) return;

    try {
        const response = await fetch(
            `${API_URL}/admin/orders/${orderId}/status?status=${status}`,
            { method: 'PUT' }
        );

        if (response.ok) {
            // DOM मा directly badge update गर्छ!
            const badge = document.getElementById(
                `statusBadge-${orderId}`
            );
            badge.className = `badge ${getStatusColor(status)}`;
            badge.textContent = `${getStatusIcon(status)} ${status}`;
            showToast('Status updated! ✅', 'success');
        }
    } catch (error) {
        showToast('Error!', 'danger');
    }
}

// ===== USERS =====
async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        const users = await response.json();
        displayAdminUsers(users);
    } catch (error) {
        console.error('Users load error:', error);
    }
}

function displayAdminUsers(users) {
    const container = document.getElementById('adminUsersList');

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td class="text-muted">#${u.id}</td>
                            <td class="fw-semibold">${u.fullName}</td>
                            <td>${u.email}</td>
                            <td>
                                <span class="badge ${u.role === 'ADMIN' ?
                                    'bg-danger' : 'bg-primary'}">
                                    ${u.role}
                                </span>
                            </td>
                            <td>
                                <span class="badge ${u.active ?
                                    'bg-success' : 'bg-secondary'}">
                                    ${u.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="text-muted small">
                                ${new Date(u.createdAt)
                                    .toLocaleDateString()}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== HELPER FUNCTIONS =====
function getStatusColor(status) {
    const colors = {
        'PENDING'   : 'bg-warning text-dark',
        'CONFIRMED' : 'bg-primary',
        'SHIPPING'  : 'bg-info',
        'DELIVERED' : 'bg-success',
        'CANCELLED' : 'bg-danger'
    };
    return colors[status] || 'bg-secondary';
}

function getStatusIcon(status) {
    const icons = {
        'PENDING'   : '⏳',
        'CONFIRMED' : '✅',
        'SHIPPING'  : '🚚',
        'DELIVERED' : '🎉',
        'CANCELLED' : '❌'
    };
    return icons[status] || '📦';
}


// ===== Order Status Update =====
async function updateAdminOrderStatus(orderId, status, selectEl) {
    if (!status) return;

    selectEl.disabled = true;

    try {
        const res = await fetch(
            `${API_URL}/admin/orders/${orderId}/status` +
            `?status=${status}`,
            { method: 'PUT' }
        );

        if (res.ok) {
            // Badge update — no reload!
            const badge = document.getElementById(
                `adminStatusBadge-${orderId}`);
            if (badge) {
                badge.className =
                    `badge ${getStatusColor(status)}`;
                badge.textContent =
                    `${getStatusIcon(status)} ${status}`;
            }

            // Array update
            const idx = allAdminOrders.findIndex(
                o => o.id === orderId);
            if (idx !== -1) {
                allAdminOrders[idx].status = status;
            }

            showToast(
                `Order #${orderId} → ${status} ✅`,
                'success');

            // Dashboard stats refresh
            if (document.getElementById('tab-dashboard') &&
                !document.getElementById('tab-dashboard')
                    .classList.contains('d-none')) {
                loadDashboard();
            }

        } else {
            showToast('Update failed!', 'danger');
        }
    } catch (err) {
        showToast('Error!', 'danger');
    } finally {
        selectEl.disabled = false;
        selectEl.value = '';
    }
}

function getProdAvatar(name) {
    return `https://ui-avatars.com/api/` +
           `?name=${encodeURIComponent(name||'P')}` +
           `&background=667eea&color=fff&size=32`;
}


// ===== Product Image Upload =====
async function uploadProductImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB!', 'warning');
        return;
    }

    await doUploadProductImage(file);
}

// Drag & Drop handler
function handleImageDrop(event) {
    event.preventDefault();
    document.getElementById('imageUploadBox')
            .style.borderColor = '#dee2e6';
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        doUploadProductImage(file);
    }
}

async function doUploadProductImage(file) {
    // Progress show
    document.getElementById('uploadProgress')
            .classList.remove('d-none');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'products');

        const res = await fetch(`${API_URL}/upload/photo`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            // Hidden input मा URL save
            document.getElementById('pImage').value = data.url;

            // Preview देखाउँछ
            document.getElementById('imagePreviewArea')
                    .innerHTML = `
                <div class="position-relative d-inline-block">
                    <img src="${data.url}"
                         style="max-height:150px;
                                border-radius:8px;
                                object-fit:cover;">
                    <button type="button"
                            class="btn btn-sm btn-danger
                                   position-absolute top-0 end-0"
                            style="border-radius:50%;
                                   width:24px;height:24px;
                                   padding:0;font-size:10px;"
                            onclick="clearProductImage()">
                        ✕
                    </button>
                </div>
                <p class="text-success small mt-2 mb-0">
                    ✅ Image uploaded!
                </p>
            `;
            showToast('Image uploaded! ✅', 'success');
        } else {
            showToast(data.message || 'Upload failed!', 'danger');
        }
    } catch (err) {
        showToast('Upload error!', 'danger');
    } finally {
        document.getElementById('uploadProgress')
                .classList.add('d-none');
    }
}

// Image clear गर्छ
function clearProductImage() {
    document.getElementById('pImage').value = '';
    document.getElementById('imagePreviewArea').innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-3x
                  text-muted mb-2 d-block"></i>
        <p class="text-muted mb-1">
            Click or Drag & Drop here
        </p>
        <small class="text-muted">JPG, PNG, WEBP — Max 5MB</small>
    `;
}