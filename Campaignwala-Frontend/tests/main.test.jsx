import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import AppRouter from '@/routes/AppRouter';
import { ThemeProvider } from '@/context-api/ThemeContext';
import { vi } from 'vitest';

// Mock ReactDOM.createRoot
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockReturnValue({
    render: vi.fn(),
  }),
}));

describe('main.jsx', () => {
  it('should render the application without crashing', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Import main.jsx to trigger the render call
    await import('@/main.jsx');

    // Check if createRoot was called with the #root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);

    // Check if render was called with the correct component tree
    const renderCall = ReactDOM.createRoot().render.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
    expect(renderCall.props.children.type).toBe(Provider);
    expect(renderCall.props.children.props.store).toBe(store);
    expect(renderCall.props.children.props.children.type).toBe(ThemeProvider);
    expect(renderCall.props.children.props.children.props.children.type).toBe(AppRouter);

    document.body.removeChild(rootElement);
  });
});
