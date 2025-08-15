import Link from 'next/link';
import { getTransactions, getFinancialSummary } from '@/lib/sheets';

// Revalidate this page every 5 minutes (300 seconds) 
// Financial data is more critical, so we want more frequent updates
export const revalidate = 300;

export default async function FinancesPage() {
  const [transactions, summary] = await Promise.all([
    getTransactions(),
    getFinancialSummary()
  ]);

  // 按日期排序（最新的在前面）
  const sortedTransactions = transactions.sort((a, b) => 
    new Date(b.Date).getTime() - new Date(a.Date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 頁面標題 */}
      <section className="relative bg-gradient-to-r from-rose-500/90 to-rose-700/90 text-white">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="relative z-10 inline-flex items-center text-rose-200 hover:text-white mb-6 transition-colors">
              ← 返回首頁
            </Link>
            <h1 className="relative z-10 text-4xl md:text-5xl font-bold mb-4">公積金明細</h1>
            <p className="relative z-10 text-xl opacity-90">
              透明公開的財務管理，每一筆收支都清楚記錄
            </p>
          </div>
        </div>
      </section>

      {/* 財務總覽 */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">財務總覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 目前結餘 */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">目前結餘</h3>
              <p className={`text-4xl font-bold ${
                summary.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                NT$ {summary.currentBalance.toLocaleString()}
              </p>
            </div>

            {/* 總收入 */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md p-8 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">總收入</h3>
              <p className="text-4xl font-bold text-green-600">
                NT$ {summary.totalIncome.toLocaleString()}
              </p>
            </div>

            {/* 總支出 */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md p-8 text-center">
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">總支出</h3>
              <p className="text-4xl font-bold text-red-600">
                NT$ {summary.totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 交易明細 */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">收支明細</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl opacity-20 mb-6">📊</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">暫無交易記錄</h3>
              <p className="text-slate-600">
                目前還沒有任何收支記錄
              </p>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md overflow-hidden">
              {/* 表格標題（桌面版） */}
              <div className="hidden md:block bg-gray-50 px-6 py-4 border-b">
                <div className="grid grid-cols-8 gap-4 font-semibold text-gray-700">
                  <div>日期</div>
                  <div>來源</div>
                  <div>項目說明</div>
                  <div>類型</div>
                  <div>金額</div>
                  <div>經手人</div>
                  <div>結餘</div>
                  <div>收據</div>
                </div>
              </div>

              {/* 交易記錄 */}
              <div className="divide-y divide-gray-100">
                {sortedTransactions.map((transaction, index) => (
                  <div key={transaction.TransactionID || `transaction-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                    
                    {/* 桌面版佈局 */}
                    <div className="hidden md:grid grid-cols-8 gap-4 items-center">
                      <div className="text-gray-600">
                        {new Date(transaction.Date).toLocaleDateString('zh-TW')}
                      </div>
                      <div className="text-gray-600">
                        {transaction.Source}
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.Description}
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.Type === '收入' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.Type}
                        </span>
                      </div>
                      <div className={`font-bold ${
                        transaction.Type === '收入' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.Type === '收入' ? '+' : '-'}NT$ {transaction.Amount.toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        {transaction.Handler}
                      </div>
                      <div className={`font-semibold ${
                        transaction.Balance >= 0 ? 'text-gray-800' : 'text-red-600'
                      }`}>
                        NT$ {transaction.Balance.toLocaleString()}
                      </div>
                      <div>
                        {transaction.ReceiptURL ? (
                          <a 
                            href={transaction.ReceiptURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            查看收據
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">無</span>
                        )}
                      </div>
                    </div>

                    {/* 手機版佈局 */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{transaction.Description}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.Date).toLocaleDateString('zh-TW')} · {transaction.Source} · {transaction.Handler}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.Type === '收入' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.Type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className={`font-bold text-lg ${
                          transaction.Type === '收入' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.Type === '收入' ? '+' : '-'}NT$ {transaction.Amount.toLocaleString()}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">結餘</div>
                          <div className={`font-semibold ${
                            transaction.Balance >= 0 ? 'text-gray-800' : 'text-red-600'
                          }`}>
                            NT$ {transaction.Balance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {transaction.ReceiptURL && (
                        <div className="mt-2">
                          <a 
                            href={transaction.ReceiptURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            查看收據 →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 統計資訊 */}
      {transactions.length > 0 && (
        <section className="bg-rose-50/70 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">統計資訊</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">{summary.transactionCount}</div>
                  <div className="text-slate-700 text-sm">總筆數</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {transactions.filter(t => t.Type === '收入').length}
                  </div>
                  <div className="text-slate-700 text-sm">收入筆數</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-2xl font-bold text-red-600">
                    {transactions.filter(t => t.Type === '支出').length}
                  </div>
                  <div className="text-slate-700 text-sm">支出筆數</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {summary.totalIncome > 0 
                      ? Math.round((summary.totalExpense / summary.totalIncome) * 100) 
                      : 0}%
                  </div>
                  <div className="text-slate-700 text-sm">支出比例</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}