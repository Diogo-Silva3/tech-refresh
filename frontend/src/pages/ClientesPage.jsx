import { useEffect, useState } from 'react'
import { Building2, Plus, X, Edit2, Users, Monitor, ShieldCheck, Mail, Building } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all'

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{editando ? `Editar Cliente` : `Novo Cliente`}</h2>
              <p className="text-blue-100 text-xs">Preencha os dados do cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nome da Empresa *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className={`${inputCls} pl-10`} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Acme Corp" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">CNPJ</label>
              <input className={inputCls} value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            </div>
          </div>

          {!editando && (
            <div className="border-t border-slate-100 dark:border-white/5 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-indigo-500" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Administrador Inicial</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nome do Admin</label>
                  <input className={inputCls} value={form.adminNome} onChange={e => setForm(f => ({ ...f, adminNome: e.target.value }))} placeholder="Ex: João Silva" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">E-mail *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input type="email" className={`${inputCls} pl-9`} value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} placeholder="admin@acme.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Senha Provisória *</label>
                    <input type="password" className={inputCls} value={form.adminSenha} onChange={e => setForm(f => ({ ...f, adminSenha: e.target.value }))} placeholder="••••••••" required />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editando ? 'Salvar Alterações' : 'Criar Cliente'}
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
      toast.success(cliente.ativo ? 'Cliente suspenso com sucesso' : 'Cliente ativado com sucesso')
      carregar()
    } catch { toast.error('Erro ao atualizar status do cliente') }
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-[#1a2235] p-6 sm:p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Building2 size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Gestão de Clientes
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Administre as organizações vinculadas à plataforma. Um cliente representa uma entidade isolada com seus próprios colaboradores, equipamentos e inventário.
          </p>
        </div>
        <div className="relative z-10">
          <button onClick={() => { setEditando(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
            <Plus size={18} /> Cadastrar Cliente
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/5 p-6 animate-pulse h-44" />
          ))
        ) : clientes.map(c => (
          <div key={c.id} className={`group bg-white dark:bg-[#1a2235] rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${c.ativo ? 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50' : 'border-red-200 dark:border-red-500/20 opacity-75 grayscale-[0.3]'}`}>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${c.ativo ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">{c.nome}</p>
                  <p className="text-xs font-mono text-slate-400 mt-1">{c.cnpj || 'Sem CNPJ vinculado'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${c.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                  {c.ativo ? 'Ativo' : 'Suspenso'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {c._count?.usuarios || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                <Monitor size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {c._count?.equipamentos || 0}
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => { setEditando(c); setModalOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors">
                <Edit2 size={13} /> Editar
              </button>
              
              <button onClick={() => toggleAtivo(c)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border transition-colors ${c.ativo ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10'}`}>
                {c.ativo ? 'Suspender' : 'Reativar'}
              </button>
            </div>
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
