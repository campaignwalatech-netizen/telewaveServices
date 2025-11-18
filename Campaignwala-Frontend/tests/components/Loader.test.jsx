
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from '../../src/components/Loader';

describe('Loader Component', () => {
  it('should render with default props', () => {
    render(<Loader />);
    const loader = screen.getByText('Loading...');
    expect(loader).toBeInTheDocument();
    // Check for medium size class
    const spinner = loader.previousSibling;
    expect(spinner.className).toContain('w-8 h-8');
  });

  it('should render with small size', () => {
    render(<Loader size="sm" />);
    const loader = screen.getByText('Loading...');
    const spinner = loader.previousSibling;
    expect(spinner.className).toContain('w-4 h-4');
  });

  it('should render with large size', () => {
    render(<Loader size="lg" />);
    const loader = screen.getByText('Loading...');
    const spinner = loader.previousSibling;
    expect(spinner.className).toContain('w-12 h-12');
  });

  it('should render with custom text', () => {
    render(<Loader text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should render without text', () => {
    render(<Loader text="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should apply a custom className', () => {
    const { container } = render(<Loader className="custom-class" />);
    expect(container.firstChild.className).toContain('custom-class');
  });
});
