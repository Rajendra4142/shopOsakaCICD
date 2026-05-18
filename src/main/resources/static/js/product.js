// URL बाट product ID लिन्छ
// Example: /product?id=1
const productId = new URLSearchParams(
    window.location.search).get('id');

let currentProduct = null; // current product store गर्छ

// Page load हुँदा product ल्याउँछ
document.addEventListener('DOMContentLoaded', loadProduct);

async function loadProduct() {
    // ID छैन भने homepage
    if (!productId) {
        window.location.href = '/';
        return;
    }

    try {
        const res = await fetch(
            `${API_URL}/products/${productId}`
        );

        if (!res.ok) {
            showSection('notFoundSection');
            return;
        }

        currentProduct = await res.json();
        displayProduct(currentProduct);
        loadRelatedProducts(currentProduct.category);

    } catch (err) {
        showSection('notFoundSection');
    }
}

// Product data page मा भर्छ
function displayProduct(product) {
    showSection('productSection');

    // Title update
    document.title = `${product.name} - ShopOsaka`;

    // Image
    const img = document.getElementById('mainImage');
    if (product.imageUrl) {
        img.src = product.imageUrl;
        img.onerror = () => {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=350&background=667eea&color=fff`;
        };
    } else {
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=350&background=667eea&color=fff`;
    }

    // Text content
    document.getElementById('productCategory')
            .textContent = product.category || 'General';
    document.getElementById('productName')
            .textContent = product.name;
    document.getElementById('productPrice')
            .textContent = `¥${product.price.toLocaleString()}`;
    document.getElementById('productDescription')
            .textContent = product.description
                || 'No description available.';

    // Stock status
    const stockEl = document.getElementById('stockStatus');
    if (product.stock > 10) {
        stockEl.innerHTML =
            '<span class="badge bg-success fs-6">✅ In Stock</span>';
    } else if (product.stock > 0) {
        stockEl.innerHTML =
            `<span class="badge bg-warning text-dark fs-6">⚠️ Only ${product.stock} left!</span>`;
    } else {
        stockEl.innerHTML =
            '<span class="badge bg-danger fs-6">❌ Out of Stock</span>';
        document.getElementById('addToCartBtn').disabled = true;
    }

    // Quantity input max set
    document.getElementById('qtyInput').max = product.stock;

    // Total preview update
    updateTotalPreview();
}

// Quantity +/- buttons
function changeQty(delta) {
    const input = document.getElementById('qtyInput');
    const newVal = Math.max(1,
        Math.min(currentProduct.stock,
            parseInt(input.value) + delta));
    input.value = newVal;
    updateTotalPreview();
}

// Total price preview — qty × price
function updateTotalPreview() {
    if (!currentProduct) return;
    const qty = parseInt(
        document.getElementById('qtyInput').value) || 1;
    const total = currentProduct.price * qty;
    document.getElementById('totalPreview')
            .textContent = `¥${total.toLocaleString()}`;
}

// Cart मा add गर्ने
async function addToCart() {
    const email = getCurrentUser();
    if (!email) {
        showToast('Please login first!', 'warning');
        setTimeout(() =>
            window.location.href = '/login', 1500);
        return;
    }

    const qty = parseInt(
        document.getElementById('qtyInput').value);

    try {
        const res = await fetch(
            `${API_URL}/cart/add?email=${email}`,
            {
                method  : 'POST',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({
                    productId : parseInt(productId),
                    quantity  : qty
                })
            }
        );

        if (res.ok) {
            updateCartCount();
            showToast(`Added to cart! 🛒`, 'success');
        } else {
            showToast('Not enough stock!', 'warning');
        }
    } catch (err) {
        showToast('Error!', 'danger');
    }
}

// Buy Now — cart मा add गरेर cart page मा जान्छ
async function buyNow() {
    await addToCart();
    setTimeout(() => window.location.href = '/cart', 500);
}

// Related products load गर्छ
async function loadRelatedProducts(category) {
    try {
        const res = await fetch(
            `${API_URL}/products/category/${category}`
        );
        const products = await res.json();

        // Current product हटाउँछ र 4 ओटा मात्र देखाउँछ
        const related = products
            .filter(p => p.id !== parseInt(productId))
            .slice(0, 4);

        const grid = document.getElementById('relatedProducts');

        if (related.length === 0) {
            grid.innerHTML =
                '<p class="text-muted">No related products found!</p>';
            return;
        }

        grid.innerHTML = related.map(p => `
            <div class="col-md-3 col-sm-6">
                <a href="/product?id=${p.id}"
                   class="text-decoration-none">
                    <div class="card product-card border-0
                                shadow-sm rounded-4">
                        ${p.imageUrl
                            ? `<img src="${p.imageUrl}"
                                    alt="${p.name}"
                                    style="height:150px;
                                           object-fit:cover;"
                                    class="card-img-top rounded-top-4">`
                            : `<div class="product-img-placeholder"
                                    style="height:150px;">🛍️</div>`
                        }
                        <div class="card-body p-3">
                            <p class="fw-semibold mb-1 text-dark
                                      small">
                                ${p.name}
                            </p>
                            <span class="text-danger fw-bold">
                                ¥${p.price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

    } catch (err) {
        console.error('Related products error:', err);
    }
}

// Section show/hide helper
function showSection(sectionId) {
    ['loadingSection', 'productSection', 'notFoundSection']
        .forEach(id =>
            document.getElementById(id)
                    .classList.add('d-none'));
    document.getElementById(sectionId)
            .classList.remove('d-none');
}

// Qty input change हुँदा total update
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('qtyInput')
            ?.addEventListener('input', updateTotalPreview);
});