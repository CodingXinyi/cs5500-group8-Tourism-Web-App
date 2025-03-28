import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChatBot from './index'; // adjust if filename is different
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIChatBot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('toggles chat window on button click', () => {
    render(<AIChatBot />);
    const toggleBtn = screen.getByRole('button', { name: '🤖' });

    fireEvent.click(toggleBtn);
    expect(screen.getByPlaceholderText(/ask something/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByPlaceholderText(/ask something/i)).not.toBeInTheDocument();
  });

  test('updates input field as user types', () => {
    render(<AIChatBot />);
    fireEvent.click(screen.getByRole('button', { name: '🤖' }));

    const input = screen.getByPlaceholderText(/ask something/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello AI' } });

    expect(input.value).toBe('Hello AI');
  });

  test('sends message and displays AI response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello human!' }],
            },
          },
        ],
      },
    });

    render(<AIChatBot />);
    fireEvent.click(screen.getByRole('button', { name: '🤖' }));

    const input = screen.getByPlaceholderText(/ask something/i);
    fireEvent.change(input, { target: { value: 'Hi AI' } });

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Hi AI')).toBeInTheDocument(); // user message
      expect(screen.getByText('Hello human!')).toBeInTheDocument(); // AI response
    });
  });

  test('handles request error and displays fallback message', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

    render(<AIChatBot />);
    fireEvent.click(screen.getByRole('button', { name: '🤖' }));

    const input = screen.getByPlaceholderText(/ask something/i);
    fireEvent.change(input, { target: { value: 'Hi there' } });

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Hi there')).toBeInTheDocument(); // user message
      expect(
        screen.getByText(/request fail, please try it later/i)
      ).toBeInTheDocument(); // fallback AI error message
    });
  });
});
