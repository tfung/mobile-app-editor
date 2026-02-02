import { describe, test, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { EditorProvider, useEditor } from '../mobile-app-editor/context/EditorContext';
import type { HomeScreenConfig } from '../mobile-app-editor/types';

// Test component that uses the context
function TestComponent() {
  const { config, updateTextSection, updateCarousel, updateCTA, setConfig } = useEditor();

  return (
    <div>
      <div data-testid="title">{config.textSection.title}</div>
      <div data-testid="description">{config.textSection.description}</div>
      <div data-testid="aspect-ratio">{config.carousel.aspectRatio}</div>
      <div data-testid="image-count">{config.carousel.images.length}</div>
      <div data-testid="cta-label">{config.cta.label}</div>

      <button onClick={() => updateTextSection({ title: 'Updated Title' })}>
        Update Title
      </button>
      <button onClick={() => updateCarousel({ aspectRatio: 'landscape' })}>
        Change Aspect Ratio
      </button>
      <button onClick={() => updateCTA({ label: 'New CTA' })}>
        Update CTA
      </button>
      <button
        onClick={() =>
          setConfig({
            carousel: {
              images: [{ url: 'https://new.com/image.jpg', alt: 'New' }],
              aspectRatio: 'square',
            },
            textSection: {
              title: 'New Title',
              description: 'New Description',
              titleColor: '#FF0000',
              descriptionColor: '#00FF00',
            },
            cta: {
              label: 'New',
              url: 'https://new.com',
              backgroundColor: '#0000FF',
              textColor: '#FFFFFF',
            },
          })
        }
      >
        Replace Config
      </button>
    </div>
  );
}

describe('EditorContext', () => {
  const defaultConfig: HomeScreenConfig = {
    carousel: {
      images: [
        { url: 'https://example.com/1.jpg', alt: 'Image 1' },
        { url: 'https://example.com/2.jpg', alt: 'Image 2' },
      ],
      aspectRatio: 'portrait',
    },
    textSection: {
      title: 'Test Title',
      description: 'Test Description',
      titleColor: '#000000',
      descriptionColor: '#666666',
    },
    cta: {
      label: 'Get Started',
      url: 'https://example.com',
      backgroundColor: '#007AFF',
      textColor: '#FFFFFF',
    },
  };

  test('provides initial config', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent('portrait');
    expect(screen.getByTestId('image-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cta-label')).toHaveTextContent('Get Started');
  });

  test('updates text section', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    act(() => {
      screen.getByText('Update Title').click();
    });

    expect(screen.getByTestId('title')).toHaveTextContent('Updated Title');
    // Other fields should remain unchanged
    expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
  });

  test('updates carousel', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    act(() => {
      screen.getByText('Change Aspect Ratio').click();
    });

    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent('landscape');
    // Images should remain unchanged
    expect(screen.getByTestId('image-count')).toHaveTextContent('2');
  });

  test('updates CTA', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    act(() => {
      screen.getByText('Update CTA').click();
    });

    expect(screen.getByTestId('cta-label')).toHaveTextContent('New CTA');
  });

  test('replaces entire config', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    act(() => {
      screen.getByText('Replace Config').click();
    });

    expect(screen.getByTestId('title')).toHaveTextContent('New Title');
    expect(screen.getByTestId('description')).toHaveTextContent('New Description');
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent('square');
    expect(screen.getByTestId('image-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cta-label')).toHaveTextContent('New');
  });

  test('partial updates preserve other fields', () => {
    render(
      <EditorProvider initialConfig={defaultConfig}>
        <TestComponent />
      </EditorProvider>
    );

    // Update only title
    act(() => {
      screen.getByText('Update Title').click();
    });

    // Verify title changed but description didn't
    expect(screen.getByTestId('title')).toHaveTextContent('Updated Title');
    expect(screen.getByTestId('description')).toHaveTextContent('Test Description');

    // Update carousel
    act(() => {
      screen.getByText('Change Aspect Ratio').click();
    });

    // Verify carousel changed but text section still has updated title
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent('landscape');
    expect(screen.getByTestId('title')).toHaveTextContent('Updated Title');
    expect(screen.getByTestId('image-count')).toHaveTextContent('2');
  });
});
