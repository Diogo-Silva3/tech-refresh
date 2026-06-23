import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Search, LayoutList, Kanban, ClipboardList, Download, Upload, Clock, Truck, FileText, CheckCircle, Package, AlertCircle, Calendar, CalendarClock, Box, PenLine, Trash2, MapPin, UserCheck, ShieldAlert } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonRow, EmptyState } from '../components/Skeleton'
import SolicitacaoModal from '../components/modals/SolicitacaoModal'
import SolicitacaoPipelineView from '../components/SolicitacaoPipelineView'
import SolicitacaoDrawer from '../components/SolicitacaoDrawer'
import ImportacaoModal from '../components/ImportacaoModal'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_BADGE = {
  TROCA:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  NOVO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  RETORNO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  ENVIO:   'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
}

const ESTADO_BADGE = {
  'Aberto':              'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  'Aguard.Definição':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  'Aguardando NF':       'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  'NF Solicitada':       'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  'Coleta Solicitada':   'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  'Aguardando Coleta':   'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  'Em Trânsito':         'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  'Aguard.Entrega':      'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  'Aguardando Entrega':  'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  'Entregue':            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
}

const STATUS_BADGE = {
  'EM_ANDAMENTO': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  'ENCERRADO': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  'ABERTO': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/20',
}

const getUltimaMovimentacao = (s) => {
  if (s.dataEntrega) return { etapa: 'Entregue ao usuário', data: s.dataEntrega, icon: UserCheck, color: 'text-emerald-500' };
  if (s.dataChegada) return { etapa: 'Chegou no TI', data: s.dataChegada, icon: Box, color: 'text-emerald-500' };
  if (s.previsaoChegada) return { etapa: 'Previsão de Chegada', data: s.previsaoChegada, icon: CalendarClock, color: 'text-purple-500' };
  if (s.dataColeta) return { etapa: 'Coletado', data: s.dataColeta, icon: Truck, color: 'text-indigo-500' };
  if (s.dataSolicitacaoColeta) return { etapa: 'Coleta Solicitada', data: s.dataSolicitacaoColeta, icon: Truck, color: 'text-indigo-400' };
  if (s.dataEmissaoNF) return { etapa: 'NF Emitida', data: s.dataEmissaoNF, icon: FileText, color: 'text-orange-500' };
  if (s.dataSolicitacaoNF) return { etapa: 'NF Solicitada', data: s.dataSolicitacaoNF, icon: FileText, color: 'text-orange-400' };
  if (s.dataDefinicaoConfirmada) return { etapa: 'Definição OK', data: s.dataDefinicaoConfirmada, icon: CheckCircle, color: 'text-yellow-500' };
  if (s.dataDefinicao) return { etapa: 'Aguard. Definição', data: s.dataDefinicao, icon: AlertCircle, color: 'text-yellow-400' };
  return { etapa: 'Criado', data: s.dataCriacao || s.createdAt, icon: Calendar, color: 'text-slate-500' };
}

// ── Mini Dashboard Premium ───────────────────────────────────────────────────

