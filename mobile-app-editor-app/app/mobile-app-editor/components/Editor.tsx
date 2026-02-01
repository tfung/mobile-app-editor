import { useFetcher } from 'react-router';
import { useEditor } from '../context/EditorContext';
import { useEffect, useState, useRef } from 'react';
import type { HomeScreenConfig } from '../types';

export function Editor() {
  const { config, setConfig, updateTextSection, updateCTA, updateCarousel } = useEditor();
  const fetcher = useFetcher();
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClasses = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200";

  const handleSave = () => {
    const formData = new FormData();
    formData.append('config', JSON.stringify(config));
    fetcher.submit(formData, { method: 'post' });
  };

  const handleExport = () => {
    const exportData = {
      carousel: config.carousel,
      textSection: config.textSection,
      cta: config.cta,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateConfig = (data: unknown): data is HomeScreenConfig => {
    if (typeof data !== 'object' || data === null) return false;

    const config = data as Record<string, unknown>;

    // Validate carousel
    if (!config.carousel || typeof config.carousel !== 'object') return false;
    const carousel = config.carousel as Record<string, unknown>;
    if (!Array.isArray(carousel.images)) return false;
    if (!['portrait', 'landscape', 'square'].includes(carousel.aspectRatio as string)) return false;

    // Validate textSection
    if (!config.textSection || typeof config.textSection !== 'object') return false;
    const textSection = config.textSection as Record<string, unknown>;
    if (typeof textSection.title !== 'string' || typeof textSection.description !== 'string') return false;
    if (typeof textSection.titleColor !== 'string' || typeof textSection.descriptionColor !== 'string') return false;

    // Validate cta
    if (!config.cta || typeof config.cta !== 'object') return false;
    const cta = config.cta as Record<string, unknown>;
    if (typeof cta.label !== 'string' || typeof cta.url !== 'string') return false;
    if (typeof cta.backgroundColor !== 'string' || typeof cta.textColor !== 'string') return false;

    return true;
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!validateConfig(json)) {
          setImportError('Invalid configuration format');
          return;
        }

        setConfig(json);
        setImportError(null);
      } catch (error) {
        setImportError('Invalid JSON file');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImage = () => {
    const newImages = [
      ...config.carousel.images,
      { url: 'https://placehold.co/400x600/000000/white?text=New+Image', alt: 'New image' }
    ];
    updateCarousel({ images: newImages });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = config.carousel.images.filter((_, i) => i !== index);
    updateCarousel({ images: newImages });
  };

  const handleUpdateImage = (index: number, field: 'url' | 'alt', value: string) => {
    const newImages = config.carousel.images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    );
    updateCarousel({ images: newImages });
  };

  const isSaving = fetcher.state === 'submitting';
  const saveResult = fetcher.data as { success?: boolean; message?: string; error?: string } | undefined;

  // After successful save, reload the page to show the new latest config
  useEffect(() => {
    if (saveResult?.success && fetcher.state === 'idle') {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [saveResult, fetcher.state]);

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuration Editor</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Customize your mobile app home screen</p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
            >
              Export JSON
            </button>
            <label className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-center text-sm sm:text-base">
              Import JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
          {saveResult && (
            <div className={`text-sm ${saveResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {saveResult.success ? saveResult.message : saveResult.error}
            </div>
          )}
          {importError && (
            <div className="text-sm text-red-600">
              {importError}
            </div>
          )}
        </div>
      </div>

      {/* Carousel Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎠</span>
          Image Carousel
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Aspect Ratio</label>
            <select
              value={config.carousel.aspectRatio}
              onChange={(e) =>
                updateCarousel({ aspectRatio: e.target.value as 'portrait' | 'landscape' | 'square' })
              }
              className={inputClasses}
            >
              <option value="portrait">Portrait (9:16)</option>
              <option value="landscape">Landscape (16:9)</option>
              <option value="square">Square (1:1)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClasses}>Images</label>
              <button
                onClick={handleAddImage}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Image
              </button>
            </div>
            <div className="space-y-3">
              {config.carousel.images.map((image, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={image.url}
                          onChange={(e) => handleUpdateImage(index, 'url', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                        <input
                          type="text"
                          value={image.alt}
                          onChange={(e) => handleUpdateImage(index, 'alt', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Image description"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      disabled={config.carousel.images.length === 1}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                      title={config.carousel.images.length === 1 ? "Cannot remove the last image" : "Remove image"}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Text Section
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Title</label>
            <input
              type="text"
              value={config.textSection.title}
              onChange={(e) => updateTextSection({ title: e.target.value })}
              className={inputClasses}
              placeholder="Enter your title"
            />
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={config.textSection.description}
              onChange={(e) => updateTextSection({ description: e.target.value })}
              className={inputClasses}
              rows={3}
              placeholder="Enter your description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Title Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.textSection.titleColor}
                  onChange={(e) => updateTextSection({ titleColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.textSection.titleColor}
                  onChange={(e) => updateTextSection({ titleColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Description Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.textSection.descriptionColor}
                  onChange={(e) => updateTextSection({ descriptionColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.textSection.descriptionColor}
                  onChange={(e) => updateTextSection({ descriptionColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#666666"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={sectionClasses}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔘</span>
          Call-to-Action Button
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Button Label</label>
            <input
              type="text"
              value={config.cta.label}
              onChange={(e) => updateCTA({ label: e.target.value })}
              className={inputClasses}
              placeholder="Get Started"
            />
          </div>
          <div>
            <label className={labelClasses}>Button URL</label>
            <input
              type="url"
              value={config.cta.url}
              onChange={(e) => updateCTA({ url: e.target.value })}
              className={inputClasses}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.cta.backgroundColor}
                  onChange={(e) => updateCTA({ backgroundColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.cta.backgroundColor}
                  onChange={(e) => updateCTA({ backgroundColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#007AFF"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.cta.textColor}
                  onChange={(e) => updateCTA({ textColor: e.target.value })}
                  className="h-11 w-16 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.cta.textColor}
                  onChange={(e) => updateCTA({ textColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
