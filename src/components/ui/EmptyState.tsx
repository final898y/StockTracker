'use client';

import React from 'react';
import { 
  SearchIcon, 
  PlusIcon, 
  InboxIcon, 
  DatabaseIcon,
  TrendingUpIcon,
  CoinsIcon 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'plus' | 'inbox' | 'database' | 'stock' | 'crypto' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const iconMap = {
  search: SearchIcon,
  plus: PlusIcon,
  inbox: InboxIcon,
  database: DatabaseIcon,
  stock: TrendingUpIcon,
  crypto: CoinsIcon,
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = iconMap[icon as keyof typeof iconMap];
    if (IconComponent) {
      return <IconComponent className="h-12 w-12 text-gray-400 dark:text-gray-500" />;
    }

    return <InboxIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />;
  };

  const getActionClasses = () => {
    if (!action) return '';
    
    const baseClasses = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors';
    
    switch (action.variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300`;
      case 'primary':
      default:
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* 圖示 */}
        <div className="flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* 標題 */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* 描述 */}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {description}
          </p>
        )}

        {/* 操作按鈕 */}
        {action && (
          <div className="mt-6">
            <button
              onClick={action.onClick}
              className={getActionClasses()}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 預設的空狀態組件
export function SearchEmptyState({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="沒有找到結果"
      description="嘗試調整您的搜尋條件或搜尋其他關鍵字"
      action={onSearch ? {
        label: "重新搜尋",
        onClick: onSearch,
        variant: "secondary"
      } : undefined}
    />
  );
}

export function WatchlistEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="stock"
      title="追蹤清單是空的"
      description="開始追蹤您感興趣的股票和加密貨幣，隨時掌握價格動態"
      action={onAdd ? {
        label: "添加第一個資產",
        onClick: onAdd,
        variant: "primary"
      } : undefined}
    />
  );
}

export function DataEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="database"
      title="暫無資料"
      description="目前沒有可顯示的資料，請稍後再試或重新載入"
      action={onRefresh ? {
        label: "重新載入",
        onClick: onRefresh,
        variant: "secondary"
      } : undefined}
    />
  );
}