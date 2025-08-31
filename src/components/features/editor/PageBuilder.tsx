'use client';
import { useState, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $insertNodes } from 'lexical';
import { $createImageNode } from '../../nodes/ImageNode';
import { $createLinkNode } from '@lexical/link';
import Image from 'next/image';
import ImageEditor from './ImageEditor';
import BookingChatbot from '@/components/features/chatbot/BookingChatbot';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ComponentProps {
  id: string;
  type: string;
  content?: string;
  src?: string;
  alt?: string;
  url?: string;
  srcSet?: string;
  sizes?: string;
}

interface PageBuilderProps {
  tenantId: string;
  settings: any;
}

const ComponentTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  BOOKING_CHATBOT: 'bookingChatbot',
  BARBER_PROFILE: 'barberProfile',
  TESTIMONIAL: 'testimonial',
  HERO_SECTION: 'heroSection',
  SERVICES_GRID: 'servicesGrid',
  GALLERY: 'gallery',
  CONTACT_FORM: 'contactForm',
  PRICING_TABLE: 'pricingTable',
  TEAM_SECTION: 'teamSection',
  REVIEWS_SECTION: 'reviewsSection',
  NEWSLETTER_SIGNUP: 'newsletterSignup',
  VIDEO_EMBED: 'videoEmbed',
  ACCORDION: 'accordion',
  TABS: 'tabs',
  CAROUSEL: 'carousel',
  MAP_EMBED: 'mapEmbed'
};

const DraggableComponent = ({ 
  component, 
  index, 
  onEdit,
  onDelete 
}: { 
  component: ComponentProps; 
  index: number; 
  onEdit: (index: number, component: ComponentProps) => void;
  onDelete: (index: number) => void;
}) => {
  const renderComponent = () => {
    switch (component.type) {
      case ComponentTypes.TEXT:
        return <p className="text-gray-800">{component.content}</p>;

      case ComponentTypes.IMAGE:
        return (
          <Image
            src={component.src || ''}
            alt={component.alt || ''}
            width={400}
            height={300}
            className="max-w-full h-auto rounded-lg shadow-sm"
            sizes={component.sizes}
          />
        );

      case ComponentTypes.BUTTON:
        return (
          <a 
            href={component.url} 
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            {component.content}
          </a>
        );

      case ComponentTypes.BOOKING_CHATBOT:
        return <BookingChatbot tenantId="tenant-id-placeholder" />;

      case ComponentTypes.BARBER_PROFILE:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{component.content}</h3>
          <a 
            href={`/portal/barbers/${component.url}`}
            className="text-blue-500 hover:text-blue-700 underline"
          >
              View Profile →
          </a>
          </div>
        );

      case ComponentTypes.TESTIMONIAL:
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <blockquote className="text-lg italic text-gray-700 mb-4">
            "{component.content}"
          </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                ★
              </div>
              <span className="ml-3 text-sm text-gray-600">Customer Review</span>
            </div>
          </div>
        );

      case ComponentTypes.HERO_SECTION:
        return (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">{component.content || 'Welcome to Our Salon'}</h1>
            <p className="text-xl mb-6">Experience premium grooming services with our expert stylists</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Book Appointment
            </button>
          </div>
        );

      case ComponentTypes.SERVICES_GRID:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-semibold">S{i}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Service {i}</h3>
                <p className="text-gray-600 mb-4">Professional styling service</p>
                <span className="text-blue-600 font-semibold">$50</span>
              </div>
            ))}
          </div>
        );

      case ComponentTypes.GALLERY:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Gallery Image {i}</span>
              </div>
            ))}
          </div>
        );

      case ComponentTypes.CONTACT_FORM:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-md" />
              <input type="email" placeholder="Your Email" className="w-full p-3 border border-gray-300 rounded-md" />
              <textarea placeholder="Your Message" rows={4} className="w-full p-3 border border-gray-300 rounded-md"></textarea>
              <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        );

      case ComponentTypes.PRICING_TABLE:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Basic', 'Premium', 'VIP'].map((plan, i) => (
              <div key={plan} className={`p-6 rounded-lg border-2 ${i === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <h3 className="text-xl font-semibold mb-2">{plan}</h3>
                <div className="text-3xl font-bold mb-4">${(i + 1) * 30}</div>
                <ul className="space-y-2 mb-6">
                  <li>✓ Service 1</li>
                  <li>✓ Service 2</li>
                  <li>✓ Service 3</li>
                </ul>
                <button className={`w-full py-2 rounded-md font-semibold ${i === 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        );

      case ComponentTypes.TEAM_SECTION:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold">Stylist {i}</h3>
                  <p className="text-gray-600">Expert Hair Stylist</p>
                </div>
              ))}
            </div>
          </div>
        );

      case ComponentTypes.REVIEWS_SECTION:
        return (
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Excellent service! The team is professional and the results are amazing."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      C{i}
                    </div>
                    <span className="ml-3 text-sm font-medium">Customer {i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case ComponentTypes.NEWSLETTER_SIGNUP:
        return (
          <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6">Subscribe to our newsletter for the latest updates and offers</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md text-gray-900"
              />
              <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        );

      case ComponentTypes.VIDEO_EMBED:
        return (
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-600">Video Player</span>
          </div>
        );

      case ComponentTypes.ACCORDION:
        return (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md">
                <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="font-medium">FAQ Question {i}</span>
                </button>
              </div>
            ))}
          </div>
        );

      case ComponentTypes.TABS:
        return (
          <div className="bg-white rounded-lg shadow-md">
            <div className="flex border-b border-gray-200">
              {['Tab 1', 'Tab 2', 'Tab 3'].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-6 py-3 font-medium ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              <p className="text-gray-700">Tab content goes here</p>
            </div>
          </div>
        );

      case ComponentTypes.CAROUSEL:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-600">Carousel Slide 1</span>
            </div>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
                ></button>
              ))}
            </div>
          </div>
        );

      case ComponentTypes.MAP_EMBED:
        return (
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-600">Interactive Map</span>
          </div>
        );

      default:
        return <div className="p-4 bg-gray-100 rounded-lg text-gray-600">Unknown component type: {component.type}</div>;
    }
  };

  return (
    <Draggable draggableId={component.id} index={index}>{(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg mb-3 bg-white hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600 capitalize">
                {component.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(index, component)}
                className="text-blue-500 hover:text-blue-700 text-sm"
                aria-label="Edit component"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(index)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label="Delete component"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="cursor-move">
            {renderComponent()}
          </div>
        </div>
      )}</Draggable>
  );
};

