import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Search, LayoutList, Kanban, ClipboardList } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonRow, EmptyState } from '../components/Skeleton'
import SolicitacaoModal from '../components/modals/SolicitacaoModal'
import SolicitacaoPipelineView from '../components/SolicitacaoPipelineView'
import SolicitacaoDrawer from '../components/SolicitacaoDrawer'

// ── Badges ──────────────────────────────────────────────────────────────────

const TIPO_BADGE = {
  TROCA:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  NOVO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  RETORNO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  ENVIO:   'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
}

const ESTADO_BADGE = {
  'Aberto':              'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400',
  'Aguardando NF':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  'NF Solicitada':       'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  'Aguardando Coleta':   'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Coleta Solicitada':   'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  'Em Trânsito':         'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  'Aguardando Entrega':  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  'Entregue':            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
}

const TIPOS = ['', 'TROCA', 'NOVO', 'RETORNO', 'ENVIO']
const ESTADOS = ['', 'Aberto', 'Aguardando NF', 'NF Solicitada', 'Aguardando Coleta', 'Coleta Solicitada', 'Em Trânsito', 'Aguardando Entrega', 'Entregue']

// ── Mini Dashboard ───────────────────────────────────────────────────────────

function DashboardCards({ dashboard, loading, filtroAtivo, onFiltro }) {
  const cards = [
    { label: 'Aberto',              value: dashboard?.porEstado?.Aberto ?? 0,              color: 'bg-slate-500',   filtro: 'Aberto' },
    { label: 'Aguardando NF',       value: dashboard?.porEstado?.['Aguardando NF'] ?? 0,   color: 'bg-yellow-500',  filtro: 'Aguardando NF' },
    { label: 'NF Solicitada',       value: dashboard?.porEstado?.['NF Solicitada'] ?? 0,   color: 'bg-orange-500',  filtro: 'NF Solicitada' },
    { label: 'Aguardando Coleta',   value: dashboard?.porEstado?.['Aguardando Coleta'] ?? 0, color: 'bg-blue-500',  filtro: 'Aguardando Coleta' },
    { label: 'Coleta Solicitada',   value: dashboard?.porEstado?.['Coleta Solicitada'] ?? 0, color: 'bg-indigo-500', filtro: 'Coleta Solicitada' },
    { label: 'Em Trânsito',         value: dashboard?.porEstado?.['Em Trânsito'] ?? 0,     color: 'bg-purple-500',  filtro: 'Em Trânsito' },
    { label: 'Aguardando Entrega',  value: dashboard?.porEstado?.['Aguardando Entrega'] ?? 0, color: 'bg-cyan-500', filtro: 'Aguardando Entrega' },
    { label: 'Entregue',            value: dashboard?.porEstado?.Entregue ?? 0,            color: 'bg-emerald-500', filtro: 'Entregue' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map(c => (
        <div
          key={c.label}
          onClick={() => onFiltro(c.filtro === filtroAtivo ? null : c.filtro)}
          className={`bg-white dark:bg-[#1a2235] border rounded-lg p-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${filtroAtivo === c.filtro ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-white/5'}`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.label}</p>
          </div>
          {loading
            ? <div className="h-6 w-8 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            : <p className="text-xl font-bold text-slate-800 dark:text-white">{c.value}</p>
          }
        </div>
      ))}
    </div>
  )
}

