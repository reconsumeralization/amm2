'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorProps {
  file: File;
  onSave: (editedImage: Blob, alt: string) => void;
  onCancel: () => void;
  tenantId: string;
  settings: any;
}

interface EditHistory {
  crop: Crop;
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  saturation: number;
  hue: number;
  blur: number;
}

interface PresetFilter {
  name: string;
  icon: string;
  settings: Partial<EditHistory>;
}

const PRESET_FILTERS: PresetFilter[] = [
  {
    name: 'Original',
    icon: '🔄',
    settings: {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
      saturation: 100,
      hue: 0,
      blur: 0,
    },
  },
  {
    name: 'Vintage',
    icon: '📸',
    settings: {
      brightness: 110,
      contrast: 120,
      sepia: 30,
      saturation: 80,
    },
  },
  {
    name: 'B&W',
    icon: '⚫',
    settings: {
      grayscale: 100,
      contrast: 110,
    },
  },
  {
    name: 'Warm',
    icon: '🌅',
    settings: {
      brightness: 105,
      saturation: 110,
      hue: 10,
    },
  },
  {
    name: 'Cool',
    icon: '❄️',
    settings: {
      brightness: 95,
      saturation: 90,
      hue: -10,
    },
  },
  {
    name: 'High Contrast',
    icon: '⚡',
    settings: {
      contrast: 150,
      brightness: 105,
    },
  },
];

