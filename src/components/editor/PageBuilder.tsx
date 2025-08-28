'use client';
import { useState, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $insertNodes } from 'lexical';
import { $createImageNode } from '../../nodes/ImageNode';
import { $createLinkNode } from '@lexical/link';	
import ImageEditor from './ImageEditor';
import BookingChatbot from '@/components/chatbot/BookingChatbot';

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
  onSave: (content: string) => void;
}

const ComponentTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  BOOKING_CHATBOT: 'bookingChatbot',
  BARBER_PROFILE: 'barberProfile',
  TESTIMONIAL: 'testimonial',
};

const DraggableComponent = ({ 
  component, 
  index, 
  moveComponent, 
  onEdit,
  onDelete 
}: { 
  component: ComponentProps; 
  index: number; 
  moveComponent: (from: number, to: number) => void;
  onEdit: (index: number, component: ComponentProps) => void;
  onDelete: (index: number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !componentRef.current) return;
    
    const deltaY = e.clientY - dragStartY;
    const componentHeight = componentRef.current.offsetHeight;
    const moveDirection = Math.floor(deltaY / componentHeight);
    
    if (Math.abs(moveDirection) >= 1) {
      const newIndex = Math.max(0, Math.min(index + moveDirection, 999)); // Arbitrary max
      if (newIndex !== index) {
        moveComponent(index, newIndex);
        setDragStartY(e.clientY);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderComponent = () => {
    switch (component.type) {
      case ComponentTypes.TEXT:
        return <p className="text-gray-800">{component.content}</p>;
      case ComponentTypes.IMAGE:
        return (
          <img 
            src={component.src} 
            alt={component.alt} 
            className="max-w-full h-auto rounded-lg shadow-sm"
            srcSet={component.srcSet}
            sizes={component.sizes}
          />
        );
      case ComponentTypes.BUTTON:
        return (
          <a 
            href={component.url} 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {component.content}
          </a>
        );
      case ComponentTypes.BOOKING_CHATBOT:
        return <BookingChatbot tenantId="tenant-id-placeholder" />;
      case ComponentTypes.BARBER_PROFILE:
        return (
          <a 
            href={`/portal/barbers/${component.url}`} 
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {component.content}
          </a>
        );
      case ComponentTypes.TESTIMONIAL:
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
            "{component.content}"
          </blockquote>
        );
      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <div
      ref={componentRef}
      className={`p-4 border-2 border-dashed border-gray-300 rounded-lg mb-3 bg-white hover:border-blue-400 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
  );
};

export default function PageBuilder({ tenantId, settings, onSave }: PageBuilderProps) {
  const [editor] = useLexicalComposerContext();
  const [components, setComponents] = useState<ComponentProps[]>([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingComponent, setEditingComponent] = useState<{ index: number; component: ComponentProps } | null>(null);
  const [error, setError] = useState('');

  const moveComponent = (from: number, to: number) => {
    setComponents((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
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
        [ComponentTypes.BOOKING_CHATBOT]: 'Book your appointment'
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

  const handleSave = () => {
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
          return `[Booking Chatbot]`;
        default:
          return '';
      }
    }).join('\n\n');
    
    // Insert the content into the editor
    editor.update(() => {
      $insertNodes([$createTextNode(contentString)]);
    });
    
    // Call the original save function with the string content
    onSave(contentString);
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
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          aria-label="Save page"
        >
          Save Page
        </button>
      </div>

      {/* Component Toolbar */}
      <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Add Components</h3>
        <div className="flex flex-wrap gap-2">
          {settings.editor.pageBuilder.components.map((type: string) => (
            <button
              key={type}
              onClick={() => addComponent(type)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              aria-label={`Add ${type} component`}
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Components Area */}
      <div className="min-h-[300px] p-4 bg-white border border-gray-200 rounded-lg">
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
                moveComponent={moveComponent}
                onEdit={editComponent}
                onDelete={deleteComponent}
              />
            ))}
          </div>
        )}
      </div>

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

  const handleSave = () => {
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
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
