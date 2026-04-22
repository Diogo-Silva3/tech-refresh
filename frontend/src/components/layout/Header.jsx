import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Monitor, User, Sun, Moon, X, Truck, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const LANGS = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
]

export default function Header({ onMenuClick }) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [focused, setFocused] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [entregasHoje, setEntregasHoje] = useState([])
  const [atrasados, setAtrasados] = useState([])
  const [naoCompareceu, setNaoCompareceu] = useState([])
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const { i18n } = useTranslation()
  const { clienteAtivo, projetoAtivo, isSuperAdmin } = useAuth()

  useEffect(() => {
    const buscarNotificacoes = async () => {
      try {
        const [vinc, equip] = await Promise.all([
          api.get('/vinculacoes?ativa=true&statusEntrega=PENDENTE&limit=100'),
          api.get('/equipamentos?limit=200'),
        ])
        const hojeStr = new Date().toLocaleDateString('pt-BR')
        const todas = vinc.data || []
        setEntregasHoje(todas.filter(v => v.dataAgendamento && new Date(v.dataAgendamento).toLocaleDateString('pt-BR') === hojeStr))

        const naoComp = await api.get('/vinculacoes?ativa=true&statusEntrega=NAO_COMPARECEU&limit=20')
        setNaoCompareceu(naoComp.data || [])

        const equipData = equip.data?.data || []
        const atrasadosList = equipData.filter(eq => {
          if (!eq.updatedAt || eq.statusProcesso === 'Entregue ao Usuário' || eq.statusProcesso === 'Em Uso') return false
          const dias = Math.floor((new Date() - new Date(eq.updatedAt)) / 86400000)
          return dias > 3
        })
        setAtrasados(atrasadosList.slice(0, 5))
      } catch {}
    }
    buscarNotificacoes()
    const interval = setInterval(buscarNotificacoes, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clienteAtivo?.id, projetoAtivo?.id])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleBusca = async (valor) => {
    setBusca(valor)
    if (valor.length < 2) { setResultados([]); return }
    setBuscando(true)
    try {
      const [equip, users] = await Promise.all([
        api.get(`/equipamentos?busca=${valor}&limit=5`),
        api.get(`/usuarios?busca=${valor}&limit=5`),
      ])
      setResultados([
        ...equip.data.data.map(e => ({ tipo: 'equipamento', id: e.id, label: `${e.marca || ''} ${e.modelo || ''}`.trim() || 'Sem nome', sub: e.serialNumber || e.tipo || '' })),
        ...users.data.data.map(u => ({ tipo: 'usuario', id: u.id, label: u.nome, sub: u.funcao || u.email || '' })),
      ])
    } catch {}
    setBuscando(false)
  }

  const irPara = (item) => {
    setBusca(''); setResultados([])
    if (item.tipo === 'equipamento') navigate(`/equipamentos/${item.id}`)
    else navigate(`/usuarios/${item.id}`)
  }

  return (
    <header className="h-14 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.04] px-5 flex items-center gap-3 sticky top-0 z-10">

      <button onClick={onMenuClick}
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg lg:hidden">
        <Menu size={16} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {buscando && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={e => handleBusca(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-slate-100/80 dark:bg-white/[0.04] border border-transparent focus:border-blue-500/30 dark:focus:border-blue-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
        {busca ? (
          <button onClick={() => { setBusca(''); setResultados([]) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
            <X size={12} />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[9px] text-slate-400 bg-slate-200 dark:bg-white/8 px-1 py-0.5 rounded font-mono">⌘K</kbd>
          </div>
        )}

        {resultados.length > 0 && focused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-white/8 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden animate-fade-in">
            {resultados.map((r, i) => (
              <button key={i} onClick={() => irPara(r)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left border-b border-slate-100 dark:border-white/[0.04] last:border-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.tipo === 'equipamento' ? 'bg-blue-100 dark:bg-blue-500/15' : 'bg-violet-100 dark:bg-violet-500/15'}`}>
                  {r.tipo === 'equipamento'
                    ? <Monitor size={12} className="text-blue-600 dark:text-blue-400" />
                    : <User size={12} className="text-violet-600 dark:text-violet-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">{r.label}</p>
                  {r.sub && <p className="text-[11px] text-slate-400 truncate">{r.sub}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${r.tipo === 'equipamento' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'}`}>
                  {r.tipo === 'equipamento' ? 'Equipamento' : 'Colaborador'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <button onClick={toggle}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
          title={dark ? 'Modo claro' : 'Modo escuro'}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Seletor de idioma */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
              title={l.label}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                i18n.language === l.code
                  ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        {/* Sino — para ADMIN/TECNICO sempre, para SUPERADMIN só se tiver cliente selecionado */}
        {(!isSuperAdmin || clienteAtivo) && (
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(v => !v)}
            className="relative p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
            <Bell size={15} />
            {(entregasHoje.length + naoCompareceu.length + atrasados.length) > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-[#0a0f1a]">
                {entregasHoje.length + naoCompareceu.length + atrasados.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-white/8 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Notificações</p>
                <span className="text-[10px] bg-slate-100 dark:bg-white/8 text-slate-500 px-2 py-0.5 rounded-full">
                  {entregasHoje.length + naoCompareceu.length + atrasados.length} alertas
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {entregasHoje.length === 0 && naoCompareceu.length === 0 && atrasados.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Bell size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[12px] text-slate-400">Nenhuma notificação</p>
                  </div>
                ) : (
                  <>
                    {entregasHoje.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide bg-amber-50 dark:bg-amber-500/5">
                          Entregas hoje ({entregasHoje.length})
                        </p>
                        {entregasHoje.map(v => (
                          <div key={v.id} onClick={() => { setNotifOpen(false); navigate('/atribuicoes') }}
                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer flex items-center gap-2.5 border-b border-slate-50 dark:border-white/[0.03]">
                            <Truck size={13} className="text-amber-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100 truncate">{v.usuario?.nome}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(v.dataAgendamento).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                                {' · '}{[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {naoCompareceu.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide bg-red-50 dark:bg-red-500/5">
                          Não compareceu ({naoCompareceu.length})
                        </p>
                        {naoCompareceu.slice(0, 3).map(v => (
                          <div key={v.id} onClick={() => { setNotifOpen(false); navigate('/atribuicoes', { state: { filtroEntrega: 'NAO_COMPARECEU' } }) }}
                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer flex items-center gap-2.5 border-b border-slate-50 dark:border-white/[0.03]">
                            <span className="text-red-400 text-sm shrink-0">✕</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100 truncate">{v.usuario?.nome}</p>
                              <p className="text-[10px] text-slate-400 truncate">{[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {atrasados.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide bg-orange-50 dark:bg-orange-500/5">
                          Atrasados na preparação ({atrasados.length})
                        </p>
                        {atrasados.map(eq => (
                          <div key={eq.id} onClick={() => { setNotifOpen(false); navigate(`/equipamentos/${eq.id}`) }}
                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer flex items-center gap-2.5 border-b border-slate-50 dark:border-white/[0.03]">
                            <span className="text-orange-400 text-sm shrink-0">⚠</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100 truncate">
                                {[eq.marca, eq.modelo].filter(Boolean).join(' ') || eq.serialNumber || '—'}
                              </p>
                              <p className="text-[10px] text-slate-400">{eq.statusProcesso} · {Math.floor((new Date() - new Date(eq.updatedAt)) / 86400000)}d parado</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.04]">
                <button onClick={() => { setNotifOpen(false); navigate('/atribuicoes') }}
                  className="w-full text-[12px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-center">
                  Ver todas as atribuições →
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  )
}
