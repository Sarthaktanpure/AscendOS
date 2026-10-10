import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../src/components/common/Card';
import Button from '../src/components/common/Button';
import Badge from '../src/components/common/Badge';

describe('AscendOS Client Design System Component Tests', () => {
  it('Card renders title, subtitle, and children content', () => {
    render(
      <Card title="Today's MIT" subtitle="Priority Task">
        <p>Master Course Schedule in Java</p>
      </Card>
    );

    expect(screen.getByText("Today's MIT")).toBeDefined();
    expect(screen.getByText("Priority Task")).toBeDefined();
    expect(screen.getByText("Master Course Schedule in Java")).toBeDefined();
  });

  it('Button renders text and responds to click handler', () => {
    let clicked = false;
    render(
      <Button onClick={() => { clicked = true; }}>
        Start Focus Session
      </Button>
    );

    const btn = screen.getByText('Start Focus Session');
    expect(btn).toBeDefined();
    btn.click();
    expect(clicked).toBe(true);
  });

  it('Badge renders correct variant text', () => {
    render(<Badge variant="emerald">Likely Match</Badge>);
    expect(screen.getByText('Likely Match')).toBeDefined();
  });
});
