import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import SolicitacaoCard from './SolicitacaoCard'
import { ClipboardList } from 'lucide-react'

const COLUNAS = [
  'Aberto',
  'Aguardando NF',
  'NF Solicitada',
  'Aguardando Coleta',
  'Coleta Solicitada',
  'Em Trânsito',
  'Aguardando Entrega',
  'Entregue',
]

const COLUNA_COLORS = {
  'Aberto':              'bg-slate-500',
  'Aguardando NF':       'bg-yellow-500',
  'NF Solicitada':       'bg-orange-500',
  'Aguardando Coleta':   'bg-blue-500',
  'Coleta Solicitada':   'bg-indigo-500',
  'Em Trânsito':         'bg-purple-500',
  'Aguardando Entrega':  'bg-cyan-500',
  'Entregue':            'bg-emerald-500',
}

// Estilo para scrollbar customizada
const scrollbarStyle = `
  .pipeline-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .pipeline-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .pipeline-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 3px;
  }
  .pipeline-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
  .dark .pipeline-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }
  .dark .pipeline-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

function SkeletonColumn() {
  return (
    <div className="flex-shrink-0 w-64 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1a2235] rounded-xl p-3 border border-slate-200 dark:border-white/8 animate-pulse">
          <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full w-3/4 mb-2" />
          <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full w-full mb-1" />
          <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function SolicitacaoPipelineView({ onEdit, filtroEstado, filtroTipo, filtroStatus, onView }) {
  const toast = useToast()
  const [board, setBoard] = useState({})
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/solicitacoes/board')
      setBoard(res.data || {})
    } catch {
      toast.error('Erro ao carregar pipeline')
    }
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { carregar() }, [filtroEstado, filtroTipo, filtroStatus])

  // Filtrar colunas se houver filtro ativo
  const colunasVisiveis = filtroEstado ? [filtroEstado] : (filtroStatus === 'ENCERRADO' ? ['Entregue'] : COLUNAS)

  // Filtrar cards dentro das colunas
  const filtrarCards = (cards) => {
    if (!filtroTipo && !filtroStatus) return cards
    return cards.filter(card => {
      if (filtroTipo && card.tipo !== filtroTipo) return false
      if (filtroStatus && card.status !== filtroStatus) return false
      return true
    })
  }

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max h-[calc(100vh-280px)]">
          {colunasVisiveis.map(coluna => {
          const allCards = board[coluna] || []
          const cards = filtrarCards(allCards)
          return (
            <div key={coluna} className="flex-shrink-0 w-64 flex flex-col">
              {/* Header da coluna */}
              <div className="flex items-center gap-2 mb-2 px-1 sticky top-0 bg-white dark:bg-[#0f1729] z-10 pb-2">
                <span className={`w-2 h-2 rounded-full ${COLUNA_COLORS[coluna] || 'bg-slate-400'}`} />
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">{coluna}</p>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                  {loading ? '…' : cards.length}
                </span>
              </div>

              {/* Cards com scroll */}
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 pipeline-scroll">
                {loading ? (
                  <SkeletonColumn />
                ) : cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
                    <ClipboardList size={20} className="mb-1" />
                    <p className="text-[11px]">Vazio</p>
                  </div>
                ) : (
                  cards.map(s => (
                    <SolicitacaoCard key={s.id} solicitacao={s} onEdit={onEdit} onView={onView} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}
