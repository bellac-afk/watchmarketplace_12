import { Metadata } from 'next'
import { ShieldCheck, AlertTriangle, UserCheck, MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Безопасность — WatchMarketplace' }

const TIPS = [
  { icon: UserCheck, title: 'Проверяйте продавца', text: 'Смотрите на рейтинг, количество сделок и дату регистрации. Верифицированные продавцы отмечены значком.' },
  { icon: MessageCircle, title: 'Общайтесь внутри платформы', text: 'Вся переписка должна вестись через чат на сайте. Не переходите в сторонние мессенджеры.' },
  { icon: ShieldCheck, title: 'Встречайтесь лично', text: 'Проводите сделки очно, в публичных местах. Проверяйте документы и подлинность часов перед оплатой.' },
  { icon: AlertTriangle, title: 'Не платите авансом', text: 'Никогда не переводите деньги заранее незнакомым людям. Мошенники часто просят предоплату.' },
]

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">Безопасность сделок</h1>
      <p className="text-slate-500 mb-10">Рекомендации для безопасной покупки и продажи часов</p>
      <div className="grid sm:grid-cols-2 gap-6">
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <Icon className="w-8 h-8 text-gold-500 mb-4" />
            <h2 className="font-bold mb-2">{title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 card p-6 text-center">
        <p className="text-slate-500 text-sm">Заметили подозрительное объявление?</p>
        <a href="mailto:safety@watchmarket.ru" className="btn-primary inline-block mt-3 px-6 py-2">Сообщить</a>
      </div>
    </div>
  )
}
