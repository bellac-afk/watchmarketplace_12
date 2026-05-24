import { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, ShieldCheck, CreditCard, PackageCheck, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Помощь — WatchMarketplace',
  description: 'Часто задаваемые вопросы и помощь по работе с маркетплейсом часов',
}

const FAQ = [
  {
    q: 'Как разместить объявление?',
    a: 'Зарегистрируйтесь или войдите в аккаунт, затем нажмите кнопку «Продать» в шапке сайта. Заполните данные о часах, укажите состояние и цену.',
  },
  {
    q: 'Как проверить подлинность часов?',
    a: 'Мы рекомендуем встречаться лично или запрашивать документы (паспорт изделия, гарантийный талон). Верифицированные продавцы отмечены значком.',
  },
  {
    q: 'Как связаться с продавцом?',
    a: 'На странице объявления есть кнопка «Написать». Переписка ведётся внутри платформы.',
  },
  {
    q: 'Что делать если возникли проблемы со сделкой?',
    a: 'Напишите в поддержку через форму ниже или на email support@watchmarket.ru. Мы рассматриваем обращения в течение 24 часов.',
  },
  {
    q: 'Безопасно ли совершать сделки?',
    a: 'Мы рекомендуем проводить сделки очно. Никогда не переводите деньги заранее незнакомым людям.',
  },
]

const TOPICS = [
  { icon: PackageCheck, title: 'Размещение объявлений', href: '/listings/create' },
  { icon: ShieldCheck, title: 'Безопасность сделок', href: '#safety' },
  { icon: CreditCard, title: 'Оплата и доставка', href: '#payment' },
  { icon: MessageCircle, title: 'Связь с поддержкой', href: '#contact' },
  { icon: AlertTriangle, title: 'Сообщить о нарушении', href: '#report' },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">Помощь</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-10">
        Всё, что нужно знать для безопасных сделок на WatchMarket
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {TOPICS.map(({ icon: Icon, title, href }) => (
          <Link
            key={title}
            href={href}
            className="card p-4 flex flex-col items-center gap-2 text-center hover:border-gold-400 transition-colors group"
          >
            <Icon className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{title}</span>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-6">Частые вопросы</h2>
      <div className="space-y-4">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="card p-5 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              {q}
              <span className="text-gold-500 text-lg group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      <div id="contact" className="mt-12 card p-6 text-center">
        <h2 className="text-lg font-bold mb-2">Не нашли ответ?</h2>
        <p className="text-slate-500 text-sm mb-4">Напишите нам — ответим в течение 24 часов</p>
        <a
          href="mailto:support@watchmarket.ru"
          className="btn-primary inline-block px-6 py-2"
        >
          Написать в поддержку
        </a>
      </div>
    </div>
  )
}
