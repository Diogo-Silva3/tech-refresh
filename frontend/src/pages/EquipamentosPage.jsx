import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import StatusBadge from '../components/StatusBadge'
import EquipamentoModal from '../components/modals/EquipamentoModal'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_OPTIONS = ['', 'DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'DESCARTADO', 'EMPRESTADO']
const STATUS_LABELS = { '': 'Todos', DISPONIVEL: 'Disponível', EM_USO: 'Em Uso', MANUTENCAO: 'Manutenção', DESCARTADO: 'Descartado', EMPRESTADO: 'Emprestado' }

const PROCESSO_STEPS = ['Novo', 'Imagem Instalada', 'Softwares Instalados', 'Asset Registrado', 'Agendado para Entrega', 'Entregue ao Usuário', 'Em Uso', 'Em Manutenção', 'Baixado']
const PROCESSO_OPTIONS = ['', ...PROCESSO_STEPS]

const PROCESSO_COLORS = {
  'Novo': 'bg-slate-100 text-slate-600',
  'Imagem Instalada': 'bg-blue-100 text-blue-700',
  'Softwares Instalados': 'bg-indigo-100 text-indigo-700',
  'Asset Registrado': 'bg-purple-100 text-purple-700',
  'Agendado para Entrega': 'bg-amber-100 text-amber-700',
  'Entregue ao Usuário': 'bg-green-100 text-green-700',
  'Em Uso': 'bg-green-100 text-green-700',
  'Em Manutenção': 'bg-red-100 text-red-700',
  'Baixado': 'bg-slate-100 text-slate-500',
}

function ProgressoBar({ statusProcesso }) {
  const steps = ['Novo', 'Imagem Instalada', 'Softwares Instalados', 'Asset Registrado', 'Agendado para Entrega', 'Entregue ao Usuário']
  const idx = steps.indexOf(statusProcesso)
  const pct = idx < 0 ? 0 : Math.round((idx / (steps.length - 1)) * 100)
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function EquipamentosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { isAdmin } = useAuth()
  const { t } = useTranslation()
  const limit = 20

  const [equipamentos, setEquipamentos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState(location.state?.status || '')
  const [statusProcesso, setStatusProcesso] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [unidades, setUnidades] = useState([])
  const [unidadeId, setUnidadeId] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit,
        ...(busca && { busca }),
        ...(status && { status }),
        ...(statusProcesso && { statusProcesso }),
        ...(unidadeId && { unidadeId }),
      })
      const res = await api.get(`/equipamentos?${params}`)
      setEquipamentos(res.data.data)
      setTotal(res.data.total)
    } catch { toast.error('Erro ao carregar equipamentos') }
    setLoading(false)
  }, [page, busca, status, statusProcesso, unidadeId])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { api.get('/unidades').then(r => setUnidades(r.data)) }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/equipamentos/${id}`)
      toast.success('Equipamento descartado')
      setConfirmDelete(null)
      carregar()
    } catch { toast.error('Erro ao descartar equipamento') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('equipamentos')}</h1>
          <p className="text-slate-500 text-sm">{total} {t('equipamentos').toLowerCase()} {t('cadastrados') || ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditando(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> {t('novoEquipamento')}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar por marca, modelo, serial..." value={busca}
            onChange={e => { setBusca(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={statusProcesso} onChange={e => { setStatusProcesso(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800">
          <option value="">Todos os processos</option>
          {PROCESSO_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={unidadeId} onChange={e => { setUnidadeId(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800">
          <option value="">Todas as unidades</option>
          {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('tipo')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('marca')} / {t('modelo')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('serial')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('unidade')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('colaborador')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('status')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('processo')}</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">{t('progresso')}</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">{t('acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">{t('carregando')}</td></tr>
              ) : equipamentos.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">{t('nenhumResultado')}</td></tr>
              ) : equipamentos.map(eq => (
                <tr key={eq.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{eq.tipo || '—'}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{eq.marca || '—'}</p>
                    <p className="text-xs text-slate-400">{eq.modelo || ''}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{eq.serialNumber || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">{eq.unidade?.nome || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">{eq.vinculacoes?.[0]?.usuario?.nome || '—'}</td>
                  <td className="py-3 px-4"><StatusBadge status={eq.status} /></td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${PROCESSO_COLORS[eq.statusProcesso] || 'bg-slate-100 text-slate-600'}`}>
                      {eq.statusProcesso || 'Novo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ProgressoBar statusProcesso={eq.statusProcesso} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/equipamentos/${eq.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalhes">
                        <Eye size={15} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setEditando(eq); setModalOpen(true) }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                          <Edit2 size={15} />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setConfirmDelete(eq)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Descartar">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">{t('pagina')} {page} {t('de')} {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                {t('anterior')}
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                {t('proxima')}
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <EquipamentoModal
          equipamento={editando}
          unidades={unidades}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); carregar() }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          titulo="Descartar equipamento?"
          mensagem={`"${[confirmDelete.marca, confirmDelete.modelo].filter(Boolean).join(' ') || 'Este equipamento'}" será marcado como descartado e removido da listagem.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
