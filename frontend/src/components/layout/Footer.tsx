import Link from 'next/link'
import { Watch, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Watch className="w-8 h-8 text-gold-500" />
              <span className="font-serif font-bold text-xl text-white">
                Watch<span className="text-gold-500">Market</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Крупнейший маркетплейс премиальных часов. 
              Покупайте и продавайте часы с уверенностью.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/watches" className="hover:text-gold-400 transition-colors">Каталог</Link></li>
              <li><Link href="/listings" className="hover:text-gold-400 transition-colors">Объявления</Link></li>
              <li><Link href="/search" className="hover:text-gold-400 transition-colors">Поиск</Link></li>
              <li><Link href="/compare" className="hover:text-gold-400 transition-colors">Сравнение</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-gold-400 transition-colors">Помощь</Link></li>
              <li><Link href="/safety" className="hover:text-gold-400 transition-colors">Безопасность</Link></li>
              <li><Link href="/terms" className="hover:text-gold-400 transition-colors">Условия</Link></li>
              <li><Link href="/privacy" className="hover:text-gold-400 transition-colors">Конфиденциальность</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-500" />
                <span>support@watchmarket.ru</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-500" />
                <span>+7 (999) 123-45-67</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-500" />
                <span>Москва, Россия</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          <p>© 2024 WatchMarketplace. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
