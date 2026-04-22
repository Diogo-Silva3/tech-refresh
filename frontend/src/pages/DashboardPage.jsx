import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Monitor, Users, Building2, CheckCircle, AlertCircle,
  Package, Clock, Truck, ThumbsUp, ChevronRight,
  AlertTriangle, UserX, ArrowUpRight, Target, CalendarCheck, PackageCheck, PackageMinus, FolderOpen
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../contexts/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const TT = {
  borderRadius: '10px',
  border: '1px solid rgba(148,163,184,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '8px 12px',
}

const PIPELINE = [
  { key: 'aguardandoImagem', label: 'Aguardando Imagem', icon: Package,  accent: '#64748b', bg: 'from-slate-100 to-slate-50 dark:from-slate-500/10 dark:to-slate-500/5',     num: 'text-slate-700 dark:text-slate-200', border: 'border-slate-200 dark:border-slate-500/20', etapa: 'Novo' },
  { key: 'comImagem', label: 'Com Imagem', icon: Clock, accent: '#f97316', bg: 'from-orange-50 to-orange-50/50 dark:from-orange-500/10 dark:to-orange-500/5', num: 'text-orange-700 dark:text-orange-300', border: 'border-orange-100 dark:border-orange-500/20', etapa: 'Imagem Instalada' },
  { key: 'agendados',        label: 'Ag. Entrega',       icon: Truck,    accent: '#eab308', bg: 'from-yellow-50 to-yellow-50/50 dark:from-yellow-500/10 dark:to-yellow-500/5',   num: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-100 dark:border-yellow-500/20', etapa: 'Agendado para Entrega' },
  { key: 'entregues',        label: 'Entregues',         icon: ThumbsUp, accent: '#10b981', bg: 'from-emerald-50 to-emerald-50/50 dark:from-emerald-500/10 dark:to-emerald-500/5', num: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-500/20', etapa: 'Entregue ao Usuário' },
]

function MetricCard({ icon: Icon, label, value, from, to, shadow, onClick }) {
  return (
    <div onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 border transition-all duration-200
        bg-white dark:bg-[#0f1623] border-slate-200/60 dark:border-white/[0.06]
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${from} ${to} opacity-[0.04] pointer-events-none`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{label}</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-white leading-none tabular-nums">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-lg ${shadow} shrink-0`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
      {onClick && (
        <p className="relative mt-4 text-[10px] text-slate-400 group-hover:text-slate-500 flex items-center gap-0.5 transition-colors">
          Ver detalhes <ArrowUpRight size={9} />
        </p>
      )}
    </div>
  )
}

function SectionCard({ title, subtitle, action, onAction, children, noPad }) {
  return (
    <div className="bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{title}</p>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && (
            <button onClick={onAction}
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 font-medium transition-colors">
              {action} <ChevronRight size={11} />
            </button>
          )}
        </div>
      )}
      {noPad ? children : <div className="px-5 pb-5 pt-4">{children}</div>}
    </div>
  )
}

