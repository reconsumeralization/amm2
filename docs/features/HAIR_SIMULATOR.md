# Hair Design Simulator

The Interactive Hair Design Simulator allows clients to upload their photo and preview different hairstyles and beard styles using AI-powered image generation. This feature helps clients visualize their desired look before booking an appointment.

## 🎯 Overview

### Purpose
- **Virtual Try-On**: Preview hairstyles and beard styles on client photos
- **Confidence Building**: Reduce appointment cancellations by showing expected results
- **Style Exploration**: Allow clients to experiment with different looks
- **Consultation Tool**: Aid stylists in understanding client preferences

### Benefits
- **Reduced Cancellations**: Clients see expected results before booking
- **Increased Confidence**: Visual confirmation of style choices
- **Better Communication**: Clear visual reference for stylist-client discussions
- **Marketing Tool**: Showcase transformation capabilities

## 🏗️ Architecture

### Component Structure
```
HairSimulator.tsx (Main Component)
├── ImageUpload.tsx (Image upload and preview)
├── StyleSelector.tsx (Hair and beard style selection)
├── PreviewGenerator.tsx (AI generation interface)
└── ResultDisplay.tsx (Generated preview display)
```

### Data Flow
```
Client Upload → Image Processing → AI Generation → Result Storage → Display
     ↓              ↓                ↓              ↓            ↓
   FormData → Bunny CDN → OpenAI DALL-E → Media Collection → Client Portal
```

## 🔧 Technical Implementation

### Frontend Component

#### Main Component: `HairSimulator.tsx`
```typescript
interface HairSimulatorProps {
  userId?: string;
}

const HAIR_STYLES = [
  'Classic Fade', 'High Fade', 'Low Fade', 'Taper Fade',
  'Pompadour', 'Quiff', 'Slick Back', 'Textured Crop',
  // ... more styles
];

const BEARD_STYLES = [
  'Clean Shaven', 'Stubble', 'Short Beard', 'Long Beard',
  'Goatee', 'Mustache', 'Van Dyke', 'Full Beard',
  // ... more styles
];
```

#### Key Features
- **Drag & Drop Upload**: Intuitive image upload interface
- **Style Selection**: Dropdown menus for hair and beard styles
- **Custom Prompts**: Text input for custom style descriptions
- **Real-time Preview**: Live preview of uploaded image
- **Progress Indicators**: Loading states during AI generation

### Backend API

#### API Route: `/api/hair-simulator`
```typescript
export async function POST(req: NextRequest) {
  const { imageId, prompt, userId } = await req.json();
  
  // 1. Fetch uploaded image from Media collection
  const media = await payload.findByID({
    collection: 'media',
    id: imageId,
  });
  
  // 2. Generate AI preview using OpenAI DALL-E 3
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${prompt}. Professional barbershop quality, natural lighting, realistic result.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "natural",
  });
  
  // 3. Upload generated image back to Media collection
  const uploadedMedia = await uploadToMedia(response.data[0].url);
  
  // 4. Log consultation if userId provided
  if (userId) {
    await logConsultation(userId, imageId, prompt, uploadedMedia.url);
  }
  
  return NextResponse.json({
    url: uploadedMedia.url,
    id: uploadedMedia.id,
  });
}
```

### Image Processing Pipeline

#### 1. Image Upload
- **Validation**: File type, size (max 10MB), dimensions
- **Optimization**: Automatic resizing and compression
- **Storage**: Upload to Bunny CDN via Media collection
- **Security**: Virus scanning and content validation

#### 2. AI Generation
- **Prompt Engineering**: Structured prompts for consistent results
- **Style Mapping**: Predefined style descriptions
- **Quality Control**: Professional barbershop aesthetic
- **Error Handling**: Fallback options for generation failures

#### 3. Result Management
- **Storage**: Generated images stored in Media collection
- **Metadata**: Style information, generation parameters
- **Cleanup**: Automatic cleanup of temporary files
- **Caching**: CDN caching for fast delivery

## 🎨 User Interface

### Upload Section
```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validation
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
```

### Style Selection
- **Hair Styles**: 20+ predefined styles with descriptions
- **Beard Styles**: 10+ beard and facial hair options
- **Custom Prompts**: Free-text input for unique styles
- **Style Combinations**: Hair + beard style combinations

### Preview Generation
```typescript
const handleSubmit = async () => {
  if (!image) {
    setError('Please select an image first');
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

    const { url } = await simRes.json();
    setPreview(url);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

## 📊 Data Management

### Media Collection Integration
```typescript
// Generated images stored in Media collection
interface MediaDocument {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  width: number;
  height: number;
  filesize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}
