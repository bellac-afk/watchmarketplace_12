import { redirect } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In real app, check admin role server-side
  // const session = await getServerSession()
  // if (session?.user?.role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen p-4">
          <h2 className="font-serif font-bold text-xl mb-6">Admin Panel</h2>
          <nav className="space-y-1">
            <a href="/admin" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
              Dashboard
            </a>
            <a href="/admin/listings" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
              Модерация объявлений
            </a>
            <a href="/admin/watches" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
              Управление каталогом
            </a>
            <a href="/admin/users" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
              Пользователи
            </a>
            <a href="/admin/brands" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
              Бренды
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
