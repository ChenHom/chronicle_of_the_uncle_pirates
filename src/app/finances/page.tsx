import { getTransactions, getFinancialSummary } from '@/lib/sheets';
import Card, { CardContent, StatsCard } from '@/components/Card';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';

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
    <div className="bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 頁面標題 */}
      <PageHeader
        title="公積金明細"
        subtitle="透明公開的財務管理，每一筆收支都清楚記錄"
        icon="💰"
        gradient="finances"
      >
        <Button href="/" variant="secondary">
          ← 返回首頁
        </Button>
      </PageHeader>

      {/* 財務總覽 */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">財務總覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCard
              title="目前結餘"
              value={`NT$ ${summary.currentBalance.toLocaleString()}`}
              icon="💰"
              className={summary.currentBalance >= 0 ? '' : 'border-red-200'}
            />
            <StatsCard
              title="總收入"
              value={`NT$ ${summary.totalIncome.toLocaleString()}`}
              icon="📈"
            />
            <StatsCard
              title="總支出"
              value={`NT$ ${summary.totalExpense.toLocaleString()}`}
              icon="📉"
            />
          </div>
        </div>

        {/* 交易明細 */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">收支明細</h2>
          
          {transactions.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl opacity-20 mb-6">📊</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">暫無交易記錄</h3>
              <p className="text-slate-600">目前還沒有任何收支記錄</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((transaction, index) => (
                <Card key={transaction.TransactionID || `transaction-${index}`} hover>
                  <CardContent className="py-4">
                    {/* 桌面版佈局 */}
                    <div className="hidden md:grid md:grid-cols-7 gap-4 items-center">
                      <div className="text-slate-600">
                        {new Date(transaction.Date).toLocaleDateString('zh-TW')}
                      </div>
                      <div className="font-medium text-slate-800 col-span-2">
                        {transaction.Description}
                      </div>
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.Type === '收入' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.Type}
                        </span>
                      </div>
                      <div className={`font-bold text-right ${
                        transaction.Type === '收入' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.Type === '收入' ? '+' : '-'}NT$ {transaction.Amount.toLocaleString()}
                      </div>
                      <div className="text-slate-600 text-center">
                        {transaction.Handler}
                      </div>
                      <div className="flex justify-end">
                        {transaction.ReceiptURL ? (
                          <a 
                            href={transaction.ReceiptURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            查看收據
                          </a>
                        ) : (
                          <span className="text-slate-400">無</span>
                        )}
                      </div>
                    </div>

                    {/* 移動版佈局 */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-slate-800">{transaction.Description}</h4>
                          <p className="text-sm text-slate-500">
                            {new Date(transaction.Date).toLocaleDateString('zh-TW')} · {transaction.Handler}
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
                          <div className="text-sm text-slate-500">結餘</div>
                          <div className={`font-semibold ${
                            transaction.Balance >= 0 ? 'text-slate-800' : 'text-red-600'
                          }`}>
                            NT$ {transaction.Balance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {transaction.ReceiptURL && (
                        <div className="mt-3 pt-3 border-t border-rose-100">
                          <a 
                            href={transaction.ReceiptURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            查看收據 →
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                <StatsCard
                  title="總筆數"
                  value={summary.transactionCount}
                  icon="📊"
                />
                <StatsCard
                  title="收入筆數"
                  value={transactions.filter(t => t.Type === '收入').length}
                  icon="📈"
                />
                <StatsCard
                  title="支出筆數"
                  value={transactions.filter(t => t.Type === '支出').length}
                  icon="📉"
                />
                <StatsCard
                  title="支出比例"
                  value={`${summary.totalIncome > 0 
                    ? Math.round((summary.totalExpense / summary.totalIncome) * 100) 
                    : 0}%`}
                  icon="📊"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}