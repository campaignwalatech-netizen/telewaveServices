
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AllSlidesTable from '../../../src/adminDashboard/forms/AllSlidesTable';
import slideService from '../../../src/services/slideService';

// Mock services and router hooks
vi.mock('../../../src/services/slideService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AllSlidesTable Component', () => {
  const mockSlides = [
    { _id: '1', offerTitle: 'Slide 1', category: { name: 'Category A' }, description: 'Desc 1', status: 'active', backgroundImage: 'img1.jpg', createdAt: new Date().toISOString() },
    { _id: '2', offerTitle: 'Slide 2', category: { name: 'Category B' }, description: 'Desc 2', status: 'inactive', backgroundImage: 'img2.jpg', createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    slideService.getAllSlides.mockResolvedValue({ success: true, data: { slides: mockSlides } });
    slideService.deleteSlide.mockResolvedValue({ success: true });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AllSlidesTable />
      </MemoryRouter>
    );
  };

  it('should load and display slides', async () => {
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Slide 1')).toBeInTheDocument();
      expect(screen.getByText('Slide 2')).toBeInTheDocument();
    });
  });

  it('should navigate to the edit form when "Edit" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Slide 1'));
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/add-slide', { state: { editSlide: mockSlides[0] } });
  });

  it('should open the delete modal and delete a slide', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderComponent();
    await waitFor(() => screen.getByText('Slide 1'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(slideService.deleteSlide).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Slide 1')).not.toBeInTheDocument();
    });
    alertSpy.mockRestore();
  });

  it('should filter slides based on search query', async () => {
    renderComponent();
    await waitFor(() => expect(slideService.getAllSlides).toHaveBeenCalledTimes(1));

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: 'Slide 1' } });

    await waitFor(() => {
      expect(slideService.getAllSlides).toHaveBeenCalledTimes(2);
      expect(slideService.getAllSlides).toHaveBeenCalledWith(expect.objectContaining({ search: 'Slide 1' }));
    }, { timeout: 1000 }); // Wait for debounce
  });
});
