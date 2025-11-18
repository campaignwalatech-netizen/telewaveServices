import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommonSelect from '../../../src/adminDashboard/components/CommonSelect';

const stringOptions = ['Option 1', 'Option 2', 'Option 3'];
const objectOptions = [
  { value: 'val1', label: 'Value One' },
  { value: 'val2', label: 'Value Two' },
];

describe('CommonSelect Component', () => {
  it('should render with a label and placeholder', () => {
    render(<CommonSelect label="Test Label" placeholder="Select one..." />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Select one...')).toBeInTheDocument();
  });

  it('should render without a label if not provided', () => {
    const { container } = render(<CommonSelect placeholder="Select one..." />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('should open the dropdown and display string options on click', async () => {
    render(<CommonSelect options={stringOptions} placeholder="Select..." />);
    
    fireEvent.click(screen.getByText('Select...'));

    // Wait for options to be available
    await screen.findByText('Option 1');

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should open the dropdown and display object options on click', async () => {
    render(<CommonSelect options={objectOptions} placeholder="Select..." />);
    
    fireEvent.click(screen.getByText('Select...'));

    await screen.findByText('Value One');

    expect(screen.getByText('Value One')).toBeInTheDocument();
    expect(screen.getByText('Value Two')).toBeInTheDocument();
  });

  it('should call onChange with the correct value when an option is selected (string options)', async () => {
    const handleChange = vi.fn();
    render(<CommonSelect options={stringOptions} onChange={handleChange} placeholder="Select..." />);
    
    fireEvent.click(screen.getByText('Select...'));
    await screen.findByText('Option 2');
    fireEvent.click(screen.getByText('Option 2'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('Option 2');
  });

  it('should call onChange with the correct value when an option is selected (object options)', async () => {
    const handleChange = vi.fn();
    render(<CommonSelect options={objectOptions} onChange={handleChange} placeholder="Select..." />);
    
    fireEvent.click(screen.getByText('Select...'));
    await screen.findByText('Value One');
    fireEvent.click(screen.getByText('Value One'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('val1');
  });

  it('should display the selected value when controlled', () => {
    render(<CommonSelect options={objectOptions} value="val2" />);

    // The trigger should display the label of the selected value
    expect(screen.getByText('Value Two')).toBeInTheDocument();
  });

  it('should apply custom className to the trigger', () => {
    const { container } = render(<CommonSelect className="my-custom-class" />);
    const trigger = container.querySelector('.my-custom-class');
    expect(trigger).toBeInTheDocument();
  });

  it('should render an empty dropdown if options array is empty', async () => {
    render(<CommonSelect options={[]} placeholder="Select..." />);
    
    fireEvent.click(screen.getByText('Select...'));

    // The content area is rendered, but it should not contain any items.
    const selectContent = screen.getByRole('listbox', { hidden: true });
    expect(selectContent.children.length).toBe(0);
  });
});