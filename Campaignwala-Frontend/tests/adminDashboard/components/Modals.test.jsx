
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  DeleteModal,
  EditModal,
  ConfirmModal,
} from '../../../src/adminDashboard/components/Modals';

describe('Modal Components', () => {
  describe('DeleteModal', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    it('should not render when isOpen is false', () => {
      render(<DeleteModal isOpen={false} onClose={onClose} onConfirm={onConfirm} itemName="Test Item" />);
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<DeleteModal isOpen={true} onClose={onClose} onConfirm={onConfirm} itemName="Test Item" />);
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should call onClose when cancel is clicked', () => {
      render(<DeleteModal isOpen={true} onClose={onClose} onConfirm={onConfirm} itemName="Test Item" />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when delete is clicked', () => {
      render(<DeleteModal isOpen={true} onClose={onClose} onConfirm={onConfirm} itemName="Test Item" />);
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('EditModal', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    it('should render with title and children', () => {
      render(
        <EditModal isOpen={true} onClose={onClose} onConfirm={onConfirm} title="Edit User">
          <div>Child Content</div>
        </EditModal>
      );
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('ConfirmModal', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    it('should render with title, message, and confirm text', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm Action"
          message="Please confirm."
          confirmText="Proceed"
        />
      );
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Please confirm.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /proceed/i })).toBeInTheDocument();
    });

    it('should apply color classes to confirm button', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm Action"
          message="Please confirm."
          confirmText="Proceed"
          confirmColor="green"
        />
      );
      expect(screen.getByRole('button', { name: /proceed/i })).toHaveClass('bg-green-600');
    });
  });
});
