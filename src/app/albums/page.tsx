import { getAlbums } from '@/lib/sheets';
import Card, { CardContent, StatsCard } from '@/components/Card';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';

// Revalidate this page every 10 minutes (600 seconds)
// Albums are updated less frequently than financial data
export const revalidate = 600;

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 頁面標題 */}
      <PageHeader
        title="活動相簿"
        subtitle="回顧我們的精彩時光與美好回憶"
        icon="📸"
        gradient="albums"
      >
        <Button href="/" variant="secondary">
          ← 返回首頁
        </Button>
      </PageHeader>

      {/* 相簿網格 */}
      <section className="container mx-auto px-6 py-16">
        {albums.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl opacity-20 mb-6">📸</div>
            <h2 className="text-2xl font-bold text-slate-700 mb-4">暫無相簿</h2>
            <p className="text-slate-600">
              目前還沒有上傳任何相簿，請期待我們的第一次冒險！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {albums.map((album) => (
              <Card key={album.AlbumID} hover className="overflow-hidden">
                {/* 相簿封面 */}
                <div className="relative h-48 bg-gradient-to-br from-purple-200 to-rose-400/80">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-6xl opacity-30">📸</div>
                  </div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* 日期標籤 */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    {new Date(album.Date).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                </div>

                {/* 相簿資訊 */}
                <CardContent>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {album.Title}
                  </h3>
                  <p className="text-slate-700 mb-4 line-clamp-3">
                    {album.Description}
                  </p>
                  
                  {/* 查看相簿按鈕 */}
                  <a
                    href={album.AlbumURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    查看完整相簿 📸
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 統計資訊 */}
      {albums.length > 0 && (
        <section className="bg-rose-50/70 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">相簿統計</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatsCard
                  title="總相簿數"
                  value={albums.length}
                  icon="📸"
                />
                <StatsCard
                  title="活動年數"
                  value={new Date().getFullYear() - Math.min(...albums.map(a => new Date(a.Date).getFullYear())) + 1}
                  icon="📅"
                />
                <StatsCard
                  title="今年活動"
                  value={albums.filter(a => new Date(a.Date).getFullYear() === new Date().getFullYear()).length}
                  icon="🎉"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}