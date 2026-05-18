// ===== HOMEPAGE JAVASCRIPT =====

let allProducts = []; // सबै products यहाँ store हुन्छ

// ===== Products Load गर्ने =====
async function loadProducts() {
    try {
        // Backend बाट products माग्छ
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();

        // Loading spinner hide गर्छ
        document.getElementById('loadingSpinner')
                .classList.add('d-none');

        // Products देखाउँछ
        displayProducts(allProducts);

    } catch (error) {
        console.error('Products load error:', error);
        document.getElementById('loadingSpinner').innerHTML =
            '<p class="text-danger">Error loading products!</p>';
    }
}

// ===== Products Display गर्ने =====
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    // Products छैन भने message देखाउँछ
    if (products.length === 0) {
        grid.innerHTML = '';
        noProducts.classList.remove('d-none');
        return;
    }

    noProducts.classList.add('d-none');

    // प्रत्येक product को लागि card बनाउँछ
    grid.innerHTML = products.map(product => `
        <div class="col-xl-3 col-lg-4 col-md-6">
            <div class="card product-card">

                <!-- Product Image -->
                ${product.imageUrl
                    ? `<img src="${product.imageUrl}"
                            alt="${product.name}"
                            onerror="this.parentElement.innerHTML=
                            '<div class=\'product-img-placeholder\'>🛍️</div>'">`
                    : '<div class="product-img-placeholder">🛍️</div>'
                }

                <div class="card-body d-flex flex-column">
                    <!-- Category Badge -->
                    <span class="badge bg-secondary mb-2 w-fit">
                        ${product.category || 'General'}
                    </span>

                    <!-- Product Name -->
                    <h6 class="card-title fw-bold">${product.name}</h6>

                    <!-- Description -->
                    <p class="card-text text-muted small flex-grow-1">
                        ${product.description
                            ? product.description.substring(0, 80) + '...'
                            : 'No description'}
                    </p>

                    <!-- Price -->
                    <div class="product-price mb-2">
                        ¥${product.price.toLocaleString()}
                    </div>

                    <!-- Stock -->
                    <span class="badge ${product.stock > 5
                        ? 'bg-success'
                        : product.stock > 0
                        ? 'bg-warning text-dark'
                        : 'bg-danger'} stock-badge mb-3">
                        ${product.stock > 0
                            ? `In Stock (${product.stock})`
                            : 'Out of Stock'}
                    </span>

                    <!-- Buttons -->
                    <div class="d-flex gap-2">
                        <button class="btn btn-add-cart flex-grow-1"
                                onclick="addToCart(${product.id})"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <a href="/product?id=${product.id}"
                           class="btn btn-outline-secondary">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Cart मा Add गर्ने =====
async function addToCart(productId) {
    const email = getCurrentUser();

    // Login छैन भने login page मा पठाउँछ
    if (!email) {
        alert('Please login first! 🔐');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/cart/add?email=${email}`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({productId: productId, quantity: 1})
            }
        );

        if (response.ok) {
            // Cart count update गर्छ
            updateCartCount();
            // Success message देखाउँछ
            showToast('Added to cart! 🛒', 'success');
        } else {
            const error = await response.text();
            showToast(error, 'danger');
        }
    } catch (error) {
        showToast('Error adding to cart!', 'danger');
    }
}

// ===== Search Function =====
async function searchProducts() {
    const keyword = document.getElementById('searchInput').value.trim();

    if (!keyword) {
        displayProducts(allProducts); // खाली भए सबै देखाउँछ
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/products/search?keyword=${keyword}`
        );
        const results = await response.json();
        displayProducts(results);
    } catch (error) {
        showToast('Search failed!', 'danger');
    }
}

// ===== Category Filter =====
function filterCategory(category) {
    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(
            p => p.category === category
        );
        displayProducts(filtered);
    }
}

// ===== Products Section मा Scroll =====
function scrollToProducts() {
    document.getElementById('productsSection')
            .scrollIntoView({behavior: 'smooth'});
}

// ===== Toast Notification =====
function showToast(message, type) {
    // Old toast हटाउँछ
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toast.innerHTML = `
        <div class="toast show align-items-center
                    text-white bg-${type} border-0">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button"
                        class="btn-close btn-close-white me-2 m-auto"
                        onclick="this.closest('.toast-container').remove()">
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(toast);

    // 3 seconds पछि automatically हटाउँछ
    setTimeout(() => toast.remove(), 3000);
}

// Enter key ले search हुन्छ
document.addEventListener('DOMContentLoaded', function() {
    loadProducts(); // Page load हुँदा products load गर्छ

    document.getElementById('searchInput')
            .addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchProducts();
    });
});