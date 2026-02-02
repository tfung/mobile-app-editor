/**
 * Client for calling the Configuration Service API
 * Uses service-to-service authentication with API key + HMAC signature
 */

import crypto from 'crypto';

const SERVICE_API_KEY = process.env.CONFIG_SERVICE_API_KEY || 'service-key-main-app-to-config-service';
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:3001';
const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || 'signature-secret-change-in-production';

/**
 * Generate HMAC signature for a request
 */
function generateSignature(method: string, path: string, body: string, timestamp: string): string {
  const payload = `${method}:${path}:${body}:${timestamp}`;
  return crypto
    .createHmac('sha256', SIGNATURE_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Handle API response and extract JSON or throw error
 */
async function handleResponse(response: Response, defaultError: string = 'Request failed') {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || defaultError);
    } catch (e) {
      if (e instanceof Error && e.message !== defaultError) {
        throw e;
      }
      throw new Error(`${defaultError}: ${response.statusText}`);
    }
  }
  return response.json();
}

/**
 * Call the Configuration Service API with service authentication + signature
 */
async function callConfigService(userId: string, path: string, options?: RequestInit) {
  const url = `${CONFIG_SERVICE_URL}${path}`;
  const method = options?.method || 'GET';
  const timestamp = Date.now().toString();

  // Get body for signature (empty string for GET/DELETE)
  let body = '';
  if (options?.body && typeof options.body === 'string') {
    body = options.body;
  }

  // Generate signature
  const signature = generateSignature(method, path, body, timestamp);

  // Add authentication and signature headers
  const headers = new Headers(options?.headers);
  headers.set('X-API-Key', SERVICE_API_KEY);
  headers.set('X-User-Id', userId);
  headers.set('X-Signature', signature);
  headers.set('X-Timestamp', timestamp);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Get all configurations for a user
 */
export async function getAllConfigsFromService(userId: string) {
  const response = await callConfigService(userId, '/api/configurations');

  if (!response.ok) {
    throw new Error(`Failed to fetch configurations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a configuration by ID
 */
export async function getConfigByIdFromService(userId: string, configId: string) {
  const response = await callConfigService(userId, `/api/configurations/${configId}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch configuration: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new configuration
 */
export async function createConfigInService(userId: string, data: unknown) {
  const body = JSON.stringify({ data });

  const response = await callConfigService(userId, '/api/configurations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  return handleResponse(response, 'Failed to create configuration');
}

/**
 * Update an existing configuration
 */
export async function updateConfigInService(userId: string, configId: string, data: unknown) {
  const body = JSON.stringify({ data });

  const response = await callConfigService(userId, `/api/configurations/${configId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  return handleResponse(response, 'Failed to update configuration');
}

/**
 * Delete a configuration
 */
export async function deleteConfigFromService(userId: string, configId: string) {
  const response = await callConfigService(userId, `/api/configurations/${configId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return false;
    }
    throw new Error(`Failed to delete configuration: ${response.statusText}`);
  }

  return true;
}
