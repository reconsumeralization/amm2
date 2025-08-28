import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageBuilder from '@/components/editor/PageBuilder';

// Mock the Lexical composer context
jest.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [
    {
      update: jest.fn(),
    },
  ],
}));

// Mock the ImageEditor component
jest.mock('@/components/editor/ImageEditor', () => {
  return function MockImageEditor({ onSave, onCancel }: any) {
    return (
      <div data-testid="image-editor">
        <button onClick={() => onSave(new Blob(), 'Test Image')}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock the BookingChatbot component
jest.mock('@/components/chatbot/BookingChatbot', () => {
  return function MockBookingChatbot() {
    return <div data-testid="booking-chatbot">Booking Chatbot</div>;
  };
});

describe('PageBuilder Component', () => {
  const mockSettings = {
    editor: {
      pageBuilder: {
        enabled: true,
        components: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial'],
      },
      imageOptimization: {
        maxImageSize: 5242880,
        responsiveSizes: [
          { width: 320, label: 'mobile' },
          { width: 768, label: 'tablet' },
          { width: 1200, label: 'desktop' },
        ],
        formats: ['jpeg', 'webp'],
        quality: 80,
      },
    },
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page builder when enabled', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Page Builder')).toBeInTheDocument();
    expect(screen.getByText('Add Components')).toBeInTheDocument();
  });

  it('shows disabled message when page builder is disabled', () => {
    const disabledSettings = {
      editor: {
        pageBuilder: {
          enabled: false,
          components: [],
        },
      },
    };

    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={disabledSettings}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Page builder is currently disabled in settings.')).toBeInTheDocument();
  });

  it('renders component buttons for enabled components', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('+ Text')).toBeInTheDocument();
    expect(screen.getByText('+ Image')).toBeInTheDocument();
    expect(screen.getByText('+ Button')).toBeInTheDocument();
    expect(screen.getByText('+ Bookingchatbot')).toBeInTheDocument();
    expect(screen.getByText('+ Barberprofile')).toBeInTheDocument();
    expect(screen.getByText('+ Testimonial')).toBeInTheDocument();
  });

  it('adds text component when text button is clicked', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('+ Text'));

    expect(screen.getByText('New text content')).toBeInTheDocument();
  });

  it('adds button component when button button is clicked', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('+ Button'));

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('shows empty state when no components are added', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('No components added yet.')).toBeInTheDocument();
    expect(screen.getByText('Use the buttons above to add content to your page.')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    // Add a component first
    fireEvent.click(screen.getByText('+ Text'));

    // Click save
    fireEvent.click(screen.getByText('Save Page'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('deletes component when delete button is clicked', () => {
    render(
      <PageBuilder
        tenantId="test-tenant"
        settings={mockSettings}
        onSave={mockOnSave}
      />
    );

    // Add a component
    fireEvent.click(screen.getByText('+ Text'));
    expect(screen.getByText('New text content')).toBeInTheDocument();

    // Delete the component
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.queryByText('New text content')).not.toBeInTheDocument();
  });
});
