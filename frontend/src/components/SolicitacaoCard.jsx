import { Edit2 } from 'lucide-react'

const TIPO_BADGE = {
  TROCA:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  NOVO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  RETORNO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  ENVIO:   'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
}

function isAtrasado(solicitacao) {
  if (solicitacao.estado === 'Entregue') return false
  const diff = (Date.now() - new Date(solicitacao.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  return diff > 3
}

export default function SolicitacaoCard({ solicitacao, onEdit, onView }) {
  const atrasado = isAtrasado(solicitacao)
  const descricao = solicitacao.descricao
    ? solicitacao.descricao.length > 60
      ? solicitacao.descricao.slice(0, 60) + '…'
      : solicitacao.descricao
    : null

  return (
    <div 
      onClick={() => onView && onView(solicitacao)}
      className={`bg-white dark:bg-[#1a2235] rounded-xl p-3 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
        atrasado
          ? 'border-red-400 dark:border-red-500/60'
          : 'border-slate-200 dark:border-white/8'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-bold text-[13px] text-slate-800 dark:text-white font-mono leading-tight">{solicitacao.numeroChamado}</p>
        <button
          onClick={(e) => { 
            e.stopPropagation()
            onEdit && onEdit(solicitacao)
          }}
          className="shrink-0 p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 size={12} />
        </button>
      </div>

      {descricao && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">{descricao}</p>
      )}

      <div className="flex items-center justify-between gap-1 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TIPO_BADGE[solicitacao.tipo] || 'bg-slate-100 text-slate-500'}`}>
          {solicitacao.tipo}
        </span>
        {atrasado && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            Atrasado
          </span>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        {solicitacao.tecnico?.nome && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">👤 {solicitacao.tecnico.nome}</p>
        )}
        {solicitacao.unidade?.nome && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">🏢 {solicitacao.unidade.nome}</p>
        )}
      </div>
    </div>
  )
}
