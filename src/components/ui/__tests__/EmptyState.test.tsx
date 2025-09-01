import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { 
  EmptyState, 
  SearchEmptyState, 
  WatchlistEmptyState, 
  DataEmptyState 
} from '../EmptyState';

describe('EmptyState', () => {
  const mockAction = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with title only', () => {
    render(<EmptyState title="測試標題" />);
    
    expect(screen.getByText('測試標題')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <EmptyState 
        title="測試標題" 
        description="這是測試描述" 
      />
    );
    
    expect(screen.getByText('測試標題')).toBeInTheDocument();
    expect(screen.getByText('這是測試描述')).toBeInTheDocument();
  });

  it('renders default inbox icon', () => {
    render(<EmptyState title="測試標題" />);
    
    // Check for inbox icon (Lucide icons render as SVG)
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders search icon when specified', () => {
    render(<EmptyState title="測試標題" icon="search" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders plus icon when specified', () => {
    render(<EmptyState title="測試標題" icon="plus" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders stock icon when specified', () => {
    render(<EmptyState title="測試標題" icon="stock" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders crypto icon when specified', () => {
    render(<EmptyState title="測試標題" icon="crypto" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders custom React element as icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
    
    render(<EmptyState title="測試標題" icon={<CustomIcon />} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders primary action button', () => {
    render(
      <EmptyState 
        title="測試標題" 
        action={{
          label: "主要操作",
          onClick: mockAction,
          variant: "primary"
        }}
      />
    );
    
    const button = screen.getByText('主要操作');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-500');
  });

  it('renders secondary action button', () => {
    render(
      <EmptyState 
        title="測試標題" 
        action={{
          label: "次要操作",
          onClick: mockAction,
          variant: "secondary"
        }}
      />
    );
    
    const button = screen.getByText('次要操作');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gray-100');
  });

  it('calls action onClick when button is clicked', async () => {
    render(
      <EmptyState 
        title="測試標題" 
        action={{
          label: "點擊我",
          onClick: mockAction
        }}
      />
    );
    
    const button = screen.getByText('點擊我');
    await user.click(button);
    
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="測試標題" className="custom-empty-state" />
    );
    
    expect(container.firstChild).toHaveClass('custom-empty-state');
  });

  it('does not render action button when action is not provided', () => {
    render(<EmptyState title="測試標題" />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses primary variant as default for action button', () => {
    render(
      <EmptyState 
        title="測試標題" 
        action={{
          label: "預設按鈕",
          onClick: mockAction
        }}
      />
    );
    
    const button = screen.getByText('預設按鈕');
    expect(button).toHaveClass('bg-blue-500');
  });
});

describe('SearchEmptyState', () => {
  const mockOnSearch = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search empty state correctly', () => {
    render(<SearchEmptyState />);
    
    expect(screen.getByText('沒有找到結果')).toBeInTheDocument();
    expect(screen.getByText('嘗試調整您的搜尋條件或搜尋其他關鍵字')).toBeInTheDocument();
  });

  it('renders without action button when onSearch is not provided', () => {
    render(<SearchEmptyState />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when onSearch is provided', () => {
    render(<SearchEmptyState onSearch={mockOnSearch} />);
    
    expect(screen.getByText('重新搜尋')).toBeInTheDocument();
  });

  it('calls onSearch when button is clicked', async () => {
    render(<SearchEmptyState onSearch={mockOnSearch} />);
    
    const button = screen.getByText('重新搜尋');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });
});

describe('WatchlistEmptyState', () => {
  const mockOnAdd = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders watchlist empty state correctly', () => {
    render(<WatchlistEmptyState />);
    
    expect(screen.getByText('追蹤清單是空的')).toBeInTheDocument();
    expect(screen.getByText('開始追蹤您感興趣的股票和加密貨幣，隨時掌握價格動態')).toBeInTheDocument();
  });

  it('renders without action button when onAdd is not provided', () => {
    render(<WatchlistEmptyState />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when onAdd is provided', () => {
    render(<WatchlistEmptyState onAdd={mockOnAdd} />);
    
    expect(screen.getByText('添加第一個資產')).toBeInTheDocument();
  });

  it('calls onAdd when button is clicked', async () => {
    render(<WatchlistEmptyState onAdd={mockOnAdd} />);
    
    const button = screen.getByText('添加第一個資產');
    await user.click(button);
    
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('uses primary variant for action button', () => {
    render(<WatchlistEmptyState onAdd={mockOnAdd} />);
    
    const button = screen.getByText('添加第一個資產');
    expect(button).toHaveClass('bg-blue-500');
  });
});

describe('DataEmptyState', () => {
  const mockOnRefresh = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data empty state correctly', () => {
    render(<DataEmptyState />);
    
    expect(screen.getByText('暫無資料')).toBeInTheDocument();
    expect(screen.getByText('目前沒有可顯示的資料，請稍後再試或重新載入')).toBeInTheDocument();
  });

  it('renders without action button when onRefresh is not provided', () => {
    render(<DataEmptyState />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when onRefresh is provided', () => {
    render(<DataEmptyState onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('重新載入')).toBeInTheDocument();
  });

  it('calls onRefresh when button is clicked', async () => {
    render(<DataEmptyState onRefresh={mockOnRefresh} />);
    
    const button = screen.getByText('重新載入');
    await user.click(button);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('uses secondary variant for action button', () => {
    render(<DataEmptyState onRefresh={mockOnRefresh} />);
    
    const button = screen.getByText('重新載入');
    expect(button).toHaveClass('bg-gray-100');
  });
});