import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { ACCOUNT_STATUS } from '../constants/auth'
import { USER_ROLES } from '../constants/roles'
import { conversationIdForTender } from '../services/chat'
import { useAuth } from './authContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user, initializing } = useAuth()
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [tenders, setTenders] = useState([])
  const [bids, setBids] = useState([])
  const [disputes, setDisputes] = useState([])

  useEffect(() => {
    // ننتظر لحد ما authContext يتأكد من حالة تسجيل الدخول، وما نفتح
    // أي listener إلا بعد ما يصير عندنا مستخدم مسجّل دخول فعليًا.
    // هيك منتجنب رفض Firestore (permission-denied) بسبب فتح الـ
    // listeners قبل ما يجهز request.auth عند Firestore.
    if (initializing || !user) {
      setCategories([])
      setUsers([])
      setTenders([])
      setBids([])
      setDisputes([])
      return
    }

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
    })
    const unsubTenders = onSnapshot(collection(db, 'tenders'), (snap) => {
      setTenders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubBids = onSnapshot(collection(db, 'bids'), (snap) => {
      setBids(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubDisputes = onSnapshot(collection(db, 'disputes'), (snap) => {
      setDisputes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })

    return () => {
      unsubCategories()
      unsubUsers()
      unsubTenders()
      unsubBids()
      unsubDisputes()
    }
  }, [initializing, user])

  // ---------- categories ----------
  const addCategory = useCallback(async (name) => {
    const trimmed = name?.trim()
    if (!trimmed) return null
    const docRef = await addDoc(collection(db, 'categories'), { name: trimmed })
    return docRef.id
  }, [])

  const removeCategory = useCallback(async (id) => {
    await deleteDoc(doc(db, 'categories', id))
  }, [])

  // ---------- users (قراءة فقط — الكتابة عبر authContext) ----------
  const getUserById = useCallback((uid) => users.find((u) => u.uid === uid), [users])

  // ---------- tenders ----------
  const createTender = useCallback(async (tender) => {
    const record = {
      status: 'active',
      removalReason: null,
      winnerBidId: null,
      createdAt: new Date().toISOString(),
      ...tender,
    }
    const docRef = await addDoc(collection(db, 'tenders'), record)
    return { id: docRef.id, ...record }
  }, [])

  const updateTender = useCallback(async (id, patch) => {
    await updateDoc(doc(db, 'tenders', id), patch)
  }, [])

  const deleteTender = useCallback(
    async (id) => {
      const batch = writeBatch(db)
      batch.delete(doc(db, 'tenders', id))
      const relatedBids = bids.filter((b) => b.tenderId === id)
      relatedBids.forEach((b) => batch.delete(doc(db, 'bids', b.id)))
      await batch.commit()
    },
    [bids],
  )

  const removeTenderByAdmin = useCallback(
    async (id, reason) => {
      await updateTender(id, { status: 'removed', removalReason: reason })
    },
    [updateTender],
  )

  // ---------- bids ----------
  const createBid = useCallback(async (bid) => {
    const record = {
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...bid,
    }
    const docRef = await addDoc(collection(db, 'bids'), record)
    return { id: docRef.id, ...record }
  }, [])

  const updateBid = useCallback(async (id, patch) => {
    await updateDoc(doc(db, 'bids', id), patch)
  }, [])

  const deleteBid = useCallback(async (id) => {
    await deleteDoc(doc(db, 'bids', id))
  }, [])

  const selectWinner = useCallback(
    async (tenderId, bidId) => {
      const batch = writeBatch(db)

      batch.update(doc(db, 'tenders', tenderId), {
        status: 'awarded',
        winnerBidId: bidId,
      })

      const tenderBids = bids.filter((b) => b.tenderId === tenderId)
      tenderBids.forEach((b) => {
        batch.update(doc(db, 'bids', b.id), {
          status: b.id === bidId ? 'won' : 'rejected',
        })
      })

      const conversationId = conversationIdForTender(tenderId)
      const welcomeRef = doc(collection(db, 'conversations', conversationId, 'messages'))
      batch.set(welcomeRef, {
        senderId: 'system',
        text:  'تم اختيار العرض الفائز. يمكنكما الآن التواصل لإتمام التعاقد. ',
        createdAt: serverTimestamp(),
      })

      await batch.commit()
    },
    [bids],
  )

  const completeTender = useCallback(async (tenderId) => {
    await updateDoc(doc(db, 'tenders', tenderId), {
      status: 'completed',
      completedAt: new Date().toISOString(),
    })
  }, [])

  // ---------- disputes ----------
  const createDispute = useCallback(async (dispute) => {
    const record = {
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...dispute,
    }
    const docRef = await addDoc(collection(db, 'disputes'), record)
    return { id: docRef.id, ...record }
  }, [])

  const updateDisputeStatus = useCallback(async (id, status) => {
    await updateDoc(doc(db, 'disputes', id), {
      status,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null,
    })
  }, [])

  // ---------- استعلامات (queries) ----------
  const getTendersByOwner = useCallback(
    (ownerId) => tenders.filter((t) => t.ownerId === ownerId && t.status !== 'removed'),
    [tenders],
  )

  const getActiveTenders = useCallback(
    () => tenders.filter((t) => t.status === 'active'),
    [tenders],
  )

  const getBidsForTender = useCallback(
    (tenderId) => bids.filter((b) => b.tenderId === tenderId),
    [bids],
  )

  const getBidsBySupplier = useCallback(
    (supplierId) => bids.filter((b) => b.supplierId === supplierId),
    [bids],
  )

  const getWonBids = useCallback(
    (supplierId) => bids.filter((b) => b.supplierId === supplierId && b.status === 'won'),
    [bids],
  )

  const hasSupplierBidOnTender = useCallback(
    (supplierId, tenderId) =>
      bids.some((b) => b.supplierId === supplierId && b.tenderId === tenderId),
    [bids],
  )

  const canAccessMessages = useCallback(
    (userId, role) => {
      if (role === USER_ROLES.STARTUP) {
        return tenders.some(
          (t) => t.ownerId === userId && t.winnerBidId && (t.status === 'awarded' || t.status === 'completed'),
        )
      }
      if (role === USER_ROLES.SUPPLIER) {
        return bids.some((b) => b.supplierId === userId && b.status === 'won')
      }
      return false
    },
    [tenders, bids],
  )

  const getConversationsForUser = useCallback(
    (userId, role) => {
      const list = []

      if (role === USER_ROLES.STARTUP) {
        tenders
          .filter(
            (t) =>
              t.ownerId === userId &&
              t.winnerBidId &&
              (t.status === 'awarded' || t.status === 'completed'),
          )
          .forEach((t) => {
            const winningBid = bids.find((b) => b.id === t.winnerBidId)
            const supplier = winningBid ? users.find((u) => u.uid === winningBid.supplierId) : null
            list.push({
              id: conversationIdForTender(t.id),
              tenderId: t.id,
              tenderTitle: t.title,
              partnerId: winningBid?.supplierId,
              partnerName: supplier?.companyName || supplier?.displayName || 'المورد',
              updatedAt: t.createdAt,
            })
          })
      }

      if (role === USER_ROLES.SUPPLIER) {
        bids
          .filter((b) => b.supplierId === userId && b.status === 'won')
          .forEach((b) => {
            const tender = tenders.find((t) => t.id === b.tenderId)
            if (!tender) return
            const owner = users.find((u) => u.uid === tender.ownerId)
            list.push({
              id: conversationIdForTender(tender.id),
              tenderId: tender.id,
              tenderTitle: tender.title,
              partnerId: tender.ownerId,
              partnerName: owner?.companyName || owner?.displayName || 'الشركة الناشئة',
              updatedAt: b.createdAt,
            })
          })
      }

      return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },
    [tenders, bids, users],
  )

  const stats = useMemo(
    () => ({
      usersCount: users.length,
      activeTenders: tenders.filter((t) => t.status === 'active').length,
      totalBids: bids.length,
      categoriesCount: categories.length,
      pendingUsers: users.filter((u) => u.status === ACCOUNT_STATUS.PENDING).length,
    }),
    [users, tenders, bids, categories],
  )

  const value = useMemo(
    () => ({
      categories,
      users,
      tenders,
      bids,
      disputes,
      stats,
      addCategory,
      removeCategory,
      getUserById,
      createTender,
      updateTender,
      deleteTender,
      removeTenderByAdmin,
      createBid,
      updateBid,
      deleteBid,
      selectWinner,
      completeTender,
      createDispute,
      updateDisputeStatus,
      getTendersByOwner,
      getActiveTenders,
      getBidsForTender,
      getBidsBySupplier,
      getWonBids,
      hasSupplierBidOnTender,
      canAccessMessages,
      getConversationsForUser,
    }),
    [
      categories,
      users,
      tenders,
      bids,
      disputes,
      stats,
      addCategory,
      removeCategory,
      getUserById,
      createTender,
      updateTender,
      deleteTender,
      removeTenderByAdmin,
      createBid,
      updateBid,
      deleteBid,
      selectWinner,
      completeTender,
      createDispute,
      updateDisputeStatus,
      getTendersByOwner,
      getActiveTenders,
      getBidsForTender,
      getBidsBySupplier,
      getWonBids,
      hasSupplierBidOnTender,
      canAccessMessages,
      getConversationsForUser,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('يجب استخدام useData داخل <DataProvider>')
  return ctx
}