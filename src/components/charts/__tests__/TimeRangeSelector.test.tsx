import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TimeRangeSelector } from '../TimeRangeSelector';

describe('TimeRangeSelector', () => {
  const mockOnTimeframeChange = vi.fn();

  beforeEach(() => {
    mockOnTimeframeChange.mockClear();
  });

  it('renders all timeframe options', () => {
    render(
      <TimeRangeSelector
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    expect(screen.getByText('1天')).toBeInTheDocument();
    expect(screen.getByText('1週')).toBeInTheDocument();
    expect(screen.getByText('1月')).toBeInTheDocument();
    expect(screen.getByText('3月')).toBeInTheDocument();
    expect(screen.getByText('1年')).toBeInTheDocument();
  });

  it('highlights the current timeframe', () => {
    render(
      <TimeRangeSelector
        currentTimeframe="1W"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    const weekButton = screen.getByText('1週');
    expect(weekButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('calls onTimeframeChange when a button is clicked', () => {
    render(
      <TimeRangeSelector
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    fireEvent.click(screen.getByText('1月'));
    expect(mockOnTimeframeChange).toHaveBeenCalledWith('1M');
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <TimeRangeSelector
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows tooltips with descriptions', () => {
    render(
      <TimeRangeSelector
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    const dayButton = screen.getByText('1天');
    expect(dayButton).toHaveAttribute('title', '1日K線');
  });
});