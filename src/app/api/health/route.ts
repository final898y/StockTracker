import { NextResponse } from 'next/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';

// 健康檢查端點
export async function GET() {
  try {
    const startTime = Date.now();
    
    // 基本健康檢查
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return ApiErrorHandler.createSuccessResponse(health, '系統運行正常');
  } catch (error) {
    return ApiErrorHandler.handleError(error, 'Health Check');
  }
}

export async function HEAD() {
  // 用於網路連線測試的輕量級端點
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}