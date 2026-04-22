export default function StatusBadge({ status }) {
  const map = {
    DISPONIVEL: { cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Disponível' },
    EM_USO:     { cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',             dot: 'bg-blue-500',    label: 'Em Uso' },
    MANUTENCAO: { cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',         dot: 'bg-amber-500',   label: 'Manutenção' },
    DESCARTADO: { cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',                 dot: 'bg-red-500',     label: 'Descartado' },
    EMPRESTADO: { cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',     dot: 'bg-violet-500',  label: 'Emprestado' },
  }
  const s = map[status] || { cls: 'bg-slate-100 dark:bg-white/8 text-slate-500', dot: 'bg-slate-400', label: status || '—' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}
