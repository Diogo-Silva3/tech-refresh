import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Building2, Monitor, Users, MapPin, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all'

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', cidade: '', estado: '' })
  const [confirm, setConfirm] = useState(null)
  const [busca, setBusca] = useState('')
  const toast = useToast()
  const { isAdmin } = useAuth()
  const { t } = useTranslation()

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/unidades')
      setUnidades(res.data)
    } catch { toast.error(t('erroCarregar')) }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (unidade = null) => {
    setEditando(unidade)
    setForm(unidade ? { nome: unidade.nome, cidade: unidade.cidade || '', estado: unidade.estado || '' } : { nome: '', cidade: '', estado: '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/unidades/${editando.id}`, form)
        toast.success(t('salvoSucesso'))
      } else {
        await api.post('/unidades', form)
        toast.success(t('salvoSucesso'))
      }
      setModalOpen(false)
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.error || t('erroSalvar'))
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/unidades/${id}`)
      toast.success(t('salvoSucesso'))
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.error || t('erroExcluir'))
    }
  }

  const labelUnidade = t('unidade')
  const labelNova = `${t('novo')} ${labelUnidade}`

  const filtradas = unidades.filter(u => !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.cidade?.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-900/80 dark:to-teal-900/60 p-6 sm:p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Building2 size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Unidades Operacionais
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
            Gerencie as diferentes localidades físicas da organização. Centralize o inventário por filial, centro de distribuição ou escritório regional.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input 
              type="text" 
              placeholder="Buscar unidade..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 pl-10 rounded-xl text-sm outline-none transition-colors backdrop-blur-sm"
            />
          </div>
          {isAdmin && (
            <button onClick={() => abrirModal()}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shrink-0">
              <Plus size={18} /> <span className="hidden sm:inline">Nova Unidade</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/5 p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhuma unidade encontrada</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">Você ainda não cadastrou nenhuma unidade ou a busca não retornou resultados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtradas.map(u => (
            <div key={u.id} className="group bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500/50">
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Building2 size={22} />
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModal(u)} className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 dark:bg-white/5 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirm(u.id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 dark:bg-white/5 dark:hover:bg-red-500/20 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <p className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate" title={u.nome}>{u.nome}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {(u.cidade || u.estado) ? [u.cidade, u.estado].filter(Boolean).join(' - ') : 'Localização não definida'}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col items-center bg-slate-50 dark:bg-white/5 py-2 rounded-xl">
                  <Monitor size={14} className="text-blue-500 mb-1" />
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{u._count?.equipamentos || 0}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mão de Obra</span>
                </div>
                <div className="flex flex-col items-center bg-slate-50 dark:bg-white/5 py-2 rounded-xl">
                  <Users size={14} className="text-indigo-500 mb-1" />
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{u._count?.usuarios || 0}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Usuários</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2235] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editando ? `Editar Unidade` : `Nova Unidade`}</h2>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nome da Unidade *</label>
                <input type="text" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Filial São Paulo" className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Cidade</label>
                  <input type="text" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Ex: São Paulo" className={inputCls} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Estado</label>
                  <input type="text" maxLength={2} value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value.toUpperCase() }))} placeholder="SP" className={inputCls} />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {t('cancelar')}
                </button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all">
                  {t('salvar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          titulo={`${t('excluir')} ${labelUnidade}`}
          mensagem={t('confirmar')}
          onConfirm={() => { handleDelete(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
