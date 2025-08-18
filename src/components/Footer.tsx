import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { href: '/', label: '首頁' },
    { href: '/albums', label: '活動相簿' },
    { href: '/finances', label: '公積金' }
  ];

  return (
    <footer className={`bg-slate-900 text-white ${className}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          
          {/* 品牌區域 */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="text-3xl">⚓</div>
              <h3 className="text-xl font-bold">海盜大叔航海誌</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              一群陪公子打球的大叔聚在一起玩樂，
              記錄我們的歡樂時光與透明財務。
            </p>
          </div>

          {/* 快速連結 */}
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-4 text-rose-300">快速導覽</h4>
            <nav className="space-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-slate-400 hover:text-rose-300 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 聯絡資訊 */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-lg mb-4 text-rose-300">關於我們</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>📧 聯絡信箱: pirates@example.com</p>
              <p>📱 LINE 群組: 海盜大叔團</p>
              <p>🏴‍☠️ 成立時間: 2024年</p>
            </div>
          </div>
        </div>

        {/* 分隔線 */}
        <hr className="border-slate-700 my-8" />

        {/* 版權區域 */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>
            © {currentYear} 海盜大叔航海誌. 保留所有權利.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center space-x-2">
              <span>⚡</span>
              <span>由 Vercel 強力驅動</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>📊</span>
              <span>數據來源: Google Sheets</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// 簡化版頁腳 - 適用於特殊頁面
export function SimpleFooter({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-rose-50 border-t border-rose-100 py-8 ${className}`}>
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="text-xl">⚓</div>
          <span className="font-semibold text-slate-700">海盜大叔航海誌</span>
        </div>
        <p className="text-slate-500 text-sm">
          © {currentYear} Chronicle of the Uncle Pirates
        </p>
      </div>
    </footer>
  );
}