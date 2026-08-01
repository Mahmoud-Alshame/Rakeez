import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'

/**
 * طبقة الدردشة — مرتبطة بـ Firestore.
 *
 * الهيكل الفعلي المستخدم:
 *
 * conversations/{conversationId}/messages/{messageId}
 *   - senderId: string   // uid أو 'system'
 *   - text: string
 *   - createdAt: Timestamp (serverTimestamp)
 *
 * readReceipts/{conversationId}_{uid}
 *   - lastReadAt: Timestamp (serverTimestamp)
 *   يُستخدم لحساب مؤشر "رسائل غير مقروءة" لكل مستخدم في كل محادثة.
 */

/** معرّف محادثة ثابت لكل مناقصة فائزة */
export function conversationIdForTender(tenderId) {
  return `conv-${tenderId}`
}

export function isFirebaseChatEnabled() {
  return firebaseReady
}

/** يستمع لرسائل محادثة معيّنة بشكل لحظي (كل الرسائل، مرتبة تصاعدياً) */
export function subscribeMessages(conversationId, onMessages) {
  if (!conversationId) return () => {}
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, (snap) => {
    onMessages(
      snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        }
      }),
    )
  })
}

/** يستمع فقط لآخر رسالة بمحادثة معيّنة — خفيف، يُستخدم لمؤشر "غير مقروء" في القائمة */
export function subscribeLastMessage(conversationId, onMessage) {
  if (!conversationId) return () => {}
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(1),
  )
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      onMessage(null)
      return
    }
    const d = snap.docs[0]
    const data = d.data()
    onMessage({
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    })
  })
}

/** يستمع لوقت آخر قراءة لمستخدم معيّن بمحادثة معيّنة */
export function subscribeReadReceipt(conversationId, uid, onRead) {
  if (!conversationId || !uid) return () => {}
  return onSnapshot(doc(db, 'readReceipts', `${conversationId}_${uid}`), (snap) => {
    if (!snap.exists()) {
      onRead(null)
      return
    }
    const data = snap.data()
    onRead(data.lastReadAt?.toDate ? data.lastReadAt.toDate().toISOString() : null)
  })
}

/** يحدّث "آخر قراءة" للمستخدم الحالي بمحادثة معيّنة — يُستدعى عند فتح/متابعة المحادثة */
export async function markConversationRead(conversationId, uid) {
  if (!conversationId || !uid) return
  await setDoc(
    doc(db, 'readReceipts', `${conversationId}_${uid}`),
    { lastReadAt: serverTimestamp() },
    { merge: true },
  )
}

/** يرسل رسالة جديدة لمحادثة معيّنة */
export async function sendFirebaseMessage(conversationId, senderId, text) {
  const trimmed = text?.trim()
  if (!trimmed) return null
  const docRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}