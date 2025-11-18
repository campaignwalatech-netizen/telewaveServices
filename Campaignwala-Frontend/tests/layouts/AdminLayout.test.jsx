
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminLayout from '../../../src/layouts/AdminLayout';

describe('AdminLayout', () => {
  it('renders its children correctly', () => {
    const childText = 'This is the child content';
    render(
      <AdminLayout>
        <div>{childText}</div>
      </AdminLayout>
    );

    const childElement = screen.getByText(childText);
    expect(childElement).toBeInTheDocument();
  });

  it('applies the correct CSS classes to the root div', () => {
    const { container } = render(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>
    );

    // The first child of the container will be the div from the layout
    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass('font-sans');
    expect(layoutDiv).toHaveClass('antialiased');
  });
});
