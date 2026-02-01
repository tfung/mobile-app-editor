const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

// Initialize SQLite database in data directory
const dbPath = path.join(__dirname, 'data', 'configurations.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create configurations table
db.exec(`
  CREATE TABLE IF NOT EXISTS configurations (
    id TEXT PRIMARY KEY,
    schema_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    data TEXT NOT NULL
  )
`);

console.log('✅ Database initialized at:', dbPath);

/**
 * Get all configurations for a user
 */
function getAllConfigs(userId) {
  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE created_by = ?
    ORDER BY updated_at DESC
  `);

  const rows = stmt.all(userId);

  return rows.map((row) => ({
    id: row.id,
    schemaVersion: row.schema_version,
    updatedAt: row.updated_at,
    data: JSON.parse(row.data),
  }));
}

/**
 * Get configuration by ID (with user verification)
 */
function getConfigById(id, userId) {
  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE id = ? AND created_by = ?
  `);

  const row = stmt.get(id, userId);

  if (!row) return null;

  return {
    id: row.id,
    schemaVersion: row.schema_version,
    updatedAt: row.updated_at,
    data: JSON.parse(row.data),
  };
}

/**
 * Create a new configuration
 */
function createConfig(userId, data) {
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO configurations (id, schema_version, created_at, updated_at, created_by, updated_by, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, 1, now, now, userId, userId, JSON.stringify(data));

  return {
    id,
    schemaVersion: 1,
    updatedAt: now,
    data,
  };
}

/**
 * Update an existing configuration (with ownership verification)
 */
function updateConfig(id, userId, data) {
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE configurations
    SET data = ?, updated_at = ?, updated_by = ?
    WHERE id = ? AND created_by = ?
  `);

  const result = stmt.run(JSON.stringify(data), now, userId, id, userId);

  if (result.changes === 0) {
    throw new Error('Configuration not found or access denied');
  }

  return {
    id,
    schemaVersion: 1,
    updatedAt: now,
    data,
  };
}

/**
 * Delete a configuration (with ownership verification)
 */
function deleteConfig(id, userId) {
  const stmt = db.prepare(`
    DELETE FROM configurations
    WHERE id = ? AND created_by = ?
  `);

  const result = stmt.run(id, userId);
  return result.changes > 0;
}

module.exports = {
  getAllConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
};
