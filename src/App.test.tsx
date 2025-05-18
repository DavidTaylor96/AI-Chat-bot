import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the chat application', () => {
  render(<App />);
  // Look for the chat input placeholder
  const inputElement = screen.getByPlaceholderText(/Message Taylor/i);
  expect(inputElement).toBeInTheDocument();
});
