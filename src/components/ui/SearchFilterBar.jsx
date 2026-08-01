/** شريط بحث وفلترة مشترك للجداول والقوائم */
export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters = [],
  className = '',
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800/80 sm:flex-row sm:flex-wrap sm:items-end ${className}`}
    >
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400">بحث</label>
        <SearchInput
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
      </div>
      {filters.map((f) => (
        <FilterSelect key={f.id} filter={f} />
      ))}
    </div>
  )
}

function SearchInput({ searchValue, onSearchChange, searchPlaceholder }) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pe-3 ps-9 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </div>
  )
}

function FilterSelect({ filter }) {
  return (
    <div className="min-w-[140px]">
      <label htmlFor={filter.id} className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400">
        {filter.label}
      </label>
      <select
        id={filter.id}
        value={filter.value}
        onChange={(e) => filter.onChange(e.target.value)}
        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** فلترة نصية بسيطة */
export function matchesSearch(text, query) {
  if (!query?.trim()) return true
  return String(text || '')
    .toLowerCase()
    .includes(query.trim().toLowerCase())
}
