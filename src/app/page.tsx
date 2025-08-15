import Link from 'next/link';
import { getFinancialSummary, getAlbums } from '@/lib/sheets';

// Revalidate this page every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  // 取得資料概覽
  const [financialSummary, albums] = await Promise.all([
    getFinancialSummary(),
    getAlbums()
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 主視覺區塊 */}
      <section className="relative bg-gradient-to-r from-rose-500/90 to-rose-700/90 text-white">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              海盜大叔航海誌
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Chronicle of the Uncle Pirates
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-rose-100 to-transparent"></div>
      </section>

      {/* 快速概覽區塊 */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* 活動相簿卡片 */}
          <Link href="/albums" className="group">
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-105 h-80 flex flex-col">
              <div className="bg-gradient-to-r from-rose-300 to-rose-500/90 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">活動相簿</h2>
                <p className="text-rose-100">回顾我們的精彩時光</p>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{albums.length}</p>
                    <p className="text-slate-700">個相簿</p>
                  </div>
                  <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    📸
                  </div>
                </div>
                <p className="text-slate-700 mt-4">
                  瀏覽團隊的活動照片與美好回憶
                </p>
              </div>
            </div>
          </Link>

          {/* 公積金總覽卡片 */}
          <Link href="/finances" className="group">
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-105 h-80 flex flex-col">
              <div className="bg-gradient-to-r from-rose-300 to-rose-500/90 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">公積金總覽</h2>
                <p className="text-rose-100">透明的財務管理</p>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      NT$ {financialSummary.currentBalance.toLocaleString()}
                    </p>
                    <p className="text-slate-700">目前結餘</p>
                  </div>
                  <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    💰
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-600/90 font-semibold">
                      +NT$ {financialSummary.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-slate-600">總收入</p>
                  </div>
                  <div>
                    <p className="text-red-600/90 font-semibold">
                      -NT$ {financialSummary.totalExpense.toLocaleString()}
                    </p>
                    <p className="text-slate-600">總支出</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 關於我們區塊 */}
      <section className="bg-rose-50/70 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">關於海盜大叔</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              一群陪公子打球的大叔聚在一起玩樂，這個網站記錄我們的照片
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}