import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ChartContainer } from '../ChartContainer';
import { Asset } from '@/types';

// Mock the chart data hook
vi.mock('@/hooks/use-chart-data', () => ({
  useChartData: vi.fn(() => ({
    data: null,
    isLoading: true,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Mock the chart store
vi.mock('@/stores/chart-store', () => ({
  useChartStore: vi.fn(() => ({
    setCurrentAsset: vi.fn(),
    setTimeframe: vi.fn(),
    setData: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  })),
}));

const mockAsset: Asset = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  assetType: 'stock',
  exchange: 'NASDAQ',
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ChartContainer', () => {
  it('shows loading state initially', () => {
    render(
      <TestWrapper>
        <ChartContainer asset={mockAsset} />
      </TestWrapper>
    );

    expect(screen.getByText('載入圖表資料中...')).toBeInTheDocument();
  });

  it('displays no data message when data is empty', async () => {
    const { useChartData } = await import('@/hooks/use-chart-data');
    vi.mocked(useChartData).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <ChartContainer asset={mockAsset} />
      </TestWrapper>
    );

    expect(screen.getByText('暫無圖表資料')).toBeInTheDocument();
    expect(screen.getByText(/Apple Inc\./)).toBeInTheDocument();
    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
  });
});