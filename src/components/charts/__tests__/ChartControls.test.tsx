import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ChartControls } from '../ChartControls';
import { IChartApi } from 'lightweight-charts';

// Mock the chart API
const mockChart = {
  timeScale: vi.fn(() => ({
    fitContent: vi.fn(),
    getVisibleRange: vi.fn(() => ({ from: 1000, to: 2000 })),
    setVisibleRange: vi.fn(),
  })),
} as unknown as IChartApi;

describe('ChartControls', () => {
  const mockOnTimeframeChange = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders time range selector and control buttons', () => {
    render(
      <ChartControls
        chart={mockChart}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('時間範圍:')).toBeInTheDocument();
    expect(screen.getByText('圖表控制:')).toBeInTheDocument();
    expect(screen.getByTitle('放大')).toBeInTheDocument();
    expect(screen.getByTitle('縮小')).toBeInTheDocument();
    expect(screen.getByTitle('向左平移')).toBeInTheDocument();
    expect(screen.getByTitle('向右平移')).toBeInTheDocument();
    expect(screen.getByText('適合內容')).toBeInTheDocument();
    expect(screen.getByText('刷新')).toBeInTheDocument();
  });

  it('calls fitContent when fit content button is clicked', () => {
    const mockFitContent = vi.fn();
    const mockTimeScale = vi.fn(() => ({
      fitContent: mockFitContent,
      getVisibleRange: vi.fn(() => ({ from: 1000, to: 2000 })),
      setVisibleRange: vi.fn(),
    }));
    
    const chartWithMock = {
      timeScale: mockTimeScale,
    } as unknown as IChartApi;

    render(
      <ChartControls
        chart={chartWithMock}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    fireEvent.click(screen.getByText('適合內容'));
    expect(mockFitContent).toHaveBeenCalled();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <ChartControls
        chart={mockChart}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
        onRefresh={mockOnRefresh}
      />
    );

    fireEvent.click(screen.getByText('刷新'));
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('disables controls when loading', () => {
    render(
      <ChartControls
        chart={mockChart}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
        onRefresh={mockOnRefresh}
        isLoading={true}
      />
    );

    const zoomInButton = screen.getByTitle('放大');
    const refreshButton = screen.getByRole('button', { name: /載入中/i });
    
    expect(zoomInButton).toBeDisabled();
    expect(refreshButton).toBeDisabled();
  });

  it('disables controls when chart is null', () => {
    render(
      <ChartControls
        chart={null}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
        onRefresh={mockOnRefresh}
      />
    );

    const zoomInButton = screen.getByTitle('放大');
    const fitContentButton = screen.getByText('適合內容');
    
    expect(zoomInButton).toBeDisabled();
    expect(fitContentButton).toBeDisabled();
  });

  it('handles zoom in functionality', () => {
    const mockSetVisibleRange = vi.fn();
    const mockTimeScale = vi.fn(() => ({
      fitContent: vi.fn(),
      getVisibleRange: vi.fn(() => ({ from: 1000, to: 2000 })),
      setVisibleRange: mockSetVisibleRange,
    }));
    
    const chartWithMock = {
      timeScale: mockTimeScale,
    } as unknown as IChartApi;

    render(
      <ChartControls
        chart={chartWithMock}
        currentTimeframe="1D"
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    fireEvent.click(screen.getByTitle('放大'));
    expect(mockSetVisibleRange).toHaveBeenCalled();
  });
});