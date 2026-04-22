import { useState } from 'react'
import { X, User, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

function ModalColaborador({ usuario, unidades, onClose, onSave, toast }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    funcao: usuario?.funcao || '',
    unidadeId: usuario?.unidadeId || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, unidadeId: form.unidadeId || null }
      if (usuario) {
        await api.put(`/usuarios/${usuario.id}`, data)
      } else {
        await api.post('/usuarios', { ...data, role: 'COLABORADOR' })
      }
      toast.success(t('salvoSucesso'))
      onSave()
    } catch (err) { toast.error(err.response?.data?.error || t('erroSalvar')) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
              <User size={16} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{usuario ? t('editar') : t('novo')} {t('colaborador')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>{t('colaborador')} *</label>
            <input type="text" required value={form.nome} onChange={set('nome')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('email')} <span className="text-xs font-normal text-slate-400">(necessário para receber notificações de entrega)</span></label>
            <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="colaborador@empresa.com" />
          </div>
          <div>
            <label className={labelCls}>Função / Cargo</label>
            <input type="text" value={form.funcao} onChange={set('funcao')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('unidade')}</label>
            <select value={form.unidadeId} onChange={set('unidadeId')} className={inputCls}>
              <option value="">{t('semUnidade')}</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">{t('cancelar')}</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? t('carregando') : t('salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalSistema({ usuario, unidades, clientes, projetos, onClose, onSave, toast }) {
  const { isSuperAdmin } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    funcao: usuario?.funcao || '',
    role: usuario?.role || 'TECNICO',
    unidadeId: (usuario?.role === 'ADMIN' ? '' : usuario?.unidadeId) || '',
    empresaId: usuario?.empresaId || '',
    projetoId: usuario?.projetoId || '',
    senha: '',
  })
  const [loading, setLoading] = useState(false)
  const set = (f) => (e) => setForm(p => {
    const updated = { ...p, [f]: e.target.value }
    if (f === 'role' && e.target.value === 'ADMIN') updated.unidadeId = ''
    return updated
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, unidadeId: form.unidadeId || null, projetoId: form.projetoId || null }
      if (!data.senha) delete data.senha
      if (!isSuperAdmin) delete data.empresaId
      else if (data.empresaId) data.empresaId = parseInt(data.empresaId)
      if (data.projetoId) data.projetoId = parseInt(data.projetoId)
      if (usuario) {
        await api.put(`/usuarios/${usuario.id}`, data)
        toast.success(t('salvoSucesso'))
      } else {
        await api.post('/usuarios', data)
        toast.success(t('salvoSucesso'))
      }
      onSave()
    } catch (err) { toast.error(err.response?.data?.error || t('erroSalvar')) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {usuario ? t('editar') : t('novo')} {t('tecnico')}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>{t('colaborador')} *</label>
            <input type="text" required value={form.nome} onChange={set('nome')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('email')} *</label>
            <input type="email" required value={form.email} onChange={set('email')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('tecnico')}</label>
              <input type="text" value={form.funcao} onChange={set('funcao')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Perfil</label>
              <select value={form.role} onChange={set('role')} className={inputCls}>
                <option value="TECNICO">{t('tecnico')}</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          {form.role !== 'ADMIN' && (
            <div>
              <label className={labelCls}>{t('unidade')}</label>
              <select value={form.unidadeId} onChange={set('unidadeId')} className={inputCls}>
                <option value="">{t('semUnidade')}</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
          )}
          {isSuperAdmin && clientes?.length > 0 && (
            <div>
              <label className={labelCls}>{t('clientes')}</label>
              <select value={form.empresaId} onChange={set('empresaId')} className={inputCls}>
                <option value="">-</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}
          {form.role === 'TECNICO' && projetos?.length > 0 && (
            <div>
              <label className={labelCls}>Projeto</label>
              <select value={form.projetoId} onChange={set('projetoId')} className={inputCls}>
                <option value="">Sem projeto</option>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>{t('senha')} {usuario ? `(${t('cancelar').toLowerCase()} = manter)` : '*'}</label>
            <input type="password" value={form.senha} onChange={set('senha')}
              minLength={!usuario ? 6 : 0} required={!usuario} autoComplete="new-password" className={inputCls} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">{t('cancelar')}</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? t('carregando') : t('salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsuarioModal({ usuario, unidades, clientes, projetos, onClose, onSave, tipo = 'sistema' }) {
  const toast = useToast()
  const props = { usuario, unidades, clientes, projetos, onClose, onSave, toast }
  if (tipo === 'colaborador') return <ModalColaborador {...props} />
  return <ModalSistema {...props} />
}
