import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, CheckSquare, Package, Clock, Truck, ThumbsUp, Wrench, Search, X, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import QrScanner from '../components/QrScanner'

const CHECKLIST_PREPARACAO = [
  { key: 'imagem', label: 'Imagem instalada' },
  { key: 'drivers', label: 'Drivers instalados' },
  { key: 'office', label: 'Office instalado' },
  { key: 'antivirus', label: 'Antivírus instalado' },
  { key: 'vpn', label: 'VPN instalada' },
  { key: 'monitoramento', label: 'Agente de monitoramento instalado' },
  { key: 'rede', label: 'Teste de rede realizado' },
  { key: 'login', label: 'Teste de login realizado' },
]

const CHECKLIST_ENTREGA = [
  { key: 'login', label: 'Login funcionando' },
  { key: 'email', label: 'Email configurado' },
  { key: 'rede', label: 'Rede funcionando' },
  { key: 'impressora', label: 'Impressora funcionando' },
  { key: 'sistemas', label: 'Sistemas da empresa funcionando' },
]

const APPS_TABLET = ['APDATA', 'GB CONNECT', 'MAXIMO PROD', 'QUALIDADE PROD']

const CHECKLIST_TABLET_ENTREGA = [
  { key: 'rede', label: 'Rede funcionando' },
  { key: 'app', label: 'Aplicação funcionando' },
  { key: 'login', label: 'Login na aplicação realizado' },
]

const isTablet = (tipo) => tipo?.toLowerCase().includes('tablet')

const PROCESSO_STEPS = ['Novo', 'Imagem Instalada', 'Softwares Instalados', 'Asset Registrado', 'Agendado para Entrega', 'Entregue ao Usuário']

const PROCESSO_COLORS = {
  'Novo': 'bg-slate-100 text-slate-600',
  'Imagem Instalada': 'bg-blue-100 text-blue-700',
  'Softwares Instalados': 'bg-indigo-100 text-indigo-700',
  'Asset Registrado': 'bg-purple-100 text-purple-700',
  'Agendado para Entrega': 'bg-amber-100 text-amber-700',
  'Entregue ao Usuário': 'bg-green-100 text-green-700',
  'Em Uso': 'bg-green-100 text-green-700',
  'Em Manutenção': 'bg-red-100 text-red-700',
}

const ETAPAS = [
  { key: '', label: 'Todos' },
  { key: 'Novo', label: 'Aguardando Imagem' },
  { key: 'Imagem Instalada', label: 'Imagem + Software Instalado' },
  { key: 'Asset Registrado', label: 'Asset Registrado' },
  { key: 'Agendado para Entrega', label: 'Agendado p/ Entrega' },
  { key: 'Entregue ao Usuário', label: 'Entregues' },
]

function ProgressoBar({ statusProcesso }) {
  // 'Em Uso' é equivalente a 'Entregue ao Usuário' para fins de progresso
  const status = statusProcesso === 'Em Uso' ? 'Entregue ao Usuário' : statusProcesso
  const idx = PROCESSO_STEPS.indexOf(status)
  const pct = idx < 0 ? 0 : Math.round((idx / (PROCESSO_STEPS.length - 1)) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right font-medium">{pct}%</span>
    </div>
  )
}

