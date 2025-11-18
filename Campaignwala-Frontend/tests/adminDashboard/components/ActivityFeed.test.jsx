
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActivityFeed from '../../../src/adminDashboard/components/ActivityFeed.jsx';

const mockActivities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'approved a project.',
    time: '2 hours ago',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'added a new slide.',
    time: '5 hours ago',
  },
];

describe('ActivityFeed Component', () => {
  it('should render the activity feed with a title', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('should display the correct number of activities', () => {
    const { container } = render(<ActivityFeed activities={mockActivities} />);
    const activityContainer = container.querySelector('.space-y-4');
    expect(activityContainer.children.length).toBe(mockActivities.length);
  });

  it('should display the correct data for each activity', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('approved a project.')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('should render the user\'s initial in the avatar', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('J').closest('div')).toHaveClass('bg-gradient-to-br');
  });

  it('should render an empty state when there are no activities', () => {
    render(<ActivityFeed activities={[]} />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.queryByText(/approved a project/)).not.toBeInTheDocument();
  });
});
