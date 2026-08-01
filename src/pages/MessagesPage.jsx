import { useEffect, useMemo, useRef, useState } from 'react'
import { RequirePermission } from '../components/auth/RequirePermission'
import { Alert } from '../components/ui/Alert'
import { btnPrimary, inputClass } from '../components/ui/FormField'
import { useAuth } from '../contexts/authContext'
import { useData } from '../contexts/dataContext'
import {
  subscribeMessages,
  sendFirebaseMessage,
  subscribeLastMessage,
  subscribeReadReceipt,
  markConversationRead,
} from '../services/chat'

/**
 * صفحة الرسائل — واجهة دردشة كاملة، متصلة بـ Firestore بشكل لحظي (Realtime).
 * قائمة المحادثات مُشتقة من dataContext (tenders/bids)، والرسائل نفسها
 * تُستمع لها مباشرة عبر subscribeMessages من services/chat.js.
 * كل عنصر بالقائمة يعرض مؤشر "غير مقروء" عبر مقارنة آخر رسالة بآخر قراءة.
 */
export default function MessagesPage() {
  const { user, role } = useAuth()
  const { canAccessMessages, getConversationsForUser } = useData()

  const allowed = canAccessMessages(user?.uid, role)
  const conversations = useMemo(
    () => (allowed ? getConversationsForUser(user?.uid, role) : []),
    [allowed, getConversationsForUser, user?.uid, role],
  )

  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0] || null
  const activeConversationId = activeConversation?.id ?? null

  useEffect(() => {
    if (conversations.length && !activeId) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId])

  // يستمع لرسائل المحادثة النشطة، ويحدّث "آخر قراءة" في كل مرة توصل رسالة
  // بينما المستخدم فاتح هذه المحادثة تحديداً — يمنع بقاء المؤشر ظاهراً بالخطأ.
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }
    const unsubscribe = subscribeMessages(activeConversationId, (msgs) => {
      setMessages(msgs)
      if (user?.uid) markConversationRead(activeConversationId, user.uid)
    })
    return unsubscribe
  }, [activeConversationId, user?.uid])

  async function handleSend(e) {
    e.preventDefault()
    if (!activeConversationId || !draft.trim()) return
    setError('')
    setSending(true)
    try {
      await sendFirebaseMessage(activeConversationId, user.uid, draft)
      setDraft('')
    } catch (err) {
      setError('تعذّر إرسال الرسالة، حاول مرة أخرى.')
    } finally {
      setSending(false)
    }
  }

  return (
    <RequirePermission permission="MESSAGES">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">الرسائل</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            التواصل بين الشركة الناشئة والمورد الفائز بعد اختيار العرض.
          </p>
        </div>

        {!allowed ? (
          <Alert variant="info" title="الرسائل غير متاحة بعد">
            تُفعَّل صفحة الرسائل فقط بعد اختيار عرض فائز في مناقصة (للناشئة) أو الفوز بمناقصة (للمورد).
          </Alert>
        ) : (
          <div className="grid min-h-[520px] gap-4 lg:grid-cols-3">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveId}
              currentUserId={user?.uid}
            />

            <ChatPanel
              conversation={activeConversation}
              messages={messages}
              currentUserId={user?.uid}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              sending={sending}
              error={error}
            />
          </div>
        )}
      </div>
    </RequirePermission>
  )
}

function ConversationList({ conversations, activeId, onSelect, currentUserId }) {
  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900 lg:col-span-1">
      <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
          المحادثات
        </p>
        <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
          {conversations.length} محادثة
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-stone-500 dark:text-stone-400">
            لا توجد محادثات بعد. ستظهر تلقائياً بعد اختيار عرض فائز.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {conversations.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={onSelect}
                currentUserId={currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

/**
 * عنصر واحد بقائمة المحادثات — يدير استماعاته الخاصة (آخر رسالة + آخر قراءة)
 * بشكل مستقل، ويحسب مؤشر "غير مقروء" محلياً بالمقارنة بينهما.
 */
function ConversationListItem({ conversation, active, onSelect, currentUserId }) {
  const [lastMessage, setLastMessage] = useState(null)
  const [lastReadAt, setLastReadAt] = useState(null)

  useEffect(() => {
    const unsubMsg = subscribeLastMessage(conversation.id, setLastMessage)
    const unsubRead = subscribeReadReceipt(conversation.id, currentUserId, setLastReadAt)
    return () => {
      unsubMsg()
      unsubRead()
    }
  }, [conversation.id, currentUserId])

  const isUnread =
    lastMessage &&
    lastMessage.senderId !== currentUserId &&
    (!lastReadAt || new Date(lastMessage.createdAt) > new Date(lastReadAt))

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className={`w-full px-4 py-3 text-right transition ${
          active
            ? 'bg-primary-light/80 dark:bg-emerald-950/50'
            : 'hover:bg-stone-50 dark:hover:bg-stone-800/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
            {conversation.partnerName}
          </p>
          {isUnread ? (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-label="رسائل غير مقروءة" />
          ) : null}
        </div>
        <p className="truncate text-xs text-primary-dark dark:text-emerald-400">
          {conversation.tenderTitle}
        </p>
        {lastMessage ? (
          <p
            className={`mt-1 line-clamp-1 text-xs ${
              isUnread
                ? 'font-semibold text-stone-700 dark:text-stone-200'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {lastMessage.text}
          </p>
        ) : null}
      </button>
    </li>
  )
}

function ChatPanel({ conversation, messages, currentUserId, draft, onDraftChange, onSend, sending, error }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, conversation?.id])

  if (!conversation) {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/50 lg:col-span-2">
        <p className="text-sm text-stone-500 dark:text-stone-400">اختر محادثة من القائمة</p>
      </section>
    )
  }

  return (
    <section className="flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900 lg:col-span-2">
      <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <div className="min-w-0">
          <p className="truncate font-bold text-stone-900 dark:text-stone-100">{conversation.partnerName}</p>
          <p className="truncate text-xs text-stone-500 dark:text-stone-400">{conversation.tenderTitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          نشطة
        </span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50/80 p-4 dark:bg-stone-950/40">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">
            لا رسائل بعد — ابدأ المحادثة الآن.
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <div className="px-4 pt-2">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <form
        onSubmit={onSend}
        className="flex gap-2 border-t border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
      >
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="اكتب رسالتك…"
          className={inputClass + ' flex-1'}
          autoComplete="off"
          disabled={sending}
        />
        <button type="submit" disabled={!draft.trim() || sending} className={btnPrimary + ' shrink-0 px-5'}>
          {sending ? 'جاري الإرسال…' : 'إرسال'}
        </button>
      </form>
    </section>
  )
}

function MessageBubble({ message, isOwn }) {
  const isSystem = message.senderId === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <p className="rounded-full bg-stone-200/80 px-3 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          {message.text}
        </p>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isOwn
            ? 'rounded-ee-sm bg-primary text-white dark:bg-emerald-700'
            : 'rounded-es-sm border border-stone-200 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <p
          className={`mt-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-stone-400 dark:text-stone-500'}`}
        >
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
            : '…'}
        </p>
      </div>
    </div>
  )
}