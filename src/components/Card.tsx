import { ReactNode } from 'react';
import Link from 'next/link';

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

interface CardProps extends BaseCardProps {
  href?: never;
  onClick?: () => void;
}

interface LinkCardProps extends BaseCardProps {
  href: string;
  onClick?: never;
}

const getPaddingClasses = (padding: 'sm' | 'md' | 'lg') => {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  return paddings[padding];
};

const baseClasses = 'bg-rose-50 border border-rose-100 rounded-2xl shadow-md overflow-hidden';
const hoverClasses = 'hover:shadow-lg transition-all duration-300 hover:scale-105';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  href,
  onClick,
  ...props
}: CardProps | LinkCardProps) {
  const classes = `
    ${baseClasses}
    ${hover ? hoverClasses : ''}
    ${getPaddingClasses(padding)}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link href={href} className={`${classes} block group`}>
        {children}
      </Link>
    );
  }

  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component 
      className={onClick ? `${classes} cursor-pointer` : classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

// 卡片標題元件
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  gradient?: 'default' | 'albums' | 'finances';
  className?: string;
}

export function CardHeader({ 
  title, 
  subtitle, 
  icon, 
  actions,
  gradient = 'default',
  className = '' 
}: CardHeaderProps) {
  const gradientClasses = {
    default: 'from-rose-300 to-rose-500/90',
    albums: 'from-purple-300 to-rose-500/90',
    finances: 'from-emerald-300 to-rose-500/90'
  };

  return (
    <div className={`bg-gradient-to-r ${gradientClasses[gradient]} p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-2xl text-white">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-rose-100 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// 卡片內容元件
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

// 統計卡片元件
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
  className = '' 
}: StatsCardProps) {
  return (
    <Card className={`text-center ${className}`} hover>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-sm">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium mt-2 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}