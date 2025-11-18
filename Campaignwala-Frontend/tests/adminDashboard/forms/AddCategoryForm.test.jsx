
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AddCategoryForm from '../../../src/adminDashboard/forms/AddCategoryForm';
import { createCategory, updateCategory } from '../../../src/services/categoryService';

// Mock services and router hooks
vi.mock('../../../src/services/categoryService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(),
  };
});

describe('AddCategoryForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLocation.mockReturnValue({ state: null }); // Default to add mode
  });

  const renderComponent = (state = null) => {
    useLocation.mockReturnValue({ state });
    return render(
      <MemoryRouter>
        <AddCategoryForm />
      </MemoryRouter>
    );
  };

  it('should render in "Add New Category" mode', () => {
    renderComponent();
    expect(screen.getByText('Add New Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('should render in "Edit Category" mode and populate fields', () => {
    const editCategory = {
      editCategory: {
        _id: '123',
        name: 'Test Category',
        description: 'Test Description',
        status: 'inactive',
      },
    };
    renderComponent(editCategory);
    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Inactive')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update category/i })).toBeInTheDocument();
  });

  it('should call createCategory on submit in add mode', async () => {
    createCategory.mockResolvedValue({ success: true });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/category name/i), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Description' } });
    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalled();
      expect(screen.getByText(/category created successfully/i)).toBeInTheDocument();
    });
  });

  it('should call updateCategory on submit in edit mode', async () => {
    const editCategory = {
      editCategory: { _id: '123', name: 'Old Name' },
    };
    updateCategory.mockResolvedValue({ success: true });
    renderComponent(editCategory);

    fireEvent.change(screen.getByLabelText(/category name/i), { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: /update category/i }));

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith('123', expect.any(Object));
      expect(screen.getByText(/category updated successfully/i)).toBeInTheDocument();
    });
  });

  it('should display an error message on failed submission', async () => {
    createCategory.mockRejectedValue(new Error('Failed to create'));
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create category/i)).toBeInTheDocument();
    });
  });
});
