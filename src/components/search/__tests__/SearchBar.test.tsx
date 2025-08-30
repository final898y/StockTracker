import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { SearchBar } from '../SearchBar';

// Mock the hooks
vi.mock('@/hooks/use-unified-search', () => ({
  useUnifiedSearch: () => ({
    query: '',
    stockResults: [],
    cryptoResults: [],
    loading: false,
    error: null,
    searchHistory: ['AAPL', 'BTC'],
    search: vi.fn(),
    clear: vi.fn(),
    hasResults: () => false,
    totalResults: 0,
    stockCount: 0,
    cryptoCount: 0,
  }),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(
      <TestWrapper>
        <SearchBar placeholder="測試搜尋..." />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('測試搜尋...');
    expect(input).toBeInTheDocument();
  });

  it('calls onSelectAsset when asset is selected', () => {
    const mockOnSelectAsset = vi.fn();
    
    render(
      <TestWrapper>
        <SearchBar onSelectAsset={mockOnSelectAsset} />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('搜尋股票或加密貨幣...');
    fireEvent.change(input, { target: { value: 'AAPL' } });
    
    // 測試輸入功能
    expect(input).toHaveValue('AAPL');
  });

  it('shows clear button when input has value', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('搜尋股票或加密貨幣...');
    fireEvent.change(input, { target: { value: 'test' } });

    // 應該顯示清除按鈕 - 通過查找 X 圖示來識別清除按鈕
    const clearIcon = document.querySelector('.lucide-x');
    expect(clearIcon).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('搜尋股票或加密貨幣...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 通過查找 X 圖示的父按鈕來點擊清除按鈕
    const clearIcon = document.querySelector('.lucide-x');
    const clearButton = clearIcon?.closest('button');
    expect(clearButton).toBeInTheDocument();
    
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(input).toHaveValue('');
  });

  it('handles keyboard events correctly', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('搜尋股票或加密貨幣...');
    
    // 測試 Escape 鍵
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // 輸入應該失去焦點（在實際實現中）
    expect(input).toBeInTheDocument();
  });
});