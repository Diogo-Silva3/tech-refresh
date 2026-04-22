import { useEffect, useState, useCallback } from 'react'
import { Shield, Search, ChevronLeft, ChevronRight, User, Monitor, ArrowLeftRight, LogIn, Trash2, RefreshCw, Plus, Edit, Calendar, Upload, UserPlus, UserX, Package, CheckSquare } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonRow, EmptyState } from '../components/Skeleton'

const ACAO_MAP = {
  // Auth
  LOGIN:                    { label: 'Login',                color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',           icon: LogIn },
  LOGIN_FALHOU:             { label: 'Login Falhou',         color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',               icon: LogIn },
  LOGOUT:                   { label: 'Logout',               color: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400',             icon: LogIn },
  SENHA_REDEFINIDA:         { label: 'Senha Redefinida',     color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',               icon: LogIn },
  // Equipamentos
  EQUIPAMENTO_CRIADO:       { label: 'Equip. Criado',        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: Plus },
  EQUIPAMENTO_EDITADO:      { label: 'Equip. Editado',       color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',               icon: Edit },
  EQUIPAMENTO_DESCARTADO:   { label: 'Equip. Descartado',    color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',               icon: Trash2 },
  AGENDAMENTO_CRIADO:       { label: 'Agendamento',          color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',   icon: Calendar },
  // Vinculações
  EQUIPAMENTO_ATRIBUIDO:    { label: 'Atribuição',           color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',   icon: Monitor },
  TRANSFERIDO:              { label: 'Transferência',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',       icon: ArrowLeftRight },
  REAGENDAMENTO:            { label: 'Reagendamento',        color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',   icon: Calendar },
  ENTREGA_CONFIRMADA:       { label: 'Entrega Confirmada',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckSquare },
  DEVOLUCAO_OK:             { label: 'Devolução OK',         color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: RefreshCw },
  DEVOLUCAO_COM_PROBLEMA:   { label: 'Devolução c/ Prob.',   color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',               icon: RefreshCw },
  // Usuários
  USUARIO_CRIADO:           { label: 'Usuário Criado',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: UserPlus },
  USUARIO_DESATIVADO:       { label: 'Usuário Desativado',   color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',               icon: UserX },
  // Técnico
  TECNICO_DESIGNADO:        { label: 'Técnico Designado',    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',           icon: User },
  // Importações
  IMPORTACAO_EQUIPAMENTOS:  { label: 'Import. Equipamentos', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',   icon: Upload },
  IMPORTACAO_USUARIOS:      { label: 'Import. Usuários',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',   icon: Upload },
  // Legados
  ATRIBUIDO:                { label: 'Atribuição',           color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',   icon: Monitor },
  DESCARTADO:               { label: 'Descartado',           color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',               icon: Trash2 },
  CRIADO:                   { label: 'Criado',               color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: Package },
  ATUALIZADO:               { label: 'Atualizado',           color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',               icon: Edit },
}

export default function AuditoriaPage() {
  const { usuario } = useAuth()
  const isSuperAdmin = usuario?.role === 'SUPERADMIN'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroAcao, setFiltroAcao] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [empresas, setEmpresas] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 50
  const toast = useToast()

  // Carrega lista de empresas para o filtro do SUPERADMIN
  useEffect(() => {
    if (!isSuperAdmin) return
    api.get('/clientes').then(r => setEmpresas(r.data?.data || r.data || [])).catch(() => {})
  }, [isSuperAdmin])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filtroAcao) params.set('acao', filtroAcao)
      if (isSuperAdmin && filtroEmpresa) params.set('empresaId', filtroEmpresa)
      const res = await api.get(`/auditoria?${params}`)
      setLogs(res.data.data || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 1)
    } catch {
      toast.error('Erro ao carregar logs de auditoria')
    }
    setLoading(false)
  }, [page, filtroAcao, filtroEmpresa, isSuperAdmin])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { setPage(1) }, [filtroAcao, filtroEmpresa])

  const logsFiltrados = busca
    ? logs.filter(l =>
        l.usuarioNome?.toLowerCase().includes(busca.toLowerCase()) ||
        l.empresaNome?.toLowerCase().includes(busca.toLowerCase()) ||
        l.projetoNome?.toLowerCase().includes(busca.toLowerCase()) ||
        l.acao?.toLowerCase().includes(busca.toLowerCase()) ||
        l.detalhes?.toLowerCase().includes(busca.toLowerCase()) ||
        l.ip?.includes(busca)
      )
    : logs

  const colunas = isSuperAdmin
    ? ['Data/Hora', 'Cliente', 'Projeto', 'Usuário', 'Ação', 'Detalhes', 'IP']
    : ['Data/Hora', 'Projeto', 'Usuário', 'Ação', 'Detalhes', 'IP']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield size={22} className="text-blue-600" /> Log de Auditoria
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{total} registros · ações críticas do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação, IP..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
          />
        </div>

        {isSuperAdmin && (
          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Todos os clientes</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        )}

        <select
          value={filtroAcao}
          onChange={e => setFiltroAcao(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="">Todas as ações</option>
          {Object.entries(ACAO_MAP)
            .filter(([k]) => !['ATRIBUIDO', 'DESCARTADO', 'CRIADO', 'ATUALIZADO'].includes(k)) // esconde legados do filtro
            .map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {colunas.map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={colunas.length} />)
                : logsFiltrados.length === 0
                  ? <EmptyState icon={Shield} titulo="Nenhum log encontrado" descricao="As ações críticas do sistema aparecerão aqui" />
                  : logsFiltrados.map(log => {
                    const info = ACAO_MAP[log.acao] || { label: log.acao, color: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400', icon: Shield }
                    const Icon = info.icon
                    return (
                      <tr key={log.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                        {isSuperAdmin && (
                          <td className="py-2.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                            {log.empresaNome || '—'}
                          </td>
                        )}
                        <td className="py-2.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {log.projetoNome || '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <User size={11} className="text-slate-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{log.usuarioNome || 'Sistema'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium ${info.color}`}>
                            <Icon size={10} />
                            {info.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.detalhes || ''}>
                          {log.detalhes || '—'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{log.ip || '—'}</td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500">Página {page} de {totalPages} · {total} registros</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
