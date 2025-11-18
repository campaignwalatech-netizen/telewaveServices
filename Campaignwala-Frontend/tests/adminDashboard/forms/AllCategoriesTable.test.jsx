
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AllCategoriesTable from '../../../src/adminDashboard/forms/AllCategoriesTable';
import { getAllCategories, deleteCategory } from '../../../src/services/categoryService';

// Mock services and router hooks
vi.mock('../../../src/services/categoryService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AllCategoriesTable Component', () => {
  const mockCategories = [
    { _id: '1', name: 'Category 1', description: 'Desc 1', status: 'active', count: 5, createdAt: new Date().toISOString() },
    { _id: '2', name: 'Category 2', description: 'Desc 2', status: 'inactive', count: 2, createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    deleteCategory.mockResolvedValue({ success: true });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AllCategoriesTable />
      </MemoryRouter>
    );
  };

  it('should display a loading state initially and then render categories', async () => {
    renderComponent();
    expect(screen.getByText(/loading categories/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching fails', async () => {
    getAllCategories.mockRejectedValue(new Error('Failed to load'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/error loading categories/i)).toBeInTheDocument();
    });
  });

  it('should navigate to the add form when "Add New Category" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Category 1')); // Wait for load
    const addButton = screen.getByTitle('Add New Category');
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/add-category');
  });

  it('should navigate to the edit form when "Edit" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Category 1'));
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/add-category', { state: { editCategory: mockCategories[0] } });
  });

  it('should open the delete modal when "Delete" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Category 1'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('should call deleteCategory and remove the item on confirmed deletion', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderComponent();
    await waitFor(() => screen.getByText('Category 1'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith('1');
      expect(alertSpy).toHaveBeenCalledWith('Category deleted successfully!');
      expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
    });
    alertSpy.mockRestore();
  });
});
