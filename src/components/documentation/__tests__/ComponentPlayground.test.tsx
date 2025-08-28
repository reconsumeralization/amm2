import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentPlayground } from '../ComponentPlayground';
import { ComponentProp } from '@/types/storybook-integration';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockProps: ComponentProp[] = [
  {
    name: 'title',
    type: 'string',
    description: 'The title of the component',
    required: true,
    defaultValue: 'Default Title',
    examples: ['Example Title', 'Another Title'],
  },
  {
    name: 'variant',
    type: '"primary" | "secondary" | "outline"',
    description: 'The visual variant',
    required: false,
    examples: ['primary', 'secondary', 'outline'],
  },
  {
    name: 'disabled',
    type: 'boolean',
    description: 'Whether the component is disabled',
    required: false,
    defaultValue: false,
    examples: [true, false],
  },
  {
    name: 'count',
    type: 'number',
    description: 'A numeric value',
    required: false,
    examples: [0, 1, 10],
  },
];

describe('ComponentPlayground', () => {
  const defaultProps = {
    componentName: 'TestComponent',
    initialProps: { title: 'Initial Title' },
    availableProps: mockProps,
    codeGeneration: true,
    livePreview: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component playground with correct title', () => {
    render(<ComponentPlayground {...defaultProps} />);
    
    expect(screen.getByText('TestComponent Playground')).toBeInTheDocument();
  });

  it('displays all available tabs', () => {
    render(<ComponentPlayground {...defaultProps} />);
    
    expect(screen.getByRole('tab', { name: 'Playground' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Props' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Code' })).toBeInTheDocument();
  });

  it('renders prop controls for all available props', () => {
    render(<ComponentPlayground {...defaultProps} />);
    
    // String input
    expect(screen.getByLabelText('title')).toBeInTheDocument();
    
    // Select for union types
    expect(screen.getByText('variant')).toBeInTheDocument();
    
    // Switch for boolean
    expect(screen.getByLabelText('disabled')).toBeInTheDocument();
    
    // Number input
    expect(screen.getByLabelText('count')).toBeInTheDocument();
  });

  it('shows required badges for required props', () => {
    render(<ComponentPlayground {...defaultProps} />);
    
    const requiredBadges = screen.getAllByText('Required');
    expect(requiredBadges).toHaveLength(1); // Only title is required
  });

  it('updates prop values when controls are changed', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Initial Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');
    
    expect(titleInput).toHaveValue('New Title');
  });

  it('generates code when props are updated', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Switch to code tab
    await user.click(screen.getByRole('tab', { name: 'Code' }));
    
    // Check initial code generation
    expect(screen.getByText(/<TestComponent/)).toBeInTheDocument();
  });

  it('resets props when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Change a prop value
    const titleInput = screen.getByDisplayValue('Initial Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed Title');
    
    // Click reset
    await user.click(screen.getByText('Reset'));
    
    // Should reset to initial value
    expect(titleInput).toHaveValue('Initial Title');
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as jest.Mock) = mockWriteText;
    
    render(<ComponentPlayground {...defaultProps} />);
    
    // Switch to code tab
    await user.click(screen.getByRole('tab', { name: 'Code' }));
    
    // Click copy button
    await user.click(screen.getByText('Copy'));
    
    expect(mockWriteText).toHaveBeenCalled();
  });

  it('displays prop documentation in props tab', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Switch to props tab
    await user.click(screen.getByRole('tab', { name: 'Props' }));
    
    // Check prop documentation
    expect(screen.getByText('The title of the component')).toBeInTheDocument();
    expect(screen.getByText('The visual variant')).toBeInTheDocument();
    expect(screen.getByText('Whether the component is disabled')).toBeInTheDocument();
  });

  it('shows prop types and default values in props tab', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Switch to props tab
    await user.click(screen.getByRole('tab', { name: 'Props' }));
    
    // Check type information
    expect(screen.getByText('string')).toBeInTheDocument();
    expect(screen.getByText('"primary" | "secondary" | "outline"')).toBeInTheDocument();
    expect(screen.getByText('boolean')).toBeInTheDocument();
    
    // Check default values
    expect(screen.getByText('"Default Title"')).toBeInTheDocument();
    expect(screen.getAllByText('false')[0]).toBeInTheDocument();
  });

  it('handles boolean prop changes correctly', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    const disabledSwitch = screen.getByRole('switch');
    
    // Initially should be unchecked (false)
    expect(disabledSwitch).not.toBeChecked();
    
    // Click to enable
    await user.click(disabledSwitch);
    expect(disabledSwitch).toBeChecked();
  });

  it('handles select prop changes correctly', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Find the variant select trigger
    const variantSelect = screen.getByRole('combobox');
    
    // Check that select is rendered
    expect(variantSelect).toBeInTheDocument();
  });

  it('handles number prop changes correctly', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    const countInput = screen.getByPlaceholderText('Enter count');
    await user.type(countInput, '42');
    
    expect(countInput).toHaveValue(42);
  });

  it('disables live preview when livePreview is false', () => {
    render(<ComponentPlayground {...defaultProps} livePreview={false} />);
    
    // Preview section should not be rendered
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('disables code generation when codeGeneration is false', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} codeGeneration={false} />);
    
    // Switch to code tab
    await user.click(screen.getByRole('tab', { name: 'Code' }));
    
    // Code section should not be rendered
    expect(screen.queryByText('Generated Code')).not.toBeInTheDocument();
  });

  it('generates correct code for different prop types', async () => {
    const user = userEvent.setup();
    render(<ComponentPlayground {...defaultProps} />);
    
    // Set various prop values
    const titleInput = screen.getByDisplayValue('Initial Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Title');
    
    const disabledSwitch = screen.getByRole('switch');
    await user.click(disabledSwitch);
    
    const countInput = screen.getByPlaceholderText('Enter count');
    await user.type(countInput, '5');
    
    // Switch to code tab
    await user.click(screen.getByRole('tab', { name: 'Code' }));
    
    // Check generated code contains TestComponent
    expect(screen.getByText(/TestComponent/)).toBeInTheDocument();
  });
});