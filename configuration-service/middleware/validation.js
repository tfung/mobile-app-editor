/**
 * Validation middleware for HomeScreenConfig
 */

// Constants
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const VALID_ASPECT_RATIOS = ['portrait', 'landscape', 'square'];

/**
 * Helper to validate a field and return error message if invalid
 */
function validateField(condition, errorMessage) {
  return condition ? null : errorMessage;
}

/**
 * Validate hex color format
 */
function validateHexColor(color, fieldName) {
  if (!HEX_COLOR_REGEX.test(color)) {
    return `${fieldName} must be a valid hex color (e.g., #000000)`;
  }
  return null;
}

/**
 * Validate URL format
 */
function validateUrl(url, fieldName) {
  try {
    new URL(url);
    return null;
  } catch {
    return `${fieldName} has invalid URL format`;
  }
}

/**
 * Validate HomeScreenConfig structure and data types
 */
function validateConfig(data) {
  let error;

  error = validateField(
    typeof data === 'object' && data !== null,
    'Configuration must be an object'
  );
  if (error) return error;

  // Validate carousel
  error = validateField(
    data.carousel && typeof data.carousel === 'object',
    'Carousel section is required'
  );
  if (error) return error;

  error = validateField(
    Array.isArray(data.carousel.images) && data.carousel.images.length > 0,
    'At least one carousel image is required'
  );
  if (error) return error;

  // Validate each image
  for (let i = 0; i < data.carousel.images.length; i++) {
    const img = data.carousel.images[i];

    error = validateField(
      typeof img === 'object' && img !== null,
      `Image at index ${i} must be an object`
    );
    if (error) return error;

    error = validateField(
      typeof img.url === 'string' && typeof img.alt === 'string',
      `Image at index ${i} must have url and alt strings`
    );
    if (error) return error;

    error = validateUrl(img.url, `Image at index ${i}`);
    if (error) return error;
  }

  error = validateField(
    VALID_ASPECT_RATIOS.includes(data.carousel.aspectRatio),
    'Aspect ratio must be portrait, landscape, or square'
  );
  if (error) return error;

  // Validate textSection
  error = validateField(
    data.textSection && typeof data.textSection === 'object',
    'Text section is required'
  );
  if (error) return error;

  error = validateField(
    typeof data.textSection.title === 'string' && typeof data.textSection.description === 'string',
    'Text section must have title and description strings'
  );
  if (error) return error;

  error = validateField(
    typeof data.textSection.titleColor === 'string' && typeof data.textSection.descriptionColor === 'string',
    'Text section must have titleColor and descriptionColor strings'
  );
  if (error) return error;

  error = validateHexColor(data.textSection.titleColor, 'Title color');
  if (error) return error;

  error = validateHexColor(data.textSection.descriptionColor, 'Description color');
  if (error) return error;

  // Validate cta
  error = validateField(
    data.cta && typeof data.cta === 'object',
    'CTA section is required'
  );
  if (error) return error;

  error = validateField(
    typeof data.cta.label === 'string' && typeof data.cta.url === 'string',
    'CTA must have label and url strings'
  );
  if (error) return error;

  error = validateField(
    typeof data.cta.backgroundColor === 'string' && typeof data.cta.textColor === 'string',
    'CTA must have backgroundColor and textColor strings'
  );
  if (error) return error;

  error = validateUrl(data.cta.url, 'CTA URL');
  if (error) return error;

  error = validateHexColor(data.cta.backgroundColor, 'CTA background color');
  if (error) return error;

  error = validateHexColor(data.cta.textColor, 'CTA text color');
  if (error) return error;

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
