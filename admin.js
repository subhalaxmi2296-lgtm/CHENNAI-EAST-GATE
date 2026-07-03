const api = window.EastgateStore;

const els = {
  adminMetrics: document.getElementById("adminMetrics"),
  inventoryTable: document.getElementById("inventoryTable"),
  ordersTable: document.getElementById("ordersTable"),
  categoriesTable: document.getElementById("categoriesTable"),
  customersTable: document.getElementById("customersTable"),
  cartTable: document.getElementById("cartTable"),
  wishlistTable: document.getElementById("wishlistTable"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  adminEmail: document.getElementById("adminEmail"),
  adminPassword: document.getElementById("adminPassword"),
  adminAuthStatus: document.getElementById("adminAuthStatus"),
  categoryForm: document.getElementById("categoryForm"),
  categorySelect: document.getElementById("categorySelect"),
  categoryName: document.getElementById("categoryName"),
  categoryDescription: document.getElementById("categoryDescription"),
  categorySortOrder: document.getElementById("categorySortOrder"),
  categoryActive: document.getElementById("categoryActive"),
  deleteCategoryButton: document.getElementById("deleteCategoryButton"),
  productForm: document.getElementById("productForm"),
  productSelect: document.getElementById("productSelect"),
  productCategory: document.getElementById("productCategory"),
  productName: document.getElementById("productName"),
  productBrand: document.getElementById("productBrand"),
  productSubcategory: document.getElementById("productSubcategory"),
  productPrice: document.getElementById("productPrice"),
  productStock: document.getElementById("productStock"),
  productBadge: document.getElementById("productBadge"),
  productImageUrl: document.getElementById("productImageUrl"),
  productImageFile: document.getElementById("productImageFile"),
  productDescription: document.getElementById("productDescription"),
  productSpecs: document.getElementById("productSpecs"),
  productActive: document.getElementById("productActive"),
  productFeatured: document.getElementById("productFeatured"),
  deleteProductButton: document.getElementById("deleteProductButton"),
};

let store = api.getStore();
let adminAuthed = false;
let editingCategoryId = null;
let editingProductId = null;

if (!api.getAdminAuth()?.authed) {
  window.location.href = "./admin-login.html";
} else {
  adminAuthed = true;
}

function formatPrice(value) {
  return api.formatPrice(value);
}

function persistStore() {
  api.saveStore(store);
}

function currentCategories() {
  return store.categories.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function setManagementEnabled(enabled) {
  [
    els.categoryForm,
    els.productForm,
    els.deleteCategoryButton,
    els.deleteProductButton,
  ].forEach((node) => {
    if (!node) return;
    node.querySelectorAll
      ? node.querySelectorAll("input, textarea, select, button").forEach((field) => {
          field.disabled = !enabled;
        })
      : (node.disabled = !enabled);
  });
}

function renderCategoryOptions() {
  if (!els.categorySelect || !els.productCategory) return;
  const categories = currentCategories();
  const options =
    ['<option value="">Select category</option>']
      .concat(categories.map((category) => `<option value="${category.id}">${category.name}</option>`))
      .join("") || `<option value="">No categories</option>`;

  els.categorySelect.innerHTML = options;
  els.productCategory.innerHTML = options;
}

function renderProductOptions() {
  if (!els.productSelect) return;
  els.productSelect.innerHTML = [
    `<option value="new">New product</option>`,
    ...store.products.map((product) => `<option value="${product.id}">${product.name}</option>`),
  ].join("");
}

function renderMetrics() {
  if (!els.adminMetrics) return;
  const cart = api.getCart();
  const wishlist = api.getWishlist();
  const totalRevenue = store.orders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = store.products.filter((product) => product.stock <= 10).length;

  els.adminMetrics.innerHTML = [
    ["Categories", String(store.categories.length)],
    ["Products", String(store.products.length)],
    ["Orders", String(store.orders.length)],
    ["Revenue", formatPrice(totalRevenue)],
    ["Low stock", String(lowStock)],
    ["Cart items", String(Object.keys(cart).length)],
    ["Wishlist items", String(wishlist.size)],
    ["Active products", String(store.products.filter((item) => item.active !== false).length)],
  ]
    .map(([label, value]) => `<div class="metric-card"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderInventory() {
  if (!els.inventoryTable) return;
  els.inventoryTable.innerHTML = store.products
    .map((product) => {
      const categoryName = api.resolveCategoryName(store, product.categoryId);
      return `
        <div class="table-row">
          <div class="inventory-item">
            <div class="inventory-thumb">${(product.badge || "ITEM").slice(0, 4)}</div>
            <div>
              <strong>${product.name}</strong>
              <div class="muted">${categoryName} | ${product.stock} in stock | ${product.active !== false ? "Active" : "Hidden"}</div>
            </div>
          </div>
          <div class="control-card">
            <strong>${formatPrice(product.price)}</strong>
            <span class="badge">${product.featured ? "Featured" : "Standard"}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCategories() {
  if (!els.categoriesTable) return;
  els.categoriesTable.innerHTML = store.categories
    .map((category) => {
      const productsInCategory = store.products.filter((product) => product.categoryId === category.id).length;
      return `
        <div class="table-row">
          <div>
            <strong>${category.name}</strong>
            <div class="muted">${category.description || "No description"} | ${productsInCategory} products</div>
          </div>
          <span class="badge">Order ${category.sortOrder || 0}</span>
        </div>
      `;
    })
    .join("");
}

function renderOrders() {
  if (!els.ordersTable) return;
  els.ordersTable.innerHTML = store.orders
    .map(
      (order) => `
        <div class="table-row">
          <div>
            <strong>${order.id}</strong>
            <div class="muted">${order.customerName} | ${order.trackingNo} | ${formatPrice(order.total)}</div>
            <div class="muted">${order.paymentMethod} | ${order.paymentStatus}</div>
          </div>
          <div class="control-card">
            <select data-order-status="${order.id}">
              ${["Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"]
                .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`)
                .join("")}
            </select>
            <button class="btn btn-secondary" type="button" data-action="update-order" data-id="${order.id}">Update</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderCustomers() {
  if (!els.customersTable) return;
  const customers = store.orders.reduce((acc, order) => {
    const key = `${order.email}|${order.phone}`;
    if (!acc.has(key)) {
      acc.set(key, {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
        lastOrder: order.id,
        status: order.status,
        total: order.total,
      });
    }
    return acc;
  }, new Map());

  els.customersTable.innerHTML = [...customers.values()]
    .map(
      (customer) => `
        <div class="table-row">
          <div>
            <strong>${customer.name}</strong>
            <div class="muted">${customer.email} | ${customer.phone}</div>
            <div class="muted">Last order ${customer.lastOrder} | ${customer.status}</div>
          </div>
          <span class="badge">${formatPrice(customer.total)}</span>
        </div>
      `
    )
    .join("");
}

function renderCartSnapshot() {
  if (!els.cartTable) return;
  const cart = api.getCart();
  const entries = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = store.products.find((item) => item.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean);

  els.cartTable.innerHTML = entries.length
    ? entries
        .map(
          ({ product, quantity }) => `
            <div class="table-row">
              <div>
                <strong>${product.name}</strong>
                <div class="muted">${quantity} pcs | ${api.resolveCategoryName(store, product.categoryId)}</div>
              </div>
              <span class="badge">${formatPrice(product.price * quantity)}</span>
            </div>
          `
        )
        .join("")
    : `<div class="empty-state">No active cart items.</div>`;
}

function renderWishlistSnapshot() {
  if (!els.wishlistTable) return;
  const wishlist = api.getWishlist();
  const items = store.products.filter((product) => wishlist.has(product.id));

  els.wishlistTable.innerHTML = items.length
    ? items
        .map(
          (product) => `
            <div class="table-row">
              <div>
                <strong>${product.name}</strong>
                <div class="muted">${api.resolveCategoryName(store, product.categoryId)}</div>
              </div>
              <span class="badge">${formatPrice(product.price)}</span>
            </div>
          `
        )
        .join("")
    : `<div class="empty-state">No wishlist items saved yet.</div>`;
}

function clearCategoryForm() {
  if (!els.categorySelect || !els.categoryName || !els.categoryDescription || !els.categorySortOrder || !els.categoryActive) return;
  editingCategoryId = null;
  els.categorySelect.value = store.categories[0]?.id || "";
  els.categoryName.value = "";
  els.categoryDescription.value = "";
  els.categorySortOrder.value = String((store.categories.length || 0) + 1);
  els.categoryActive.checked = true;
}

function fillCategoryForm(id) {
  if (!els.categorySelect || !els.categoryName || !els.categoryDescription || !els.categorySortOrder || !els.categoryActive) return;
  const category = store.categories.find((item) => item.id === id);
  if (!category) return clearCategoryForm();
  editingCategoryId = category.id;
  els.categorySelect.value = category.id;
  els.categoryName.value = category.name;
  els.categoryDescription.value = category.description || "";
  els.categorySortOrder.value = String(category.sortOrder || 1);
  els.categoryActive.checked = category.active !== false;
}

function clearProductForm() {
  if (!els.productSelect || !els.productCategory || !els.productName || !els.productBrand || !els.productSubcategory || !els.productPrice || !els.productStock || !els.productBadge || !els.productImageUrl || !els.productImageFile || !els.productDescription || !els.productSpecs || !els.productActive || !els.productFeatured) return;
  editingProductId = null;
  els.productSelect.value = "new";
  els.productCategory.value = store.categories[0]?.id || "";
  els.productName.value = "";
  els.productBrand.value = "";
  els.productSubcategory.value = "";
  els.productPrice.value = "";
  els.productStock.value = "";
  els.productBadge.value = "";
  els.productImageUrl.value = "";
  els.productImageFile.value = "";
  els.productDescription.value = "";
  els.productSpecs.value = "";
  els.productActive.checked = true;
  els.productFeatured.checked = false;
}

function fillProductForm(id) {
  if (!els.productSelect || !els.productCategory || !els.productName || !els.productBrand || !els.productSubcategory || !els.productPrice || !els.productStock || !els.productBadge || !els.productImageUrl || !els.productImageFile || !els.productDescription || !els.productSpecs || !els.productActive || !els.productFeatured) return;
  const product = store.products.find((item) => item.id === id);
  if (!product) return clearProductForm();
  editingProductId = product.id;
  els.productSelect.value = product.id;
  els.productCategory.value = product.categoryId;
  els.productName.value = product.name;
  els.productBrand.value = product.brand || "";
  els.productSubcategory.value = product.subcategory || "";
  els.productPrice.value = String(product.price || 0);
  els.productStock.value = String(product.stock || 0);
  els.productBadge.value = product.badge || "";
  els.productImageUrl.value = product.image || "";
  els.productDescription.value = product.description || "";
  els.productSpecs.value = (product.specs || []).join(", ");
  els.productActive.checked = product.active !== false;
  els.productFeatured.checked = Boolean(product.featured);
}

function renderAll() {
  store = api.getStore();
  renderMetrics();
  renderCategoryOptions();
  renderProductOptions();
  renderInventory();
  renderCategories();
  renderOrders();
  renderCustomers();
  renderCartSnapshot();
  renderWishlistSnapshot();
  if (!editingCategoryId) clearCategoryForm();
  if (!editingProductId) clearProductForm();
}

async function saveCategory(event) {
  event.preventDefault();
  if (!els.categoryName || !els.categoryDescription || !els.categorySortOrder || !els.categoryActive) return;
  if (!adminAuthed) return;

  const name = els.categoryName.value.trim();
  if (!name) {
    alert("Category name is required.");
    return;
  }

  const category = {
    id: editingCategoryId || api.nextId("cat", store.counters.category++),
    name,
    description: els.categoryDescription.value.trim(),
    sortOrder: Number(els.categorySortOrder.value || 1),
    active: els.categoryActive.checked,
  };

  const index = store.categories.findIndex((item) => item.id === category.id);
  if (index >= 0) store.categories[index] = category;
  else store.categories.push(category);

  persistStore();
  renderAll();
  clearCategoryForm();
}

function deleteCategory() {
  if (!adminAuthed) return;
  if (!editingCategoryId) return;
  if (store.categories.length <= 1) {
    alert("At least one category must remain.");
    return;
  }

  const hasProducts = store.products.some((product) => product.categoryId === editingCategoryId);
  if (hasProducts && store.categories.length > 1) {
    const fallback = store.categories.find((item) => item.id !== editingCategoryId);
    store.products = store.products.map((product) =>
      product.categoryId === editingCategoryId ? { ...product, categoryId: fallback.id } : product
    );
  }

  store.categories = store.categories.filter((category) => category.id !== editingCategoryId);
  if (!store.categories.length) {
    alert("At least one category must remain.");
    store = api.getStore();
    return;
  }

  persistStore();
  editingCategoryId = null;
  renderAll();
  clearCategoryForm();
}

async function saveProduct(event) {
  event.preventDefault();
  if (!els.productName || !els.productCategory || !els.productBrand || !els.productSubcategory || !els.productPrice || !els.productStock || !els.productBadge || !els.productImageUrl || !els.productImageFile || !els.productDescription || !els.productSpecs || !els.productActive || !els.productFeatured) return;
  if (!adminAuthed) return;

  const name = els.productName.value.trim();
  const categoryId = els.productCategory.value;
  if (!name || !categoryId) {
    alert("Product name and category are required.");
    return;
  }

  const file = els.productImageFile.files[0];
  const uploadedImage = await api.exportImage(file);
  const image = uploadedImage || els.productImageUrl.value.trim();

  const product = {
    id: editingProductId || api.nextId("prd", store.counters.product++),
    categoryId,
    name,
    brand: els.productBrand.value.trim(),
    subcategory: els.productSubcategory.value.trim(),
    price: Number(els.productPrice.value || 0),
    stock: Number(els.productStock.value || 0),
    badge: els.productBadge.value.trim() || "Product",
    image,
    swatch: "linear-gradient(135deg, #f4f4f4, #e3e3e3)",
    description: els.productDescription.value.trim(),
    specs: els.productSpecs.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    rating: 4.5,
    active: els.productActive.checked,
    featured: els.productFeatured.checked,
  };

  const index = store.products.findIndex((item) => item.id === product.id);
  if (index >= 0) store.products[index] = product;
  else store.products.push(product);

  persistStore();
  renderAll();
  clearProductForm();
}

function deleteProduct() {
  if (!adminAuthed) return;
  if (!editingProductId) return;

  store.products = store.products.filter((product) => product.id !== editingProductId);
  api.saveCart(
    Object.fromEntries(
      Object.entries(api.getCart()).filter(([productId]) => productId !== editingProductId)
    )
  );
  api.saveWishlist(new Set([...api.getWishlist()].filter((productId) => productId !== editingProductId)));
  persistStore();
  editingProductId = null;
  renderAll();
  clearProductForm();
}

function updateOrderStatus(orderId, nextStatus) {
  if (!els.ordersTable) return;
  if (!adminAuthed) return;
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = nextStatus;
  persistStore();
  renderAll();
}

function unlockAdmin(email, password) {
  if (email === "admin@chennaieastgate.com" && password === "Eastgate@2026") {
    adminAuthed = true;
    api.saveAdminAuth({ authed: true, at: new Date().toISOString() });
    if (els.adminAuthStatus) {
      els.adminAuthStatus.textContent = "Admin access granted. Management controls are unlocked.";
    }
    setManagementEnabled(true);
    renderAll();
  } else {
    adminAuthed = false;
    api.clearAdminAuth();
    if (els.adminAuthStatus) {
      els.adminAuthStatus.textContent = "Invalid credentials. Try the provided admin login.";
    }
    setManagementEnabled(false);
  }
}

if (els.adminLoginForm) {
  els.adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    unlockAdmin(els.adminEmail.value.trim().toLowerCase(), els.adminPassword.value.trim());
  });
}

if (els.categoryForm) els.categoryForm.addEventListener("submit", saveCategory);
if (els.productForm) els.productForm.addEventListener("submit", saveProduct);
if (els.deleteCategoryButton) els.deleteCategoryButton.addEventListener("click", deleteCategory);
if (els.deleteProductButton) els.deleteProductButton.addEventListener("click", deleteProduct);

if (els.categorySelect) els.categorySelect.addEventListener("change", (event) => fillCategoryForm(event.target.value));
if (els.productSelect) {
  els.productSelect.addEventListener("change", (event) => {
    if (event.target.value === "new") clearProductForm();
    else fillProductForm(event.target.value);
  });
}

if (els.ordersTable) {
  els.ordersTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='update-order']");
    if (!button) return;
    const select = els.ordersTable.querySelector(`select[data-order-status="${button.dataset.id}"]`);
    if (select) updateOrderStatus(button.dataset.id, select.value);
  });
}

document.addEventListener("click", (event) => {
  const logoutLink = event.target.closest("a[data-action='logout']");
  if (!logoutLink) return;
  event.preventDefault();
  api.clearAdminAuth();
  window.location.href = "./admin-login.html";
});

window.addEventListener("storage", renderAll);
window.addEventListener("eastgate-sync", renderAll);

setManagementEnabled(false);
setManagementEnabled(adminAuthed);
renderAll();

if (document.body?.dataset?.view === "categories") {
  renderCategoryOptions();
  renderCategories();
}
