import { getFinancialSummary, getAlbums } from '@/lib/sheets';
import Card, { CardHeader, CardContent } from '@/components/Card';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';

// Revalidate this page every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  // 取得資料概覽
  const [financialSummary, albums] = await Promise.all([
    getFinancialSummary(),
    getAlbums()
  ]);

  return (
    <div className="bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 主視覺區塊 */}
      <PageHeader
        title="海盜大叔航海誌"
        subtitle="Chronicle of the Uncle Pirates - 記錄我們的歡樂時光與透明財務"
        icon="⚓"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button href="/albums" variant="secondary" size="lg">
            <span className="mr-2">📸</span>
            瀏覽相簿
          </Button>
          <Button href="/finances" variant="outline" size="lg">
            <span className="mr-2">💰</span>
            查看財務
          </Button>
        </div>
      </PageHeader>

      {/* 快速概覽區塊 */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* 活動相簿卡片 */}
          <Card href="/albums" hover className="h-80 flex flex-col">
            <CardHeader
              title="活動相簿"
              subtitle="回顧我們的精彩時光"
              icon="📸"
              gradient="albums"
            />
            <CardContent className="flex-1 flex flex-col justify-between">
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
            </CardContent>
          </Card>

          {/* 公積金總覽卡片 */}
          <Card href="/finances" hover className="h-80 flex flex-col">
            <CardHeader
              title="公積金總覽"
              subtitle="透明的財務管理"
              icon="💰"
              gradient="finances"
            />
            <CardContent className="flex-1 flex flex-col justify-between">
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
            </CardContent>
          </Card>
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
    </div>
  );
}