function UnifiedDashboard({ dashboard, loading, filtroCard, filtroTipo, filtroStatus, onFiltro }) {
  const totalAtivos = (dashboard?.porEstado?.Aberto ?? 0) + 
                     (dashboard?.porEstado?.['Aguard.Definição'] ?? 0) + 
                     (dashboard?.porEstado?.['Aguardando NF'] ?? 0) + 
                     (dashboard?.porEstado?.['NF Solicitada'] ?? 0) + 
                     (dashboard?.porEstado?.['Aguardando Coleta'] ?? 0) + 
                     (dashboard?.porEstado?.['Coleta Solicitada'] ?? 0) + 
                     (dashboard?.porEstado?.['Em Trânsito'] ?? 0) + 
                     (dashboard?.porEstado?.['Aguard.Entrega'] ?? 0) + 
                     (dashboard?.porEstado?.['Aguardando Entrega'] ?? 0);

  const filterCards = [
    { key: 'TOTAL', label: 'Todos os Ativos', value: totalAtivos, icon: ClipboardList, color: 'blue', isStatus: true },
    { key: 'NOVO', label: 'Novo', value: dashboard?.porTipo?.NOVO ?? 0, icon: Package, color: 'emerald', isTipo: true },
    { key: 'TROCA', label: 'Trocas', value: dashboard?.porTipo?.TROCA ?? 0, icon: Truck, color: 'amber', isTipo: true },
    { key: 'ENCERRADO', label: 'Encerrados', value: dashboard?.totalEncerrados ?? 0, icon: CheckCircle, color: 'slate', isEncerrado: true },
  ]

  const stageCards = [
    { label: 'Aberto', value: dashboard?.porEstado?.Aberto ?? 0, color: 'slate' },
    { label: 'Aguard.Definição', value: (dashboard?.porEstado?.['Aguard.Definição'] ?? 0) + (dashboard?.porEstado?.['Aguardando NF'] ?? 0), color: 'yellow' },
    { label: 'NF Solicitada', value: dashboard?.porEstado?.['NF Solicitada'] ?? 0, color: 'orange' },
    { label: 'Aguardando Coleta', value: (dashboard?.porEstado?.['Aguardando Coleta'] ?? 0) + (dashboard?.porEstado?.['Coleta Solicitada'] ?? 0), color: 'indigo' },
    { label: 'Em Trânsito', value: dashboard?.porEstado?.['Em Trânsito'] ?? 0, color: 'purple' },
    { label: 'Aguard.Entrega', value: (dashboard?.porEstado?.['Aguard.Entrega'] ?? 0) + (dashboard?.porEstado?.['Aguardando Entrega'] ?? 0), color: 'cyan' },
  ]

  const isCardActive = (key, isTipo, isEncerrado) => {
    if (isEncerrado) return filtroStatus === 'ENCERRADO';
    if (isTipo) return filtroTipo === key;
    if (key === 'TOTAL') return !filtroCard && !filtroTipo && filtroStatus !== 'ENCERRADO';
    return filtroCard === key;
  }

  const handleFilterClick = (key, isTipo, isEncerrado) => {
    onFiltro(key, isTipo, isEncerrado)
  }

  return (
    <div className="space-y-4">
      {/* Cards Principais (Totais e Tipos) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filterCards.map(c => {
          const active = isCardActive(c.key, c.isTipo, c.isEncerrado)
          const Icon = c.icon
          return (
            <button
              key={c.key}
              onClick={() => handleFilterClick(c.key, c.isTipo, c.isEncerrado)}
              className={`relative overflow-hidden flex items-center justify-between p-4 rounded-xl border transition-all text-left group
                ${active 
                  ? `bg-${c.color}-50 dark:bg-${c.color}-500/10 border-${c.color}-300 dark:border-${c.color}-500/50 ring-1 ring-${c.color}-500/20` 
                  : 'bg-white dark:bg-[#1a2235] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${active ? `text-${c.color}-700 dark:text-${c.color}-400` : 'text-slate-500 dark:text-slate-400'}`}>
                  {c.label}
                </p>
                {loading ? (
                  <div className="h-8 w-12 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                ) : (
                  <p className={`text-2xl font-bold ${active ? `text-${c.color}-800 dark:text-${c.color}-300` : 'text-slate-700 dark:text-white'}`}>
                    {c.value}
                  </p>
                )}
              </div>
              <div className={`p-2.5 rounded-xl ${active ? `bg-${c.color}-100 dark:bg-${c.color}-500/20 text-${c.color}-600 dark:text-${c.color}-300` : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform'}`}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Cards de Estágios (Pipeline) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stageCards.map(c => {
          const active = isCardActive(c.label, false, false)
          return (
            <button
              key={c.label}
              onClick={() => handleFilterClick(c.label, false, false)}
              className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-20
                ${active 
                  ? `bg-${c.color}-50 dark:bg-${c.color}-500/10 border-${c.color}-300 dark:border-${c.color}-500/50 shadow-sm` 
                  : 'bg-white dark:bg-[#1a2235] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 bg-${c.color}-500 dark:bg-${c.color}-400 ${active ? 'shadow-[0_0_8px_rgba(0,0,0,0.3)] shadow-' + c.color + '-500/50' : ''}`} />
                <span className={`text-[10px] font-medium truncate ${active ? `text-${c.color}-700 dark:text-${c.color}-300` : 'text-slate-500 dark:text-slate-400'}`}>
                  {c.label}
                </span>
              </div>
              {loading ? (
                <div className="h-6 w-8 bg-slate-100 dark:bg-white/5 rounded animate-pulse mt-auto" />
              ) : (
                <span className={`text-xl font-bold mt-auto ${active ? `text-${c.color}-800 dark:text-${c.color}-100` : 'text-slate-700 dark:text-slate-200'}`}>
                  {c.value}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SolicitacoesPage() {
  const toast = useToast()
  const { isTecnico } = useAuth()
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
  const [importacaoOpen, setImportacaoOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // solicitação a excluir
  const [deletando, setDeletando] = useState(false)

  const debounceRef = useRef(null)

  // Função para exportar relatório
  const exportarRelatorio = async () => {
    try {
      const params = new URLSearchParams({ limit: 10000 })
      if (busca) params.set('busca', busca)
      if (filtroCard) params.set('estado', filtroCard)
      if (filtroTipo) params.set('tipo', filtroTipo)
      if (filtroStatus) params.set('status', filtroStatus)
      
      const res = await api.get(`/solicitacoes?${params}`)
      const dados = res.data.data || []
      
      const csvData = dados.map(s => ({
        'Nº Chamado': s.numeroChamado,
        'Descrição': s.descricao || '',
        'Tipo': s.tipo,
        'Estado': s.estado,
        'Status': s.status === 'EM_ANDAMENTO' ? 'Em andamento' : s.status === 'ENCERRADO' ? 'Encerrado' : 'Aberto',
        'Técnico': s.tecnico?.nome || '',
        'Unidade': s.unidade?.nome || '',
        'Data Criação': s.dataCriacao ? new Date(s.dataCriacao).toLocaleDateString('pt-BR') : new Date(s.createdAt).toLocaleDateString('pt-BR'),
        'Sol. Definição': s.dataDefinicao ? new Date(s.dataDefinicao).toLocaleDateString('pt-BR') : '',
        'Data Definição': s.dataDefinicaoConfirmada ? new Date(s.dataDefinicaoConfirmada).toLocaleDateString('pt-BR') : '',
        'Sol. NF': s.dataSolicitacaoNF ? new Date(s.dataSolicitacaoNF).toLocaleDateString('pt-BR') : '',
        'Emissão NF': s.dataEmissaoNF ? new Date(s.dataEmissaoNF).toLocaleDateString('pt-BR') : '',
        'Sol. Coleta': s.dataSolicitacaoColeta ? new Date(s.dataSolicitacaoColeta).toLocaleDateString('pt-BR') : '',
        'Data Coleta': s.dataColeta ? new Date(s.dataColeta).toLocaleDateString('pt-BR') : '',
        'Previsão': s.previsaoChegada ? new Date(s.previsaoChegada).toLocaleDateString('pt-BR') : '',
        'Chegada': s.dataChegada ? new Date(s.dataChegada).toLocaleDateString('pt-BR') : '',
        'Entrega': s.dataEntrega ? new Date(s.dataEntrega).toLocaleDateString('pt-BR') : ''
      }))
      
      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(';'),
        ...csvData.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(';'))
      ].join('\r\n')
      
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent
      
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio-solicitacoes-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar relatório')
    }
  }

  const excluirSolicitacao = async () => {
    if (!confirmDelete) return
    setDeletando(true)
    try {
      await api.delete(`/solicitacoes/${confirmDelete.id}`)
      toast.success('Solicitação excluída com sucesso!')
      setSolicitacoes(prev => prev.filter(s => s.id !== confirmDelete.id))
      setTotal(prev => prev - 1)
      setConfirmDelete(null)
      carregarDashboard()
    } catch {
      toast.error('Erro ao excluir solicitação')
    }
    setDeletando(false)
  }

  const handleBusca = (val) => {
    setBusca(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPage(1), 400)
  }

  const handleFilterClick = (key, isTipo, isEncerrado) => {
    setFiltroCard(null)
    setFiltroTipo(null)
    setFiltroStatus(null)

    if (isEncerrado) {
      setFiltroStatus('ENCERRADO')
    } else if (isTipo) {
      setFiltroTipo(key)
    } else if (key !== 'TOTAL') {
      setFiltroCard(key)
    }
    setPage(1)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Logística e Solicitações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestão de envios, retornos e trocas de ativos</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Lista/Pipeline */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1a2235] rounded-xl p-1 border border-slate-200 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'lista' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <LayoutList size={15} /> <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'pipeline' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Kanban size={15} /> <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>
          <button
            onClick={exportarRelatorio}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download size={16} /> <span className="hidden md:inline">Relatório</span>
          </button>
          <button
            onClick={() => setImportacaoOpen(true)}
            disabled={isTecnico}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Upload size={16} /> <span className="hidden md:inline">Importar</span>
          </button>
          <button
            onClick={() => { setEditando(null); setModalOpen(true) }}
            disabled={isTecnico}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus size={16} /> Nova Solicitação
          </button>
        </div>
      </div>

      {/* Mini Dashboard Unificado */}
      <UnifiedDashboard 
        dashboard={dashboard} 
        loading={dashLoading} 
        filtroCard={filtroCard} 
        filtroTipo={filtroTipo} 
        filtroStatus={filtroStatus} 
        onFiltro={handleFilterClick} 
      />

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

      {/* Lista View Otimizada */}
      {viewMode === 'lista' && (
        <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          {/* Barra de Busca */}
          <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por chamado, técnico, unidade..."
                value={busca}
                onChange={e => handleBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[25%]">Identificação do Chamado</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Local & Responsável</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[25%]">Fase / Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Última Movimentação</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[10%]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                ) : solicitacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={ClipboardList} titulo="Nenhuma solicitação encontrada" descricao="Tente ajustar os filtros ou crie um novo registro." />
                    </td>
                  </tr>
                ) : (
                  solicitacoes.map(s => {
                    const statusClass = STATUS_BADGE[s.status || 'ABERTO'] || STATUS_BADGE['ABERTO']
                    const mov = getUltimaMovimentacao(s)
                    const MovIcon = mov.icon

                    return (
                      <tr 
                        key={s.id} 
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => setDrawerSolicitacaoId(s.id)}
                      >
                        {/* 1. Identificação */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[13px] font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">
                                {s.numeroChamado}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${TIPO_BADGE[s.tipo] || 'bg-slate-100 text-slate-500'}`}>
                                {s.tipo}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-sm leading-snug" title={s.descricao}>
                              {s.descricao || 'Sem descrição detalhada.'}
                            </p>
                          </div>
                        </td>

                        {/* 2. Local & Responsável */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                              <MapPin size={13} className="text-slate-400" />
                              {s.unidade?.nome || 'Unidade não informada'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <UserCheck size={12} className="text-slate-400" />
                              {s.tecnico?.nome || 'Sem técnico vinculado'}
                            </div>
                          </div>
                        </td>

                        {/* 3. Fase / Status */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-2 items-start">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${ESTADO_BADGE[s.estado] || 'bg-slate-100 text-slate-500'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                              {s.estado}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold tracking-wide uppercase ${statusClass}`}>
                              {s.status === 'EM_ANDAMENTO' ? 'Em andamento' : s.status === 'ENCERRADO' ? 'Encerrado' : 'Aberto'}
                            </span>
                          </div>
                        </td>

                        {/* 4. Última Movimentação (Linha do Tempo consolidada) */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <MovIcon size={14} className={mov.color} />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                {mov.etapa}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 ml-5">
                              <Clock size={11} />
                              {new Date(mov.data).toLocaleDateString('pt-BR')} 
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity italic ml-1 text-[9px]">
                                (ver histórico)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 5. Ações */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditando(s); setModalOpen(true) }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Editar Solicitação"
                            >
                              <PenLine size={16} />
                            </button>
                            {!isTecnico && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(s) }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir Solicitação"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-transparent border-t border-slate-100 dark:border-white/5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mostrando página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                  Anterior
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modais omitidos para brevidade (mantém o design original) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Excluir Solicitação</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Essa ação é irreversível.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
              Tem certeza que deseja excluir o chamado <span className="font-mono font-bold text-slate-800 dark:text-white">{confirmDelete.numeroChamado}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletando}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={excluirSolicitacao}
                disabled={deletando}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm shadow-red-500/20"
              >
                {deletando ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Excluindo...</>
                ) : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <SolicitacaoModal
          solicitacao={editando}
          onClose={() => { setModalOpen(false); setEditando(null) }}
          onSave={() => { setModalOpen(false); setEditando(null); carregar(); carregarDashboard() }}
        />
      )}

      <SolicitacaoDrawer
        solicitacaoId={drawerSolicitacaoId}
        onClose={() => setDrawerSolicitacaoId(null)}
      />

      <ImportacaoModal
        isOpen={importacaoOpen}
        onClose={() => setImportacaoOpen(false)}
        onSucesso={() => { 
          setImportacaoOpen(false)
          carregar()
          carregarDashboard()
        }}
      />
    </div>
  )
}
