
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  DistributeLeadsForm,
  UploadLeadsForm,
  ApproveAccountForm,
  AddAccountForm,
  DefaultView,
} from '../../../src/adminDashboard/components/DummyForms';

describe('DummyForms Components', () => {
  describe('DistributeLeadsForm', () => {
    it('should render the Distribute Leads form correctly', () => {
      render(<DistributeLeadsForm />);
      expect(screen.getByText('Distribute Leads')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Team Member')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of Leads')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /distribute/i })).toBeInTheDocument();
    });
  });

  describe('UploadLeadsForm', () => {
    it('should render the Upload Leads form correctly', () => {
      render(<UploadLeadsForm />);
      expect(screen.getByText('Upload Fresh Leads')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload CSV File')).toBeInTheDocument();
      expect(screen.getByLabelText('Freelancer Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload leads/i })).toBeInTheDocument();
    });
  });

  describe('ApproveAccountForm', () => {
    it('should render the Approve Account form with pending accounts', () => {
      render(<ApproveAccountForm />);
      expect(screen.getByText('Approve Account')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /approve/i })).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: /reject/i })).toHaveLength(2);
    });
  });

  describe('AddAccountForm', () => {
    it('should render the Add New Account form correctly', () => {
      render(<AddAccountForm />);
      expect(screen.getByText('Add New Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add account/i })).toBeInTheDocument();
    });
  });

  describe('DefaultView', () => {
    it('should render the default welcome view', () => {
      render(<DefaultView />);
      expect(screen.getByText('Welcome to Freelancewala Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Select a menu item from the sidebar to get started')).toBeInTheDocument();
    });
  });
});
