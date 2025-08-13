import Link from 'next/link';
import { getAlbums } from '@/lib/sheets';

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-rose-50">
      {/* 頁面標題 */}
      <section className="relative bg-gradient-to-r from-rose-500/90 to-rose-700/90 text-white">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="relative z-10 inline-flex items-center text-rose-200 hover:text-white mb-6 transition-colors">
              ← 返回首頁
            </Link>
            <h1 className="relative z-10 text-4xl md:text-5xl font-bold mb-4">活動相簿</h1>
            <p className="relative z-10 text-xl opacity-90">
              回顧我們的精彩時光與美好回憶
            </p>
          </div>
        </div>
      </section>

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
              <div
                key={album.AlbumID}
                className="bg-rose-50 border border-rose-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-105"
              >
                {/* 相簿封面 */}
                <div className="relative h-48 bg-gradient-to-br from-rose-200 to-rose-400/80">
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
                <div className="p-6">
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
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  >
                    查看完整相簿 📸
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 統計資訊 */}
      {albums.length > 0 && (
        <section className="bg-rose-50/70 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">相簿統計</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{albums.length}</div>
                  <div className="text-slate-700">總相簿數</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600">
                    {new Date().getFullYear() - Math.min(...albums.map(a => new Date(a.Date).getFullYear())) + 1}
                  </div>
                  <div className="text-slate-700">活動年數</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-teal-600">
                    {albums.filter(a => new Date(a.Date).getFullYear() === new Date().getFullYear()).length}
                  </div>
                  <div className="text-slate-700">今年活動</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}