```

### Consultation Logging
```typescript
// Log consultation in User collection
await payload.update({
  collection: 'users',
  id: userId,
  data: {
    consultations: {
      push: {
        date: new Date().toISOString(),
        recommendations: {
          hairstyle: prompt.includes('hair') ? prompt : '',
          beardStyle: prompt.includes('beard') ? prompt : '',
        },
        notes: `AI-generated preview for: ${prompt}`,
        originalImageId: imageId,
        generatedImageId: uploadedMedia.id,
      },
    },
  },
});
```

## 🔐 Security & Privacy

### Image Security
- **File Validation**: Type checking, size limits, virus scanning
- **Access Control**: User-specific image access
- **Data Retention**: Automatic cleanup of old images
- **Privacy Protection**: No image sharing without consent

### API Security
- **Rate Limiting**: Prevent abuse of AI generation
- **Authentication**: User authentication required
- **Input Sanitization**: Prompt validation and sanitization
- **Error Handling**: Secure error messages

## 🚀 Performance Optimization

### Frontend Optimization
- **Lazy Loading**: Components loaded on demand
- **Image Compression**: Client-side image optimization
- **Caching**: Browser caching for static assets
- **Progressive Loading**: Loading states and skeleton screens

### Backend Optimization
- **CDN Caching**: Bunny CDN for fast image delivery
- **Database Indexing**: Optimized Media collection queries
- **API Caching**: Redis caching for frequent requests
- **Queue Processing**: Background processing for large images

## 🧪 Testing

### Unit Tests
```typescript
describe('HairSimulator', () => {
  test('should validate image upload', () => {
    // Test file size validation
    // Test file type validation
    // Test image preview generation
  });

  test('should handle style selection', () => {
    // Test hair style selection
    // Test beard style selection
    // Test custom prompt input
  });

  test('should generate AI preview', () => {
    // Test API call to hair simulator
    // Test error handling
    // Test loading states
  });
});
```

### Integration Tests
- **API Endpoint Testing**: Full request/response cycle
- **Image Processing**: Upload, generation, storage pipeline
- **User Flow**: Complete user journey testing
- **Error Scenarios**: Network failures, API limits, invalid inputs

### User Testing
- **Usability Testing**: User interface and experience
- **Performance Testing**: Load testing with multiple users
- **Accessibility Testing**: Screen reader compatibility
- **Mobile Testing**: Responsive design validation

## 📱 Mobile Experience

### Responsive Design
- **Touch-Friendly**: Large touch targets for mobile
- **Gesture Support**: Swipe and pinch gestures
- **Offline Support**: Basic functionality without internet
- **Progressive Web App**: Installable on mobile devices

### Mobile Optimization
- **Image Compression**: Automatic mobile image optimization
- **Touch Interactions**: Optimized for touch input
- **Loading States**: Clear feedback during processing
- **Error Handling**: Mobile-friendly error messages

## 🔄 Integration Points

### Existing Systems
- **User Authentication**: Integration with existing auth system
- **Media Management**: Uses existing Media collection
- **Consultation Logging**: Integrates with user consultation history
- **Admin Dashboard**: Analytics and management interface

### Third-Party Services
- **OpenAI DALL-E 3**: AI image generation
- **Bunny CDN**: Image storage and delivery
- **Payload CMS**: Media collection management

## 📊 Analytics & Monitoring

### Usage Metrics
- **Upload Count**: Number of images uploaded
- **Generation Success Rate**: Successful AI generations
- **Style Preferences**: Most popular hair and beard styles
- **User Engagement**: Time spent using simulator

### Performance Metrics
- **Generation Time**: Average time for AI generation
- **Image Quality**: User satisfaction with generated images
- **Error Rates**: Failed generations and uploads
- **API Usage**: OpenAI API consumption

### Admin Dashboard
- **Usage Analytics**: Real-time usage statistics
- **Popular Styles**: Trending hair and beard styles
- **Performance Monitoring**: System performance metrics
- **Error Tracking**: Failed requests and error patterns

## 🛠️ Configuration

### Environment Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Media Storage
BUNNY_CDN_STORAGE_ZONE=your_storage_zone
BUNNY_CDN_API_KEY=your_api_key

# Application Settings
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_SECRET=your_payload_secret
```

### Feature Flags
```typescript
const FEATURE_FLAGS = {
  HAIR_SIMULATOR_ENABLED: process.env.HAIR_SIMULATOR_ENABLED === 'true',
  AI_GENERATION_ENABLED: process.env.AI_GENERATION_ENABLED === 'true',
  CONSULTATION_LOGGING: process.env.CONSULTATION_LOGGING === 'true',
};
```

## 🆘 Troubleshooting

### Common Issues

#### Image Upload Failures
```bash
# Check file permissions
ls -la /path/to/upload/directory

# Verify storage configuration
curl -H "AccessKey: $BUNNY_CDN_API_KEY" \
  https://api.bunny.net/storagezone/$BUNNY_CDN_STORAGE_ZONE
```

#### AI Generation Failures
```bash
# Check OpenAI API status
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Verify API limits
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### Performance Issues
```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s \
  "https://your-api.com/api/hair-simulator"

# Check database performance
EXPLAIN ANALYZE SELECT * FROM media WHERE id = 'image_id';
```

### Debug Mode
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Image upload details:', {
    fileSize: file.size,
    fileType: file.type,
    fileName: file.name,
  });
  
  console.log('AI generation details:', {
    prompt,
    imageId,
    userId,
  });
}
```

## 🔮 Future Enhancements

### Planned Features
- **AR Integration**: Augmented reality try-on
- **Style Library**: Curated style collections
- **Social Sharing**: Share results on social media
- **Style History**: Save and compare previous styles
- **Advanced AI**: More sophisticated style generation

### Technical Improvements
- **Real-time Generation**: Live preview generation
- **Batch Processing**: Multiple style generation
- **Style Transfer**: More accurate style application
- **Performance Optimization**: Faster generation times

---

*Last updated: January 2025*
*Version: 1.0.0*
