import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'
import { Settings, User, Lock, Shield, QrCode, ShieldCheck, Plus, Edit2, Trash2, Search, CheckCircle2, ChevronRight } from 'lucide-react'
import UsuarioModal from '../components/modals/UsuarioModal'
import ConfirmDialog from '../components/ConfirmDialog'

const TABS_ADMIN = [
  { id: 'perfil',   label: 'Perfil de Acesso',    icon: User, desc: 'Seus dados e credenciais' },
  { id: 'seguranca',label: 'Segurança', icon: Lock, desc: 'Senhas e autenticação' },
  { id: 'sistema',  label: 'Gestão do Sistema',   icon: Settings, desc: 'Usuários, Domínios e QR Codes' },
  { id: 'sobre',    label: 'Sobre a Plataforma',     icon: Shield, desc: 'Versão e Suporte NTT Data' },
]
const TABS_USER = [
  { id: 'perfil',   label: 'Perfil de Acesso',    icon: User, desc: 'Seus dados e credenciais' },
  { id: 'seguranca',label: 'Segurança', icon: Lock, desc: 'Senhas e autenticação' },
  { id: 'sobre',    label: 'Sobre a Plataforma',     icon: Shield, desc: 'Versão e Suporte NTT Data' },
]

export default function ConfiguracoesPage() {
  const { usuario, isAdmin, isSuperAdmin } = useAuth()
  const toast = useToast()
  const [aba, setAba] = useState('perfil')
  const [senhaForm, setSenhaForm] = useState({ novaSenha: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [loadingQr, setLoadingQr] = useState(false)
  const [confirmQrText, setConfirmQrText] = useState('')
  const [showQrConfirm, setShowQrConfirm] = useState(false)
  
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

  const handleRegerarQrCode = async () => {
    if (confirmQrText !== 'CONFIRMAR') {
      return toast.error('Digite CONFIRMAR para prosseguir');
    }
    setLoadingQr(true)
    try {
      const res = await api.post('/equipamentos/regenerar-qrcodes')
      toast.success(res.data.message || 'QR Codes regenerados com sucesso')
      setShowQrConfirm(false)
      setConfirmQrText('')
    } catch { toast.error('Erro ao regenerar QR Codes') }
    setLoadingQr(false)
  }

  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all'
  const tabs = isAdmin ? TABS_ADMIN : TABS_USER

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Sidebar de Abas estilo macOS Settings */}
      <div className="w-full md:w-72 shrink-0 space-y-2">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-6 px-2">Configurações</h1>
        <div className="flex flex-col gap-1">
          {tabs.map(t => {
            const Icon = t.icon
            const isActive = aba === t.id
            return (
              <button key={t.id} onClick={() => setAba(t.id)}
                className={`flex items-center text-left gap-3 px-4 py-3 rounded-2xl transition-all relative overflow-hidden group
                  ${isActive 
                    ? 'bg-blue-600 dark:bg-blue-600 shadow-lg shadow-blue-500/20 text-white' 
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                {isActive && <div className="absolute inset-0 bg-white/10 w-1/2 -skew-x-12 group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{t.label}</p>
                  <p className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{t.desc}</p>
                </div>
                {isActive && <ChevronRight size={16} className="text-white/50" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-6">
        
        {/* Aba Perfil */}
        {aba === 'perfil' && (
          <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-blue-500" /> Meu Perfil
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-3xl flex items-center justify-center text-4xl font-bold shadow-xl shadow-blue-500/20">
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-white dark:border-[#1a2235]">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-black text-2xl text-slate-800 dark:text-white">{usuario?.nome}</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{usuario?.email}</p>
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide uppercase
                    ${usuario?.role === 'ADMIN'
                      ? 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400'
                      : 'bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-400'}`}>
                    {usuario?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
              {[
                { label: 'Função / Cargo', value: usuario?.funcao },
                { label: 'Unidade Alocada', value: usuario?.unidade?.nome },
                { label: 'Empresa', value: usuario?.empresa?.nome },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-bold">{item.value || 'Não definido'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Segurança */}
        {aba === 'seguranca' && (
          <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="text-blue-500" /> Alterar Senha
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Mantenha sua conta segura atualizando sua senha regularmente. Use pelo menos 6 caracteres.</p>
            
            <form onSubmit={handleSenha} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nova Senha</label>
                <input type="password" required minLength={6} value={senhaForm.novaSenha}
                  onChange={e => setSenhaForm(f => ({ ...f, novaSenha: e.target.value }))}
                  autoComplete="new-password" className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Confirmar Nova Senha</label>
                <input type="password" required minLength={6} value={senhaForm.confirmar}
                  onChange={e => setSenhaForm(f => ({ ...f, confirmar: e.target.value }))}
                  autoComplete="new-password" className={inputCls} placeholder="••••••••" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                  {loading ? 'Salvando...' : 'Atualizar Senha Segura'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Aba Sistema (admin) */}
        {aba === 'sistema' && isAdmin && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Info sistema & QR Code Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <Settings size={100} className="absolute -right-5 -top-5 text-white/5" />
                <p className="text-sm font-black flex items-center gap-2 mb-4 text-slate-300 uppercase tracking-wide">
                  <Settings size={16} /> Status do Sistema
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">Versão Deploy</p>
                    <p className="text-lg font-black text-white">2.1 Stable</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">Empresa Base</p>
                    <p className="text-lg font-black text-white">{usuario?.empresa?.nome}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2 uppercase tracking-wide">
                  <QrCode size={16} className="text-blue-500" /> Ação de Emergência
                </p>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">Esta rotina regera forçadamente as URLs e os QR Codes de **todos** os equipamentos do banco de dados.</p>
                
                {!showQrConfirm ? (
                  <button onClick={() => setShowQrConfirm(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors">
                    Iniciar Regeneração em Lote
                  </button>
                ) : (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Confirmação Crítica</p>
                    <input type="text" placeholder="Digite CONFIRMAR" value={confirmQrText} onChange={e=>setConfirmQrText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-red-200 dark:border-red-500/30 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-red-500 mb-2" />
                    <div className="flex gap-2">
                      <button onClick={()=>setShowQrConfirm(false)} className="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">Cancelar</button>
                      <button onClick={handleRegerarQrCode} disabled={loadingQr || confirmQrText !== 'CONFIRMAR'} className="flex-1 bg-red-600 text-white disabled:opacity-50 text-xs font-bold py-1.5 rounded-lg">Regenerar Tudo</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Domínios */}
            <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 uppercase tracking-wide">
                <Shield size={16} className="text-indigo-500" /> Domínios de Autenticação Permitidos
              </p>
              <div className="flex flex-wrap gap-2">
                {dominios.length === 0 && <p className="text-xs text-slate-400 font-medium">Nenhum restrição cadastrada ou carregando...</p>}
                {dominios.map(d => (
                  <span key={d} className="text-xs bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-3 py-1.5 rounded-lg font-mono font-bold">
                    @{d}
                  </span>
                ))}
              </div>
            </div>

            {/* Usuários do Sistema (Tabela Otimizada) */}
            <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-500" /> Contas Administrativas e Técnicos
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Gerencie quem tem acesso de login na plataforma.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Pesquisar..." value={buscaSistema}
                      onChange={e => setBuscaSistema(e.target.value)}
                      className="w-full sm:w-56 pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                  </div>
                  <button onClick={() => { setEditandoSistema(null); setModalSistema(true) }}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0">
                    <Plus size={16} /> <span className="hidden sm:inline">Novo</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                      <th className="text-left py-4 px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identificação</th>
                      <th className="text-left py-4 px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unidade</th>
                      <th className="text-left py-4 px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nível de Acesso</th>
                      <th className="text-right py-4 px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {usuariosSistema.length === 0 && (
                      <tr><td colSpan={4} className="py-12 text-center text-sm font-medium text-slate-400">Nenhum usuário cadastrado no sistema</td></tr>
                    )}
                    {usuariosSistema
                      .filter(u => !buscaSistema || u.nome?.toLowerCase().includes(buscaSistema.toLowerCase()) || u.email?.toLowerCase().includes(buscaSistema.toLowerCase()))
                      .map(u => (
                      <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black shrink-0 shadow-sm border border-slate-200 dark:border-white/5">
                              {u.nome?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white leading-tight">{u.nome}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.unidade?.nome || 'Matriz'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider
                            ${u.role === 'ADMIN' ? 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
                            {u.role === 'ADMIN' ? <ShieldCheck size={12}/> : <User size={12}/>}
                            {u.role === 'ADMIN' ? 'Admin' : 'Técnico'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditandoSistema(u); setModalSistema(true) }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setConfirmDelete(u)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                              <Trash2 size={16} />
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
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden shrink-0">
                  <img src="/logo-ntt.png" alt="NTT" className="w-full h-full object-contain p-2" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Tech Refresh Hub</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Plataforma Enterprise de Gestão de Inventário de TI</p>
                  <span className="inline-block mt-3 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Build 2.1.0</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                {[
                  { label: 'Ambiente', value: 'Produção Segura' },
                  { label: 'Desenvolvido por', value: 'NTT Data' },
                  { label: 'Ano de Lançamento', value: '2026' },
                  { label: 'Stack Frontend', value: 'React + TailwindCSS' },
                  { label: 'Stack Backend', value: 'Node + Prisma ORM' },
                  { label: 'Banco de Dados', value: 'PostgreSQL' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-lg text-white">
              <h3 className="text-lg font-black mb-2 flex items-center gap-2"><Shield size={20} /> Central de Suporte NTT</h3>
              <p className="text-sm text-blue-100 mb-6 max-w-xl">Nossa equipe está disponível para solucionar dúvidas técnicas, investigar falhas e realizar treinamentos de uso da plataforma Tech Refresh.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:diogo.silva@nttdata.com" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl text-sm font-bold transition-colors inline-flex items-center justify-center gap-2">
                  diogo.silva@nttdata.com
                </a>
                <a href="https://tech-refresh.cloud" target="_blank" rel="noreferrer" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-colors inline-flex items-center justify-center gap-2">
                  Portal de Atendimento
                </a>
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
            titulo="Desativar acesso?"
            mensagem={`A conta "${confirmDelete.nome}" será desativada e o usuário perderá imediatamente o acesso ao sistema. Confirma?`}
            onConfirm={() => handleDeleteSistema(confirmDelete.id)}
            onCancel={() => setConfirmDelete(null)} />
        )}
      </div>
    </div>
  )
}
