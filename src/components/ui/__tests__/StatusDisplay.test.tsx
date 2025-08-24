import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusDisplay, SearchStatusDisplay, WatchlistStatusDisplay } from '../StatusDisplay';

describe('StatusDisplay', () => {
  it('renders loading state', () => {
    render(
      <StatusDisplay loading={true} loadingMessage="載入測試資料...">
        <div>Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('載入測試資料...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    const mockRetry = vi.fn();
    
    render(
      <StatusDisplay 
        error="測試錯誤訊息" 
        errorTitle="錯誤標題"
        onRetry={mockRetry}
      >
        <div>Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument();
    expect(screen.getByText('錯誤標題')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    const retryButton = screen.getByText('重試');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();
  });

  it('renders empty state', () => {
    const mockEmptyAction = vi.fn();
    
    render(
      <StatusDisplay 
        empty={true}
        emptyTitle="空狀態標題"
        emptyDescription="空狀態描述"
        emptyActionLabel="執行操作"
        onEmptyAction={mockEmptyAction}
      >
        <div>Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('空狀態標題')).toBeInTheDocument();
    expect(screen.getByText('空狀態描述')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    const actionButton = screen.getByText('執行操作');
    fireEvent.click(actionButton);
    expect(mockEmptyAction).toHaveBeenCalled();
  });

  it('renders children when no special state', () => {
    render(
      <StatusDisplay>
        <div>Normal Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('prioritizes loading over error and empty', () => {
    render(
      <StatusDisplay 
        loading={true}
        error="錯誤"
        empty={true}
        loadingMessage="載入中"
      >
        <div>Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('載入中')).toBeInTheDocument();
    expect(screen.queryByText('錯誤')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('prioritizes error over empty', () => {
    render(
      <StatusDisplay 
        error="錯誤訊息"
        empty={true}
      >
        <div>Content</div>
      </StatusDisplay>
    );

    expect(screen.getByText('錯誤訊息')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});

describe('SearchStatusDisplay', () => {
  it('renders search-specific empty state', () => {
    const mockSearch = vi.fn();
    
    render(
      <SearchStatusDisplay 
        hasResults={false}
        onSearch={mockSearch}
      >
        <div>Search Results</div>
      </SearchStatusDisplay>
    );

    expect(screen.getByText('沒有找到結果')).toBeInTheDocument();
    expect(screen.getByText('嘗試調整您的搜尋條件或搜尋其他關鍵字')).toBeInTheDocument();
    
    const searchButton = screen.getByText('重新搜尋');
    fireEvent.click(searchButton);
    expect(mockSearch).toHaveBeenCalled();
  });

  it('renders search results when hasResults is true', () => {
    render(
      <SearchStatusDisplay hasResults={true}>
        <div>Search Results</div>
      </SearchStatusDisplay>
    );

    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.queryByText('沒有找到結果')).not.toBeInTheDocument();
  });
});

describe('WatchlistStatusDisplay', () => {
  it('renders watchlist-specific empty state', () => {
    const mockAdd = vi.fn();
    
    render(
      <WatchlistStatusDisplay 
        isEmpty={true}
        onAdd={mockAdd}
      >
        <div>Watchlist Items</div>
      </WatchlistStatusDisplay>
    );

    expect(screen.getByText('追蹤清單是空的')).toBeInTheDocument();
    expect(screen.getByText('開始追蹤您感興趣的股票和加密貨幣，隨時掌握價格動態')).toBeInTheDocument();
    
    const addButton = screen.getByText('添加第一個資產');
    fireEvent.click(addButton);
    expect(mockAdd).toHaveBeenCalled();
  });

  it('renders watchlist items when not empty', () => {
    render(
      <WatchlistStatusDisplay isEmpty={false}>
        <div>Watchlist Items</div>
      </WatchlistStatusDisplay>
    );

    expect(screen.getByText('Watchlist Items')).toBeInTheDocument();
    expect(screen.queryByText('追蹤清單是空的')).not.toBeInTheDocument();
  });
});