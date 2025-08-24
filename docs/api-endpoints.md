# API Endpoints Documentation

## Overview

This document describes the Next.js API Routes implemented for the Stock Tracker application. All endpoints follow RESTful conventions and return standardized JSON responses.

## Base Response Format

All API endpoints return responses in the following format:

```typescript
interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
```

## Stock API Endpoints

### 1. Stock Search

**Endpoint:** `GET /api/stocks/search`

**Description:** Search for US stocks by symbol or company name.

**Query Parameters:**
- `query` (required): Search term (1-50 characters)

**Example Request:**
```
GET /api/stocks/search?query=AAPL
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "US",
      "currency": "USD",
      "type": "stock"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Codes:**
- `INVALID_SYMBOL`: Missing or invalid query parameter
- `EXTERNAL_API_ERROR`: Alpha Vantage API error
- `API_RATE_LIMIT`: API rate limit exceeded
- `NETWORK_ERROR`: Network timeout or connection error

### 2. Stock Details

**Endpoint:** `GET /api/stocks/[symbol]`

**Description:** Get current price and details for a specific stock.

**Path Parameters:**
- `symbol` (required): Stock symbol (e.g., AAPL, MSFT)

**Example Request:**
```
GET /api/stocks/AAPL
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "exchange": "US",
    "currency": "USD",
    "price": 150.25,
    "change": 2.15,
    "changePercent": 1.45,
    "volume": 45678900,
    "timestamp": "2024-01-15"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Cryptocurrency API Endpoints

### 1. Crypto Search

**Endpoint:** `GET /api/crypto/search`

**Description:** Search for cryptocurrencies by name or symbol.

**Query Parameters:**
- `query` (required): Search term (1-50 characters)

**Example Request:**
```
GET /api/crypto/search?query=bitcoin
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Crypto Details

**Endpoint:** `GET /api/crypto/[symbol]`

**Description:** Get current price and details for a specific cryptocurrency.

**Path Parameters:**
- `symbol` (required): Cryptocurrency ID (e.g., bitcoin, ethereum)

**Example Request:**
```
GET /api/crypto/bitcoin
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "current_price": 42500.00,
    "price_change_24h": 1250.50,
    "price_change_percentage_24h": 3.03,
    "market_cap": 832500000000,
    "total_volume": 15678900000,
    "last_updated": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Chart Data API Endpoints

### 1. Chart Data for Symbol

**Endpoint:** `GET /api/charts/[symbol]`

**Description:** Get historical chart data for a specific asset.

**Path Parameters:**
- `symbol` (required): Asset symbol or ID

**Query Parameters:**
- `assetType` (required): Asset type (`stock` or `crypto`)
- `timeframe` (optional): Time range (`1D`, `1W`, `1M`, `3M`, `1Y`). Default: `1M`
- `includeValidation` (optional): Include data validation info (`true` or `false`)

**Example Request:**
```
GET /api/charts/AAPL?assetType=stock&timeframe=1M
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "timeframe": "1M",
    "data": [
      {
        "timestamp": 1704067200000,
        "open": 148.50,
        "high": 152.30,
        "low": 147.80,
        "close": 150.25,
        "volume": 45678900
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Chart API Information

**Endpoint:** `GET /api/charts`

**Description:** Get API information and configuration.

**Query Parameters:**
- `action` (optional): Specific action (`timeframes`, `config`)

**Example Requests:**
```
GET /api/charts
GET /api/charts?action=timeframes
GET /api/charts?action=config
```

**Example Response (API Info):**
```json
{
  "success": true,
  "data": {
    "name": "Chart Data API",
    "version": "1.0.0",
    "description": "Provides historical chart data for stocks and cryptocurrencies",
    "supportedAssetTypes": ["stock", "crypto"],
    "supportedTimeframes": ["1D", "1W", "1M", "3M", "1Y"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Batch Chart Requests

**Endpoint:** `POST /api/charts`

**Description:** Get chart data for multiple assets in a single request.

**Request Body:**
```json
[
  {
    "symbol": "AAPL",
    "assetType": "stock",
    "timeframe": "1M"
  },
  {
    "symbol": "bitcoin",
    "assetType": "crypto",
    "timeframe": "1W"
  }
]
```

**Response:** Array of chart responses (max 10 requests per batch)

## Error Handling

### Standard Error Codes

- `INVALID_SYMBOL`: Invalid or missing symbol/query parameter
- `ASSET_NOT_FOUND`: Asset not found in external APIs
- `API_RATE_LIMIT`: External API rate limit exceeded
- `EXTERNAL_API_ERROR`: External API service error
- `NETWORK_ERROR`: Network timeout or connection error
- `METHOD_NOT_ALLOWED`: HTTP method not supported

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (asset not found)
- `405`: Method Not Allowed
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error
- `503`: Service Unavailable (external API down)

## Rate Limiting

### External API Limits

**Alpha Vantage (Free Tier):**
- 25 requests per day
- 5 API requests per minute

**CoinGecko (Free Tier):**
- 50 calls per minute
- 10,000 calls per month

### Implementation Notes

1. **Caching Strategy**: Implement client-side caching to reduce API calls
2. **Error Handling**: All endpoints include comprehensive error handling
3. **Validation**: Input validation for all parameters
4. **Rate Limiting**: Built-in rate limiting for external APIs
5. **Retry Logic**: Automatic retry with exponential backoff
6. **Monitoring**: Request logging and error tracking

## Usage Examples

### Frontend Integration

```typescript
// Search for stocks
const searchStocks = async (query: string) => {
  const response = await fetch(`/api/stocks/search?query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data;
};

// Get stock details
const getStockDetails = async (symbol: string) => {
  const response = await fetch(`/api/stocks/${symbol}`);
  const data = await response.json();
  return data;
};

// Get chart data
const getChartData = async (symbol: string, assetType: 'stock' | 'crypto', timeframe: string = '1M') => {
  const response = await fetch(`/api/charts/${symbol}?assetType=${assetType}&timeframe=${timeframe}`);
  const data = await response.json();
  return data;
};
```

### Error Handling Example

```typescript
const handleApiCall = async (apiCall: () => Promise<Response>) => {
  try {
    const response = await apiCall();
    const data = await response.json();
    
    if (!data.success) {
      switch (data.error.code) {
        case 'API_RATE_LIMIT':
          // Show rate limit message
          break;
        case 'ASSET_NOT_FOUND':
          // Show not found message
          break;
        default:
          // Show generic error
          break;
      }
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    console.error('API call failed:', error);
  }
};
```

## Testing

The API endpoints include comprehensive tests covering:

- Input validation
- Error handling
- Response format consistency
- HTTP method restrictions
- Edge cases and boundary conditions

Run tests with:
```bash
npm test -- --run src/app/api/__tests__/api-routes.test.ts
```

## Security Considerations

1. **API Keys**: Store API keys in environment variables
2. **Input Validation**: Validate all input parameters
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Error Messages**: Don't expose sensitive information in error messages
5. **CORS**: Configure CORS appropriately for production
6. **Logging**: Log requests for monitoring and debugging

## Future Enhancements

1. **Authentication**: Add user authentication for personalized features
2. **Caching**: Implement Redis caching for better performance
3. **WebSockets**: Real-time price updates via WebSocket connections
4. **Pagination**: Add pagination for large result sets
5. **Filtering**: Advanced filtering options for search results
6. **Analytics**: Request analytics and usage tracking