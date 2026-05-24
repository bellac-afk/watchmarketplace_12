'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Watch, User, Heart, MessageSquare, Plus, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SmartSearch } from '@/components/search/SmartSearch'
import type { RootState } from '@/store'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const navLinks = [
    { href: '/watches', label: 'Каталог' },
    { href: '/listings', label: 'Объявления' },
    { href: '/search', label: 'Поиск' },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Watch className="w-8 h-8 text-gold-500" />
            <span className="font-serif font-bold text-xl hidden sm:block">
              Watch<span className="text-gold-500">Market</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SmartSearch variant="header" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  href="/messages"
                  className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link
                  href="/listings/create"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Продать</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
          >
            <div className="px-4 py-4 space-y-4">
              <SmartSearch variant="header" />

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(link.href)
                        ? 'text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/30'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {isAuthenticated ? (
                <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                    <User className="w-4 h-4" /> Профиль
                  </Link>
                  <Link href="/favorites" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                    <Heart className="w-4 h-4" /> Избранное
                  </Link>
                  <Link href="/messages" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                    <MessageSquare className="w-4 h-4" /> Сообщения
                  </Link>
                  <Link href="/listings/create" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gold-600">
                    <Plus className="w-4 h-4" /> Разместить объявление
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link href="/login" className="flex-1 btn-secondary text-center">
                    Войти
                  </Link>
                  <Link href="/register" className="flex-1 btn-primary text-center">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
