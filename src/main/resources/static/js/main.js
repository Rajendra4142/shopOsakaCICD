const API_URL = 'https://shoposaka.duckdns.org/api';

// Login भएको user को email
function getCurrentUser() {
    return localStorage.getItem('userEmail');
}

// Cart count update
async function updateCartCount() {
    const email = getCurrentUser();
    if (!email) return;
    try {
        const res = await fetch(`${API_URL}/cart?email=${email}`);
        const items = await res.json();
        const el = document.getElementById('cartCount');
        if (el) el.textContent = items.length;
    } catch (e) {}
}

// Navbar auth buttons update
// Email को सट्टा Name देखाउँछ!
function updateAuthButtons() {
    const email = getCurrentUser();
    const name  = localStorage.getItem('userName') || email;
    const role  = localStorage.getItem('userRole');
    const photo = localStorage.getItem('userPhoto');
    const div   = document.getElementById('authButtons');
    if (!div) return;

    if (email) {
        // Photo — localStorage बाट लिन्छ
        // localStorage clear नहुञ्जेल persist हुन्छ!
        const avatarHtml = (photo && photo !== 'null')
            ? `<img src="${photo}"
                    style="width:32px;height:32px;
                           border-radius:50%;
                           object-fit:cover;
                           border:2px solid #ffc107;"
                    onerror="this.src='${getNavAvatar(name)}';">`
            : `<img src="${getNavAvatar(name)}"
                    style="width:32px;height:32px;
                           border-radius:50%;">`;

        div.innerHTML = `
            <a href="/cart"
               class="btn btn-outline-warning
                      position-relative me-1">
                <i class="fas fa-shopping-cart"></i>
                <span id="cartCount"
                      class="badge bg-danger
                             position-absolute top-0
                             start-100 translate-middle
                             rounded-pill">0</span>
            </a>
            <div class="dropdown">
                <button class="btn btn-outline-light
                               dropdown-toggle
                               d-flex align-items-center gap-2"
                        data-bs-toggle="dropdown">
                    ${avatarHtml}
                    <span class="d-none d-md-inline">
                        ${name}
                    </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                    <li>
                        <a class="dropdown-item" href="/profile">
                            <i class="fas fa-user me-2 text-primary"></i>
                            Profile
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="/orders">
                            <i class="fas fa-box me-2 text-warning"></i>
                            My Orders
                        </a>
                    </li>
                    ${role === 'ADMIN' ? `
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger"
                           href="/admin">
                            <i class="fas fa-cog me-2"></i>
                            Admin Panel
                        </a>
                    </li>` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button class="dropdown-item text-danger"
                                onclick="logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        `;
        updateCartCount();

        // ← KEY FIX: Page load मा backend बाट photo fetch
        // localStorage मा photo छैन भने backend बाट लिन्छ
        if (!photo || photo === 'null') {
            fetchAndCacheUserPhoto(email);
        }
    } else {
        div.innerHTML = `
            <a href="/login"
               class="btn btn-outline-light me-1">Login</a>
            <a href="/register"
               class="btn btn-warning">Register</a>
        `;
    }
}