export default function ImageEditor({ file, onSave, onCancel, tenantId, settings }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'crop' | 'effects' | 'filters' | 'details'>('crop');
  const [showPreview, setShowPreview] = useState(false);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      // Initialize history with default state
      const initialState: EditHistory = {
        crop,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
        saturation: 100,
        hue: 0,
        blur: 0,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const saveToHistory = useCallback(() => {
    const newState: EditHistory = {
      crop,
      brightness,
      contrast,
      grayscale,
      sepia,
      saturation,
      hue,
      blur,
      rotation,
      flipHorizontal,
      flipVertical,
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [crop, brightness, contrast, grayscale, sepia, saturation, hue, blur, rotation, flipHorizontal, flipVertical, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCrop(prevState.crop);
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setGrayscale(prevState.grayscale);
      setSepia(prevState.sepia);
      setSaturation(prevState.saturation);
      setHue(prevState.hue);
      setBlur(prevState.blur);
      setRotation(prevState.rotation);
      setFlipHorizontal(prevState.flipHorizontal);
      setFlipVertical(prevState.flipVertical);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCrop(nextState.crop);
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setGrayscale(nextState.grayscale);
      setSepia(nextState.sepia);
      setSaturation(nextState.saturation);
      setHue(nextState.hue);
      setBlur(nextState.blur);
      setRotation(nextState.rotation);
      setFlipHorizontal(nextState.flipHorizontal);
      setFlipVertical(nextState.flipVertical);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    // Tab navigation
    if (e.key === 'Tab' && e.altKey) {
      e.preventDefault();
      const tabs: Array<typeof activeTab> = ['crop', 'effects', 'filters', 'details'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    }
  }, [undo, redo, activeTab]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const applyPresetFilter = useCallback((preset: PresetFilter) => {
    Object.entries(preset.settings).forEach(([key, value]) => {
      switch (key) {
        case 'brightness':
          setBrightness(value as number);
          break;
        case 'contrast':
          setContrast(value as number);
          break;
        case 'grayscale':
          setGrayscale(value as number);
          break;
        case 'sepia':
          setSepia(value as number);
          break;
        case 'saturation':
          setSaturation(value as number);
          break;
        case 'hue':
          setHue(value as number);
          break;
        case 'blur':
          setBlur(value as number);
          break;
      }
    });
    setTimeout(saveToHistory, 100); // Delay to ensure all state updates are applied
  }, [saveToHistory]);

  const generatePreview = useCallback(async () => {
    if (!imageRef.current || !previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const image = imageRef.current;
    
    canvas.width = 200;
    canvas.height = 150;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filters
    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `grayscale(${grayscale}%)`,
      `sepia(${sepia}%)`,
      `saturate(${saturation}%)`,
      `hue-rotate(${hue}deg)`,
      `blur(${blur}px)`
    ].join(' ');
    
    ctx.filter = filters;
    
    // Draw scaled image
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    
    if (aspectRatio > canvas.width / canvas.height) {
      drawHeight = canvas.width / aspectRatio;
    } else {
      drawWidth = canvas.height * aspectRatio;
    }
    
    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;
    
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  }, [brightness, contrast, grayscale, sepia, saturation, hue, blur]);

  useEffect(() => {
    if (showPreview && imageSrc) {
      generatePreview();
    }
  }, [showPreview, imageSrc, generatePreview]);

  const getCroppedImage = useCallback(
    async (image: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      // Calculate dimensions considering rotation
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;
      
      canvas.width = cropWidth * cos + cropHeight * sin;
      canvas.height = cropWidth * sin + cropHeight * cos;
      
      // Center the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Apply transformations
      ctx.rotate(radians);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      
      // Apply filters
      const filters = [
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
        `grayscale(${grayscale}%)`,
        `sepia(${sepia}%)`,
        `saturate(${saturation}%)`,
        `hue-rotate(${hue}deg)`,
        `blur(${blur}px)`
      ].join(' ');
      
      ctx.filter = filters;
      
      // Draw the cropped image
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        cropWidth,
        cropHeight,
        -cropWidth / 2,
        -cropHeight / 2,
        cropWidth,
        cropHeight
      );
      
      return new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), file.type, 0.9)
      );
    },
    [crop, brightness, contrast, grayscale, sepia, saturation, hue, blur, rotation, flipHorizontal, flipVertical, file.type]
  );

  const handleSave = async () => {
    if (!imageSrc || !imageRef.current) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const editedImage = await getCroppedImage(imageRef.current);
      if (editedImage.size > settings.editor.imageOptimization.maxImageSize) {
        setError(`Edited image exceeds ${settings.editor.imageOptimization.maxImageSize / 1024 / 1024}MB`);
        setIsProcessing(false);
        return;
      }
      onSave(editedImage, altText);
      setIsProcessing(false);
    } catch (err) {
      setError('Failed to process image');
      setIsProcessing(false);
    }
  };

  const resetImage = () => {
    setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setSepia(0);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropAspectRatio(undefined);
    saveToHistory();
  };

  const setCropAspect = (ratio: number | undefined) => {
    setCropAspectRatio(ratio);
    if (ratio) {
      const newCrop = { ...crop };
      const imageAspect = imageRef.current ? imageRef.current.width / imageRef.current.height : 1;
      
      if (ratio > imageAspect) {
        newCrop.width = 90;
        newCrop.height = (90 / ratio) * imageAspect;
      } else {
        newCrop.height = 90;
        newCrop.width = (90 * ratio) / imageAspect;
      }
      
      newCrop.x = (100 - newCrop.width) / 2;
      newCrop.y = (100 - newCrop.height) / 2;
      
      setCrop(newCrop);
    }
  };

  if (!settings.editor?.imageEditor?.enabled) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Image Editing Disabled</h2>
          <p className="text-gray-600 mb-4">Image editing is currently disabled in settings.</p>
          <button
            onClick={onCancel}
            className="w-full p-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Image</h2>
          <div className="flex items-center gap-2">
            {/* Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-md transition-colors ${
                showPreview ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle preview"
              title="Toggle preview"
            >
              👁️
            </button>
            
            {/* Undo/Redo Controls */}
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              aria-label="Undo (Ctrl+Z)"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              aria-label="Redo (Ctrl+Y)"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
            <button
              onClick={resetImage}
              className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
              aria-label="Reset all changes"
              title="Reset all changes"
            >
              🔄
            </button>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="Close image editor"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: 'crop', label: 'Crop & Transform', icon: '✂️' },
            { key: 'effects', label: 'Effects', icon: '🎨' },
            { key: 'filters', label: 'Filters', icon: '📸' },
            { key: 'details', label: 'Details', icon: '📝' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Image Display */}
          <div className="lg:col-span-2">
            {imageSrc && (
              <div className="mb-4 flex justify-center relative">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={saveToHistory}
                  aspect={cropAspectRatio}
                  className="mb-4"
                >
                  <img 
                    ref={imageRef}
                    src={imageSrc} 
                    alt="Image to edit" 
                    style={{ 
                      filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`,
                      transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '500px'
                    }} 
                  />
                </ReactCrop>
                
                {/* Preview Canvas */}
                {showPreview && (
                  <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg border">
                    <div className="text-xs text-gray-600 mb-1">Preview</div>
                    <canvas
                      ref={previewCanvasRef}
                      className="border rounded"
                      width={200}
                      height={150}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {activeTab === 'crop' && (
              <>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">✂️</span>
                  Crop & Transform
                </h3>
                
                {/* Aspect Ratio Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => setCropAspect(undefined)}
                      className={`p-2 rounded border ${!cropAspectRatio ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setCropAspect(1)}
                      className={`p-2 rounded border ${cropAspectRatio === 1 ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      1:1
                    </button>
                    <button
                      onClick={() => setCropAspect(4/3)}
                      className={`p-2 rounded border ${cropAspectRatio === 4/3 ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      4:3
                    </button>
                    <button
                      onClick={() => setCropAspect(16/9)}
                      className={`p-2 rounded border ${cropAspectRatio === 16/9 ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      16:9
                    </button>
                    <button
                      onClick={() => setCropAspect(3/2)}
                      className={`p-2 rounded border ${cropAspectRatio === 3/2 ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      3:2
                    </button>
                    <button
                      onClick={() => setCropAspect(2/3)}
                      className={`p-2 rounded border ${cropAspectRatio === 2/3 ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                    >
                      2:3
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRotation((prev) => (prev - 90) % 360);
                      saveToHistory();
                    }}
                    className="flex-1 p-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors text-sm"
                    aria-label="Rotate left 90 degrees"
                  >
                    ↺ Rotate Left
                  </button>
                  <button
                    onClick={() => {
                      setRotation((prev) => (prev + 90) % 360);
                      saveToHistory();
                    }}
                    className="flex-1 p-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors text-sm"
                    aria-label="Rotate right 90 degrees"
                  >
                    ↻ Rotate Right
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFlipHorizontal(!flipHorizontal);
                      saveToHistory();
                    }}
                    className={`flex-1 p-2 rounded-md transition-colors text-sm ${
                      flipHorizontal ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-label="Flip horizontally"
                  >
                    ↔ Flip H
                  </button>
                  <button
                    onClick={() => {
                      setFlipVertical(!flipVertical);
                      saveToHistory();
                    }}
                    className={`flex-1 p-2 rounded-md transition-colors text-sm ${
                      flipVertical ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-label="Flip vertically"
                  >
                    ↕ Flip V
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    onMouseUp={saveToHistory}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Fine rotation adjustment"
                  />
                </div>
              </>
            )}

            {activeTab === 'effects' && (
              <>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🎨</span>
                  Effects
                </h3>
                
                {settings.editor.imageEditor.effects.includes('brightness') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brightness: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      onMouseUp={saveToHistory}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Adjust brightness"
                    />
                  </div>
                )}
                
                {settings.editor.imageEditor.effects.includes('contrast') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contrast: {contrast}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      onMouseUp={saveToHistory}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Adjust contrast"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saturation: {saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    onMouseUp={saveToHistory}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Adjust saturation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hue: {hue}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={hue}
                    onChange={(e) => setHue(Number(e.target.value))}
                    onMouseUp={saveToHistory}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Adjust hue"
                  />
                </div>
                
                {settings.editor.imageEditor.effects.includes('grayscale') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grayscale: {grayscale}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      onMouseUp={saveToHistory}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Adjust grayscale"
                    />
                  </div>
                )}
                
                {settings.editor.imageEditor.effects.includes('sepia') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sepia: {sepia}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      onMouseUp={saveToHistory}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Adjust sepia"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blur: {blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    onMouseUp={saveToHistory}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Adjust blur"
                  />
                </div>
              </>
            )}

            {activeTab === 'filters' && (
              <>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📸</span>
                  Preset Filters
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_FILTERS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPresetFilter(preset)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center border"
                    >
                      <div className="text-lg mb-1">{preset.icon}</div>
                      <div className="text-xs font-medium">{preset.name}</div>
                    </button>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <p><strong>Tip:</strong> Apply a preset filter, then fine-tune with the Effects tab.</p>
                </div>
              </>
            )}

            {activeTab === 'details' && (
              <>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📝</span>
                  Image Details
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text (for accessibility) *
                  </label>
                  <textarea
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe the image for screen readers"
                    rows={3}
                    aria-label="Image alt text"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {altText.length}/150 characters
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                  <p><strong>File:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Type:</strong> {file.type}</p>
                  <p><strong>Max Size:</strong> {(settings.editor.imageOptimization.maxImageSize / 1024 / 1024).toFixed(1)} MB</p>
                  <p><strong>Dimensions:</strong> {imageRef.current ? `${imageRef.current.naturalWidth} × ${imageRef.current.naturalHeight}` : 'Loading...'}</p>
                </div>
                
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  <p><strong>Keyboard Shortcuts:</strong></p>
                  <p>• Ctrl+Z: Undo</p>
                  <p>• Ctrl+Y: Redo</p>
                  <p>• Ctrl+S: Save</p>
                  <p>• Alt+Tab: Switch tabs</p>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-600 text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span>History: {historyIndex + 1} / {history.length}</span>
            <span>Tab: {activeTab}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              disabled={isProcessing}
              aria-label="Cancel image editing"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !altText.trim()}
              aria-label="Save edited image"
            >
              {isProcessing ? 'Processing...' : 'Save Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}