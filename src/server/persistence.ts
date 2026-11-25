import fs from 'fs';
import { neon } from '@neondatabase/serverless';

type JsonRecord = Record<string, any>;

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl(): string {
  return String(process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!sqlClient) sqlClient = neon(databaseUrl);
  return sqlClient;
}

async function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS lkhoa_orders (
          order_code TEXT PRIMARY KEY,
          idempotency_key TEXT UNIQUE,
          order_data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS lkhoa_orders_created_at_idx
        ON lkhoa_orders (created_at DESC)
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS lkhoa_connector_config (
          provider TEXT PRIMARY KEY,
          config_data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

function requireDurableStorageOnServerless(): void {
  if ((process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME) && !getDatabaseUrl()) {
    throw new Error('DATABASE_URL chưa được cấu hình. Hệ thống từ chối lưu đơn tạm để tránh mất dữ liệu.');
  }
}

export async function loadOrders(localPath: string): Promise<JsonRecord[]> {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    const rows = await sql`
      SELECT order_data
      FROM lkhoa_orders
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return rows.map((row: any) => row.order_data).filter(Boolean);
  }

  requireDurableStorageOnServerless();
  try {
    if (!fs.existsSync(localPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveOrders(localPath: string, orders: JsonRecord[]): Promise<void> {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    for (const order of orders.slice(0, 500)) {
      const orderCode = String(order?.orderCode || '').trim();
      if (!orderCode) continue;
      const idempotencyKey = String(order?.idempotencyKey || '').trim() || null;
      const createdAt = String(order?.createdAt || '').trim() || new Date().toISOString();
      const updatedAt = String(order?.updatedAt || order?.createdAt || '').trim() || new Date().toISOString();
      await sql`
        INSERT INTO lkhoa_orders (order_code, idempotency_key, order_data, created_at, updated_at)
        VALUES (
          ${orderCode},
          ${idempotencyKey},
          ${JSON.stringify(order)}::jsonb,
          ${createdAt}::timestamptz,
          ${updatedAt}::timestamptz
        )
        ON CONFLICT (order_code) DO UPDATE SET
          idempotency_key = EXCLUDED.idempotency_key,
          order_data = EXCLUDED.order_data,
          updated_at = EXCLUDED.updated_at
      `;
    }
    return;
  }

  requireDurableStorageOnServerless();
  fs.writeFileSync(localPath, JSON.stringify(orders.slice(0, 500), null, 2), 'utf-8');
}

export async function loadConnectorConfigs(localPath: string): Promise<Record<string, JsonRecord>> {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    const rows = await sql`
      SELECT provider, config_data
      FROM lkhoa_connector_config
    `;
    return Object.fromEntries(rows.map((row: any) => [row.provider, row.config_data || {}]));
  }

  requireDurableStorageOnServerless();
  try {
    if (!fs.existsSync(localPath)) return {};
    const parsed = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveConnectorConfigs(localPath: string, configs: Record<string, JsonRecord>): Promise<void> {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    for (const [provider, config] of Object.entries(configs)) {
      await sql`
        INSERT INTO lkhoa_connector_config (provider, config_data, updated_at)
        VALUES (${provider}, ${JSON.stringify(config || {})}::jsonb, NOW())
        ON CONFLICT (provider) DO UPDATE SET
          config_data = EXCLUDED.config_data,
          updated_at = NOW()
      `;
    }
    return;
  }

  requireDurableStorageOnServerless();
  fs.writeFileSync(localPath, JSON.stringify(configs, null, 2), 'utf-8');
}

export async function getPersistenceHealth(): Promise<{
  configured: boolean;
  provider: 'neon-postgres' | 'local-file';
}> {
  const configured = Boolean(getDatabaseUrl());
  if (configured) await ensureSchema();
  return { configured, provider: configured ? 'neon-postgres' : 'local-file' };
}
