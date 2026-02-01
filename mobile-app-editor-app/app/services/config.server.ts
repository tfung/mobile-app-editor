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
 * Requires userId to verify ownership
 */
export function getConfigById(id: string, userId: string): ConfigResponse | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT id, schema_version, updated_at, data
    FROM configurations
    WHERE id = ? AND created_by = ?
  `);

  const row = stmt.get(id, userId) as {
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
 * Verifies ownership before updating
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
    WHERE id = ? AND created_by = ?
  `);

  const result = stmt.run(JSON.stringify(data), now, userId, id, userId);

  if (result.changes === 0) {
    throw new Error("Configuration not found or access denied");
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

/**
 * Validate HomeScreenConfig structure and data types
 */
export function validateConfig(data: unknown): data is HomeScreenConfig {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const config = data as Record<string, unknown>;

  // Validate carousel
  if (!config.carousel || typeof config.carousel !== "object") {
    return false;
  }
  const carousel = config.carousel as Record<string, unknown>;

  if (!Array.isArray(carousel.images) || carousel.images.length === 0) {
    return false;
  }

  // Validate each image
  for (const img of carousel.images) {
    if (typeof img !== "object" || img === null) return false;
    const image = img as Record<string, unknown>;
    if (typeof image.url !== "string" || typeof image.alt !== "string") {
      return false;
    }
    // Validate URL format
    try {
      new URL(image.url);
    } catch {
      return false;
    }
  }

  if (!["portrait", "landscape", "square"].includes(carousel.aspectRatio as string)) {
    return false;
  }

  // Validate textSection
  if (!config.textSection || typeof config.textSection !== "object") {
    return false;
  }
  const textSection = config.textSection as Record<string, unknown>;

  if (typeof textSection.title !== "string" || typeof textSection.description !== "string") {
    return false;
  }
  if (typeof textSection.titleColor !== "string" || typeof textSection.descriptionColor !== "string") {
    return false;
  }

  // Validate hex colors
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexColorRegex.test(textSection.titleColor as string) ||
      !hexColorRegex.test(textSection.descriptionColor as string)) {
    return false;
  }

  // Validate cta
  if (!config.cta || typeof config.cta !== "object") {
    return false;
  }
  const cta = config.cta as Record<string, unknown>;

  if (typeof cta.label !== "string" || typeof cta.url !== "string") {
    return false;
  }
  if (typeof cta.backgroundColor !== "string" || typeof cta.textColor !== "string") {
    return false;
  }

  // Validate URL format
  try {
    new URL(cta.url as string);
  } catch {
    return false;
  }

  // Validate hex colors
  if (!hexColorRegex.test(cta.backgroundColor as string) ||
      !hexColorRegex.test(cta.textColor as string)) {
    return false;
  }

  return true;
}
