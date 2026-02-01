import { getDb } from "./db.server";
import type { HomeScreenConfig, ConfigResponse } from "../mobile-app-editor/types";
import { randomUUID } from "crypto";

/**
 * Create a new configuration
 */
export function createConfig(
  userId: string,
  data: HomeScreenConfig
): ConfigResponse {
  const db = getDb();
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
 * Get configuration by ID
 */
export function getConfigById(id: string): ConfigResponse | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE id = ?
  `);

  const row = stmt.get(id) as {
    id: string;
    schema_version: number;
    updated_at: string;
    data: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    schemaVersion: row.schema_version,
    updatedAt: row.updated_at,
    data: JSON.parse(row.data),
  };
}

/**
 * Get the latest configuration for a user
 */
export function getLatestConfig(userId: string): ConfigResponse | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE created_by = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `);

  const row = stmt.get(userId) as {
    id: string;
    schema_version: number;
    updated_at: string;
    data: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    schemaVersion: row.schema_version,
    updatedAt: row.updated_at,
    data: JSON.parse(row.data),
  };
}

/**
 * Get all configurations for a user
 */
export function getAllConfigs(userId: string): ConfigResponse[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE created_by = ?
    ORDER BY updated_at DESC
  `);

  const rows = stmt.all(userId) as {
    id: string;
    schema_version: number;
    updated_at: string;
    data: string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    schemaVersion: row.schema_version,
    updatedAt: row.updated_at,
    data: JSON.parse(row.data),
  }));
}

/**
 * Update an existing configuration
 */
export function updateConfig(
  id: string,
  userId: string,
  data: HomeScreenConfig
): ConfigResponse {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE configurations
    SET data = ?, updated_at = ?, updated_by = ?
    WHERE id = ?
  `);

  const result = stmt.run(JSON.stringify(data), now, userId, id);

  if (result.changes === 0) {
    throw new Error("Configuration not found");
  }

  return {
    id,
    schemaVersion: 1,
    updatedAt: now,
    data,
  };
}

/**
 * Delete a configuration
 */
export function deleteConfig(id: string, userId: string): boolean {
  const db = getDb();

  const stmt = db.prepare(`
    DELETE FROM configurations
    WHERE id = ? AND created_by = ?
  `);

  const result = stmt.run(id, userId);
  return result.changes > 0;
}