export default function PageBuilder({ tenantId, settings }: PageBuilderProps) {
  const [editor] = useLexicalComposerContext();
  const [components, setComponents] = useState<ComponentProps[]>([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingComponent, setEditingComponent] = useState<{ index: number; component: ComponentProps } | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving page content to backend
  const savePageContent = async (content: string) => {
    setIsSaving(true);
    setError('');

    try {
      const pageData = {
        tenantId,
        components,
        content,
        lastSaved: new Date().toISOString(),
        version: 1
      };

      // Save to backend API
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error('Failed to save page content');
      }

      const result = await response.json();
      console.log('Page content saved:', result);
      
      // Show success message
      if (typeof window !== 'undefined') {
        toast.success('Page saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save page content:', err);
      setError('Failed to save page content. Please try again.');
      
      // Show error message
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('Failed to save page. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const newComponents = Array.from(components);
    const [reorderedItem] = newComponents.splice(result.source.index, 1);
    newComponents.splice(result.destination.index, 0, reorderedItem);

    setComponents(newComponents);
  };

  const addComponent = (type: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    if (type === ComponentTypes.IMAGE) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedFile(file);
          setShowImageEditor(true);
        }
      };
      input.click();
    } else {
      const defaultContent = {
        [ComponentTypes.TEXT]: 'New text content',
        [ComponentTypes.BUTTON]: 'Click Me',
        [ComponentTypes.BARBER_PROFILE]: 'View Barber Profile',
        [ComponentTypes.TESTIMONIAL]: 'Great service!',
        [ComponentTypes.BOOKING_CHATBOT]: 'Book your appointment',
        [ComponentTypes.HERO_SECTION]: 'Welcome to Our Salon',
        [ComponentTypes.SERVICES_GRID]: 'Our Services',
        [ComponentTypes.GALLERY]: 'Gallery',
        [ComponentTypes.CONTACT_FORM]: 'Contact Us',
        [ComponentTypes.PRICING_TABLE]: 'Pricing Plans',
        [ComponentTypes.TEAM_SECTION]: 'Meet Our Team',
        [ComponentTypes.REVIEWS_SECTION]: 'Customer Reviews',
        [ComponentTypes.NEWSLETTER_SIGNUP]: 'Stay Updated',
        [ComponentTypes.VIDEO_EMBED]: 'Video Content',
        [ComponentTypes.ACCORDION]: 'FAQ Section',
        [ComponentTypes.TABS]: 'Tabbed Content',
        [ComponentTypes.CAROUSEL]: 'Image Carousel',
        [ComponentTypes.MAP_EMBED]: 'Location Map'
      };
      
      setComponents((prev) => [
        ...prev,
        {
          id,
          type,
          content: defaultContent[type as keyof typeof defaultContent] || 'New component',
          url: type === ComponentTypes.BUTTON ? '#' : type === ComponentTypes.BARBER_PROFILE ? 'barber-1' : undefined
        },
      ]);
    }
  };

  const editComponent = (index: number, component: ComponentProps) => {
    setEditingComponent({ index, component });
  };

  const deleteComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSave = async (editedImage: Blob, alt: string) => {
    try {
      const formData = new FormData();
      formData.append('file', editedImage);
      
      const uploadRes = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        headers: { 'X-Tenant-ID': tenantId },
      });
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }
      
      const media = await uploadRes.json();

      // Generate responsive images
      const responsiveImages = await Promise.all(
        settings.editor.imageOptimization.responsiveSizes.map(async (size: any) => {
          const res = await fetch('/api/image-optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
            body: JSON.stringify({
              mediaId: media.id,
              width: size.width,
              formats: settings.editor.imageOptimization.formats,
              quality: settings.editor.imageOptimization.quality,
            }),
          });
          
          if (!res.ok) {
            throw new Error('Failed to optimize image');
          }
          
          return await res.json();
        })
      );

      const id = Math.random().toString(36).substr(2, 9);
      const newComponent: ComponentProps = {
        id,
        type: ComponentTypes.IMAGE,
        src: responsiveImages[0].urls.find((u: any) => u.format === 'jpeg')?.url,
        alt,
        srcSet: responsiveImages.flatMap((img: any) => img.urls.map((u: any) => `${u.url} ${img.width}w`)).join(', '),
        sizes: responsiveImages.map((img: any) => `(max-width: ${img.width}px) ${img.width}px`).join(', ') + ', 1200px',
      };
      
      setComponents((prev) => [...prev, newComponent]);
      setShowImageEditor(false);
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Failed to save image. Please try again.');
    }
  };

  const handleSaveClick = () => {
    // Convert components to a string representation for the editor
    const contentString = components.map(comp => {
      switch (comp.type) {
        case ComponentTypes.TEXT:
          return comp.content || '';
        case ComponentTypes.IMAGE:
          return `[Image: ${comp.alt || 'Image'}]`;
        case ComponentTypes.BUTTON:
          return `[Button: ${comp.content || 'Click Me'}]`;
        case ComponentTypes.BARBER_PROFILE:
          return `[Barber Profile: ${comp.content || 'View Profile'}]`;
        case ComponentTypes.TESTIMONIAL:
          return `[Testimonial: ${comp.content || 'Customer feedback'}]`;
        case ComponentTypes.BOOKING_CHATBOT:
          return `[Booking Chatbot]`
        default:
          return `[${comp.type}: ${comp.content || 'Component'}]`;
      }
    }).join('\n\n');
    
    // Insert the content into the editor
    editor.update(() => {
      $insertNodes([$createTextNode(contentString)]);
    });
    
    // Save to backend
    handleSave(contentString);
  };

  if (!settings.editor?.pageBuilder?.enabled) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Page builder is currently disabled in settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Page Builder</h2>
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save page"
        >
          {isSaving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {/* Component Toolbar */}
      <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add Components</h3>

        {/* Basic Components */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Basic</h4>
        <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addComponent(ComponentTypes.TEXT)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
            >
              + Text
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.IMAGE)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
            >
              + Image
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.BUTTON)}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors"
            >
              + Button
            </button>
          </div>
        </div>

        {/* Layout Components */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Layout</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addComponent(ComponentTypes.HERO_SECTION)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
            >
              + Hero
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.SERVICES_GRID)}
              className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 transition-colors"
            >
              + Services
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.TEAM_SECTION)}
              className="px-3 py-1 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors"
            >
              + Team
            </button>
          </div>
        </div>

        {/* Interactive Components */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Interactive</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addComponent(ComponentTypes.CONTACT_FORM)}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors"
            >
              + Contact
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.BOOKING_CHATBOT)}
              className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-600 transition-colors"
            >
              + Chatbot
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.NEWSLETTER_SIGNUP)}
              className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
            >
              + Newsletter
            </button>
          </div>
        </div>

        {/* Content Components */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Content</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addComponent(ComponentTypes.TESTIMONIAL)}
              className="px-3 py-1 bg-teal-500 text-white text-sm rounded-md hover:bg-teal-600 transition-colors"
            >
              + Testimonial
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.REVIEWS_SECTION)}
              className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-md hover:bg-emerald-600 transition-colors"
            >
              + Reviews
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.GALLERY)}
              className="px-3 py-1 bg-violet-500 text-white text-sm rounded-md hover:bg-violet-600 transition-colors"
            >
              + Gallery
            </button>
          </div>
        </div>

        {/* Advanced Components */}
        <div>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Advanced</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addComponent(ComponentTypes.PRICING_TABLE)}
              className="px-3 py-1 bg-rose-500 text-white text-sm rounded-md hover:bg-rose-600 transition-colors"
            >
              + Pricing
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.ACCORDION)}
              className="px-3 py-1 bg-lime-500 text-white text-sm rounded-md hover:bg-lime-600 transition-colors"
            >
              + Accordion
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.TABS)}
              className="px-3 py-1 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 transition-colors"
            >
              + Tabs
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.CAROUSEL)}
              className="px-3 py-1 bg-sky-500 text-white text-sm rounded-md hover:bg-sky-600 transition-colors"
            >
              + Carousel
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.VIDEO_EMBED)}
              className="px-3 py-1 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 transition-colors"
            >
              + Video
            </button>
            <button
              onClick={() => addComponent(ComponentTypes.MAP_EMBED)}
              className="px-3 py-1 bg-stone-500 text-white text-sm rounded-md hover:bg-stone-600 transition-colors"
            >
              + Map
            </button>
          </div>
        </div>
      </div>

      {/* Components Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="components">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-[300px] p-4 bg-white border border-gray-200 rounded-lg"
            >
              {components.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No components added yet.</p>
                  <p className="text-sm">Use the buttons above to add content to your page.</p>
                </div>
              ) : (
                <div>
                  {components.map((comp, index) => (
                    <DraggableComponent
                      key={comp.id}
                      component={comp}
                      index={index}
                      onEdit={editComponent}
                      onDelete={deleteComponent}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Image Editor Modal */}
      {showImageEditor && selectedFile && (
        <ImageEditor
          file={selectedFile}
          onSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
          tenantId={tenantId}
          settings={settings}
        />
      )}

      {/* Component Editor Modal */}
      {editingComponent && (
        <ComponentEditor
          component={editingComponent.component}
          onSave={(updatedComponent) => {
            setComponents((prev) => 
              prev.map((comp, i) => 
                i === editingComponent.index ? { ...comp, ...updatedComponent } : comp
              )
            );
            setEditingComponent(null);
          }}
          onCancel={() => setEditingComponent(null)}
        />
      )}
    </div>
  );
}

// Simple Component Editor Modal
function ComponentEditor({ 
  component, 
  onSave, 
  onCancel 
}: { 
  component: ComponentProps; 
  onSave: (component: Partial<ComponentProps>) => void; 
  onCancel: () => void; 
}) {
  const [content, setContent] = useState(component.content || '');
  const [url, setUrl] = useState(component.url || '');

  const handleComponentSave = () => {
    onSave({ content, url });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit {component.type}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {(component.type === ComponentTypes.BUTTON || component.type === ComponentTypes.BARBER_PROFILE) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleComponentSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
