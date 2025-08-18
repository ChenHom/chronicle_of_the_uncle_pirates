'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-rose-500 text-white shadow-md' 
          : 'text-slate-700 hover:text-rose-600 hover:bg-rose-50'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: '首頁', icon: '🏠' },
    { href: '/albums', label: '活動相簿', icon: '📸' },
    { href: '/finances', label: '公積金', icon: '💰' }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="text-2xl group-hover:scale-110 transition-transform">⚓</div>
            <span className="font-bold text-xl text-slate-900 group-hover:text-rose-600 transition-colors">
              海盜大叔
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                isActive={pathname === item.href}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-rose-50 transition-colors"
            aria-label="開啟選單"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}></span>
              <span className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-48 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-2 pt-4">
            {navItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                isActive={pathname === item.href}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}