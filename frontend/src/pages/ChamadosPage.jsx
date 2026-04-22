import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, AlertCircle, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { SkeletonRow, EmptyState } from '../components/Skeleton'

const STATUS_MAP = {
  ABERTO:      { label: 'Aberto',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',    icon: AlertCircle },
  EM_ANDAMENTO:{ label: 'Em Andamento',color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: Clock },
  RESOLVIDO:   { label: 'Resolvido',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle },
  CANCELADO:   { label: 'Cancelado',   color: 'bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-400',     icon: XCircle },
}

const PRIORIDADE_MAP = {
  BAIXA:  { label: 'Baixa',  color: 'bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-400' },
  MEDIA:  { label: 'Média',  color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
  ALTA:   { label: 'Alta',   color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' },
  CRITICA:{ label: 'Crítica',color: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
}

function NovoChamadoModal({ onClose, onSave }) {
  const toast = useToast()
  const [form, setForm] = useState({ titulo: '', descricao: '', prioridade: 'MEDIA', equipamentoId: '', usuarioId: '' })
  const [equipamentos, setEquipamentos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/equipamentos?limit=200').then(r => setEquipamentos(r.data.data || []))
    api.get('/usuarios?limit=200').then(r => setUsuarios(r.data.data || []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return toast.error('Título obrigatório')
    setLoading(true)
    try {
      await api.post('/chamados', {
        ...form,
        equipamentoId: form.equipamentoId ? parseInt(form.equipamentoId) : null,
        usuarioId: form.usuarioId ? parseInt(form.usuarioId) : null,
      })
      toast.success('Chamado criado com sucesso')
      onSave()
    } catch { toast.error('Erro ao criar chamado') }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="font-semibold text-slate-800 dark:text-white">Novo Chamado</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Título *</label>
            <input className={inputCls} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Descreva o problema brevemente" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição</label>
            <textarea className={inputCls} rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes adicionais..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Prioridade</label>
              <select className={inputCls} value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}>
                {Object.entries(PRIORIDADE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Equipamento</label>
              <select className={inputCls} value={form.equipamentoId} onChange={e => setForm(f => ({ ...f, equipamentoId: e.target.value }))}>
                <option value="">Nenhum</option>
                {equipamentos.map(eq => <option key={eq.id} value={eq.id}>{eq.marca} {eq.modelo} — {eq.serialNumber}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Colaborador</label>
            <select className={inputCls} value={form.usuarioId} onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))}>
              <option value="">Nenhum</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium">
              {loading ? 'Salvando...' : 'Criar Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AtualizarStatusModal({ chamado, onClose, onSave }) {
  const toast = useToast()
  const [status, setStatus] = useState(chamado.status)
  const [descricao, setDescricao] = useState(chamado.descricao || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/chamados/${chamado.id}`, { status, descricao })
      toast.success('Chamado atualizado')
      onSave()
    } catch { toast.error('Erro ao atualizar chamado') }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="font-semibold text-slate-800 dark:text-white">Atualizar Chamado</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Chamado</p>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{chamado.titulo}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Observação</label>
            <textarea className={inputCls} rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Adicione uma observação..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ChamadosPage() {
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [modalNovo, setModalNovo] = useState(false)
  const [editando, setEditando] = useState(null)
  const toast = useToast()

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroStatus) params.set('status', filtroStatus)
      const res = await api.get(`/chamados?${params}`)
      setChamados(res.data)
    } catch { toast.error('Erro ao carregar chamados') }
    setLoading(false)
  }, [filtroStatus])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = chamados.filter(c =>
    !busca || c.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    c.equipamento?.serialNumber?.toLowerCase().includes(busca.toLowerCase()) ||
    c.usuario?.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  const contadores = Object.keys(STATUS_MAP).reduce((acc, k) => {
    acc[k] = chamados.filter(c => c.status === k).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Chamados</h1>
          <p className="text-slate-400 text-xs mt-0.5">{chamados.length} chamados no total</p>
        </div>
        <button onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Novo Chamado
        </button>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_MAP).map(([k, v]) => {
          const Icon = v.icon
          return (
            <button key={k} onClick={() => setFiltroStatus(filtroStatus === k ? '' : k)}
              className={`bg-white dark:bg-[#1a2235] border rounded-xl p-3 text-left transition-all shadow-sm
                ${filtroStatus === k ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-white/5 hover:shadow-md'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{v.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{contadores[k] || 0}</p>
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        {/* Filtros */}
        <div className="p-3 flex flex-wrap gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por título, serial, colaborador..." value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
          </div>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 text-[13px] border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200">
            <option value="">Todos os status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3">
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Título</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Equipamento</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Colaborador</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Prioridade</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Status</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Data</th>
                <th className="text-right py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : filtrados.length === 0
                  ? <EmptyState icon={AlertCircle} titulo="Nenhum chamado encontrado" descricao="Crie um novo chamado para começar" />
                  : filtrados.map(c => {
                    const st = STATUS_MAP[c.status] || STATUS_MAP.ABERTO
                    const pr = PRIORIDADE_MAP[c.prioridade] || PRIORIDADE_MAP.MEDIA
                    return (
                      <tr key={c.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                        <td className="py-2.5 px-4">
                          <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">{c.titulo}</p>
                          {c.descricao && <p className="text-[11px] text-slate-400 truncate max-w-xs">{c.descricao}</p>}
                        </td>
                        <td className="py-2.5 px-4 text-[12px] text-slate-500 dark:text-slate-400">
                          {c.equipamento ? `${c.equipamento.marca} ${c.equipamento.modelo}` : '—'}
                          {c.equipamento?.serialNumber && <span className="block text-[11px] font-mono text-slate-400">{c.equipamento.serialNumber}</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[12px] text-slate-600 dark:text-slate-300">{c.usuario?.nome || '—'}</td>
                        <td className="py-2.5 px-4">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${pr.color}`}>{pr.label}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button onClick={() => setEditando(c)}
                            className="flex items-center gap-1 ml-auto text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                            <ChevronDown size={12} /> Atualizar
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {modalNovo && <NovoChamadoModal onClose={() => setModalNovo(false)} onSave={() => { setModalNovo(false); carregar() }} />}
      {editando && <AtualizarStatusModal chamado={editando} onClose={() => setEditando(null)} onSave={() => { setEditando(null); carregar() }} />}
    </div>
  )
}
