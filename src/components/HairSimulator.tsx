'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

// Icons replaced with placeholder divs to avoid lucide-react import issues

interface HairSimulatorProps {
  userId?: string;
}

const HAIR_STYLES = [
  'Classic Fade',
  'High Fade',
  'Low Fade',
  'Taper Fade',
  'Pompadour',
  'Quiff',
  'Slick Back',
  'Textured Crop',
  'Buzz Cut',
  'Mohawk',
  'Undercut',
  'Side Part',
  'Messy Quiff',
  'Curly Top',
  'Wavy Textured',
  'Bald Fade',
  'Temple Fade',
  'Drop Fade',
  'Burst Fade',
  'Skin Fade',
];

const BEARD_STYLES = [
  'Clean Shaven',
  'Stubble',
  'Short Beard',
  'Long Beard',
  'Goatee',
  'Mustache',
  'Van Dyke',
  'Full Beard',
  'Corporate Beard',
  'Bandholz',
];

export default function HairSimulator({ userId }: HairSimulatorProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [hairStyle, setHairStyle] = useState('');
  const [beardStyle, setBeardStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    if (!hairStyle && !beardStyle && !customPrompt) {
      setError('Please select a style or enter a custom prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Upload image first
      const formData = new FormData();
      formData.append('file', image);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }

      const { id: imageId } = await uploadRes.json();

      // Generate hair simulation
      const prompt = customPrompt || 
        `Apply ${hairStyle} ${beardStyle ? `and ${beardStyle} beard style` : ''} to this person's headshot. 
         Make it look natural and professional. 
         Keep the same lighting and background.`;

      const simRes = await fetch('/api/hair-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageId, 
          prompt,
          userId 
        }),
      });

      if (!simRes.ok) {
        throw new Error('Failed to generate preview');
      }

      const { url } = await simRes.json();
      setPreview(url);

      // Save to user's consultation history if userId provided
      if (userId) {
        await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            imageId,
            previewUrl: url,
            hairStyle,
            beardStyle,
            customPrompt,
            date: new Date().toISOString(),
          }),
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } } as any;
      handleImageUpload(event);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5">✨</div>
            Hair Style Simulator
          </CardTitle>
          <CardDescription>
            Upload your photo and preview different hairstyles and beard styles with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Upload Your Photo</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                imagePreview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-xs mx-auto rounded-lg shadow-md"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-12 w-12 mx-auto text-gray-400 flex items-center justify-center">📤</div>
                  <div>
                    <p className="text-lg font-medium">Drop your photo here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Style Selection Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Choose Your Style</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hair Style</label>
                <Select value={hairStyle} onValueChange={setHairStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hair style" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAIR_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Beard Style</label>
                <Select value={beardStyle} onValueChange={setBeardStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a beard style" />
                  </SelectTrigger>
                  <SelectContent>
                    {BEARD_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Prompt (Optional)</label>
              <Textarea
                placeholder="Describe your desired style in detail..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !image}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin">⏳</div>
                Generating Preview...
              </>
            ) : (
              <>
                <div className="mr-2 h-4 w-4">✨</div>
                Generate Preview
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                              <div className="h-5 w-5">🖼️</div>
              Your Style Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Style Preview" 
                className="max-w-full rounded-lg shadow-lg"
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = preview;
                    link.download = 'hair-style-preview.jpg';
                    link.click();
                  }}
                >
                  Download Preview
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPreview('');
                    setHairStyle('');
                    setBeardStyle('');
                    setCustomPrompt('');
                  }}
                >
                  Try Another Style
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Use a clear, front-facing photo with good lighting</li>
            <li>• Ensure your face is clearly visible and well-lit</li>
            <li>• Avoid photos with hats, sunglasses, or other accessories</li>
            <li>• For best results, use a photo with a neutral background</li>
            <li>• The AI works best with high-quality images (1MB+)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
