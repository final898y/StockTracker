'use client';

import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface StatusDisplayProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingMessage?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: 'search' | 'plus' | 'inbox' | 'database' | 'stock' | 'crypto' | React.ReactNode;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatusDisplay({
  loading = false,
  error = null,
  empty = false,
  loadingMessage = '載入中...',
  errorTitle,
  emptyTitle = '暫無資料',
  emptyDescription,
  emptyIcon = 'inbox',
  onRetry,
  onEmptyAction,
  emptyActionLabel,
  children,
  className = ''
}: StatusDisplayProps) {
  // 載入狀態
  if (loading) {
    return (
      <div className={className}>
        <LoadingIndicator message={loadingMessage} variant="page" />
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className={className}>
        <div className="max-w-md mx-auto py-12">
          <ErrorMessage
            title={errorTitle}
            message={error}
            variant="card"
            severity="error"
            onRetry={onRetry}
            retryText="重試"
          />
        </div>
      </div>
    );
  }

  // 空狀態
  if (empty) {
    return (
      <div className={className}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={onEmptyAction && emptyActionLabel ? {
            label: emptyActionLabel,
            onClick: onEmptyAction,
            variant: 'primary'
          } : undefined}
        />
      </div>
    );
  }

  // 正常內容
  return <div className={className}>{children}</div>;
}

// 特定用途的狀態顯示組件
export function SearchStatusDisplay({
  loading,
  error,
  hasResults,
  onRetry,
  onSearch,
  children,
  className
}: {
  loading?: boolean;
  error?: string | null;
  hasResults?: boolean;
  onRetry?: () => void;
  onSearch?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <StatusDisplay
      loading={loading}
      error={error}
      empty={!hasResults && !loading && !error}
      loadingMessage="搜尋中..."
      errorTitle="搜尋失敗"
      emptyTitle="沒有找到結果"
      emptyDescription="嘗試調整您的搜尋條件或搜尋其他關鍵字"
      emptyIcon="search"
      onRetry={onRetry}
      onEmptyAction={onSearch}
      emptyActionLabel="重新搜尋"
      className={className}
    >
      {children}
    </StatusDisplay>
  );
}

export function WatchlistStatusDisplay({
  loading,
  error,
  isEmpty,
  onRetry,
  onAdd,
  children,
  className
}: {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  onAdd?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <StatusDisplay
      loading={loading}
      error={error}
      empty={isEmpty && !loading && !error}
      loadingMessage="載入追蹤清單..."
      errorTitle="載入失敗"
      emptyTitle="追蹤清單是空的"
      emptyDescription="開始追蹤您感興趣的股票和加密貨幣，隨時掌握價格動態"
      emptyIcon="stock"
      onRetry={onRetry}
      onEmptyAction={onAdd}
      emptyActionLabel="添加第一個資產"
      className={className}
    >
      {children}
    </StatusDisplay>
  );
}

export function DataStatusDisplay({
  loading,
  error,
  isEmpty,
  onRetry,
  onRefresh,
  children,
  className
}: {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <StatusDisplay
      loading={loading}
      error={error}
      empty={isEmpty && !loading && !error}
      loadingMessage="載入資料..."
      errorTitle="載入失敗"
      emptyTitle="暫無資料"
      emptyDescription="目前沒有可顯示的資料，請稍後再試或重新載入"
      emptyIcon="database"
      onRetry={onRetry}
      onEmptyAction={onRefresh}
      emptyActionLabel="重新載入"
      className={className}
    >
      {children}
    </StatusDisplay>
  );
}