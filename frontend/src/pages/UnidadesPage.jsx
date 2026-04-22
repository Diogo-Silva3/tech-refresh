import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Building2, Monitor, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', cidade: '', estado: '' })
  const [confirm, setConfirm] = useState(null)
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('unidades')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{unidades.length} {t('unidades').toLowerCase()}</p>
        </div>
        {isAdmin && (
          <button onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> {labelNova}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unidades.map(u => (
            <div key={u.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{u.nome}</p>
                    {(u.cidade || u.estado) && (
                      <p className="text-xs text-slate-400">{[u.cidade, u.estado].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => abrirModal(u)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirm(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Monitor size={14} />
                  <span>{u._count?.equipamentos || 0} {t('equipamentos').toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Users size={14} />
                  <span>{u._count?.usuarios || 0} {t('colaboradores').toLowerCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5">
              {editando ? `${t('editar')} ${labelUnidade}` : labelNova}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('novo')} *</label>
                <input type="text" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                  <input type="text" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                  <input type="text" maxLength={2} value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value.toUpperCase() }))}
                    placeholder="SP"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  {t('cancelar')}
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
