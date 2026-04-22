export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="border-b border-slate-50 dark:border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full w-2/3" />
          <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full w-1/3" />
        </div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full w-full mt-3" />
    </div>
  )
}

export function EmptyState({ icon: Icon, titulo, descricao }) {
  return (
    <tr>
      <td colSpan={99} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          {Icon && <Icon size={32} className="text-slate-300 dark:text-slate-600 mb-1" />}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{titulo}</p>
          {descricao && <p className="text-xs text-slate-400 dark:text-slate-500">{descricao}</p>}
        </div>
      </td>
    </tr>
  )
}