// Backend बाट photo fetch गरेर cache गर्छ
async function fetchAndCacheUserPhoto(email) {
    try {
        const res = await fetch(
            `${API_URL}/user/profile` +
            `?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const user = await res.json();

        if (user.profilePhoto) {
            localStorage.setItem('userPhoto',
                user.profilePhoto);
            // Navbar photo update
            const imgs = document.querySelectorAll(
                '[data-profile-photo]');
            imgs.forEach(img =>
                img.src = user.profilePhoto);
            updateAuthButtons(); // Re-render with photo
        }
        // Name पनि update गर्छ
        if (user.fullName) {
            localStorage.setItem('userName', user.fullName);
        }
    } catch (err) {}
}

function getNavAvatar(name) {
    return `https://ui-avatars.com/api/` +
           `?name=${encodeURIComponent(name||'U')}` +
           `&background=667eea&color=fff&size=32&bold=true`;
}




function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

// Chat button add गर्छ (सबै pages मा)
function addChatButton() {
    const chatBtn = document.createElement('div');
    chatBtn.innerHTML = `
        <!-- Chat Toggle Button -->
        <button id="chatToggle"
                onclick="toggleChat()"
                style="position:fixed; bottom:20px; right:20px;
                       width:55px; height:55px; border-radius:50%;
                       background:linear-gradient(135deg,#667eea,#764ba2);
                       border:none; color:white; font-size:22px;
                       box-shadow:0 4px 15px rgba(102,126,234,0.5);
                       cursor:pointer; z-index:1000;
                       transition:transform 0.3s;">
            <i class="fas fa-comments"></i>
        </button>

        <!-- Chat Window -->
        <div id="chatWindow"
             style="position:fixed; bottom:85px; right:20px;
                    width:320px; height:420px;
                    background:white; border-radius:16px;
                    box-shadow:0 10px 40px rgba(0,0,0,0.15);
                    display:none; flex-direction:column;
                    overflow:hidden; z-index:999;">

            <!-- Chat Header -->
            <div style="background:linear-gradient(
                            135deg,#667eea,#764ba2);
                        padding:15px; color:white;">
                <div class="d-flex align-items-center gap-2">
                    <div style="width:35px; height:35px;
                                background:rgba(255,255,255,0.3);
                                border-radius:50%;
                                display:flex; align-items:center;
                                justify-content:center;">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div>
                        <div class="fw-bold">ShopOsaka Support</div>
                        <small style="opacity:0.8;">
                            <span style="color:#4ade80;">●</span>
                            Online
                        </small>
                    </div>
                    <button onclick="toggleChat()"
                            style="background:none; border:none;
                                   color:white; margin-left:auto;
                                   font-size:18px; cursor:pointer;">
                        ✕
                    </button>
                </div>
            </div>

            <!-- Chat Messages -->
            <div id="chatMessages"
                 style="flex:1; overflow-y:auto;
                        padding:15px; background:#f8f9fa;">
                <!-- Welcome message -->
                <div style="display:flex; gap:8px;
                            margin-bottom:12px;">
                    <div style="width:30px; height:30px;
                                background:linear-gradient(
                                    135deg,#667eea,#764ba2);
                                border-radius:50%; flex-shrink:0;
                                display:flex; align-items:center;
                                justify-content:center;
                                color:white; font-size:12px;">
                        S
                    </div>
                    <div style="background:white; padding:10px 12px;
                                border-radius:0 12px 12px 12px;
                                box-shadow:0 1px 3px rgba(0,0,0,0.1);
                                max-width:80%; font-size:14px;">
								Welcome to ShopOsaka! 🙏
								How can I help you?
                    </div>
                </div>
            </div>

            <!-- Chat Input -->
            <div style="padding:12px; border-top:1px solid #e9ecef;
                        background:white;">
                <div class="input-group">
                    <input type="text"
                           id="chatInput"
                           class="form-control form-control-sm"
                          placeholder="Type a message..."
                           style="border-radius:20px 0 0 20px;"
                           onkeypress="chatKeyPress(event)">
                    <button class="btn btn-sm"
                            onclick="sendChatMessage()"
                            style="background:linear-gradient(
                                       135deg,#667eea,#764ba2);
                                   color:white; border:none;
                                   border-radius:0 20px 20px 0;
                                   padding:0 15px;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatBtn);
}

// Chat toggle
function toggleChat() {
    const win = document.getElementById('chatWindow');
    const btn = document.getElementById('chatToggle');
    if (win.style.display === 'none' || !win.style.display) {
        win.style.display = 'flex';
        btn.style.transform = 'scale(0.9)';
        // Chat input मा focus
        setTimeout(() =>
            document.getElementById('chatInput').focus(), 100);
    } else {
        win.style.display = 'none';
        btn.style.transform = 'scale(1)';
    }
}

// Chat message पठाउने
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // User message देखाउँछ
    addChatMsg(message, 'user');
    input.value = '';

    // Bot response — simple FAQ
    const response = getChatbotResponse(message);
    setTimeout(() => addChatMsg(response, 'bot'), 800);
}

// Message HTML add गर्छ
function addChatMsg(text, sender) {
    const container = document.getElementById('chatMessages');
    const isUser = sender === 'user';

    const msg = document.createElement('div');
    msg.style.cssText = `
        display:flex; gap:8px; margin-bottom:12px;
        justify-content:${isUser ? 'flex-end' : 'flex-start'};
    `;

    msg.innerHTML = isUser ? `
        <div style="background:linear-gradient(
                        135deg,#667eea,#764ba2);
                    color:white; padding:10px 12px;
                    border-radius:12px 0 12px 12px;
                    max-width:80%; font-size:14px;">
            ${text}
        </div>
    ` : `
        <div style="width:30px; height:30px;
                    background:linear-gradient(
                        135deg,#667eea,#764ba2);
                    border-radius:50%; flex-shrink:0;
                    display:flex; align-items:center;
                    justify-content:center;
                    color:white; font-size:12px;">S</div>
        <div style="background:white; padding:10px 12px;
                    border-radius:0 12px 12px 12px;
                    box-shadow:0 1px 3px rgba(0,0,0,0.1);
                    max-width:80%; font-size:14px;">
            ${text}
        </div>
    `;

    container.appendChild(msg);
    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Simple FAQ Chatbot
function getChatbotResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('order') || msg.includes('orders')) {
        return '📦 View your orders <a href="/orders">here</a>!';
    }
    if (msg.includes('cancel')) {
        return '❌ To cancel an order, go to Orders page and email us: support@shopOsaka.com';
    }
    if (msg.includes('payment') || msg.includes('pay')) {
        return '💳 We accept Cash on Delivery and Online Payment!';
    }
    if (msg.includes('delivery') || msg.includes('ship')) {
        return '🚚 Delivery takes 3-5 business days. Free shipping!';
    }
    if (msg.includes('return') || msg.includes('refund')) {
        return '🔄 7-day return policy available. support@shopOsaka.com मा contact गर्नुस्।';
    }
    if (msg.includes('hello') || msg.includes('hi')
            || msg.includes('namaste')) {
        return 'Hello! 🙏 I am ShopOsaka Support. How can I help you?';
    }
    return '🤔 For this question, please contact our team: support@shopOsaka.com वा +81-XX-XXXX-XXXX';
}

function chatKeyPress(event) {
    if (event.key === 'Enter') sendChatMessage();
}

// Page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthButtons();
    addChatButton(); // सबै pages मा chat button थप्छ
});

function showToast(message, type = 'success') {
    // Old toast हटाउँछ
    document.querySelector('.toast-container')?.remove();

    // info type को लागि color
    const bgColor = type === 'info' ? 'bg-info' :
                    type === 'success' ? 'bg-success' :
                    type === 'warning' ? 'bg-warning' :
                    'bg-danger';

    const textColor = type === 'warning' || type === 'info'
        ? 'text-dark' : 'text-white';

    const toast = document.createElement('div');
    toast.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast show align-items-center
                    ${textColor} ${bgColor} border-0"
             style="min-width:250px;">
            <div class="d-flex">
                <div class="toast-body fw-semibold">
                    ${message}
                </div>
                <button type="button"
                        class="btn-close
                               ${textColor === 'text-dark' ? '' : 'btn-close-white'}
                               me-2 m-auto"
                        onclick="this.closest(
                            '.toast-container').remove()">
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}