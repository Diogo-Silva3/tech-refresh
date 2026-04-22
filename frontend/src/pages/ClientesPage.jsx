import { useEffect, useState } from 'react'
import { Building2, Plus, X, Edit2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

function ClienteModal({ onClose, onSave, cliente }) {
  const toast = useToast()
  const { t } = useTranslation()
  const editando = !!cliente
  const [form, setForm] = useState({
    nome: cliente?.nome || '',
    cnpj: cliente?.cnpj || '',
    adminNome: '', adminEmail: '', adminSenha: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editando) {
        await api.put(`/clientes/${cliente.id}`, { nome: form.nome, cnpj: form.cnpj, ativo: cliente.ativo })
        toast.success(t('salvoSucesso'))
      } else {
        await api.post('/clientes', form)
        toast.success(t('salvoSucesso'))
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || t('erroSalvar'))
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">{editando ? `${t('editar')} ${t('clientes').slice(0,-1)}` : `${t('novo')} ${t('clientes').slice(0,-1)}`}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('clientes').slice(0,-1)} *</label>
            <input className={inputCls} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Wickbold Brasil" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">CNPJ</label>
            <input className={inputCls} value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
          </div>
          {!editando && (
            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Admin</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('colaborador')}</label>
                  <input className={inputCls} value={form.adminNome} onChange={e => setForm(f => ({ ...f, adminNome: e.target.value }))} placeholder="Admin name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('email')} *</label>
                  <input type="email" className={inputCls} value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} placeholder="admin@empresa.com" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('senha')} *</label>
                  <input type="password" className={inputCls} value={form.adminSenha} onChange={e => setForm(f => ({ ...f, adminSenha: e.target.value }))} required />
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">{t('cancelar')}</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? t('carregando') : editando ? t('salvar') : `${t('novo')} ${t('clientes').slice(0,-1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const toast = useToast()
  const { t } = useTranslation()

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/clientes')
      setClientes(res.data)
    } catch { toast.error('Erro ao carregar clientes') }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const toggleAtivo = async (cliente) => {
    try {
      await api.put(`/clientes/${cliente.id}`, { nome: cliente.nome, ativo: !cliente.ativo })
      toast.success(cliente.ativo ? 'Cliente desativado' : 'Cliente ativado')
      carregar()
    } catch { toast.error('Erro ao atualizar cliente') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('clientes')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{clientes.length} {t('clientes').toLowerCase()}</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> {t('novo')} {t('clientes').slice(0,-1)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-32" />
          ))
        ) : clientes.map(c => (
          <div key={c.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 ${c.ativo ? 'border-slate-200 dark:border-slate-700' : 'border-red-200 dark:border-red-800/40 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{c.nome}</p>
                  {c.cnpj && <p className="text-xs text-slate-400">{c.cnpj}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <button onClick={() => { setEditando(c); setModalOpen(true) }}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                  <Edit2 size={13} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>{c._count?.usuarios || 0} usuários</span>
              <span>{c._count?.equipamentos || 0} equipamentos</span>
            </div>
            <button onClick={() => toggleAtivo(c)}
              className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${c.ativo ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-500/10'}`}>
              {c.ativo ? 'Desativar' : 'Reativar'}
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ClienteModal
          cliente={editando}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); carregar() }}
        />
      )}
    </div>
  )
}
