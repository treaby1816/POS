-- ═══════════════════════════════════════════════════════════════
-- TREABYN POS — INITIAL DATABASE SCHEMA
-- Run this migration against your Supabase PostgreSQL instance
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- TENANTS (businesses using Treabyn)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                              -- "FreshMart Abuja"
  owner_name    TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT NOT NULL,
  business_type TEXT DEFAULT 'retail',                      -- retail / supermarket / enterprise
  country       TEXT DEFAULT 'NG',
  state         TEXT,
  city          TEXT,
  plan          TEXT DEFAULT 'starter',                     -- starter / business / enterprise
  status        TEXT DEFAULT 'trial',                       -- trial / active / suspended / expired
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- LICENSES (one per tenant, tied to their plan)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE licenses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID REFERENCES tenants(id) ON DELETE CASCADE,
  license_key          TEXT UNIQUE NOT NULL,                 -- "TRB-XXXX-XXXX-XXXX-XXXX"
  key_hash             TEXT NOT NULL,                        -- HMAC-SHA256 hash for validation
  plan                 TEXT NOT NULL,                        -- starter / business / enterprise
  max_stores           INT DEFAULT 1,
  max_devices          INT DEFAULT 2,
  max_cashiers         INT DEFAULT 3,
  activated_at         TIMESTAMPTZ,
  expires_at           TIMESTAMPTZ,                          -- NULL = lifetime license
  last_seen_at         TIMESTAMPTZ,
  device_fingerprints  JSONB DEFAULT '[]',                   -- registered device IDs
  is_active            BOOLEAN DEFAULT true,
  revoked_at           TIMESTAMPTZ,
  revoke_reason        TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS (payment tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID REFERENCES tenants(id),
  license_id            UUID REFERENCES licenses(id),
  paystack_ref          TEXT UNIQUE,                          -- Paystack transaction reference
  paystack_sub_code     TEXT,                                 -- For recurring subscriptions
  plan                  TEXT NOT NULL,
  amount_ngn            INT NOT NULL,                         -- Amount in kobo (÷100 = ₦)
  billing_cycle         TEXT DEFAULT 'monthly',               -- monthly / yearly / lifetime
  status                TEXT DEFAULT 'pending',               -- pending / active / cancelled / failed
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- STORES (each tenant can have multiple stores)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT,
  city       TEXT,
  state      TEXT,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id) ON DELETE CASCADE,
  store_id       UUID REFERENCES stores(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  barcode        TEXT,
  selling_price  DECIMAL(12,2) NOT NULL,
  cost_price     DECIMAL(12,2) DEFAULT 0,
  stock_qty      INT DEFAULT 0,
  low_stock_at   INT DEFAULT 10,
  category       TEXT DEFAULT 'General',
  supplier       TEXT,
  image_url      TEXT,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SALES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  store_id        UUID REFERENCES stores(id) ON DELETE SET NULL,
  receipt_no      TEXT UNIQUE NOT NULL,                      -- TRB-{STORE}-{DATE}-{SEQ}
  cashier_id      UUID,
  payment_method  TEXT DEFAULT 'cash',                       -- cash / card / transfer
  subtotal        DECIMAL(12,2) NOT NULL,
  discount        DECIMAL(12,2) DEFAULT 0,
  vat_amount      DECIMAL(12,2) DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL,
  status          TEXT DEFAULT 'completed',                  -- completed / cancelled / refunded
  synced          BOOLEAN DEFAULT false,                     -- offline sync flag
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SALE ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sale_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id       UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  qty           INT NOT NULL,
  unit_price    DECIMAL(12,2) NOT NULL,
  total_price   DECIMAL(12,2) NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- TENANT USERS (cashiers / managers per tenant)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE tenant_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  store_id    UUID REFERENCES stores(id) ON DELETE SET NULL,
  auth_id     UUID,                                          -- Supabase auth user ID
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT DEFAULT 'cashier',                        -- owner / admin / manager / cashier
  pin         TEXT,                                          -- 4-digit POS PIN (hashed)
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID,
  action      TEXT NOT NULL,
  resource    TEXT,
  details     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_licenses_tenant       ON licenses(tenant_id);
CREATE INDEX idx_licenses_key          ON licenses(license_key);
CREATE INDEX idx_subscriptions_tenant  ON subscriptions(tenant_id);
CREATE INDEX idx_stores_tenant         ON stores(tenant_id);
CREATE INDEX idx_products_tenant       ON products(tenant_id);
CREATE INDEX idx_products_store        ON products(store_id);
CREATE INDEX idx_products_barcode      ON products(barcode);
CREATE INDEX idx_sales_tenant          ON sales(tenant_id);
CREATE INDEX idx_sales_store           ON sales(store_id);
CREATE INDEX idx_sales_receipt         ON sales(receipt_no);
CREATE INDEX idx_sales_created         ON sales(created_at DESC);
CREATE INDEX idx_sale_items_sale       ON sale_items(sale_id);
CREATE INDEX idx_tenant_users_tenant   ON tenant_users(tenant_id);
CREATE INDEX idx_audit_logs_tenant     ON audit_logs(tenant_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE tenants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: users can only access their own tenant's data
-- (These policies assume auth.uid() maps to tenant_users.auth_id)

CREATE POLICY "Tenants: owner access"
  ON tenants FOR ALL
  USING (id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Licenses: tenant access"
  ON licenses FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Subscriptions: tenant access"
  ON subscriptions FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Stores: tenant access"
  ON stores FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Products: tenant access"
  ON products FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Sales: tenant access"
  ON sales FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Sale items: via sale"
  ON sale_items FOR ALL
  USING (sale_id IN (SELECT id FROM sales WHERE tenant_id IN
    (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid())));

CREATE POLICY "Tenant users: tenant access"
  ON tenant_users FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

CREATE POLICY "Audit logs: tenant access"
  ON audit_logs FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE auth_id = auth.uid()));

-- Service role bypass (for edge functions / admin)
-- The service role key bypasses RLS by default in Supabase.

-- ═══════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
