const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

async function initDatabase() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'treabyn.db');

  // Load existing or create new
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS local_license (
      key TEXT PRIMARY KEY,
      plan TEXT,
      expires_at TEXT,
      tenant_name TEXT,
      max_stores INTEGER DEFAULT 1,
      max_devices INTEGER DEFAULT 2,
      max_cashiers INTEGER DEFAULT 3,
      cached_at INTEGER
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op TEXT NOT NULL,
      table_name TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS local_products (
      id TEXT PRIMARY KEY, tenant_id TEXT, store_id TEXT, name TEXT, barcode TEXT,
      selling_price REAL, cost_price REAL, stock_qty INTEGER, low_stock_at INTEGER,
      category TEXT, supplier TEXT, image_url TEXT, is_active INTEGER DEFAULT 1,
      created_at TEXT, updated_at TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS local_sales (
      id TEXT PRIMARY KEY, tenant_id TEXT, store_id TEXT, receipt_no TEXT UNIQUE,
      cashier_id TEXT, payment_method TEXT, subtotal REAL, discount REAL,
      vat_amount REAL, total REAL, status TEXT DEFAULT 'completed',
      synced INTEGER DEFAULT 0, created_at TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS local_sale_items (
      id TEXT PRIMARY KEY, sale_id TEXT, product_id TEXT, product_name TEXT,
      qty INTEGER, unit_price REAL, total_price REAL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS local_settings (
      key TEXT PRIMARY KEY, value TEXT
    )
  `);

  // Auto-save to disk periodically
  setInterval(() => saveDatabase(), 30000);

  return db;
}

function saveDatabase() {
  if (!db) return;
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'treabyn.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('DB save error:', err);
  }
}

function getDb() { return db; }

// Save on app quit
if (app) {
  app.on('before-quit', () => saveDatabase());
}

module.exports = { initDatabase, getDb, saveDatabase };
