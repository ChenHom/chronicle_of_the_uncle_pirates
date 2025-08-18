import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  gradient?: 'default' | 'albums' | 'finances';
  className?: string;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  icon,
  children,
  gradient = 'default',
  className = '' 
}: PageHeaderProps) {
  const gradientClasses = {
    default: 'from-rose-500/90 to-rose-700/90',
    albums: 'from-purple-500/90 to-rose-600/90',
    finances: 'from-emerald-500/90 to-rose-600/90'
  };

  return (
    <section className={`relative bg-gradient-to-r ${gradientClasses[gradient]} text-white ${className}`}>
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {icon && (
            <div className="text-4xl md:text-5xl mb-4 opacity-90">
              {icon}
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-rose-100 to-transparent"></div>
    </section>
  );
}

// 簡化版頁面標題 - 適用於內容頁面
interface SimplePageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SimplePageHeader({ 
  title, 
  subtitle, 
  icon,
  actions,
  className = '' 
}: SimplePageHeaderProps) {
  return (
    <div className={`border-b border-rose-100 bg-white/50 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="text-2xl md:text-3xl text-rose-500">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-600 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}