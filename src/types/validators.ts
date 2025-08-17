// Type validation utilities

import { AssetType, TimeframeType } from './index';
import { ASSET_TYPES, TIMEFRAMES } from '../constants';

// Type guards
export function isAssetType(value: string): value is AssetType {
  return Object.values(ASSET_TYPES).includes(value as AssetType);
}

export function isTimeframeType(value: string): value is TimeframeType {
  return Object.values(TIMEFRAMES).includes(value as TimeframeType);
}

export function isValidSymbol(symbol: string): boolean {
  return typeof symbol === 'string' && symbol.length > 0 && /^[A-Za-z0-9.-]+$/.test(symbol);
}

export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

export function isValidTimestamp(timestamp: string | number | Date): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

// Validation functions
export function validateAsset(asset: unknown): asset is { symbol: string; name: string; assetType: AssetType } {
  if (typeof asset !== 'object' || asset === null) return false;
  
  const obj = asset as Record<string, unknown>;
  
  return (
    typeof obj.symbol === 'string' &&
    typeof obj.name === 'string' &&
    isAssetType(obj.assetType as string)
  );
}

export function validatePriceData(data: unknown): data is { price: number; timestamp: string } {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    isValidPrice(obj.price as number) &&
    isValidTimestamp(obj.timestamp as string)
  );
}

export function validateChartDataPoint(point: unknown): point is {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
} {
  if (typeof point !== 'object' || point === null) return false;
  
  const obj = point as Record<string, unknown>;
  
  return (
    typeof obj.timestamp === 'number' &&
    isValidPrice(obj.open as number) &&
    isValidPrice(obj.high as number) &&
    isValidPrice(obj.low as number) &&
    isValidPrice(obj.close as number) &&
    typeof obj.volume === 'number' && obj.volume >= 0
  );
}