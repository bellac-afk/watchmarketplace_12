import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Условия использования — WatchMarketplace' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">Условия использования</h1>
      <p className="text-slate-500 mb-10">Последнее обновление: 1 января 2026 г.</p>
      <div className="prose dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">
        {[
          { title: '1. Общие положения', text: 'WatchMarketplace — площадка для купли-продажи наручных часов между частными лицами. Используя сервис, вы соглашаетесь с настоящими условиями.' },
          { title: '2. Регистрация', text: 'Для размещения объявлений необходима регистрация. Вы обязуетесь предоставлять достоверные данные и нести ответственность за действия из своего аккаунта.' },
          { title: '3. Объявления', text: 'Запрещено размещать фальсифицированные или похищенные товары, а также вводящие в заблуждение описания. Администрация вправе удалять нарушающие правила объявления.' },
          { title: '4. Сделки', text: 'Платформа является посредником для связи покупателей и продавцов. WatchMarketplace не несёт ответственности за качество товаров и выполнение договорённостей между пользователями.' },
          { title: '5. Ответственность', text: 'Пользователи несут полную ответственность за законность своих действий на платформе. Администрация оставляет за собой право заблокировать аккаунт при нарушении правил.' },
        ].map(({ title, text }) => (
          <section key={title}>
            <h2 className="text-lg font-bold mb-2">{title}</h2>
            <p className="text-sm leading-relaxed">{text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
