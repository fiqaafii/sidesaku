// ── Stat Card ─────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, colorClass = 'text-primary', bgClass = 'bg-navy-50' }) {
  return (
    <div className="card-hover flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0 shadow-xs`}>
        <Icon size={22} className={colorClass} />
      </div>
      <div>
        <p className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight leading-none">
          {value ?? '—'}
        </p>
        <p className="text-xs text-gray-500 font-medium mt-1.5">{label}</p>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bglight flex items-center justify-center mb-4 text-gray-400">
        <Icon size={30} className="text-gray-400" />
      </div>
      <p className="font-heading text-sm font-bold text-gray-600">{title}</p>
      {desc && <p className="text-xs text-gray-400 mt-1 max-w-xs">{desc}</p>}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg
      className="animate-spin text-primary"
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading text-base sm:text-lg font-bold text-primary tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-9 pr-4 py-2 text-sm"
      />
    </div>
  );
}
