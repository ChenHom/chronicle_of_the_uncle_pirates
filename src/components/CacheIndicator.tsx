'use client';

import { useState, useEffect } from 'react';

interface CacheIndicatorProps {
  isDevelopment?: boolean;
}

export default function CacheIndicator({ isDevelopment = process.env.NODE_ENV === 'development' }: CacheIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<Array<{
    key: string;
    age: number;
    remainingSeconds: number;
  }>>([]);

  useEffect(() => {
    if (!isDevelopment) return;

    // 檢查是否有快取資料
    const checkCache = async () => {
      try {
        const response = await fetch('/api/cache-status', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setCacheInfo(data);
        }
      } catch {
        console.log('Cache API not available');
      }
    };

    checkCache();
    const interval = setInterval(checkCache, 10000); // 每10秒檢查一次

    return () => clearInterval(interval);
  }, [isDevelopment]);

  if (!isDevelopment) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-slate-700 transition-colors"
      >
        Cache {cacheInfo.length > 0 ? '🟢' : '🔴'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-80 max-h-60 overflow-y-auto">
          <h3 className="font-semibold text-sm mb-2">快取狀態</h3>
          {cacheInfo.length === 0 ? (
            <p className="text-sm text-slate-500">沒有快取資料</p>
          ) : (
            <div className="space-y-2">
              {cacheInfo.map((cache, index) => (
                <div key={index} className="text-xs font-mono bg-slate-50 p-2 rounded">
                  <div className="font-semibold">{cache.key}</div>
                  <div className="text-slate-600">
                    已存在: {cache.age}s | 剩餘: {cache.remainingSeconds}s
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}