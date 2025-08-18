import { ReactNode } from 'react';
import Card from './Card';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface TableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  striped?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  className = '',
  striped = true,
  compact = false,
  loading = false,
  emptyMessage = '沒有資料'
}: TableProps<T>) {
  const getAlignClasses = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-rose-100 overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="bg-rose-50 h-12"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-t border-rose-100 h-16 flex items-center px-6">
              <div className="grid grid-cols-6 gap-4 w-full">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-rose-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-rose-100 overflow-hidden ${className}`}>
        <div className="p-12 text-center">
          <div className="text-4xl opacity-20 mb-4">📋</div>
          <p className="text-slate-500 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-rose-100 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-rose-50 border-b border-rose-100">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    ${compact ? 'px-4 py-3' : 'px-6 py-4'}
                    text-sm font-semibold text-slate-700 
                    ${getAlignClasses(column.align)}
                    ${column.width ? '' : 'min-w-0'}
                  `}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  border-b border-rose-50 last:border-b-0 
                  hover:bg-rose-25 transition-colors
                  ${striped && rowIndex % 2 === 1 ? 'bg-rose-25/50' : ''}
                `}
              >
                {columns.map((column, colIndex) => {
                  const value = typeof column.key === 'string' 
                    ? row[column.key] 
                    : '';
                  
                  return (
                    <td
                      key={colIndex}
                      className={`
                        ${compact ? 'px-4 py-3' : 'px-6 py-4'}
                        text-sm text-slate-900
                        ${getAlignClasses(column.align)}
                      `}
                    >
                      {column.render ? column.render(value, row, rowIndex) : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 簡單的資料表格元件 - 適用於鍵值對顯示
interface SimpleTableProps {
  data: Array<{ label: string; value: ReactNode; highlight?: boolean }>;
  className?: string;
}

export function SimpleTable({ data, className = '' }: SimpleTableProps) {
  return (
    <div className={`bg-white rounded-xl border border-rose-100 overflow-hidden ${className}`}>
      <div className="divide-y divide-rose-100">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center px-6 py-4 hover:bg-rose-25 transition-colors ${
              item.highlight ? 'bg-rose-50' : ''
            }`}
          >
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className={`${item.highlight ? 'font-bold text-slate-900' : 'text-slate-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 卡片式表格 - 適用於移動端
interface CardTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  cardTitle?: (row: T, index: number) => ReactNode;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function CardTable<T extends Record<string, unknown>>({
  data,
  columns,
  cardTitle,
  className = '',
  loading = false,
  emptyMessage = '沒有資料'
}: CardTableProps<T>) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-rose-100 p-6 animate-pulse">
            <div className="h-6 bg-rose-200 rounded mb-4 w-1/2"></div>
            <div className="space-y-3">
              {columns.slice(0, 3).map((_, colIndex) => (
                <div key={colIndex} className="flex justify-between">
                  <div className="h-4 bg-rose-200 rounded w-1/3"></div>
                  <div className="h-4 bg-rose-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-rose-100 p-12 text-center ${className}`}>
        <div className="text-4xl opacity-20 mb-4">📋</div>
        <p className="text-slate-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((row, rowIndex) => (
        <Card key={rowIndex} className="space-y-3">
          {cardTitle && (
            <div className="font-semibold text-lg text-slate-900 border-b border-rose-100 pb-3">
              {cardTitle(row, rowIndex)}
            </div>
          )}
          <div className="space-y-2">
            {columns.map((column, colIndex) => {
              const value = typeof column.key === 'string' 
                ? row[column.key] 
                : '';
              
              return (
                <div key={colIndex} className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium text-sm">
                    {column.header}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {column.render ? column.render(value, row, rowIndex) : (value as React.ReactNode)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}