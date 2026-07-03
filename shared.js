(function (global) {
  const STORE_KEY = "eastgate-commerce-store-v3";
  const CART_KEY = "eastgate-cart-v3";
  const WISHLIST_KEY = "eastgate-wishlist-v3";
  const SESSION_KEY = "eastgate-session-v3";
  const ADMIN_SESSION_KEY = "eastgate-admin-session-v3";
  const BOOTSTRAP_URL = "/api/bootstrap";
  const SYNC_EVENT = "eastgate-sync";
  let syncTimer = null;
  let syncInFlight = false;
  let syncPending = false;

  const CATEGORY_BLUEPRINTS = [
    {
      id: "cat-kitchenware",
      name: "Kitchenware",
      description: "Cookware, serveware, and utility essentials.",
      sortOrder: 1,
      active: true,
    },
    {
      id: "cat-electronics",
      name: "Electronics",
      description: "Practical gadgets and accessories for home and office.",
      sortOrder: 2,
      active: true,
    },
    {
      id: "cat-artifacts",
      name: "Artifacts",
      description: "Decorative and giftable heritage-inspired pieces.",
      sortOrder: 3,
      active: true,
    },
  ];

  const PRODUCT_BLUEPRINTS = [
    {
      id: "prd-001",
      categoryId: "cat-kitchenware",
      name: "Sleek Steel Cook Set",
      brand: "Eastgate Home",
      subcategory: "Cookware",
      price: 3499,
      stock: 14,
      badge: "Bestseller",
      swatch: "linear-gradient(135deg, #f9f9f9, #d9d9d9)",
      description: "A durable six-piece cooking set built for daily Indian kitchen use.",
      specs: ["Stainless steel", "Induction ready", "Easy clean"],
      rating: 4.8,
      active: true,
      featured: true,
    },
    {
      id: "prd-002",
      categoryId: "cat-kitchenware",
      name: "Premium Serveware Tray",
      brand: "Eastgate Select",
      subcategory: "Serveware",
      price: 1899,
      stock: 22,
      badge: "New",
      swatch: "linear-gradient(135deg, #f4f4f4, #ece2cf)",
      description: "A polished tray for festive serving and elegant gifting moments.",
      specs: ["Mirror finish", "Gift box", "Hand wash"],
      rating: 4.5,
      active: true,
      featured: true,
    },
    {
      id: "prd-003",
      categoryId: "cat-electronics",
      name: "Smart Desk Lamp",
      brand: "Eastgate Tech",
      subcategory: "Lighting",
      price: 2499,
      stock: 9,
      badge: "Featured",
      swatch: "linear-gradient(135deg, #f1f4f7, #dbe3eb)",
      description: "A compact smart lamp with touch control and warm-to-cool brightness tuning.",
      specs: ["Touch dimmer", "USB powered", "Eye comfort"],
      rating: 4.7,
      active: true,
      featured: true,
    },
    {
      id: "prd-004",
      categoryId: "cat-electronics",
      name: "Portable Speaker",
      brand: "Eastgate Sound",
      subcategory: "Audio",
      price: 3999,
      stock: 11,
      badge: "Trending",
      swatch: "linear-gradient(135deg, #f2f2f2, #dadada)",
      description: "A compact Bluetooth speaker with strong bass and long battery life.",
      specs: ["Bluetooth 5.3", "12h battery", "TWS support"],
      rating: 4.6,
      active: true,
      featured: true,
    },
    {
      id: "prd-005",
      categoryId: "cat-artifacts",
      name: "Brass Elephant Decor",
      brand: "Eastgate Art",
      subcategory: "Decor",
      price: 2799,
      stock: 6,
      badge: "Curated",
      swatch: "linear-gradient(135deg, #f4efe7, #d9c29d)",
      description: "A handcrafted accent piece that adds a rich traditional note to interiors.",
      specs: ["Hand-finished", "Brass alloy", "Display piece"],
      rating: 4.9,
      active: true,
      featured: true,
    },
    {
      id: "prd-006",
      categoryId: "cat-artifacts",
      name: "Temple Bell Set",
      brand: "Eastgate Art",
      subcategory: "Gifting",
      price: 1599,
      stock: 18,
      badge: "Giftable",
      swatch: "linear-gradient(135deg, #efe8dd, #d9c4a0)",
      description: "A tasteful set for home shrines, gifting, and decorative interiors.",
      specs: ["Twin bells", "Gift-ready", "Decorative"],
      rating: 4.4,
      active: true,
      featured: true,
    },
    {
      id: "prd-007",
      categoryId: "cat-kitchenware",
      name: "Utility Knife Block",
      brand: "Eastgate Pro",
      subcategory: "Tools",
      price: 1299,
      stock: 27,
      badge: "Essential",
      swatch: "linear-gradient(135deg, #f7f7f7, #d9d9d9)",
      description: "A compact knife block set for efficient prep and safe storage.",
      specs: ["6 pieces", "Anti-slip base", "Compact"],
      rating: 4.3,
      active: true,
      featured: false,
    },
    {
      id: "prd-008",
      categoryId: "cat-electronics",
      name: "Multiport Charger",
      brand: "Eastgate Tech",
      subcategory: "Accessories",
      price: 2199,
      stock: 15,
      badge: "Fast charge",
      swatch: "linear-gradient(135deg, #ededed, #d8dfe8)",
      description: "A tidy charging hub for everyday devices, desk setups, and travel bags.",
      specs: ["65W output", "USB-C", "Safety rated"],
      rating: 4.5,
      active: true,
      featured: false,
    },
  ];

  const ORDER_BLUEPRINTS = [
    {
      id: "EG-10421",
      receiptNo: "RCPT-5001",
      trackingNo: "TRK-9001",
      customerName: "Jayaraj Yowan",
      email: "customer@chennaieastgate.com",
      phone: "+91 90000 12345",
      address: "Chennai, Tamil Nadu",
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      status: "Processing",
      subtotal: 2499,
      shipping: 0,
      total: 2499,
      createdAt: new Date().toISOString(),
      items: [{ productId: "prd-003", name: "Smart Desk Lamp", qty: 1, price: 2499 }],
    },
    {
      id: "EG-10405",
      receiptNo: "RCPT-5002",
      trackingNo: "TRK-9002",
      customerName: "Anitha R",
      email: "anitha@example.com",
      phone: "+91 98765 43210",
      address: "Chennai, Tamil Nadu",
      paymentMethod: "Stripe",
      paymentStatus: "Paid",
      status: "Shipped",
      subtotal: 2799,
      shipping: 0,
      total: 2799,
      createdAt: new Date().toISOString(),
      items: [{ productId: "prd-005", name: "Brass Elephant Decor", qty: 1, price: 2799 }],
    },
    {
      id: "EG-10388",
      receiptNo: "RCPT-5003",
      trackingNo: "TRK-9003",
      customerName: "Rajesh K",
      email: "rajesh@example.com",
      phone: "+91 91234 56789",
      address: "Chennai, Tamil Nadu",
      paymentMethod: "PayPal",
      paymentStatus: "Paid",
      status: "Delivered",
      subtotal: 3499,
      shipping: 0,
      total: 3499,
      createdAt: new Date().toISOString(),
      items: [{ productId: "prd-001", name: "Sleek Steel Cook Set", qty: 1, price: 3499 }],
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isValidStore(store) {
    return store && Array.isArray(store.categories) && Array.isArray(store.products) && Array.isArray(store.orders);
  }

  function seedStore() {
    return {
      version: 3,
      counters: {
        category: 4,
        product: 9,
        order: 10422,
        receipt: 5004,
        tracking: 9004,
      },
      categories: clone(CATEGORY_BLUEPRINTS),
      products: clone(PRODUCT_BLUEPRINTS),
      orders: clone(ORDER_BLUEPRINTS),
    };
  }

  function normalizeStore(store) {
    const base = seedStore();
    if (!isValidStore(store)) return base;
    return {
      version: 3,
      counters: {
        category: store.counters?.category || base.counters.category,
        product: store.counters?.product || base.counters.product,
        order: store.counters?.order || base.counters.order,
        receipt: store.counters?.receipt || base.counters.receipt,
        tracking: store.counters?.tracking || base.counters.tracking,
      },
      categories: store.categories.length ? store.categories : base.categories,
      products: store.products.length ? store.products : base.products,
      orders: store.orders.length ? store.orders : base.orders,
    };
  }

  function getStore() {
    const current = readJSON(STORE_KEY, null);
    if (!current) {
      const seeded = seedStore();
      saveStore(seeded);
      return clone(seeded);
    }
    return normalizeStore(current);
  }

  function saveStore(store) {
    writeJSON(STORE_KEY, store);
    queueSync();
  }

  function getCart() {
    return readJSON(CART_KEY, {
      "prd-001": 1,
      "prd-003": 1,
    });
  }

  function saveCart(cart) {
    writeJSON(CART_KEY, cart);
    queueSync();
  }

  function getWishlist() {
    return new Set(readJSON(WISHLIST_KEY, ["prd-005", "prd-008"]));
  }

  function saveWishlist(wishlist) {
    writeJSON(WISHLIST_KEY, [...wishlist]);
    queueSync();
  }

  function getSession() {
    return readJSON(SESSION_KEY, null);
  }

  function saveSession(session) {
    writeJSON(SESSION_KEY, session);
    queueSync();
  }

  function getAdminAuth() {
    return readJSON(ADMIN_SESSION_KEY, null);
  }

  function saveAdminAuth(session) {
    writeJSON(ADMIN_SESSION_KEY, session);
    queueSync();
  }

  function clearAdminAuth() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    queueSync();
  }

  function formatPrice(value) {
    return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0)}`;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function nextId(prefix, currentCount) {
    return `${prefix}-${String(currentCount).padStart(3, "0")}`;
  }

  function createTrackingNo(store) {
    const next = store.counters.tracking++;
    return `TRK-${next}`;
  }

  function createReceiptNo(store) {
    const next = store.counters.receipt++;
    return `RCPT-${next}`;
  }

  function createOrderNo(store) {
    const next = store.counters.order++;
    return `EG-${next}`;
  }

  function resolveCategoryName(store, categoryId) {
    const category = store.categories.find((item) => item.id === categoryId);
    return category ? category.name : "Uncategorized";
  }

  function exportImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
    });
  }

  function collectSnapshot() {
    return {
      store: readJSON(STORE_KEY, seedStore()),
      cart: readJSON(CART_KEY, {}),
      wishlist: readJSON(WISHLIST_KEY, []),
      session: readJSON(SESSION_KEY, null),
      adminAuth: readJSON(ADMIN_SESSION_KEY, null),
    };
  }

  function applySnapshot(snapshot) {
    if (!snapshot) return;
    if (snapshot.store) writeJSON(STORE_KEY, normalizeStore(snapshot.store));
    if (snapshot.cart) writeJSON(CART_KEY, snapshot.cart);
    if (snapshot.wishlist) writeJSON(WISHLIST_KEY, snapshot.wishlist);
    if (snapshot.session !== undefined) writeJSON(SESSION_KEY, snapshot.session);
    if (snapshot.adminAuth !== undefined) {
      if (snapshot.adminAuth) writeJSON(ADMIN_SESSION_KEY, snapshot.adminAuth);
      else localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    global.dispatchEvent(new Event(SYNC_EVENT));
  }

  async function pullRemoteState() {
    try {
      const response = await fetch(BOOTSTRAP_URL, { cache: "no-store" });
      if (!response.ok) return;
      const snapshot = await response.json();
      applySnapshot(snapshot);
    } catch {
      // Offline or backend unavailable. Local cache remains authoritative.
    }
  }

  async function pushRemoteState() {
    if (syncInFlight) return;
    syncInFlight = true;
    try {
      await fetch(BOOTSTRAP_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectSnapshot()),
      });
    } catch {
      // Best effort sync only.
    } finally {
      syncInFlight = false;
      if (syncPending) {
        syncPending = false;
        queueSync();
      }
    }
  }

  function queueSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (syncInFlight) {
        syncPending = true;
        return;
      }
      pushRemoteState();
    }, 150);
  }

  global.addEventListener("focus", pullRemoteState);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) pullRemoteState();
  });
  setInterval(pullRemoteState, 30000);
  pullRemoteState();

  global.EastgateStore = {
    STORE_KEY,
    CART_KEY,
    WISHLIST_KEY,
    SESSION_KEY,
    seedStore,
    getStore,
    saveStore,
    getCart,
    saveCart,
    getWishlist,
    saveWishlist,
    getSession,
    saveSession,
    getAdminAuth,
    saveAdminAuth,
    clearAdminAuth,
    readJSON,
    writeJSON,
    formatPrice,
    slugify,
    nextId,
    createOrderNo,
    createReceiptNo,
    createTrackingNo,
    resolveCategoryName,
    exportImage,
    pullRemoteState,
    pushRemoteState,
  };
})(window);
