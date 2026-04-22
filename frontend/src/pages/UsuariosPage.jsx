import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Users, ExternalLink, MailWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import UsuarioModal from '../components/modals/UsuarioModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { SkeletonRow, EmptyState } from '../components/Skeleton'

const ABAS = [
  { id: 'colaboradores', label: 'Colaboradores', icon: Users },
]

export default function UsuariosPage() {
  const [aba, setAba] = useState('colaboradores')
  const [usuarios, setUsuarios] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [unidadeId, setUnidadeId] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [unidades, setUnidades] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const toast = useToast()
  const { isAdmin, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [clientes, setClientes] = useState([])
  const limit = 20

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit,
        ...(busca && { busca }),
        ...(unidadeId && { unidadeId }),
        semAcesso: 'true',
      })
      const res = await api.get(`/usuarios?${params}`)
      setUsuarios(res.data.data)
      setTotal(res.data.total)
    } catch { toast.error('Erro ao carregar usuários') }
    setLoading(false)
  }, [page, busca, unidadeId, aba])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => { api.get('/unidades').then(r => setUnidades(r.data)) }, [])
  useEffect(() => {
    if (isSuperAdmin) api.get('/clientes').then(r => setClientes(r.data)).catch(() => {})
  }, [isSuperAdmin])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuário desativado')
      setConfirmDelete(null)
      carregar()
    } catch { toast.error('Erro ao desativar') }
  }

  const mudarAba = (novaAba) => { setAba(novaAba); setPage(1); setBusca(''); setUnidadeId('') }
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('colaboradores')}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{total} {t('registros')}</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditando(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> {t('novo')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        {/* Abas */}
        <div className="flex border-b border-slate-200 dark:border-white/5">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => mudarAba(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${aba === id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="p-3 flex flex-wrap gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por nome, email, função..." value={busca}
              onChange={e => { setBusca(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
          </div>
          <select value={unidadeId} onChange={e => { setUnidadeId(e.target.value); setPage(1) }}
            className="px-3 py-1.5 text-[13px] border border-slate-200 dark:border-white/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200">
            <option value="">{t('todasUnidades')}</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3">
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">{t('colaborador')}</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">{t('email')}</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Função</th>
                <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">{t('unidade')}</th>
                <th className="text-right py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">{t('acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={aba === 'sistema' ? 6 : 5} />)
                : usuarios.length === 0
                  ? <EmptyState icon={Users} titulo={t('nenhumResultado')} descricao={t('importarPlanilha')} />
                  : usuarios.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                            ${aba === 'sistema' ? 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400' : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'}`}>
                            {u.nome?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[13px] text-slate-800 dark:text-slate-100">{u.nome}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[12px] text-slate-500 dark:text-slate-400">
                        {u.email
                          ? u.email
                          : (
                            <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                              <MailWarning size={12} />
                              <span className="text-[11px]">Sem email</span>
                            </span>
                          )
                        }
                      </td>
                      <td className="py-2.5 px-4 text-[12px] text-slate-600 dark:text-slate-300">{u.funcao || '—'}</td>
                      <td className="py-2.5 px-4 text-[12px] text-slate-600 dark:text-slate-300">{u.unidade?.nome || '—'}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/usuarios/${u.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                            <ExternalLink size={14} />
                          </button>
                          {isAdmin && (
                            <>
                              <button onClick={() => { setEditando(u); setModalOpen(true) }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setConfirmDelete(u)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/5">
            <p className="text-[12px] text-slate-500">{t('pagina')} {page} {t('de')} {totalPages} — {total} {t('registros')}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-[12px] border border-slate-200 dark:border-white/8 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">{t('anterior')}</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-[12px] border border-slate-200 dark:border-white/8 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">{t('proxima')}</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <UsuarioModal usuario={editando} unidades={unidades} clientes={clientes}
          tipo={isSuperAdmin && editando?.role && editando.role !== 'COLABORADOR' ? 'sistema' : 'colaborador'}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); carregar() }} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          titulo="Desativar usuário?"
          mensagem={`"${confirmDelete.nome}" será desativado e não poderá mais acessar o sistema.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}
