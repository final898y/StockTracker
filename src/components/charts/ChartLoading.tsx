'use client';

interface ChartLoadingProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ChartLoading({ 
  width = 800, 
  height = 400, 
  className = '' 
}: ChartLoadingProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">載入圖表資料中...</p>
      </div>
    </div>
  );
}