function DashboardTecnicoSection() {
  const [tecnicos, setTecnicos] = useState([])
  const [loadingTec, setLoadingTec] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const carregarTecnicos = (mes) => {
    setLoadingTec(true)
    api.get(`/dashboard/tecnicos?mes=${mes}`)
      .then(r => setTecnicos(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingTec(false))
  }

  useEffect(() => { carregarTecnicos(mesSelecionado) }, [mesSelecionado])

  const mesesOpcoes = (() => {
    const opts = []
    const hoje = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      opts.push({ val, label })
    }
    return opts
  })()

  const chartData = tecnicos.map(t => ({ nome: t.nome?.split(' ')[0] || t.nome, entregas: t.totalMesAtual, nomeCompleto: t.nome }))

  return (
    <SectionCard title="Dashboard por Técnico" subtitle="Entregas no mês selecionado">
      <div className="flex items-center justify-end mb-4">
        <select
          value={mesSelecionado}
          onChange={e => setMesSelecionado(e.target.value)}
          className="text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 capitalize">
          {mesesOpcoes.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>

      {loadingTec ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tecnicos.length === 0 ? (
        <p className="text-center text-[12px] text-slate-400 py-8">Nenhum técnico encontrado</p>
      ) : (
        <div className="space-y-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gTecnico" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={TT}
                cursor={{ fill: 'rgba(148,163,184,0.06)' }}
                formatter={(value, name, props) => [value, 'Entregas']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.nomeCompleto || label}
              />
              <Bar dataKey="entregas" fill="url(#gTecnico)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Técnico</th>
                  <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Mês Atual</th>
                  <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Últimos 6 meses</th>
                  <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Média Mensal</th>
                </tr>
              </thead>
              <tbody>
                {tecnicos.map((tec, i) => (
                  <tr key={tec.id} className={`border-b border-slate-50 dark:border-slate-700/50 ${i === 0 && tec.totalMesAtual > 0 ? 'bg-violet-50/50 dark:bg-violet-500/5' : ''}`}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 shrink-0">
                          {tec.nome?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{tec.nome}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`text-[13px] font-bold tabular-nums ${tec.totalMesAtual > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
                        {tec.totalMesAtual}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[13px] text-slate-600 dark:text-slate-400 tabular-nums">{tec.total6Meses}</td>
                    <td className="py-2.5 px-3 text-right text-[13px] text-slate-500 dark:text-slate-400 tabular-nums">{tec.mediaMensal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('')
  const [alertasGarantia, setAlertasGarantia] = useState([])
  const navigate = useNavigate()
  const { usuario, isAdmin, projetoAtivo, clienteAtivo } = useAuth()
  const { t } = useTranslation()

  const carregar = (unidadeId = '') => {
    setLoading(true)
    setErro(false)
    const params = unidadeId ? `?unidadeId=${unidadeId}` : ''
    api.get(`/dashboard${params}`)
      .then(r => setData(r.data))
      .catch(() => setErro(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAdmin && usuario?.unidadeId) {
      setUnidadeSelecionada(String(usuario.unidadeId))
      carregar(usuario.unidadeId)
    } else {
      carregar()
    }
    api.get('/equipamentos/alertas-garantia').then(r => setAlertasGarantia(r.data || [])).catch(() => {})
  }, [usuario, projetoAtivo?.id, clienteAtivo?.id])

  useEffect(() => {
    // Refresh a cada 30 segundos
    const interval = setInterval(() => {
      carregar(unidadeSelecionada || ((!isAdmin && usuario?.unidadeId) ? usuario.unidadeId : ''))
    }, 30 * 1000)
    
    // Refresh quando a página fica visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        carregar(unidadeSelecionada || ((!isAdmin && usuario?.unidadeId) ? usuario.unidadeId : ''))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [unidadeSelecionada, usuario, isAdmin])

  const handleUnidadeChange = (e) => {
    const val = e.target.value
    setUnidadeSelecionada(val)
    carregar(val)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[12px] text-slate-400">{t('carregando')}</p>
    </div>
  )

  if (erro) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-[13px] text-slate-400">{t('erroCarregar')}</p>
      <button onClick={() => carregar(unidadeSelecionada)}
        className="text-[12px] text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg hover:bg-blue-500/15 transition-colors">
        Tentar novamente
      </button>
    </div>
  )

  const { resumo, processo, porMarca, porUnidade, porTipo, ultimosEquipamentos, entregasPorMes, alertas, atividadesRecentes, techRefresh, unidades } = data || {}

  const statusData = [
    { name: 'Disponível', value: resumo?.disponiveis || 0 },
    { name: 'Em Uso',     value: resumo?.emUso || 0 },
    { name: 'Manutenção', value: resumo?.manutencao || 0 },
  ].filter(s => s.value > 0)

  const techCards = [
    ...(isAdmin ? [{ label: t('totalProjeto'), value: techRefresh?.totalProjeto, icon: Target, from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/25', route: '/equipamentos', state: {} }] : []),
    { label: t('agendadas'),       value: techRefresh?.maquinasAgendadas,      icon: CalendarCheck, from: 'from-amber-400',   to: 'to-orange-500',  shadow: 'shadow-amber-500/25',   route: '/atribuicoes', state: { filtroEntrega: 'PENDENTE' } },
    { label: t('entregues'),       value: techRefresh?.maquinasEntregues,      icon: PackageCheck,  from: 'from-emerald-500', to: 'to-teal-600',    shadow: 'shadow-emerald-500/25', route: '/atribuicoes', state: { filtroEntrega: 'ENTREGUE' } },
    { label: t('faltamEntregar'), value: techRefresh?.maquinasFaltamEntregar, icon: PackageMinus,  from: 'from-red-400',     to: 'to-rose-600',    shadow: 'shadow-red-500/25',     route: '/equipamentos', state: { status: 'DISPONIVEL' } },
  ]

  const resumoCards = [
    { key: 'totalAtribuido', label: t('atribuido'),   icon: CheckCircle, from: 'from-emerald-500', to: 'to-teal-600',   shadow: 'shadow-emerald-500/25', route: '/atribuicoes', state: { filtroEntrega: 'ENTREGUE' } },
    { key: 'disponiveis', label: t('disponiveis'), icon: AlertCircle, from: 'from-amber-400',   to: 'to-orange-500', shadow: 'shadow-amber-500/25',   route: '/equipamentos', state: { status: 'DISPONIVEL' } },
  ]

  return (
    <div className="space-y-6 max-w-[1440px] animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-xs mt-0.5">Visão geral do inventário de TI</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && unidades?.length > 0 && (
            <select value={unidadeSelecionada} onChange={handleUnidadeChange}
              className="text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">{t('todasUnidades')}</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          )}
          <button onClick={() => navigate('/equipamentos')}
            className="flex items-center gap-1.5 text-[12px] text-blue-400 font-medium bg-blue-500/10 hover:bg-blue-500/15 px-3 py-1.5 rounded-lg transition-colors">
          Todos os equipamentos <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Banner do projeto ativo */}
      {projetoAtivo && (
        <div className="flex items-center gap-4 bg-white dark:bg-[#0f1623] border border-slate-200/60 dark:border-white/[0.06] rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="w-9 h-9 bg-violet-100 dark:bg-violet-500/15 rounded-xl flex items-center justify-center shrink-0">
            <FolderOpen size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">{projetoAtivo.nome}</p>
            {projetoAtivo.descricao && (
              <p className="text-[11px] text-slate-400 truncate">{projetoAtivo.descricao}</p>
            )}
          </div>
          {(projetoAtivo.dataInicio || projetoAtivo.dataFim) && (
            <div className="flex items-center gap-4 text-[11px] shrink-0">
              {projetoAtivo.dataInicio && (
                <div className="flex flex-col items-center bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-1.5">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Início</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(projetoAtivo.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {projetoAtivo.dataInicio && projetoAtivo.dataFim && (
                <ChevronRight size={12} className="text-slate-300 shrink-0" />
              )}
              {projetoAtivo.dataFim && (
                <div className="flex flex-col items-center bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-1.5">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Fim</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(projetoAtivo.dataFim).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tech Refresh + Resumo — grade unificada */}
      {techRefresh && (
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
          {techCards.map(c => (
            <MetricCard key={c.label} icon={c.icon} label={c.label} value={c.value ?? 0}
              from={c.from} to={c.to} shadow={c.shadow}
              onClick={() => navigate(c.route, { state: c.state || {} })} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {resumoCards.map(c => {
          let valor = c.key === 'totalAtribuido' ? techRefresh?.totalAtribuido : resumo?.[c.key];
          // Debug: log do valor
          if (c.key === 'totalAtribuido') {
            console.log('DEBUG ATRIBUÍDO:', { valor, techRefresh });
          }
          return (
            <MetricCard key={c.key} icon={c.icon} label={c.label} value={valor}
              from={c.from} to={c.to} shadow={c.shadow}
              onClick={() => navigate(c.route, { state: c.state || {} })} />
          );
        })}
      </div>

      {/* Alertas */}
      {(alertas?.atrasadosNaPreparacao > 0 || alertas?.colaboradoresSemEquipamento > 0 || alertasGarantia.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alertas?.atrasadosNaPreparacao > 0 && (
            <button onClick={() => navigate('/preparacao')}
              className="flex items-center gap-3.5 bg-amber-50 dark:bg-amber-500/8 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-4 text-left hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
                  {alertas.atrasadosNaPreparacao} equipamento{alertas.atrasadosNaPreparacao > 1 ? 's' : ''} atrasado{alertas.atrasadosNaPreparacao > 1 ? 's' : ''}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400/70 mt-0.5">Em preparação há mais de 3 dias</p>
              </div>
              <ArrowUpRight size={14} className="text-amber-500 shrink-0" />
            </button>
          )}
          {alertas?.colaboradoresSemEquipamento > 0 && (
            <button onClick={() => navigate('/usuarios')}
              className="flex items-center gap-3.5 bg-blue-50 dark:bg-blue-500/8 border border-blue-200/60 dark:border-blue-500/20 rounded-2xl p-4 text-left hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                <UserX size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-blue-900 dark:text-blue-200">
                  {alertas.colaboradoresSemEquipamento} colaborador{alertas.colaboradoresSemEquipamento > 1 ? 'es' : ''} sem equipamento
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400/70 mt-0.5">Sem atribuição ativa no momento</p>
              </div>
              <ArrowUpRight size={14} className="text-blue-500 shrink-0" />
            </button>
          )}
          {alertasGarantia.length > 0 && (
            <button onClick={() => navigate('/equipamentos')}
              className="flex items-center gap-3.5 bg-red-50 dark:bg-red-500/8 border border-red-200/60 dark:border-red-500/20 rounded-2xl p-4 text-left hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-red-900 dark:text-red-200">
                  {alertasGarantia.length} equipamento{alertasGarantia.length > 1 ? 's' : ''} com alerta de garantia
                </p>
                <p className="text-[11px] text-red-600 dark:text-red-400/70 mt-0.5">Garantia vencida ou vencendo em 30 dias</p>
              </div>
              <ArrowUpRight size={14} className="text-red-500 shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* Pipeline */}
      <SectionCard title={t('cicloPreparacao')} subtitle="Equipamentos em processo" action={t('verPreparacao')} onAction={() => navigate('/preparacao')}>
        <div className="grid grid-cols-4 gap-3">
          {PIPELINE.map((item, idx) => {
            const Icon = item.icon
            const val = processo?.[item.key] ?? 0
            return (
              <div key={item.key} className="relative">
                <div
                  onClick={() => navigate('/preparacao', { state: { etapa: item.etapa } })}
                  className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: item.accent + '20' }}>
                    <Icon size={14} style={{ color: item.accent }} />
                  </div>
                  <p className={`text-3xl font-bold leading-none tabular-nums ${item.num}`}>{val}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 leading-tight">{item.label}</p>
                  {item.key === 'agendados' && data?.equipamentosAgendados && data.equipamentosAgendados.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-1">
                      {data.equipamentosAgendados.slice(0, 2).map(eq => (
                        <p key={eq.id} className="text-[9px] text-slate-600 dark:text-slate-400 truncate">
                          {eq.serialNumber}
                        </p>
                      ))}
                      {data.equipamentosAgendados.length > 2 && (
                        <p className="text-[9px] text-slate-500 dark:text-slate-500">+{data.equipamentosAgendados.length - 2} mais</p>
                      )}
                    </div>
                  )}
                </div>
                {idx < PIPELINE.length - 1 && (
                  <ChevronRight size={12} className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10" />
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Gráficos linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title={t('porMarca')}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={porMarca} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="marca" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="total" fill="url(#gBlue)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('statusEquipamentos')}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="44%" outerRadius={65} innerRadius={38} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={TT} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('porTipo')}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={porTipo} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="tipo" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="total" fill="url(#gViolet)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Gráficos linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title={t('porUnidade')}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={porUnidade} layout="vertical" margin={{ top: 0, right: 10, left: 110, bottom: 0 }}>
              <defs>
                <linearGradient id="gEmerald" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="unidade" type="category" width={110} axisLine={false} tickLine={false}
                tick={({ x, y, payload }) => (
                  <text x={x} y={y} dy={4} textAnchor="end" fill="#94a3b8" fontSize={10}>
                    {payload.value?.length > 14 ? payload.value.slice(0, 13) + '…' : payload.value}
                  </text>
                )}
              />
              <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="equipamentos" fill="url(#gEmerald)" radius={[0, 6, 6, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('entregasPorMes')} subtitle="Últimos 6 meses">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={entregasPorMes} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="entregas" stroke="#10b981" strokeWidth={2.5} fill="url(#gArea)"
                dot={{ fill: '#10b981', r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Dashboard por Técnico — apenas admins */}
      {isAdmin && <DashboardTecnicoSection />}

      {/* Últimos cadastrados + Atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title={t('ultimosCadastrados')} action={t('verTodos')} onAction={() => navigate('/equipamentos')} noPad>
          <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
            {ultimosEquipamentos?.map(eq => (
              <div key={eq.id} onClick={() => navigate(`/equipamentos/${eq.id}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Monitor size={13} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                    {[eq.marca, eq.modelo].filter(Boolean).join(' ') || '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">{eq.serialNumber || eq.tipo || '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={eq.status} />
                  <p className="text-[10px] text-slate-400 mt-1">{eq.unidade?.nome || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t('atividadesRecentes')} action={t('verTodas')} onAction={() => navigate('/atribuicoes')} noPad>
          <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
            {!atividadesRecentes?.length && (
              <p className="text-center text-[12px] text-slate-400 py-8">{t('nenhumaAtividade')}</p>
            )}
            {atividadesRecentes?.map(v => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold
                  ${v.ativa ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                  {v.usuario?.nome?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-700 dark:text-slate-300 truncate">
                    <span className="font-semibold text-slate-800 dark:text-white">{v.usuario?.nome || 'Colaborador'}</span>
                    <span className="text-slate-400"> {v.ativa ? 'recebeu' : 'devolveu'} </span>
                    <span className="font-medium">{[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ')}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.equipamento?.serialNumber}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${v.ativa ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                    {v.ativa ? 'Ativo' : 'Encerrado'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

    </div>
  )
}
