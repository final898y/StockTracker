export interface MarketTradingHours {
  open: string; // e.g., "09:30"
  close: string; // e.g., "16:00"
  timezone: string; // e.g., "America/New_York"
}

export interface MarketConfig {
  id: string; // e.g., "US", "TW", "CRYPTO"
  name: string; // e.g., "United States Stock Market", "Taiwan Stock Exchange", "Cryptocurrency Market"
  tradingHours?: MarketTradingHours;
  // Add more properties for holidays, specific rules later if needed
}

export const MARKET_CONFIGS: MarketConfig[] = [
  {
    id: "US",
    name: "United States Stock Market",
    tradingHours: {
      open: "09:30",
      close: "16:00",
      timezone: "America/New_York",
    },
  },
  {
    id: "TW",
    name: "Taiwan Stock Exchange",
    tradingHours: {
      open: "09:00",
      close: "13:30",
      timezone: "Asia/Taipei",
    },
  },
  {
    id: "CRYPTO",
    name: "Cryptocurrency Market",
    // Crypto markets are typically 24/7, so no specific trading hours
  },
];

export function getMarketConfig(marketId: string): MarketConfig | undefined {
  return MARKET_CONFIGS.find(config => config.id === marketId);
}