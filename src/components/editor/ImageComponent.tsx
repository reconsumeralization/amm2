'use client';
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ImageNode } from '../../nodes/ImageNode';
import type { NodeKey } from 'lexical';

interface ImageComponentProps {
  nodeKey: NodeKey;
  src: string;
  alt: string;
  width: number;
  height: number | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  onError?: (error: string) => void;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hue: number;
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hue: 0,
};

export default function ImageComponent({ 
  nodeKey, 
  src, 
  alt, 
  width, 
  height, 
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.8,
  format = 'jpeg',
  onError 
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [cropSrc, setCropSrc] = useState(src);
  const [crop, setCrop] = useState<Crop>({ 
    unit: '%', 
    x: 0, 
    y: 0, 
    width: 100, 
    height: 100 
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropper, setShowCropper] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [altText, setAltText] = useState(alt);
  const [showAltEditor, setShowAltEditor] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleError = useCallback((error: string) => {
    console.error('ImageComponent error:', error);
    onError?.(error);
  }, [onError]);

  const applyFilters = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `grayscale(${filters.grayscale}%)`,
      `sepia(${filters.sepia}%)`,
      `hue-rotate(${filters.hue}deg)`,
    ].join(' ');
    
    ctx.filter = filterString;
  }, [filters.brightness, filters.contrast, filters.saturation, filters.blur, filters.grayscale, filters.sepia, filters.hue]);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      handleError('Missing image reference or crop data');
      return;
    }

    setIsLoading(true);
    
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      // Calculate crop dimensions
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;
      
      // Respect max dimensions while maintaining aspect ratio
      let finalWidth = cropWidth;
      let finalHeight = cropHeight;
      
      if (cropWidth > maxWidth || cropHeight > maxHeight) {
        const aspectRatio = cropWidth / cropHeight;
        if (cropWidth > maxWidth) {
          finalWidth = maxWidth;
          finalHeight = maxWidth / aspectRatio;
        }
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = maxHeight * aspectRatio;
        }
      }
      
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      // Apply filters
      applyFilters(canvas, ctx);
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        cropWidth,
        cropHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );
      
      const mimeType = `image/${format}`;
      const newSrc = canvas.toDataURL(mimeType, quality);
      
      setCropSrc(newSrc);
      
      // Update the Lexical node
      editor.update(() => {
        const node = editor.getEditorState()._nodeMap.get(nodeKey) as ImageNode;
        if (node && typeof node.setSrc === 'function') {
          node.setSrc(newSrc);
          if (altText !== alt && typeof node.setAlt === 'function') {
            node.setAlt(altText);
          }
        }
      });
      
      setShowCropper(false);
    } catch (error) {
      handleError(`Failed to crop image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [completedCrop, filters, quality, format, maxWidth, maxHeight, editor, nodeKey, altText, alt, applyFilters, handleError]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleFilterChange = useCallback((filterName: keyof ImageFilters, value: number) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const updateAltText = useCallback(() => {
    editor.update(() => {
      const node = editor.getEditorState()._nodeMap.get(nodeKey) as ImageNode;
      if (node && typeof node.setAlt === 'function') {
        node.setAlt(altText);
      }
    });
    setShowAltEditor(false);
  }, [editor, nodeKey, altText]);

  const imageStyle = {
    width: `${width}px`,
    height: height === 'auto' ? 'auto' : `${height}px`,
    filter: [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `grayscale(${filters.grayscale}%)`,
      `sepia(${filters.sepia}%)`,
      `hue-rotate(${filters.hue}deg)`,
    ].join(' '),
  };

  return (
    <div className="relative inline-block group">
      <img 
        ref={imgRef}
        src={cropSrc} 
        alt={altText} 
        style={imageStyle}
        className="transition-all duration-200"
        onError={() => handleError('Failed to load image')}
      />
      
      {/* Control buttons - show on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <button 
          onClick={() => setShowCropper(true)} 
          className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs shadow-lg"
          title="Crop image"
        >
          ✂️
        </button>
        <button 
          onClick={() => setShowFilters(true)} 
          className="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded text-xs shadow-lg"
          title="Apply filters"
        >
          🎨
        </button>
        <button 
          onClick={() => setShowAltEditor(true)} 
          className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs shadow-lg"
          title="Edit alt text"
        >
          📝
        </button>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-full overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                minWidth={10}
                minHeight={10}
              >
                <img 
                  ref={imgRef}
                  src={cropSrc} 
                  alt={altText}
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowCropper(false)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={getCroppedImg} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading || !completedCrop}
              >
                {isLoading ? 'Processing...' : 'Apply Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Image Filters</h3>
            <div className="space-y-4">
              {Object.entries(filters).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">
                    {key}: {value}{key === 'blur' ? 'px' : key === 'hue' ? '°' : '%'}
                  </label>
                  <input
                    type="range"
                    min={key === 'hue' ? -180 : 0}
                    max={key === 'hue' ? 180 : key === 'blur' ? 10 : 200}
                    value={value}
                    onChange={(e) => handleFilterChange(key as keyof ImageFilters, Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button 
                onClick={resetFilters} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alt Text Editor Modal */}
      {showAltEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Alt Text</h3>
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Describe this image for accessibility..."
            />
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setShowAltEditor(false)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={updateAltText} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}