import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { SearchFilterBar, matchesSearch } from '../../components/ui/SearchFilterBar'
import { FormField, btnOutline, btnPrimary, btnDangerSm, inputClass } from '../../components/ui/FormField'
import { formatSYPRange } from '../../utils/currency'
import { useAuth } from '../../contexts/authContext'
import { useData } from '../../contexts/dataContext'
import { generateTenderSuggestion } from '../../services/aiTender'

const STATUS_LABELS = {
  active: 'نشطة',
  awarded: 'مُنحت',
  completed: 'مكتملة',
}

const emptyForm = {
  title: '',
  categoryId: '',
  description: '',
  budgetMin: '',
  budgetMax: '',
  deadline: '',
}

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function StartupTendersPage() {
  const { user, isProfileComplete } = useAuth()
  const { categories, getTendersByOwner, createTender, updateTender, deleteTender } = useData()
  const tenders = getTendersByOwner(user?.uid)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  // --- حالة مساعد الذكاء الاصطناعي ---
  const [aiOpen, setAiOpen] = useState(false)
  const [aiCategoryId, setAiCategoryId] = useState('')
  const [aiIdea, setAiIdea] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState(null)

  const filtered = useMemo(() => {
    return tenders.filter((t) => {
      const catName = categories.find((c) => c.id === t.categoryId)?.name || ''
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      const matchesCat = categoryFilter === 'all' || t.categoryId === categoryFilter
      const matchesText =
        matchesSearch(t.title, search) ||
        matchesSearch(t.description, search) ||
        matchesSearch(catName, search)
      return matchesStatus && matchesCat && matchesText
    })
  }, [tenders, search, statusFilter, categoryFilter, categories])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setOpen(true)
  }

  function openEdit(t) {
    if (t.status === 'completed' || t.status === 'awarded') return
    setEditing(t)
    setForm({
      title: t.title,
      categoryId: t.categoryId,
      description: t.description,
      budgetMin: String(t.budgetMin),
      budgetMax: String(t.budgetMax),
      deadline: t.deadline?.slice(0, 10) || '',
    })
    setFormError('')
    setOpen(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!isProfileComplete) return
    const payload = {
      title: form.title.trim(),
      categoryId: form.categoryId,
      description: form.description.trim(),
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      deadline: form.deadline,
      ownerId: user.uid,
    }
    setFormError('')
    setSubmitting(true)
    try {
      if (editing) {
        await updateTender(editing.id, payload)
      } else {
        await createTender(payload)
      }
      setOpen(false)
    } catch (err) {
      setFormError('تعذّر حفظ المناقصة، حاول مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTender(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // --- دوال مساعد الذكاء الاصطناعي ---
  function openAi() {
    setAiCategoryId('')
    setAiIdea('')
    setAiSuggestion(null)
    setAiError('')
    setAiOpen(true)
  }

  async function runGenerate() {
    if (!aiCategoryId || !aiIdea.trim()) return
    setAiError('')
    setAiLoading(true)
    setAiSuggestion(null)
    try {
      const categoryName = categories.find((c) => c.id === aiCategoryId)?.name || ''
      const suggestion = await generateTenderSuggestion({ idea: aiIdea.trim(), categoryName })
      setAiSuggestion(suggestion)
    } catch (err) {
      setAiError(err?.message || 'تعذّر توليد الاقتراح، حاول مرة أخرى أو أعد صياغة الفكرة.')
    } finally {
      setAiLoading(false)
    }
  }

  async function generateSuggestion(e) {
    e.preventDefault()
    await runGenerate()
  }

  function retryAi() {
    setAiSuggestion(null)
    setAiError('')
    setAiLoading(false)
  }

  function adoptSuggestion() {
    if (!aiSuggestion) return
    setEditing(null)
    setForm({
      title: aiSuggestion.title,
      categoryId: aiCategoryId,
      description: aiSuggestion.description,
      budgetMin: String(aiSuggestion.budgetMin),
      budgetMax: String(aiSuggestion.budgetMax),
      deadline: addDays(aiSuggestion.suggestedDays),
    })
    setFormError('')
    setAiOpen(false)
    setOpen(true)
  }

  return (
    <RequirePermission permission="STARTUP_TENDERS">
      <StartupTendersPageContent
        isProfileComplete={isProfileComplete}
        openCreate={openCreate}
        openAi={openAi}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        filtered={filtered}
        openEdit={openEdit}
        setDeleteTarget={setDeleteTarget}
        open={open}
        setOpen={setOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        onSubmit={onSubmit}
        deleteTarget={deleteTarget}
        confirmDelete={confirmDelete}
        submitting={submitting}
        deleting={deleting}
        formError={formError}
        // AI props
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        aiCategoryId={aiCategoryId}
        setAiCategoryId={setAiCategoryId}
        aiIdea={aiIdea}
        setAiIdea={setAiIdea}
        aiLoading={aiLoading}
        aiError={aiError}
        aiSuggestion={aiSuggestion}
        setAiSuggestion={setAiSuggestion}
        retryAi={retryAi}
        generateSuggestion={generateSuggestion}
        runGenerate={runGenerate}
        adoptSuggestion={adoptSuggestion}
      />
    </RequirePermission>
  )
}

function StartupTendersPageContent(props) {
  const {
    isProfileComplete,
    openCreate,
    openAi,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    filtered,
    openEdit,
    setDeleteTarget,
    open,
    setOpen,
    editing,
    form,
    setForm,
    onSubmit,
    deleteTarget,
    confirmDelete,
    submitting,
    deleting,
    formError,
    aiOpen,
    setAiOpen,
    aiCategoryId,
    setAiCategoryId,
    aiIdea,
    setAiIdea,
    aiLoading,
    aiError,
    aiSuggestion,
    setAiSuggestion,
    retryAi,
    generateSuggestion,
    runGenerate,
    adoptSuggestion,
  } = props

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">مناقصاتي</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">إنشاء وإدارة المناقصات واستقبال العروض.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openAi}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-gradient-to-l from-primary-light to-white px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm transition hover:shadow-md dark:border-emerald-800 dark:from-emerald-950/40 dark:to-stone-900 dark:text-emerald-300"
          >
            <AiSparkleIcon />
            Generate with AI
          </button>
          <button type="button" onClick={openCreate} className={btnPrimary}>
            + مناقصة جديدة
          </button>
        </div>
      </div>

      {!isProfileComplete ? (
        <Alert variant="warning">
          يجب <Link to="/profile" className="font-semibold underline">إكمال الملف الشخصي</Link> قبل نشر أي مناقصة.
        </Alert>
      ) : null}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالعنوان أو الوصف..."
        filters={[
          {
            id: 'status',
            label: 'الحالة',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'كل الحالات' },
              { value: 'active', label: 'نشطة' },
              { value: 'awarded', label: 'مُنحت' },
              { value: 'completed', label: 'مكتملة' },
            ],
          },
          {
            id: 'category',
            label: 'التصنيف',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 'all', label: 'كل التصنيفات' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ],
          },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <table className="w-full min-w-[700px] text-right text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">العنوان</th>
              <th className="px-4 py-3 font-semibold">الميزانية</th>
              <th className="px-4 py-3 font-semibold">الموعد النهائي</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
              <th className="px-4 py-3 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                  لا توجد مناقصات مطابقة.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const locked = t.status === 'completed' || t.status === 'awarded'
                return (
                  <tr key={t.id} className="border-b border-stone-50 dark:border-stone-800">
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatSYPRange(t.budgetMin, t.budgetMax)}
                    </td>
                    <td className="px-4 py-3">{t.deadline}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-800">
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StartupTendersActions
                        t={t}
                        locked={locked}
                        openEdit={openEdit}
                        setDeleteTarget={setDeleteTarget}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة إنشاء/تعديل المناقصة (يدوياً أو بعد اعتماد اقتراح AI) */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'تعديل المناقصة' : 'مناقصة جديدة'}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={btnOutline}>
              إلغاء
            </button>
            <button
              type="submit"
              form="tender-form"
              className={btnPrimary}
              disabled={(!editing && !isProfileComplete) || submitting}
            >
              {submitting ? 'جاري الحفظ…' : editing ? 'حفظ' : 'نشر'}
            </button>
          </>
        }
      >
        <form id="tender-form" onSubmit={onSubmit} className="space-y-3">
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          {!isProfileComplete && !editing ? (
            <Alert variant="warning">
              يجب <Link to="/profile" className="font-semibold underline">إكمال الملف الشخصي</Link> قبل نشر المناقصة.
            </Alert>
          ) : null}
          <FormField label="عنوان المناقصة" id="title">
            <input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} disabled={submitting} />
          </FormField>
          <FormField label="التصنيف" id="categoryId">
            <select id="categoryId" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass} disabled={submitting}>
              <option value="">اختر</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="الوصف" id="description">
            <textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} disabled={submitting} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="الحد الأدنى للميزانية" id="budgetMin">
              <input id="budgetMin" type="number" required min={0} value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} className={inputClass} disabled={submitting} />
            </FormField>
            <FormField label="الحد الأعلى" id="budgetMax">
              <input id="budgetMax" type="number" required min={0} value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} className={inputClass} disabled={submitting} />
            </FormField>
          </div>
          <FormField label="آخر موعد لتلقي العروض" id="deadline">
            <input id="deadline" type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} disabled={submitting} />
          </FormField>
        </form>
      </Modal>

      {/* نافذة مساعد الذكاء الاصطناعي */}
      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="توليد مناقصة بالذكاء الاصطناعي"
        size="lg"
        footer={
          aiSuggestion ? (
            <div key="suggestion-actions" className="flex gap-2">
              <button type="button" onClick={retryAi} className={btnOutline}>
                محاولة أخرى
              </button>
              <button type="button" onClick={adoptSuggestion} className={btnPrimary}>
                اعتماد هذا الاقتراح
              </button>
            </div>
          ) : (
            <div key="form-actions" className="flex gap-2">
              <button
                type="button"
                onClick={runGenerate}
                className={btnPrimary}
                disabled={aiLoading || !aiCategoryId || !aiIdea.trim()}
              >
                {aiLoading ? 'جاري التوليد…' : 'توليد الاقتراح'}
              </button>
            </div>
          )
        }
      >
        {!aiSuggestion ? (
          <form id="ai-form" onSubmit={generateSuggestion} className="space-y-3">
            {aiError ? <Alert variant="error">{aiError}</Alert> : null}
            <Alert variant="info">
              اكتب فكرة مختصرة عمّا تحتاجه، وسيقترح الذكاء الاصطناعي عنواناً ووصفاً احترافياً ونطاق
              ميزانية وموعداً نهائياً مناسباً. راجع الاقتراح دائماً قبل النشر.
            </Alert>
            <FormField label="التصنيف" id="ai-category">
              <select
                id="ai-category"
                required
                value={aiCategoryId}
                onChange={(e) => setAiCategoryId(e.target.value)}
                className={inputClass}
                disabled={aiLoading}
              >
                <option value="">اختر</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="فكرتك بإيجاز" id="ai-idea">
              <textarea
                id="ai-idea"
                required
                minLength={10}
                rows={4}
                value={aiIdea}
                onChange={(e) => setAiIdea(e.target.value)}
                className={inputClass}
                placeholder="مثال: أحتاج شركة لتصميم وتطوير موقع تعريفي لمنتجاتنا مع لوحة تحكم بسيطة"
                disabled={aiLoading}
              />
              <p className="mt-1 text-xs text-stone-400">
                كل ما كانت الفكرة أوضح وأكثر تفصيلاً، كل ما كان الاقتراح أدق.
              </p>
            </FormField>
          </form>
        ) : (
          <AiSuggestionPreview suggestion={aiSuggestion} deadline={addDays(aiSuggestion.suggestedDays)} />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="حذف المناقصة"
        message={`هل أنت متأكد من حذف "${deleteTarget?.title}"؟ سيتم حذف جميع العروض المرتبطة بها.`}
        confirmLabel="حذف نهائي"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

function AiSuggestionPreview({ suggestion, deadline }) {
  return (
    <div className="space-y-4">
      <Alert variant="success" title="تم توليد الاقتراح">
        راجع التفاصيل التالية، ويمكنك تعديل أي حقل بعد الاعتماد قبل النشر النهائي.
      </Alert>
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">العنوان المقترح</p>
        <p className="mt-1 font-bold text-stone-900 dark:text-stone-100">{suggestion.title}</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">الوصف المقترح</p>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-stone-700 dark:text-stone-300">
          {suggestion.description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">الحد الأدنى</p>
          <p className="mt-1 font-bold tabular-nums text-stone-900 dark:text-stone-100">
            {suggestion.budgetMin.toLocaleString('ar-SY')} ل.س
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">الحد الأعلى</p>
          <p className="mt-1 font-bold tabular-nums text-stone-900 dark:text-stone-100">
            {suggestion.budgetMax.toLocaleString('ar-SY')} ل.س
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">الموعد النهائي</p>
          <p className="mt-1 font-bold text-stone-900 dark:text-stone-100">{deadline}</p>
        </div>
      </div>
    </div>
  )
}

function AiSparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"
        fill="currentColor"
      />
      <path
        d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
        fill="currentColor"
      />
    </svg>
  )
}

function StartupTendersActions({ t, locked, openEdit, setDeleteTarget }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`/compare/${t.id}`} className={btnOutline + ' text-xs'}>
        العروض
      </Link>
      {!locked ? (
        <>
          <button type="button" onClick={() => openEdit(t)} className={btnOutline + ' text-xs'}>
            تعديل
          </button>
          <button type="button" onClick={() => setDeleteTarget(t)} className={btnDangerSm}>
            حذف
          </button>
        </>
      ) : (
        <span className="text-xs text-stone-400">مقفلة</span>
      )}
    </div>
  )
}