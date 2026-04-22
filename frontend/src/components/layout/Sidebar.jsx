import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Monitor, Users, Link2, Building2,
  FileBarChart, Upload, Settings, LogOut, X, ChevronRight,
  ChevronDown, Briefcase, FolderOpen, Wrench, ClipboardList, Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

export default function Sidebar({ open, onClose }) {
  const { usuario, logout, isAdmin, isSuperAdmin, clienteAtivo, setClienteAtivo, projetoAtivo, setProjetoAtivo } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [clientes, setClientes] = useState([])
  const [projetos, setProjetos] = useState([])
  const [seletorAberto, setSeletorAberto] = useState(false)
  const [seletorProjetoAberto, setSeletorProjetoAberto] = useState(false)

  useEffect(() => {
    if (isSuperAdmin) {
      api.get('/clientes').then(r => setClientes(r.data)).catch(() => {})
    }
  }, [isSuperAdmin])

  useEffect(() => {
    if (isSuperAdmin && clienteAtivo) {
      api.get('/projetos').then(r => setProjetos(r.data)).catch(() => {})
    } else if (isAdmin && !isSuperAdmin) {
      api.get('/projetos').then(r => setProjetos(r.data)).catch(() => {})
    }
  }, [isSuperAdmin, isAdmin, clienteAtivo])

  const handleLogout = () => { logout(); navigate('/login') }

  const navGroups = [
    {
      label: t('Principal'),
      items: [
        { to: '/dashboard',    icon: LayoutDashboard, label: t('dashboard') },
        { to: '/equipamentos', icon: Monitor,          label: t('equipamentos') },
        { to: '/usuarios',     icon: Users,            label: t('colaboradores') },
        { to: '/atribuicoes',  icon: Link2,            label: t('atribuicoes') },
        { to: '/preparacao',   icon: Wrench,           label: t('preparacao') },
        { to: '/solicitacoes', icon: ClipboardList,    label: 'Solicitações' },
      ],
    },
    {
      label: t('Operacional'),
      items: [
        ...(isAdmin ? [{ to: '/unidades', icon: Building2, label: t('unidades') }] : []),
        ...(isAdmin ? [{ to: '/importacao', icon: Upload, label: t('importarPlanilha') }] : []),
        { to: '/relatorios', icon: FileBarChart, label: t('relatorios') },
        ...(isAdmin ? [{ to: '/auditoria', icon: Shield, label: 'Auditoria' }] : []),
      ],
    },
    {
      label: t('Administração'),
      items: [
        ...(isSuperAdmin ? [
          { to: '/clientes',  icon: Briefcase,  label: t('clientes') },
          { to: '/projetos',  icon: FolderOpen, label: t('projetos') },
        ] : []),
        { to: '/configuracoes', icon: Settings, label: t('configuracoes') },
      ],
    },
  ]

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 flex flex-col
        w-[220px] bg-[#0a0f1a] border-r border-white/[0.04]
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0 overflow-hidden border border-slate-100">
                <img src="/logo-ntt.png" alt="NTT" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white leading-tight tracking-tight">Tech Refresh</p>
                <p className="text-[10px] text-slate-500 leading-tight">{isSuperAdmin && clienteAtivo ? clienteAtivo.nome : (usuario?.empresa?.nome || '')}</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-600 hover:text-white p-1 rounded-lg">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Seletor de cliente (só SUPERADMIN) */}
        {isSuperAdmin && (
          <div className="px-3 pb-1 space-y-1 relative">
            {/* Cliente */}
            <div className="relative">
              <button
                onClick={() => { setSeletorAberto(v => !v); setSeletorProjetoAberto(false) }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
              >
                <span className="truncate text-[10px] text-slate-500 mr-1">Cliente</span>
                <span className="truncate flex-1 text-left">{clienteAtivo ? clienteAtivo.nome : 'Selecionar...'}</span>
                <ChevronDown size={12} className={`shrink-0 ml-1 transition-transform ${seletorAberto ? 'rotate-180' : ''}`} />
              </button>
              {seletorAberto && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1929] border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
                  {clientes.filter(c => c.ativo).map(c => (
                    <button key={c.id}
                      onClick={() => { setClienteAtivo(c); setSeletorAberto(false); navigate('/dashboard') }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${clienteAtivo?.id === c.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-white/[0.05]'}`}>
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Projeto */}
            {clienteAtivo && (
              <div className="relative">
                <button
                  onClick={() => { setSeletorProjetoAberto(v => !v); setSeletorAberto(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
                >
                  <span className="truncate text-[10px] text-slate-500 mr-1">Projeto</span>
                  <span className="truncate flex-1 text-left">{projetoAtivo ? projetoAtivo.nome : 'Selecionar...'}</span>
                  <ChevronDown size={12} className={`shrink-0 ml-1 transition-transform ${seletorProjetoAberto ? 'rotate-180' : ''}`} />
                </button>
                {seletorProjetoAberto && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1929] border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
                    {projetos.filter(p => p.ativo).map(p => (
                      <button key={p.id}
                        onClick={() => { setProjetoAtivo(p); setSeletorProjetoAberto(false); navigate('/dashboard') }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${projetoAtivo?.id === p.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-white/[0.05]'}`}>
                        {p.nome}
                      </button>
                    ))}
                    {projetos.length === 0 && (
                      <p className="px-3 py-2 text-xs text-slate-500">Nenhum projeto cadastrado</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Seletor de projeto (ADMIN) */}
        {isAdmin && !isSuperAdmin && projetos.length > 0 && (
          <div className="px-3 pb-1 relative">
            <div className="relative">
              <button
                onClick={() => setSeletorProjetoAberto(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
              >
                <span className="truncate text-[10px] text-slate-500 mr-1">Projeto</span>
                <span className="truncate flex-1 text-left">{projetoAtivo ? projetoAtivo.nome : 'Selecionar...'}</span>
                <ChevronDown size={12} className={`shrink-0 ml-1 transition-transform ${seletorProjetoAberto ? 'rotate-180' : ''}`} />
              </button>
              {seletorProjetoAberto && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1929] border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
                  {projetos.filter(p => p.ativo).map(p => (
                    <button key={p.id}
                      onClick={() => { setProjetoAtivo(p); setSeletorProjetoAberto(false); navigate('/dashboard') }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${projetoAtivo?.id === p.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-white/[0.05]'}`}>
                      {p.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 pb-3 space-y-5 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.12em] px-2.5 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-all
                      ${isActive
                        ? 'bg-blue-600/15 text-blue-400'
                        : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-full" />
                        )}
                        <Icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
                        <span className="flex-1">{label}</span>
                        {isActive && <ChevronRight size={11} className="text-blue-500/60" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">{usuario?.nome}</p>
              <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                {usuario?.role === 'SUPERADMIN' ? 'Super Admin' : usuario?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-slate-600 hover:bg-white/[0.04] hover:text-slate-400 transition-colors">
            <LogOut size={12} />
            {t('sairDaConta')}
          </button>
          <p className="text-center text-[9px] text-slate-700 mt-2 leading-tight">
            {t('desenvolvido')} <span className="text-slate-500">NTT Data</span> · v2.0.0 · 2026
          </p>
        </div>
      </aside>
    </>
  )
}
