import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamCard } from '../app/components';

describe('TeamCard', () => {
  it('renders and toggles via keyboard', () => {
    const onClick = vi.fn();
    render(<TeamCard name="Testland" selected={false} onClick={onClick} />);
    const el = screen.getByRole('button', { name: /testland/i });
    expect(el).toBeDefined();
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});
