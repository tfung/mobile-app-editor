/**
 * Validation middleware for HomeScreenConfig
 */

/**
 * Validate HomeScreenConfig structure and data types
 */
function validateConfig(data) {
  if (typeof data !== 'object' || data === null) {
    return 'Configuration must be an object';
  }

  // Validate carousel
  if (!data.carousel || typeof data.carousel !== 'object') {
    return 'Carousel section is required';
  }

  if (!Array.isArray(data.carousel.images) || data.carousel.images.length === 0) {
    return 'At least one carousel image is required';
  }

  // Validate each image
  for (let i = 0; i < data.carousel.images.length; i++) {
    const img = data.carousel.images[i];
    if (typeof img !== 'object' || img === null) {
      return `Image at index ${i} must be an object`;
    }
    if (typeof img.url !== 'string' || typeof img.alt !== 'string') {
      return `Image at index ${i} must have url and alt strings`;
    }
    // Validate URL format
    try {
      new URL(img.url);
    } catch {
      return `Image at index ${i} has invalid URL format`;
    }
  }

  if (!['portrait', 'landscape', 'square'].includes(data.carousel.aspectRatio)) {
    return 'Aspect ratio must be portrait, landscape, or square';
  }

  // Validate textSection
  if (!data.textSection || typeof data.textSection !== 'object') {
    return 'Text section is required';
  }

  if (typeof data.textSection.title !== 'string' || typeof data.textSection.description !== 'string') {
    return 'Text section must have title and description strings';
  }

  if (typeof data.textSection.titleColor !== 'string' || typeof data.textSection.descriptionColor !== 'string') {
    return 'Text section must have titleColor and descriptionColor strings';
  }

  // Validate hex colors
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexColorRegex.test(data.textSection.titleColor)) {
    return 'Title color must be a valid hex color (e.g., #000000)';
  }
  if (!hexColorRegex.test(data.textSection.descriptionColor)) {
    return 'Description color must be a valid hex color (e.g., #666666)';
  }

  // Validate cta
  if (!data.cta || typeof data.cta !== 'object') {
    return 'CTA section is required';
  }

  if (typeof data.cta.label !== 'string' || typeof data.cta.url !== 'string') {
    return 'CTA must have label and url strings';
  }

  if (typeof data.cta.backgroundColor !== 'string' || typeof data.cta.textColor !== 'string') {
    return 'CTA must have backgroundColor and textColor strings';
  }

  // Validate URL format
  try {
    new URL(data.cta.url);
  } catch {
    return 'CTA URL has invalid format';
  }

  // Validate hex colors
  if (!hexColorRegex.test(data.cta.backgroundColor)) {
    return 'CTA background color must be a valid hex color';
  }
  if (!hexColorRegex.test(data.cta.textColor)) {
    return 'CTA text color must be a valid hex color';
  }

  return null; // Valid
}

/**
 * Middleware to validate configuration in request body
 */
function validateConfigMiddleware(req, res, next) {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Configuration data is required in request body',
    });
  }

  const error = validateConfig(data);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error,
    });
  }

  next();
}

module.exports = {
  validateConfig,
  validateConfigMiddleware,
};
