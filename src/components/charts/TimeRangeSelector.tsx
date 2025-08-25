'use client';

import { TimeframeType } from '@/types';

interface TimeRangeSelectorProps {
  currentTimeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
  disabled?: boolean;
  className?: string;
}

const TIMEFRAME_OPTIONS: { value: TimeframeType; label: string; description: string }[] = [
  { value: '1D', label: '1天', description: '1日K線' },
  { value: '1W', label: '1週', description: '1週K線' },
  { value: '1M', label: '1月', description: '1月K線' },
  { value: '3M', label: '3月', description: '3月K線' },
  { value: '1Y', label: '1年', description: '1年K線' },
];

export function TimeRangeSelector({
  currentTimeframe,
  onTimeframeChange,
  disabled = false,
  className = '',
}: TimeRangeSelectorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">時間範圍:</span>
      <div className="flex items-center space-x-1">
        {TIMEFRAME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onTimeframeChange(option.value)}
            disabled={disabled}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200
              ${
                currentTimeframe === option.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-sm'
              }
            `}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}