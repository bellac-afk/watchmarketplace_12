'use client'

import { motion } from 'framer-motion'
import { Search, MessageCircle, ShieldCheck, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Найдите часы',
    description: 'Используйте поиск по референсу или фильтры для поиска идеальных часов',
  },
  {
    icon: MessageCircle,
    title: 'Свяжитесь с продавцом',
    description: 'Задавайте вопросы через внутренний чат и договаривайтесь о сделке',
  },
  {
    icon: ShieldCheck,
    title: 'Проверьте продавца',
    description: 'Изучите рейтинг, отзывы и статус верификации продавца',
  },
  {
    icon: CheckCircle2,
    title: 'Совершите сделку',
    description: 'Встретьтесь лично или используйте безопасную доставку',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Как это работает
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Простой и безопасный процесс покупки и продажи часов премиум-класса
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gold-500/10 rounded-2xl flex items-center justify-center">
                <step.icon className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
