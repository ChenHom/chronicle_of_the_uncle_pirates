interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  message = '載入中...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4`}></div>
      <p className={`text-slate-600 ${textSizeClasses[size]}`}>{message}</p>
    </div>
  );
}

// 載入卡片元件 - 用於顯示載入中的卡片骨架
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-rose-50 border border-rose-100 rounded-2xl shadow-md overflow-hidden animate-pulse ${className}`}>
      <div className="h-48 bg-rose-200"></div>
      <div className="p-6">
        <div className="h-6 bg-rose-200 rounded mb-2"></div>
        <div className="h-4 bg-rose-200 rounded mb-4 w-3/4"></div>
        <div className="h-10 bg-rose-300 rounded"></div>
      </div>
    </div>
  );
}

// 載入表格行元件
export function LoadingTableRow({ columns = 8 }: { columns?: number }) {
  return (
    <div className="p-6 animate-pulse">
      <div className="grid grid-cols-8 gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-rose-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}