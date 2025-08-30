'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { NetworkStatus, useGlobalErrorHandler } from '@/components/error';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 全域錯誤處理
  useGlobalErrorHandler();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 快取策略配置
            staleTime: 60 * 1000, // 1分鐘內認為資料新鮮
            gcTime: 10 * 60 * 1000, // 10分鐘後清理快取
            
            // 重試策略
            retry: (failureCount, error) => {
              // 對於 4xx 錯誤不重試
              if (error instanceof Error && error.message.includes('4')) {
                return false;
              }
              // 最多重試 3 次
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // 網路狀態處理
            refetchOnWindowFocus: true, // 視窗重新聚焦時刷新
            refetchOnReconnect: true, // 網路重連時刷新
            refetchOnMount: true, // 組件掛載時刷新
            
            // 錯誤處理
            throwOnError: false, // 不拋出錯誤，讓組件處理
          },
          mutations: {
            // 變更操作的重試策略
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NetworkStatus />
      {children}
    </QueryClientProvider>
  );
}