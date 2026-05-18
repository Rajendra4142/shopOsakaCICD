document.addEventListener('DOMContentLoaded', loadOrders);

async function loadOrders() {
    const email = getCurrentUser();
    if (!email) {
        document.getElementById('notLoggedIn')
                .classList.remove('d-none');
        return;
    }

    try {
        const res = await fetch(
            `${API_URL}/orders` +
            `?email=${encodeURIComponent(email)}`
        );
        const orders = await res.json();

        if (!Array.isArray(orders) || orders.length === 0) {
            document.getElementById('noOrders')
                    .classList.remove('d-none');
            return;
        }

        displayOrders(orders);

    } catch (err) {
        console.error('Orders error:', err);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');

    container.innerHTML = orders.map(order => `
        <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-4">

                <!-- Order Header -->
                <div class="d-flex justify-content-between
                            align-items-center mb-3">
                    <div>
                        <h6 class="fw-bold mb-0">
                            Order #${order.orderId}
                        </h6>
                        <small class="text-muted">
                            ${order.orderedAt
                                ? new Date(order.orderedAt)
                                    .toLocaleDateString('ja-JP')
                                : '-'}
                        </small>
                    </div>
                    <span class="badge ${getStatusColor(order.status)} fs-6">
                        ${getStatusIcon(order.status)}
                        ${order.status}
                    </span>
                </div>

                <!-- Tracking Progress Bar -->
                ${order.status !== 'CANCELLED'
                    ? getTrackingHtml(order.status)
                    : '<div class="alert alert-danger py-2 mb-3">❌ This order was cancelled.</div>'}

                <!-- Order Items -->
                <div class="border-top pt-3 mt-3">
                    ${(order.items || []).map(item => `
                        <div class="d-flex align-items-center
                                    gap-3 mb-3">
                            <img src="${item.imageUrl ||
                                getAvatar(item.productName)}"
                                 class="rounded-3 flex-shrink-0"
                                 style="width:60px;height:60px;
                                        object-fit:cover;"
                                 onerror="this.src='${
                                    getAvatar(item.productName)}'">
                            <div class="flex-grow-1">
                                <div class="fw-semibold">
                                    ${item.productName}
                                </div>
                                <small class="text-muted">
                                    ¥${Number(item.price)
                                        .toLocaleString()}
                                    × ${item.quantity}
                                </small>
                            </div>
                            <div class="fw-bold text-danger">
                                ¥${Number(item.subtotal)
                                    .toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Order Footer -->
                <div class="d-flex justify-content-between
                            align-items-center border-top pt-3">
                    <div>
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            ${order.shippingAddress || '-'}
                        </small>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block">Total</small>
                        <span class="fw-bold text-danger fs-5">
                            ¥${Number(order.totalAmount)
                                .toLocaleString()}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    `).join('');
}

// Tracking Progress Bar
function getTrackingHtml(status) {
    const steps = [
        { key:'PENDING',   label:'Ordered',   icon:'📦' },
        { key:'CONFIRMED', label:'Confirmed',  icon:'✅' },
        { key:'SHIPPING',  label:'Shipped',    icon:'🚚' },
        { key:'DELIVERED', label:'Delivered',  icon:'🎉' }
    ];

    const currentIdx = steps.findIndex(s => s.key === status);

    return `
        <div class="d-flex align-items-center mb-3">
            ${steps.map((step, idx) => `
                <div class="text-center"
                     style="flex:1;position:relative;">

                    <!-- Step Circle -->
                    <div style="
                        width:38px;height:38px;
                        border-radius:50%;
                        margin:0 auto 6px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:18px;
                        background:${idx <= currentIdx
                            ? 'linear-gradient(135deg,#667eea,#764ba2)'
                            : '#e9ecef'};
                        border:3px solid ${idx <= currentIdx
                            ? '#667eea' : '#dee2e6'};
                        transition:all 0.3s;
                        position:relative;z-index:2;">
                        ${step.icon}
                    </div>

                    <!-- Label -->
                    <small style="
                        color:${idx <= currentIdx
                            ? '#667eea' : '#adb5bd'};
                        font-weight:${idx === currentIdx
                            ? '700' : '400'};
                        font-size:11px;">
                        ${step.label}
                    </small>

                    <!-- Connector Line -->
                    ${idx < steps.length - 1 ? `
                        <div style="
                            position:absolute;
                            top:19px;
                            left:calc(50% + 19px);
                            right:calc(-50% + 19px);
                            height:3px;
                            background:${idx < currentIdx
                                ? 'linear-gradient(90deg,#667eea,#764ba2)'
                                : '#dee2e6'};
                            z-index:1;
                            transition:all 0.3s;">
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function getStatusColor(status) {
    const colors = {
        'PENDING'  : 'bg-warning text-dark',
        'CONFIRMED': 'bg-primary',
        'SHIPPING' : 'bg-info text-dark',
        'DELIVERED': 'bg-success',
        'CANCELLED': 'bg-danger'
    };
    return colors[status] || 'bg-secondary';
}

function getStatusIcon(status) {
    const icons = {
        'PENDING'  : '⏳',
        'CONFIRMED': '✅',
        'SHIPPING' : '🚚',
        'DELIVERED': '🎉',
        'CANCELLED': '❌'
    };
    return icons[status] || '📦';
}

function getAvatar(name) {
    return `https://ui-avatars.com/api/` +
           `?name=${encodeURIComponent(name||'P')}` +
           `&background=667eea&color=fff&size=60`;
}