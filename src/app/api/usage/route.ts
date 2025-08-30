import { NextResponse } from 'next/server';
import { getAllUsageData } from '@/lib/api-usage-tracker';

export async function GET() {
  try {
    const usage = getAllUsageData();

    return NextResponse.json({
      success: true,
      usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'USAGE_FETCH_ERROR',
          message: '無法獲取 API 使用量資料',
        },
      },
      { status: 500 }
    );
  }
}