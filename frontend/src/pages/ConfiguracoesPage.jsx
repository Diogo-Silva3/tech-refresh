import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'
import { Settings, User, Lock, Shield, QrCode, ShieldCheck, Plus, Edit2, Trash2, Search } from 'lucide-react'
import UsuarioModal from '../components/modals/UsuarioModal'
import ConfirmDialog from '../components/ConfirmDialog'

const TABS_ADMIN = [
  { id: 'perfil',   label: 'Perfil',    icon: User },
  { id: 'seguranca',label: 'Segurança', icon: Lock },
  { id: 'sistema',  label: 'Sistema',   icon: Settings },
  { id: 'sobre',    label: 'Sobre',     icon: Shield },
]
const TABS_USER = [
  { id: 'perfil',   label: 'Perfil',    icon: User },
  { id: 'seguranca',label: 'Segurança', icon: Lock },
  { id: 'sobre',    label: 'Sobre',     icon: Shield },
]

export default function ConfiguracoesPage() {
  const { usuario, isAdmin, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [aba, setAba] = useState('perfil')
  const [senhaForm, setSenhaForm] = useState({ novaSenha: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [loadingQr, setLoadingQr] = useState(false)
  const [dominios, setDominios] = useState([])
  const [usuariosSistema, setUsuariosSistema] = useState([])
  const [unidades, setUnidades] = useState([])
  const [modalSistema, setModalSistema] = useState(false)
  const [editandoSistema, setEditandoSistema] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [buscaSistema, setBuscaSistema] = useState('')
  const [clientes, setClientes] = useState([])
  const [projetos, setProjetos] = useState([])

  useEffect(() => {
    if (isAdmin) {
      api.get('/auth/dominios').then(r => setDominios(r.data.dominios)).catch(() => {})
      carregarUsuariosSistema()
      api.get('/unidades').then(r => setUnidades(r.data)).catch(() => {})
    }
    if (isSuperAdmin) {
      api.get('/clientes').then(r => setClientes(r.data)).catch(() => {})
      api.get('/projetos').then(r => setProjetos(r.data)).catch(() => {})
    }
  }, [isAdmin, isSuperAdmin])

  const carregarUsuariosSistema = () => {
    api.get('/usuarios?comAcesso=true&limit=100')
      .then(r => setUsuariosSistema(r.data.data || []))
      .catch(() => {})
  }

  const handleDeleteSistema = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuário desativado')
      setConfirmDelete(null)
      carregarUsuariosSistema()
    } catch { toast.error('Erro ao desativar') }
  }

  const handleSenha = async (e) => {
    e.preventDefault()
    if (senhaForm.novaSenha !== senhaForm.confirmar) return toast.error('As senhas não coincidem')
    setLoading(true)
    try {
      await api.put(`/usuarios/${usuario.id}`, { senha: senhaForm.novaSenha })
      toast.success('Senha alterada com sucesso')
      setSenhaForm({ novaSenha: '', confirmar: '' })
    } catch { toast.error('Erro ao alterar senha') }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white'
  const tabs = isAdmin ? TABS_ADMIN : TABS_USER

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Configurações</h1>
        <p className="text-slate-400 text-xs mt-0.5">Gerencie suas preferências e conta</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setAba(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all
                ${aba === t.id
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Aba Perfil */}
      {aba === 'perfil' && (
        <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{usuario?.nome}</p>
              <p className="text-sm text-slate-400">{usuario?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                ${usuario?.role === 'ADMIN'
                  ? 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400'
                  : 'bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-400'}`}>
                {usuario?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
            {[
              { label: 'Função', value: usuario?.funcao },
              { label: 'Unidade', value: usuario?.unidade?.nome },
              { label: 'Empresa', value: usuario?.empresa?.nome },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba Segurança */}
      {aba === 'seguranca' && (
        <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Lock size={14} /> Alterar Senha
          </p>
          <form onSubmit={handleSenha} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nova Senha</label>
              <input type="password" required minLength={6} value={senhaForm.novaSenha}
                onChange={e => setSenhaForm(f => ({ ...f, novaSenha: e.target.value }))}
                autoComplete="new-password" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirmar Nova Senha</label>
              <input type="password" required minLength={6} value={senhaForm.confirmar}
                onChange={e => setSenhaForm(f => ({ ...f, confirmar: e.target.value }))}
                autoComplete="new-password" className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium mt-1">
              {loading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      )}

      {/* Aba Sistema (admin) */}
      {aba === 'sistema' && isAdmin && (
        <div className="space-y-4">

          {/* Info sistema */}
          <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
              <Settings size={14} /> Informações
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Versão</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">2.1</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Empresa</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{usuario?.empresa?.nome}</p>
              </div>
            </div>
          </div>

          {/* QR Codes + Domínios lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
                <QrCode size={14} /> QR Codes
              </p>
              <p className="text-[11px] text-slate-400 mb-3">Regenera os QR Codes de todos os equipamentos.</p>
              <button
                onClick={async () => {
                  setLoadingQr(true)
                  try {
                    const res = await api.post('/equipamentos/regenerar-qrcodes')
                    toast.success(res.data.message)
                  } catch { toast.error('Erro ao regenerar QR Codes') }
                  setLoadingQr(false)
                }}
                disabled={loadingQr}
                className="bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/15 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-xs font-medium w-full">
                {loadingQr ? 'Regenerando...' : 'Regenerar QR Codes'}
              </button>
            </div>

            <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
                <Shield size={14} /> Domínios Permitidos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dominios.length === 0 && <p className="text-xs text-slate-400">Carregando...</p>}
                {dominios.map(d => (
                  <span key={d} className="text-[10px] bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Usuários do Sistema */}
          <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.04]">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck size={14} /> Usuários do Sistema
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar..." value={buscaSistema}
                    onChange={e => setBuscaSistema(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-44" />
                </div>
                <button onClick={() => { setEditandoSistema(null); setModalSistema(true) }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                  <Plus size={12} /> Novo usuário
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02]">
                  <th className="text-left py-2.5 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Nome</th>
                  <th className="text-left py-2.5 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Email</th>
                  <th className="text-left py-2.5 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Unidade</th>
                  <th className="text-left py-2.5 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Perfil</th>
                  <th className="text-right py-2.5 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosSistema.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-400">Nenhum usuário cadastrado</td></tr>
                )}
                {usuariosSistema
                  .filter(u => !buscaSistema || u.nome?.toLowerCase().includes(buscaSistema.toLowerCase()) || u.email?.toLowerCase().includes(buscaSistema.toLowerCase()))
                  .map(u => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {u.nome?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{u.nome}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[12px] text-slate-500 dark:text-slate-400">{u.email || '—'}</td>
                    <td className="py-2.5 px-4 text-[12px] text-slate-600 dark:text-slate-300">{u.unidade?.nome || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium
                        ${u.role === 'ADMIN' ? 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400' : 'bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-400'}`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Técnico'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditandoSistema(u); setModalSistema(true) }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Aba Sobre */}
      {aba === 'sobre' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 overflow-hidden shrink-0">
                <img src="/logo-ntt.png" alt="NTT" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-slate-800 dark:text-white">Tech Refresh</p>
                <p className="text-[12px] text-slate-400">Sistema de Gestão de Inventário de TI</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
              {[
                { label: 'Versão', value: '2.1' },
                { label: 'Ambiente', value: 'Produção' },
                { label: 'Desenvolvido por', value: 'NTT Data' },
                { label: 'Ano', value: '2026' },
                { label: 'Frontend', value: 'React + Vite + Tailwind' },
                { label: 'Backend', value: 'Node.js + Prisma + PostgreSQL' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-5">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-3">Suporte</p>
            <div className="space-y-2 text-[12px] text-slate-500 dark:text-slate-400">
              <p>Para suporte técnico, entre em contato com a equipe NTT Data.</p>
              <p>Email: <span className="text-blue-500">diogo.silva@nttdata.com</span></p>
              <p>Sistema: <a href="https://tech-refresh.cloud" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tech-refresh.cloud</a></p>
            </div>
          </div>
        </div>
      )}

      {modalSistema && (
        <UsuarioModal usuario={editandoSistema} unidades={unidades} clientes={clientes} projetos={projetos} tipo="sistema"
          onClose={() => setModalSistema(false)}
          onSave={() => { setModalSistema(false); carregarUsuariosSistema() }} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          titulo="Desativar usuário?"
          mensagem={`"${confirmDelete.nome}" será desativado e não poderá mais acessar o sistema.`}
          onConfirm={() => handleDeleteSistema(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}