function CardEquipamento({ eq, onAtualizar }) {
  const [aberto, setAberto] = useState(false)
  const [aba, setAba] = useState('preparacao')
  const tablet = isTablet(eq.tipo)

  // Checklist de preparação — tablet usa só 1 item (aplicação)
  const [checklistPrep, setChecklistPrep] = useState(eq.checklistPreparacao || {})
  const [appSelecionada, setAppSelecionada] = useState(eq.checklistPreparacao?.app || '')

  // Checklist de entrega
  const checklistEntregaItems = tablet ? CHECKLIST_TABLET_ENTREGA : CHECKLIST_ENTREGA
  const [checklistEnt, setChecklistEnt] = useState(() => {
    const saved = eq.checklistEntrega || {}
    const algumMarcado = checklistEntregaItems.some(i => saved[i.key])
    if (algumMarcado) return saved
    return Object.fromEntries(checklistEntregaItems.map(i => [i.key, true]))
  })

  useEffect(() => {
    setChecklistPrep(eq.checklistPreparacao || {})
    setAppSelecionada(eq.checklistPreparacao?.app || '')
  }, [eq.checklistPreparacao])

  useEffect(() => {
    const saved = eq.checklistEntrega || {}
    const algumMarcado = checklistEntregaItems.some(i => saved[i.key])
    setChecklistEnt(algumMarcado ? saved : Object.fromEntries(checklistEntregaItems.map(i => [i.key, true])))
  }, [eq.checklistEntrega])

  const [salvando, setSalvando] = useState(false)
  const toast = useToast()

  // Contagem de progresso
  const prepDone = tablet
    ? (appSelecionada ? 1 : 0)
    : CHECKLIST_PREPARACAO.filter(i => checklistPrep[i.key]).length
  const prepTotal = tablet ? 1 : CHECKLIST_PREPARACAO.length
  const entDone = checklistEntregaItems.filter(i => checklistEnt[i.key]).length

  const salvar = async (tipo) => {
    setSalvando(true)
    try {
      let itens
      if (tipo === 'preparacao') {
        itens = tablet ? { app: appSelecionada, instalado: !!appSelecionada } : checklistPrep
      } else {
        itens = checklistEnt
      }
      const res = await api.put(`/equipamentos/${eq.id}/checklist`, { tipo, itens })
      toast.success('Checklist salvo')
      onAtualizar(res.data)
    } catch {
      toast.error('Erro ao salvar')
    }
    setSalvando(false)
  }

  return (
    <div className={`bg-white rounded-xl border transition-all ${aberto ? 'border-blue-300 shadow-md' : 'border-slate-200'}`}>
      {/* Header do card */}
      <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setAberto(a => !a)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800">{[eq.marca, eq.modelo].filter(Boolean).join(' ') || 'Equipamento'}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROCESSO_COLORS[eq.statusProcesso] || 'bg-slate-100 text-slate-600'}`}>
              {eq.statusProcesso || 'Novo'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
            <span>{eq.tipo || '—'}</span>
            <span className="font-mono">{eq.serialNumber || '—'}</span>
            {eq.unidade && <span>{eq.unidade.nome}</span>}
            {eq.tecnico && <span>Técnico: {eq.tecnico.nome}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:block w-32">
            <ProgressoBar statusProcesso={eq.statusProcesso} />
          </div>
          <div className="text-xs text-slate-400 text-right hidden md:block">
            <p>{prepDone}/{prepTotal} prep.</p>
            <p>{entDone}/{checklistEntregaItems.length} entrega</p>
          </div>
          {aberto ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Checklist expandido */}
      {aberto && (
        <div className="border-t border-slate-100 p-4">
          {/* Abas */}
          <div className="flex gap-1 mb-4 border-b border-slate-100">
            <button onClick={() => setAba('preparacao')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${aba === 'preparacao' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              Preparação ({prepDone}/{prepTotal})
            </button>
            <button onClick={() => setAba('entrega')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${aba === 'entrega' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              Entrega ({entDone}/{checklistEntregaItems.length})
            </button>
          </div>

          {aba === 'preparacao' && (
            <div className="space-y-2">
              {tablet ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Selecione a aplicação</label>
                    <select
                      value={appSelecionada}
                      onChange={e => setAppSelecionada(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                      <option value="">Selecione a aplicação...</option>
                      {APPS_TABLET.map(app => <option key={app} value={app}>{app}</option>)}
                    </select>
                  </div>
                  {appSelecionada && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                      <span className="text-green-600 text-lg">✓</span>
                      <span className="text-sm font-medium text-green-700">{appSelecionada} selecionada</span>
                    </div>
                  )}
                  <button onClick={() => salvar('preparacao')} disabled={salvando || !appSelecionada}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    {salvando ? 'Salvando...' : 'Salvar Preparação'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {CHECKLIST_PREPARACAO.map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={!!checklistPrep[item.key]}
                          onChange={e => setChecklistPrep(p => ({ ...p, [item.key]: e.target.checked }))}
                          className="w-4 h-4 rounded accent-blue-600" />
                        <span className={`text-sm ${checklistPrep[item.key] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.label}
                        </span>
                        {checklistPrep[item.key] && <span className="ml-auto text-xs text-green-600">✓</span>}
                      </label>
                    ))}
                  </div>
                  <button onClick={() => salvar('preparacao')} disabled={salvando}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    {salvando ? 'Salvando...' : 'Salvar Preparação'}
                  </button>
                </div>
              )}
            </div>
          )}

          {aba === 'entrega' && (
            <div className="space-y-2">
              {entDone === checklistEntregaItems.length && entDone > 0 && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                  ✓ Entrega concluída — equipamento marcado como Em Uso
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {checklistEntregaItems.map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={!!checklistEnt[item.key]}
                      onChange={e => setChecklistEnt(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className={`text-sm ${checklistEnt[item.key] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                    {checklistEnt[item.key] && <span className="ml-auto text-xs text-green-600">✓</span>}
                  </label>
                ))}
              </div>
              <button onClick={() => salvar('entrega')} disabled={salvando}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {salvando ? 'Salvando...' : 'Confirmar Entrega'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PreparacaoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [equipamentos, setEquipamentos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [etapaAtiva, setEtapaAtiva] = useState(location.state?.etapa || '')
  const [busca, setBusca] = useState('')
  const [page, setPage] = useState(1)
  const [scannerAberto, setScannerAberto] = useState(false)
  const limit = 20

  const [etapaDetectada, setEtapaDetectada] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit,
        // Quando há busca ativa, não filtra por etapa (mostra o equipamento independente da etapa)
        ...(!busca && etapaAtiva && { statusProcesso: etapaAtiva }),
        ...(busca && { busca }),
      })
      const res = await api.get(`/equipamentos?${params}`)
      const data = res.data.data.map(eq => ({
        ...eq,
        checklistPreparacao: eq.checklistPreparacao
          ? (typeof eq.checklistPreparacao === 'string' ? JSON.parse(eq.checklistPreparacao) : eq.checklistPreparacao)
          : {},
        checklistEntrega: eq.checklistEntrega
          ? (typeof eq.checklistEntrega === 'string' ? JSON.parse(eq.checklistEntrega) : eq.checklistEntrega)
          : {},
      }))
      setEquipamentos(data)
      setTotal(res.data.total)

      // Detecta e destaca a etapa do equipamento encontrado
      if (busca && data.length >= 1) {
        setEtapaDetectada(data[0].statusProcesso || '')
      } else {
        setEtapaDetectada('')
      }
    } catch {}
    setLoading(false)
  }, [page, etapaAtiva, busca])

  useEffect(() => { carregar() }, [carregar])

  // Reseta página ao mudar busca ou etapa
  useEffect(() => { setPage(1) }, [busca, etapaAtiva])

  const handleAtualizar = (equipamentoAtualizado) => {
    setEquipamentos(prev => prev.map(eq =>
      eq.id === equipamentoAtualizado.id ? {
        ...equipamentoAtualizado,
        checklistPreparacao: equipamentoAtualizado.checklistPreparacao || {},
        checklistEntrega: equipamentoAtualizado.checklistEntrega || {},
      } : eq
    ))
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('filaPreparacao')}</h1>
        <p className="text-slate-500 text-sm">{total} {t('equipamentos').toLowerCase()} · {t('carregando').includes('...') ? '' : 'clique para abrir'}</p>
      </div>

      {/* Busca + QR Scanner */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder={t('buscarSerial')}
            className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setScannerAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          title={t('escanearQR')}>
          <QrCode size={16} />
          <span className="hidden sm:inline">{t('escanearQR')}</span>
        </button>
      </div>

      {scannerAberto && (
        <QrScanner
          onResult={(id) => {
            setScannerAberto(false)
            navigate(`/equipamentos/${id}`)
          }}
          onClose={() => setScannerAberto(false)}
        />
      )}

      {/* Filtro por etapa */}
      <div className="flex flex-wrap gap-2">
        {ETAPAS.map(e => {
          const isAtiva = !busca ? etapaAtiva === e.key : (e.key === '' ? false : etapaDetectada === e.key || (e.key === '' && !etapaDetectada))
          const isDetectada = busca && e.key !== '' && etapaDetectada === e.key
          return (
            <button key={e.key} onClick={() => { setEtapaAtiva(e.key); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isDetectada
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : (!busca && etapaAtiva === e.key)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}>
              {e.label}
              {isDetectada && ' ←'}
            </button>
          )
        })}
      </div>

      {/* Lista de equipamentos */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : equipamentos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          Nenhum equipamento nesta etapa
        </div>
      ) : (
        <div className="space-y-3">
          {equipamentos.map(eq => (
            <CardEquipamento key={eq.id} eq={eq} onAtualizar={handleAtualizar} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 bg-white">
              Anterior
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 bg-white">
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
