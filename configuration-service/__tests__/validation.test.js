const { validateConfig } = require('../middleware/validation');

describe('validateConfig', () => {
  const validConfig = {
    carousel: {
      images: [
        { url: 'https://example.com/image.jpg', alt: 'Test image' }
      ],
      aspectRatio: 'portrait'
    },
    textSection: {
      title: 'Test Title',
      description: 'Test description',
      titleColor: '#000000',
      descriptionColor: '#666666'
    },
    cta: {
      label: 'Get Started',
      url: 'https://example.com',
      backgroundColor: '#007AFF',
      textColor: '#FFFFFF'
    }
  };

  describe('Valid configurations', () => {
    test('should accept valid configuration', () => {
      const result = validateConfig(validConfig);
      expect(result).toBeNull();
    });

    test('should accept landscape aspect ratio', () => {
      const config = { ...validConfig, carousel: { ...validConfig.carousel, aspectRatio: 'landscape' } };
      expect(validateConfig(config)).toBeNull();
    });

    test('should accept square aspect ratio', () => {
      const config = { ...validConfig, carousel: { ...validConfig.carousel, aspectRatio: 'square' } };
      expect(validateConfig(config)).toBeNull();
    });

    test('should accept multiple images', () => {
      const config = {
        ...validConfig,
        carousel: {
          ...validConfig.carousel,
          images: [
            { url: 'https://example.com/1.jpg', alt: 'Image 1' },
            { url: 'https://example.com/2.jpg', alt: 'Image 2' },
            { url: 'https://example.com/3.jpg', alt: 'Image 3' }
          ]
        }
      };
      expect(validateConfig(config)).toBeNull();
    });
  });

  describe('Invalid configurations', () => {
    test('should reject null or non-object', () => {
      expect(validateConfig(null)).toMatch(/must be an object/);
      expect(validateConfig('string')).toMatch(/must be an object/);
      expect(validateConfig(123)).toMatch(/must be an object/);
    });

    test('should reject missing carousel', () => {
      const config = { ...validConfig };
      delete config.carousel;
      expect(validateConfig(config)).toMatch(/Carousel section is required/);
    });

    test('should reject empty images array', () => {
      const config = { ...validConfig, carousel: { ...validConfig.carousel, images: [] } };
      expect(validateConfig(config)).toMatch(/At least one carousel image is required/);
    });

    test('should reject invalid image URL', () => {
      const config = {
        ...validConfig,
        carousel: {
          ...validConfig.carousel,
          images: [{ url: 'not-a-valid-url', alt: 'Test' }]
        }
      };
      expect(validateConfig(config)).toMatch(/invalid URL format/);
    });

    test('should reject missing alt text', () => {
      const config = {
        ...validConfig,
        carousel: {
          ...validConfig.carousel,
          images: [{ url: 'https://example.com/image.jpg' }]
        }
      };
      expect(validateConfig(config)).toMatch(/must have url and alt strings/);
    });

    test('should reject invalid aspect ratio', () => {
      const config = { ...validConfig, carousel: { ...validConfig.carousel, aspectRatio: 'invalid' } };
      expect(validateConfig(config)).toMatch(/must be portrait, landscape, or square/);
    });

    test('should reject missing text section', () => {
      const config = { ...validConfig };
      delete config.textSection;
      expect(validateConfig(config)).toMatch(/Text section is required/);
    });

    test('should reject invalid title color format', () => {
      const config = { ...validConfig, textSection: { ...validConfig.textSection, titleColor: 'red' } };
      expect(validateConfig(config)).toMatch(/Title color must be a valid hex color/);
    });

    test('should reject invalid hex color (too short)', () => {
      const config = { ...validConfig, textSection: { ...validConfig.textSection, titleColor: '#FFF' } };
      expect(validateConfig(config)).toMatch(/Title color must be a valid hex color/);
    });

    test('should reject invalid hex color (missing #)', () => {
      const config = { ...validConfig, textSection: { ...validConfig.textSection, titleColor: '000000' } };
      expect(validateConfig(config)).toMatch(/Title color must be a valid hex color/);
    });

    test('should reject invalid description color', () => {
      const config = { ...validConfig, textSection: { ...validConfig.textSection, descriptionColor: '#GGG000' } };
      expect(validateConfig(config)).toMatch(/Description color must be a valid hex color/);
    });

    test('should reject missing CTA section', () => {
      const config = { ...validConfig };
      delete config.cta;
      expect(validateConfig(config)).toMatch(/CTA section is required/);
    });

    test('should reject invalid CTA URL', () => {
      const config = { ...validConfig, cta: { ...validConfig.cta, url: 'not a url' } };
      expect(validateConfig(config)).toMatch(/CTA URL has invalid format/);
    });

    test('should reject invalid CTA background color', () => {
      const config = { ...validConfig, cta: { ...validConfig.cta, backgroundColor: 'blue' } };
      expect(validateConfig(config)).toMatch(/CTA background color must be a valid hex color/);
    });

    test('should reject invalid CTA text color', () => {
      const config = { ...validConfig, cta: { ...validConfig.cta, textColor: '#12345' } };
      expect(validateConfig(config)).toMatch(/CTA text color must be a valid hex color/);
    });
  });

  describe('Edge cases', () => {
    test('should handle special characters in text fields', () => {
      const config = {
        ...validConfig,
        textSection: {
          ...validConfig.textSection,
          title: 'Title with émojis 🎉 and spëcial çharacters',
          description: 'Description with\nnewlines\nand\ttabs'
        }
      };
      expect(validateConfig(config)).toBeNull();
    });

    test('should handle long text fields', () => {
      const config = {
        ...validConfig,
        textSection: {
          ...validConfig.textSection,
          title: 'A'.repeat(1000),
          description: 'B'.repeat(10000)
        }
      };
      expect(validateConfig(config)).toBeNull();
    });

    test('should handle URLs with query parameters', () => {
      const config = {
        ...validConfig,
        carousel: {
          ...validConfig.carousel,
          images: [{ url: 'https://example.com/image.jpg?size=large&quality=high', alt: 'Test' }]
        }
      };
      expect(validateConfig(config)).toBeNull();
    });
  });
});
