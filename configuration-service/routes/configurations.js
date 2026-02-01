const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateConfigMiddleware } = require('../middleware/validation');
const {
  getAllConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
} = require('../db');

/**
 * GET /api/configurations
 * List all configurations for the authenticated user
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const configs = getAllConfigs(req.userId);
    res.json(configs);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch configurations',
    });
  }
});

/**
 * GET /api/configurations/:id
 * Get a specific configuration by ID
 */
router.get('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const config = getConfigById(id, req.userId);

    if (!config) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Configuration not found',
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch configuration',
    });
  }
});

/**
 * POST /api/configurations
 * Create a new configuration
 */
router.post('/', requireAuth, validateConfigMiddleware, (req, res) => {
  try {
    const { data } = req.body;
    const config = createConfig(req.userId, data);

    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating configuration:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create configuration',
    });
  }
});

/**
 * PUT /api/configurations/:id
 * Update an existing configuration
 */
router.put('/:id', requireAuth, validateConfigMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const config = updateConfig(id, req.userId, data);

    res.json(config);
  } catch (error) {
    console.error('Error updating configuration:', error);

    if (error.message.includes('not found or access denied')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Configuration not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update configuration',
    });
  }
});

/**
 * DELETE /api/configurations/:id
 * Delete a configuration
 */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteConfig(id, req.userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Configuration not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete configuration',
    });
  }
});

module.exports = router;
