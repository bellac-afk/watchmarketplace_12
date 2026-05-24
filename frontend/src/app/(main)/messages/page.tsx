'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MessageSquare, Send, User, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/utils'

interface Conversation {
  partner: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    read: boolean
  }
  unreadCount: number
  listing?: {
    id: string
    watch: {
      brand: { name: string }
      model: string
    }
    images: Array<{ url: string }>
  }
}

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    id: string
    name: string
    avatar?: string
  }
}

export default function MessagesPage() {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messages/conversations')
      return data.data
    },
  })

  const { data: messages } = useQuery<Message[]>({
    queryKey: ['messages', selectedPartner],
    queryFn: async () => {
      if (!selectedPartner) return []
      const { data } = await api.get(`/messages/${selectedPartner}`)
      return data.data
    },
    enabled: !!selectedPartner,
    refetchInterval: 5000,
  })

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return

    try {
      await api.post('/messages', {
        receiverId: selectedPartner,
        listingId: conversations?.find(c => c.partner.id === selectedPartner)?.listing?.id,
        content: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const selectedConversation = conversations?.find(c => c.partner.id === selectedPartner)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Сообщения</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold">Диалоги</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations?.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Нет сообщений</p>
              </div>
            ) : (
              conversations?.map((conv) => (
                <button
                  key={conv.partner.id}
                  onClick={() => setSelectedPartner(conv.partner.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 ${
                    selectedPartner === conv.partner.id
                      ? 'bg-gold-50 dark:bg-gold-950/20 border-l-4 border-l-gold-500'
                      : ''
                  }`}
                >
                  {conv.partner.avatar ? (
                    <img
                      src={conv.partner.avatar}
                      alt={conv.partner.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{conv.partner.name}</span>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-gold-500 text-white text-xs rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.listing && (
                      <p className="text-xs text-slate-500 mb-1 truncate">
                        {conv.listing.watch.brand.name} {conv.listing.watch.model}
                      </p>
                    )}
                    <p className={`text-sm truncate ${
                      conv.unreadCount > 0 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-500'
                    }`}>
                      {conv.lastMessage.content}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatRelativeDate(conv.lastMessage.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          {selectedPartner && selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                {selectedConversation.partner.avatar ? (
                  <img
                    src={selectedConversation.partner.avatar}
                    alt={selectedConversation.partner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{selectedConversation.partner.name}</div>
                  {selectedConversation.listing && (
                    <div className="text-xs text-slate-500">
                      {selectedConversation.listing.watch.brand.name} {selectedConversation.listing.watch.model}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === selectedPartner ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      msg.senderId === selectedPartner
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                        : 'bg-gold-600 text-white rounded-tr-none'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderId === selectedPartner ? 'text-slate-400' : 'text-gold-200'
                      }`}>
                        {formatRelativeDate(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Напишите сообщение..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p>Выберите диалог для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
