'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 自動重定向到儀表板
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">股票追蹤系統</h1>
          <p className="text-gray-600 mb-8">正在載入儀表板...</p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-solid border-blue-500 bg-blue-500 text-white transition-colors flex items-center justify-center hover:bg-blue-600 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            進入儀表板
          </button>
          <button
            onClick={() => router.push('/test-chart')}
            className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center hover:bg-gray-50 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            測試圖表
          </button>
        </div>
      </main>
    </div>
  );
}
