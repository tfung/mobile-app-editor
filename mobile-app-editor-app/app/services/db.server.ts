import Database from "better-sqlite3";
import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";

let db: Database.Database | null = null;

/**
 * Get database instance (singleton)
 */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), "data", "app.db");

    // Ensure data directory exists
    const dataDir = dirname(dbPath);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL"); // Enable Write-Ahead Logging for better concurrency

    initializeDatabase(db);
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeDatabase(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS configurations (
      id TEXT PRIMARY KEY,
      schema_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      data TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_configurations_updated_at
      ON configurations(updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_configurations_created_by
      ON configurations(created_by);
  `);

  console.log("✅ Database initialized successfully");
}

/**
 * Close database connection
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Cleanup on process exit
process.on("exit", closeDb);
process.on("SIGINT", () => {
  closeDb();
  process.exit(0);
});
