const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

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

function seedSnapshot() {
  return {
    store: seedStore(),
    cart: {
      "prd-001": 1,
      "prd-003": 1,
    },
    wishlist: ["prd-005", "prd-008"],
    session: null,
    adminAuth: null,
  };
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATE_FILE);
  } catch {
    await fs.writeFile(STATE_FILE, JSON.stringify(seedSnapshot(), null, 2), "utf8");
  }
}

async function readSnapshot() {
  await ensureDataFile();
  const raw = await fs.readFile(STATE_FILE, "utf8");
  try {
    const snapshot = JSON.parse(raw);
    return { ...seedSnapshot(), ...snapshot, store: snapshot.store || seedStore() };
  } catch {
    const snapshot = seedSnapshot();
    await fs.writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), "utf8");
    return snapshot;
  }
}

async function writeSnapshot(snapshot) {
  await ensureDataFile();
  const nextSnapshot = {
    ...seedSnapshot(),
    ...snapshot,
    store: snapshot.store || seedStore(),
  };
  await fs.writeFile(STATE_FILE, JSON.stringify(nextSnapshot, null, 2), "utf8");
  return nextSnapshot;
}

app.use(express.json({ limit: "10mb" }));
app.use(express.static(ROOT, { extensions: ["html"] }));

app.get("/api/bootstrap", async (_req, res) => {
  try {
    const snapshot = await readSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: "Unable to read snapshot" });
  }
});

app.put("/api/bootstrap", async (req, res) => {
  try {
    const snapshot = await writeSnapshot(req.body || {});
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: "Unable to save snapshot" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

ensureDataFile().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chennai Eastgate running on http://localhost:${PORT}`);
  });
});