function SummaryCards({ dashboard, loading, onFiltro }) {
  const cards = [
    { label: 'Total', value: dashboard?.total ?? 0, color: 'bg-blue-500', icon: '📊', filtro: null },
    { label: 'Novo', value: dashboard?.porTipo?.NOVO ?? 0, color: 'bg-emerald-500', icon: '✨', filtro: 'NOVO' },
    { label: 'Troca', value: dashboard?.porTipo?.TROCA ?? 0, color: 'bg-amber-500', icon: '🔄', filtro: 'TROCA' },
    { label: 'Encerrados', value: dashboard?.totalEncerrados ?? 0, color: 'bg-slate-500', icon: '✓', filtro: 'ENCERRADO' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div
          key={c.label}
          onClick={() => onFiltro(c.filtro)}
          className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{c.label}</p>
            <span className="text-lg">{c.icon}</span>
          </div>
          {loading
            ? <div className="h-8 w-12 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            : <p className="text-3xl font-bold text-slate-800 dark:text-white">{c.value}</p>
          }
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SolicitacoesPage() {
  const toast = useToast()
  const { isTecnico, isAdmin } = useAuth()
  const limit = 20

  const [solicitacoes, setSolicitacoes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [dashLoading, setDashLoading] = useState(true)

  const [busca, setBusca] = useState('')
  const [filtroCard, setFiltroCard] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState(null)
  const [filtroStatus, setFiltroStatus] = useState(null)
  const [page, setPage] = useState(1)

  const [viewMode, setViewMode] = useState('lista') // 'lista' | 'pipeline'
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [drawerSolicitacaoId, setDrawerSolicitacaoId] = useState(null)

  const debounceRef = useRef(null)

  // Debounce busca
  const handleBusca = (val) => {
    setBusca(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPage(1), 400)
  }

  const carregarDashboard = useCallback(async () => {
    setDashLoading(true)
    try {
      const res = await api.get('/solicitacoes/dashboard')
      setDashboard(res.data)
    } catch { /* silencioso */ }
    setDashLoading(false)
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit })
      if (busca) params.set('busca', busca)
      if (filtroCard) params.set('estado', filtroCard)
      if (filtroTipo) params.set('tipo', filtroTipo)
      if (filtroStatus) params.set('status', filtroStatus)
      const res = await api.get(`/solicitacoes?${params}`)
      setSolicitacoes(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch { toast.error('Erro ao carregar solicitações') }
    setLoading(false)
  }, [page, busca, filtroCard, filtroTipo, filtroStatus])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { carregarDashboard() }, [carregarDashboard])

  const totalPages = Math.ceil(total / limit)

  const inputCls = 'px-3 py-2 text-sm border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-500" />
            Solicitações de Ativos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Lista/Pipeline */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200 dark:border-white/8">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'lista' ? 'bg-white dark:bg-[#1a2235] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <LayoutList size={13} /> Lista
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'pipeline' ? 'bg-white dark:bg-[#1a2235] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Kanban size={13} /> Pipeline
            </button>
          </div>
          <button
            onClick={() => { setEditando(null); setModalOpen(true) }}
            disabled={isTecnico}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Nova Solicitação
          </button>
        </div>
      </div>

      {/* Mini Dashboard */}
      <div className="space-y-3">
        <SummaryCards dashboard={dashboard} loading={dashLoading} onFiltro={(f) => { 
          // Limpar filtros anteriores quando clica em um novo card
          setFiltroCard(null)
          setFiltroTipo(null)
          setFiltroStatus(null)
          
          // Aplicar novo filtro
          if (f === 'ENCERRADO') {
            setFiltroStatus('ENCERRADO')
          } else if (f) {
            setFiltroTipo(f)
          }
          setPage(1) 
        }} />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <DashboardCards dashboard={dashboard} loading={dashLoading} filtroAtivo={filtroCard} onFiltro={(f) => { 
              // Limpar filtros anteriores quando clica em um novo card
              setFiltroCard(null)
              setFiltroTipo(null)
              setFiltroStatus(null)
              
              // Aplicar novo filtro
              if (f) {
                setFiltroCard(f)
              }
              setPage(1) 
            }} />
          </div>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <SolicitacaoPipelineView 
          onEdit={(s) => { setEditando(s); setModalOpen(true) }} 
          onView={(s) => setDrawerSolicitacaoId(s.id)}
          filtroEstado={filtroCard}
          filtroTipo={filtroTipo}
          filtroStatus={filtroStatus}
        />
      )}

      {/* Lista View */}
      {viewMode === 'lista' && (
        <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
          {/* Filtros */}
          <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
            <div className="relative max-w-md">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por chamado, técnico, unidade..."
                value={busca}
                onChange={e => handleBusca(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400`}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3">
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Nº Chamado</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Descrição</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Estado</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Status</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Técnico</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Unidade</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Criado</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Sol. Definição</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Data Definição</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Sol. NF</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Emissão NF</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Sol. Coleta</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Data Coleta</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Previsão</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Chegada</th>
                  <th className="text-left py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Entrega</th>
                  <th className="text-right py-2.5 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={18} />)
                  : solicitacoes.length === 0
                    ? <EmptyState icon={ClipboardList} titulo="Nenhuma solicitação encontrada" descricao="Crie uma nova solicitação para começar" />
                    : solicitacoes.map(s => (
                      <tr 
                        key={s.id} 
                        className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors cursor-pointer"
                        onClick={() => setDrawerSolicitacaoId(s.id)}
                      >
                        <td className="py-2.5 px-2 font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-100">{s.numeroChamado}</td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={s.descricao || ''}>{s.descricao || '—'}</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TIPO_BADGE[s.tipo] || 'bg-slate-100 text-slate-500'}`}>{s.tipo}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_BADGE[s.estado] || 'bg-slate-100 text-slate-500'}`}>{s.estado}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            s.status === 'ENCERRADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                            s.status === 'EM_ANDAMENTO' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400'
                          }`}>{s.status === 'EM_ANDAMENTO' ? 'Em andamento' : s.status === 'ENCERRADO' ? 'Encerrado' : 'Aberto'}</span>
                        </td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-300">{s.tecnico?.nome || '—'}</td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-500 dark:text-slate-400">{s.unidade?.nome || '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{new Date(s.dataCriacao || s.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataDefinicao ? new Date(s.dataDefinicao).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataDefinicaoConfirmada ? new Date(s.dataDefinicaoConfirmada).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataSolicitacaoNF ? new Date(s.dataSolicitacaoNF).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataEmissaoNF ? new Date(s.dataEmissaoNF).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataSolicitacaoColeta ? new Date(s.dataSolicitacaoColeta).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataColeta ? new Date(s.dataColeta).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.previsaoChegada ? new Date(s.previsaoChegada).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataChegada ? new Date(s.dataChegada).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-400">{s.dataEntrega ? new Date(s.dataEntrega).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation()
                              setEditando(s)
                              setModalOpen(true)
                            }}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs border border-slate-200 dark:border-white/8 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">
                  Anterior
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs border border-slate-200 dark:border-white/8 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <SolicitacaoModal
          solicitacao={editando}
          onClose={() => { setModalOpen(false); setEditando(null) }}
          onSave={() => { setModalOpen(false); setEditando(null); carregar(); carregarDashboard() }}
        />
      )}

      {/* Drawer */}
      <SolicitacaoDrawer
        solicitacaoId={drawerSolicitacaoId}
        onClose={() => setDrawerSolicitacaoId(null)}
      />
    </div>
  )
}
