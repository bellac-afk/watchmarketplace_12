import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Конфиденциальность — WatchMarketplace' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">Политика конфиденциальности</h1>
      <p className="text-slate-500 mb-10">Последнее обновление: 1 января 2026 г.</p>
      <div className="space-y-8 text-slate-700 dark:text-slate-300">
        {[
          { title: 'Какие данные мы собираем', text: 'При регистрации: имя, email, номер телефона (опционально). При использовании сервиса: история просмотров, поисковые запросы, сообщения между пользователями.' },
          { title: 'Как мы используем данные', text: 'Для работы платформы, персонализации рекомендаций, обеспечения безопасности и связи с вами по вопросам сервиса.' },
          { title: 'Передача данным третьим лицам', text: 'Мы не продаём ваши данные. Передача возможна только по законному требованию государственных органов или для работы технических сервисов (хостинг, аналитика).' },
          { title: 'Хранение данных', text: 'Данные хранятся на защищённых серверах. Пароли хешируются и не хранятся в открытом виде.' },
          { title: 'Ваши права', text: 'Вы можете запросить удаление аккаунта и всех связанных данных, написав на privacy@watchmarket.ru.' },
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
