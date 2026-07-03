const api = window.EastgateStore;

const els = {
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortFilter: document.getElementById("sortFilter"),
  inStockOnly: document.getElementById("inStockOnly"),
  productGrid: document.getElementById("productGrid"),
  cartItems: document.getElementById("cartItems"),
  wishlistItems: document.getElementById("wishlistItems"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutButton: document.getElementById("checkoutButton"),
  checkoutDialog: document.getElementById("checkoutDialog"),
  checkoutForm: document.getElementById("checkoutForm"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  confirmOrderButton: document.getElementById("confirmOrderButton"),
  customerName: document.getElementById("customerName"),
  customerEmail: document.getElementById("customerEmail"),
  customerPhone: document.getElementById("customerPhone"),
  customerAddress: document.getElementById("customerAddress"),
  paymentMethod: document.getElementById("paymentMethod"),
  productDialog: document.getElementById("productDialog"),
  dialogContent: document.getElementById("dialogContent"),
  loginForm: document.getElementById("loginForm"),
  loginId: document.getElementById("loginId"),
  loginOrderId: document.getElementById("loginOrderId"),
  loginStatus: document.getElementById("loginStatus"),
  trackingSummary: document.getElementById("trackingSummary"),
  receiptDialog: document.getElementById("receiptDialog"),
  receiptContent: document.getElementById("receiptContent"),
  printReceiptButton: document.getElementById("printReceiptButton"),
};

const state = {
  store: api.getStore(),
  cart: api.getCart(),
  wishlist: api.getWishlist(),
  session: api.getSession(),
  query: "",
  category: "all",
  sort: "featured",
  inStockOnly: false,
  receiptOrder: null,
};

function syncFromStorage() {
  state.store = api.getStore();
  state.cart = api.getCart();
  state.wishlist = api.getWishlist();
  state.session = api.getSession();
  renderCategoryOptions();
  renderAll();
}

function categoryOptions() {
  return state.store.categories
    .filter((category) => category.active)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function productCatalog() {
  const activeProducts = state.store.products.filter((product) => product.active !== false);
  const activeCategoryIds = new Set(categoryOptions().map((category) => category.id));

  let items = activeProducts.filter((product) => activeCategoryIds.has(product.categoryId));
  const query = state.query.trim().toLowerCase();

  items = items.filter((product) => {
    const categoryName = api.resolveCategoryName(state.store, product.categoryId);
    const searchSpace = [
      product.name,
      product.brand,
      product.subcategory,
      categoryName,
      product.description,
      (product.specs || []).join(" "),
    ].join(" ").toLowerCase();

    return (
      (!query || searchSpace.includes(query)) &&
      (state.category === "all" || product.categoryId === state.category) &&
      (!state.inStockOnly || product.stock > 0)
    );
  });

  switch (state.sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "stock-desc":
      items.sort((a, b) => b.stock - a.stock);
      break;
    default:
      items.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return items;
}

function formatPrice(value) {
  return api.formatPrice(value);
}

function getCartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = state.store.products.find((item) => item.id === id);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean);
}

function cartTotal() {
  return getCartEntries().reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
}

function persistCart() {
  api.saveCart(state.cart);
}

function persistWishlist() {
  api.saveWishlist(state.wishlist);
}

function persistSession() {
  api.saveSession(state.session);
}

function renderCategoryOptions() {
  const categories = categoryOptions();
  const validCategoryIds = new Set(categories.map((category) => category.id));
  if (state.category !== "all" && !validCategoryIds.has(state.category)) {
    state.category = "all";
  }
  const selectOptions = ["<option value=\"all\">All categories</option>"]
    .concat(
      categories.map(
        (category) =>
          `<option value="${category.id}">${category.name}</option>`
      )
    )
    .join("");
  els.categoryFilter.innerHTML = selectOptions;
  els.categoryFilter.value = state.category;
}

function renderProducts() {
  const items = productCatalog();
  els.productGrid.innerHTML =
    items
      .map((product) => {
        const categoryName = api.resolveCategoryName(state.store, product.categoryId);
        const wish = state.wishlist.has(product.id);
        const visual = product.image
          ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />`
          : `<div class="product-fallback" style="background:${product.swatch || '#f3f3f3'}">
               <span>${categoryName}</span>
               <strong>${(product.badge || "Eastgate").toUpperCase()}</strong>
             </div>`;

        return `
          <article class="product-card">
            <div class="product-visual ${product.image ? "has-image" : ""}">
              ${visual}
            </div>
            <div class="product-meta">
              <div>
                <h3>${product.name}</h3>
                <div class="muted">${categoryName} | ${product.subcategory || "General"}</div>
              </div>
              <div class="price">${formatPrice(product.price)}</div>
            </div>
            <p>${product.description}</p>
            <div class="product-details">
              <span class="pill">Stock ${product.stock}</span>
              <span class="pill alt">Rating ${(product.rating || 4.5).toFixed(1)}</span>
              ${(product.specs || []).map((spec) => `<span class="pill">${spec}</span>`).join("")}
            </div>
            <div class="product-actions">
              <button class="btn btn-secondary" data-action="details" data-id="${product.id}" type="button">View details</button>
              <button class="btn btn-secondary" data-action="wish" data-id="${product.id}" type="button">${wish ? "Wishlisted" : "Wishlist"}</button>
              <button class="btn btn-primary" data-action="add" data-id="${product.id}" type="button">${product.stock > 0 ? "Add to cart" : "Out of stock"}</button>
            </div>
          </article>
        `;
      })
      .join("") || `<div class="empty-state">No products matched the current filters.</div>`;
}

function renderCart() {
  const entries = getCartEntries();
  els.cartItems.innerHTML = entries.length
    ? entries
        .map(({ product, quantity }) => {
          const total = product.price * quantity;
          return `
            <div class="cart-item">
              <div class="row">
                <strong>${product.name}</strong>
                <span>${formatPrice(total)}</span>
              </div>
              <div class="row muted">
                <span>${api.resolveCategoryName(state.store, product.categoryId)}</span>
                <span>${product.stock} left</span>
              </div>
              <div class="row">
                <div class="quantity" aria-label="Adjust quantity">
                  <button type="button" data-action="decrease" data-id="${product.id}">-</button>
                  <strong>${quantity}</strong>
                  <button type="button" data-action="increase" data-id="${product.id}">+</button>
                </div>
                <button class="btn btn-secondary" type="button" data-action="remove" data-id="${product.id}">Remove</button>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">Your cart is empty. Add products to begin checkout.</div>`;

  const total = cartTotal();
  els.cartTotal.textContent = formatPrice(total);
  els.checkoutTotal.textContent = formatPrice(total);
  els.checkoutButton.disabled = total === 0;
  els.confirmOrderButton.disabled = total === 0;
}

function renderWishlist() {
  const items = state.store.products.filter((product) => state.wishlist.has(product.id));
  els.wishlistItems.innerHTML = items.length
    ? items
        .map(
          (product) => `
            <div class="wish-item">
              <div class="row">
                <strong>${product.name}</strong>
                <button class="btn btn-secondary" type="button" data-action="wish" data-id="${product.id}">Remove</button>
              </div>
              <div class="row muted">
                <span>${api.resolveCategoryName(state.store, product.categoryId)}</span>
                <span>${formatPrice(product.price)}</span>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty-state">Saved items will appear here.</div>`;
}

function renderTrackingSummary() {
  if (!state.session) {
    els.loginStatus.textContent = "Login to see your tracked order status.";
    els.trackingSummary.textContent = "Order tracking is available for registered customers.";
    return;
  }

  const identity = String(state.session.identity || "").toLowerCase();
  const order = state.store.orders.find((item) => {
    if (item.id !== state.session.orderId) return false;
    const emailMatch = String(item.email || "").toLowerCase() === identity;
    const phoneMatch = String(item.phone || "") === String(state.session.identity || "");
    return emailMatch || phoneMatch || identity === "";
  });

  if (!order) {
    els.loginStatus.textContent = `Signed in as ${state.session.identity}.`;
    els.trackingSummary.textContent = "No matching order was found yet.";
    return;
  }

  els.loginStatus.textContent = `Signed in as ${state.session.identity}.`;
  els.trackingSummary.textContent = `Order ${order.id} is ${order.status}. Tracking no ${order.trackingNo}.`;
}

function openDetails(id) {
  const product = state.store.products.find((item) => item.id === id);
  if (!product) return;

  const categoryName = api.resolveCategoryName(state.store, product.categoryId);
  const visual = product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />`
    : `<div class="product-fallback" style="background:${product.swatch || '#f3f3f3'}">
         <span>${categoryName}</span>
         <strong>${(product.badge || "Eastgate").toUpperCase()}</strong>
       </div>`;

  els.dialogContent.innerHTML = `
    <div class="dialog-product">
      <div class="product-visual ${product.image ? "has-image" : ""}" style="min-height: 220px;">
        ${visual}
      </div>
      <div class="dialog-grid">
        <div>
          <p class="eyebrow">Product detail</p>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        </div>
        <div>
          <p class="eyebrow">Specifications</p>
          <div class="stack small">
            ${(product.specs || []).map((spec) => `<div class="notice">${spec}</div>`).join("")}
          </div>
        </div>
      </div>
      <div class="panel-total">
        <span>${product.brand} | ${categoryName}</span>
        <strong>${formatPrice(product.price)}</strong>
      </div>
    </div>
  `;
  els.productDialog.showModal();
}

function renderReceipt(order) {
  const items = order.items
    .map(
      (item) => `
        <div class="receipt-row">
          <span>${item.name} x ${item.qty}</span>
          <strong>${formatPrice(item.price * item.qty)}</strong>
        </div>
      `
    )
    .join("");

  els.receiptContent.innerHTML = `
    <div class="receipt-grid">
      <div class="control-card"><span>Order No</span><strong>${order.id}</strong></div>
      <div class="control-card"><span>Tracking No</span><strong>${order.trackingNo}</strong></div>
      <div class="control-card"><span>Receipt No</span><strong>${order.receiptNo}</strong></div>
      <div class="control-card"><span>Payment</span><strong>${order.paymentMethod}</strong></div>
    </div>
    <div class="stack" style="margin-top:14px;">
      <div class="notice"><strong>${order.customerName}</strong><br>${order.email}<br>${order.phone}<br>${order.address}</div>
      <div class="stack">${items}</div>
      <div class="receipt-row"><span>Subtotal</span><strong>${formatPrice(order.subtotal)}</strong></div>
      <div class="receipt-row"><span>Shipping</span><strong>${formatPrice(order.shipping)}</strong></div>
      <div class="panel-total"><span>Grand Total</span><strong>${formatPrice(order.total)}</strong></div>
    </div>
  `;
  els.receiptDialog.showModal();
}

function openCheckout() {
  if (cartTotal() === 0) return;
  els.checkoutDialog.showModal();
}

function confirmOrder(event) {
  event.preventDefault();
  const total = cartTotal();
  if (total === 0) return;

  const store = api.getStore();
  const entries = getCartEntries();
  const customerName = els.customerName.value.trim();
  const email = els.customerEmail.value.trim();
  const phone = els.customerPhone.value.trim();
  const address = els.customerAddress.value.trim();

  if (!customerName || !email || !phone || !address) {
    alert("Please fill in your contact and shipping details.");
    return;
  }

  const stockIssue = entries.find((entry) => entry.quantity > entry.product.stock);
  if (stockIssue) {
    alert(`Not enough stock for ${stockIssue.product.name}.`);
    return;
  }

  const order = {
    id: api.createOrderNo(store),
    receiptNo: api.createReceiptNo(store),
    trackingNo: api.createTrackingNo(store),
    customerName,
    email,
    phone,
    address,
    paymentMethod: els.paymentMethod.value,
    paymentStatus: els.paymentMethod.value === "Cash on Delivery" ? "Pending" : "Paid",
    status: "Processing",
    subtotal: total,
    shipping: total >= 2999 ? 0 : 99,
    total: total + (total >= 2999 ? 0 : 99),
    createdAt: new Date().toISOString(),
    items: entries.map((entry) => ({
      productId: entry.product.id,
      name: entry.product.name,
      qty: entry.quantity,
      price: entry.product.price,
    })),
  };

  const updatedProducts = store.products.map((product) => {
    const ordered = entries.find((entry) => entry.product.id === product.id);
    return ordered ? { ...product, stock: Math.max(0, product.stock - ordered.quantity) } : product;
  });

  store.orders.unshift(order);
  store.products = updatedProducts;

  api.saveStore(store);
  state.store = store;
  state.cart = {};
  api.saveCart(state.cart);
  state.session = { identity: email, orderId: order.id };
  persistSession();
  renderAll();
  els.checkoutDialog.close();
  renderReceipt(order);
}

function handleLogin(event) {
  event.preventDefault();
  const identity = els.loginId.value.trim();
  const orderId = els.loginOrderId.value.trim().toUpperCase();

  if (!identity || !orderId) {
    els.loginStatus.textContent = "Please enter your email/phone and order number.";
    return;
  }

  state.session = { identity, orderId };
  persistSession();
  renderTrackingSummary();
}

function addToCart(id) {
  const product = state.store.products.find((item) => item.id === id);
  if (!product) return;
  const current = state.cart[id] || 0;
  if (current >= product.stock) {
    alert("This product has reached available stock.");
    return;
  }
  state.cart[id] = current + 1;
  persistCart();
  renderCart();
}

function adjustCart(id, delta) {
  const product = state.store.products.find((item) => item.id === id);
  if (!product) return;
  const current = state.cart[id] || 0;
  const next = current + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = Math.min(next, product.stock);
  persistCart();
  renderAll();
}

function toggleWishlist(id) {
  if (state.wishlist.has(id)) state.wishlist.delete(id);
  else state.wishlist.add(id);
  persistWishlist();
  renderWishlist();
}

function renderAll() {
  renderProducts();
  renderCart();
  renderWishlist();
  renderTrackingSummary();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === "add") addToCart(id);
  if (action === "increase") adjustCart(id, 1);
  if (action === "decrease") adjustCart(id, -1);
  if (action === "remove") adjustCart(id, -(state.cart[id] || 0));
  if (action === "wish") toggleWishlist(id);
  if (action === "details") openDetails(id);
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

els.categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

els.sortFilter.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

els.inStockOnly.addEventListener("change", (event) => {
  state.inStockOnly = event.target.checked;
  renderProducts();
});

els.checkoutButton.addEventListener("click", openCheckout);
els.checkoutForm.addEventListener("submit", confirmOrder);
els.loginForm.addEventListener("submit", handleLogin);
els.printReceiptButton.addEventListener("click", () => window.print());

window.addEventListener("storage", syncFromStorage);
window.addEventListener("eastgate-sync", syncFromStorage);

renderCategoryOptions();
renderAll();
