import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Monitor, User, Building2, QrCode, Clock, Edit2, ChevronRight, Check } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import StatusBadge from '../components/StatusBadge'
import EquipamentoModal from '../components/modals/EquipamentoModal'

const ETAPAS = [
  {
    key: 'Novo',
    label: 'Aguardando Imagem',
    descricao: 'Instale a imagem do sistema operacional no equipamento.',
    proxima: 'Imagem Instalada',
    btnLabel: 'Imagem instalada — Avançar',
  },
  {
    key: 'Imagem Instalada',
    label: 'Imagem Instalada',
    descricao: 'Instale todos os softwares necessários: drivers, Office, Antivírus, VPN e agente de monitoramento.',
    proxima: 'Softwares Instalados',
    btnLabel: 'Softwares instalados — Avançar',
  },
  {
    key: 'Softwares Instalados',
    label: 'Softwares Instalados',
    descricao: 'Registre o asset no sistema de inventário da empresa.',
    proxima: 'Asset Registrado',
    btnLabel: 'Asset registrado — Avançar',
  },
  {
    key: 'Asset Registrado',
    label: 'Asset Registrado',
    descricao: 'Prepare os documentos e envie para o time de Asset.',
    proxima: 'Agendado para Entrega',
    btnLabel: 'Documentos enviados — Avançar',
    temObservacao: true,
  },
  {
    key: 'Agendado para Entrega',
    label: 'Agendado p/ Entrega',
    descricao: 'Agende a entrega com o colaborador.',
    proxima: 'Entregue ao Usuário',
    btnLabel: 'Entrega realizada — Concluir',
    temAgendamento: true,
  },
  {
    key: 'Entregue ao Usuário',
    label: 'Entregue',
    descricao: 'Equipamento entregue ao colaborador.',
    proxima: null,
  },
]

const ETAPAS_MOVEL = [
  {
    key: 'Novo',
    label: 'Configuração Inicial',
    descricao: 'Ative o dispositivo, configure a conta Google/Samsung e conecte ao Wi-Fi.',
    proxima: 'Imagem Instalada',
    btnLabel: 'Configuração concluída — Avançar',
  },
  {
    key: 'Imagem Instalada',
    label: 'App Instalado',
    descricao: 'Instale e configure a aplicação no dispositivo (APDATA, GB CONNECT, MAXIMO PROD, QUALIDADE PROD).',
    proxima: 'Agendado para Entrega',
    btnLabel: 'App configurado — Avançar',
  },
  {
    key: 'Agendado para Entrega',
    label: 'Agendado p/ Entrega',
    descricao: 'Agende a entrega com o colaborador.',
    proxima: 'Entregue ao Usuário',
    btnLabel: 'Entrega realizada — Concluir',
    temAgendamento: true,
  },
  {
    key: 'Entregue ao Usuário',
    label: 'Entregue',
    descricao: 'Dispositivo entregue ao colaborador.',
    proxima: null,
  },
]

const isMobile = (tipo) => ['tablet', 'celular', 'smartphone'].includes((tipo || '').toLowerCase())

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

function FluxoPreparacao({ equipamento, colaboradores, tecnicos, onAtualizar, isTecnico, usuarioId }) {
  const etapas = isMobile(equipamento.tipo) ? ETAPAS_MOVEL : ETAPAS
  const etapaAtual = etapas.find(e => e.key === equipamento.statusProcesso) || etapas[0]
  const idxAtual = etapas.findIndex(e => e.key === equipamento.statusProcesso)
  const [observacao, setObservacao] = useState('')
  const [comentario, setComentario] = useState('')
  const [agendamento, setAgendamento] = useState(equipamento.agendamento || { colaboradorId: '', data: '', horario: '', local: '' })
  const [salvando, setSalvando] = useState(false)

  // Log de etapas salvo no campo dedicado historicoEtapas
  const logEtapas = (() => {
    try {
      const parsed = equipamento.historicoEtapas
      if (Array.isArray(parsed)) return parsed
      return []
    } catch { return [] }
  })()

  const avancar = async () => {
    if (!etapaAtual.proxima) return
    
    // Validar agendamento
    if (etapaAtual.temAgendamento) {
      if (!agendamento.colaboradorId) {
        alert('Selecione um colaborador para agendar')
        return
      }
      if (!agendamento.data) {
        alert('Selecione uma data para agendar')
        return
      }
    }
    
    setSalvando(true)
    try {
      // Se tem agendamento, salvar agendamento E atualizar statusProcesso em uma única chamada
      if (etapaAtual.temAgendamento) {
        const res = await api.put(`/equipamentos/${equipamento.id}`, {
          statusProcesso: etapaAtual.proxima,
          agendamento: agendamento,
          comentarioEtapa: comentario || null,
          ...(etapaAtual.temObservacao && observacao && { observacao }),
        })
        setComentario('')
        onAtualizar(res.data)
        
        // Recarregar dashboard após atualizar agendamento - com refresh forçado
        setTimeout(() => {
          // Limpar cache e forçar reload
          window.location.href = '/dashboard?t=' + Date.now()
        }, 300)
      } else {
        const res = await api.put(`/equipamentos/${equipamento.id}`, {
          statusProcesso: etapaAtual.proxima,
          comentarioEtapa: comentario || null,
          ...(etapaAtual.temObservacao && observacao && { observacao }),
        })
        setComentario('')
        onAtualizar(res.data)
      }
    } catch (err) { 
      console.error('Erro ao avançar etapa:', err)
      alert('Erro ao avançar etapa')
    }
    setSalvando(false)
  }

  // Prazo estimado por etapa (dias)
  const PRAZOS = { 'Novo': 1, 'Imagem Instalada': 1, 'Softwares Instalados': 1, 'Asset Registrado': 2, 'Agendado para Entrega': 3 }
  const prazoEtapa = PRAZOS[etapaAtual.key] || 1

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {etapas.filter(e => e.key !== 'Entregue ao Usuário').map((etapa, idx) => {
          const concluida = idxAtual > idx
          const ativa = idxAtual === idx
          return (
            <div key={etapa.key} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${ativa ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : concluida ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {concluida
                  ? <Check size={12} />
                  : <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${ativa ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                }
                <span className="hidden sm:inline">{etapa.label}</span>
              </div>
              {idx < etapas.length - 2 && (
                <div className={`w-6 h-0.5 rounded-full ${idxAtual > idx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Etapa atual */}
      {etapaAtual.proxima ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <span className="text-white font-bold text-lg">{idxAtual + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">Etapa atual</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Prazo estimado: {prazoEtapa} dia{prazoEtapa > 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{etapaAtual.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{etapaAtual.descricao}</p>
            </div>
          </div>

          {/* Técnico responsável */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Técnico responsável</label>
            <select
              value={agendamento.tecnicoId || equipamento.tecnicoId || ''}
              onChange={async e => {
                const tecnicoId = e.target.value
                await api.put(`/equipamentos/${equipamento.id}`, { tecnicoId: tecnicoId || null })
                onAtualizar({ ...equipamento, tecnicoId: tecnicoId ? parseInt(tecnicoId) : null })
              }}
              disabled={isTecnico}
              className={"w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" + (isTecnico ? ' opacity-60 cursor-not-allowed' : '')}>
              <option value="">Selecionar técnico...</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            {isTecnico && <p className="text-xs text-slate-400 mt-1">Seu técnico é atribuído automaticamente</p>}
          </div>

          {/* Comentário da etapa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Comentário <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
              placeholder="Descreva o que foi feito nesta etapa..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
          </div>

          {/* Campo de observação (etapa 4) */}
          {etapaAtual.temObservacao && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observação / Documentos enviados
              </label>
              <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={3}
                placeholder="Descreva os documentos preparados e enviados ao time de Asset..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
            </div>
          )}

          {/* Agendamento (etapa 5) */}
          {etapaAtual.temAgendamento && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Colaborador</label>
                <select value={agendamento.colaboradorId}
                  onChange={e => setAgendamento(a => ({ ...a, colaboradorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  <option value="">Selecionar...</option>
                  {colaboradores.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                <input type="date" value={agendamento.data}
                  onChange={e => setAgendamento(a => ({ ...a, data: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                <input type="time" value={agendamento.horario}
                  onChange={e => setAgendamento(a => ({ ...a, horario: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Local</label>
                <input type="text" value={agendamento.local} placeholder="Ex: Sala TI, Recepção..."
                  onChange={e => setAgendamento(a => ({ ...a, local: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
              </div>
            </div>
          )}

          <button onClick={avancar} disabled={salvando}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all">
            {salvando ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : etapaAtual.btnLabel}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
            <Check size={32} className="text-white" />
          </div>
          <p className="font-bold text-emerald-700 text-lg">Equipamento entregue!</p>
          <p className="text-sm text-slate-500 mt-1">Processo concluído com sucesso</p>
        </div>
      )}

      {/* Timeline de etapas concluídas */}
      {logEtapas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Histórico de etapas</h4>
          <div className="space-y-3">
            {logEtapas.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.para}</span>
                    {log.tecnicoNome && (
                      <span className="text-xs text-slate-400">por {log.tecnicoNome}</span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(log.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.comentario && (
                    <p className="text-xs text-slate-500 mt-0.5 italic">"{log.comentario}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EquipamentoDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, isTecnico } = useAuth()
  const [equipamento, setEquipamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [unidades, setUnidades] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('preparacao')
  const [historicoLoc, setHistoricoLoc] = useState([])

  const carregar = async () => {
    setLoading(true)
    try {
      const [eqRes, unRes, tecRes, colabRes] = await Promise.all([
        api.get(`/equipamentos/${id}`),
        api.get('/unidades'),
        api.get('/usuarios?comAcesso=true&role=TECNICO&limit=200'),
        api.get('/usuarios?semAcesso=true&limit=500'),
      ])
      setEquipamento(eqRes.data)
      setUnidades(unRes.data)
      setTecnicos(tecRes.data?.data || [])
      setColaboradores(colabRes.data?.data || [])
      api.get(`/equipamentos/${id}/historico-localizacao`).then(r => setHistoricoLoc(r.data || [])).catch(() => {})
    } catch { navigate('/equipamentos') }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!equipamento) return null

  const vinculacaoAtiva = equipamento.vinculacoes?.find(v => v.ativa)

  const abas = [
    { id: 'preparacao', label: 'Preparação' },
    { id: 'info', label: 'Informações' },
    { id: 'historico', label: 'Histórico' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/equipamentos')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">
            {[equipamento.marca, equipamento.modelo].filter(Boolean).join(' ') || 'Equipamento'}
          </h1>
          <p className="text-slate-500 text-sm">{equipamento.tipo || 'Sem tipo'} · {equipamento.serialNumber || 'Sem serial'}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${PROCESSO_COLORS[equipamento.statusProcesso] || 'bg-slate-100 text-slate-600'}`}>
          {equipamento.statusProcesso || 'Novo'}
        </span>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Edit2 size={15} /> Editar
        </button>
      </div>

      {/* Abas */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {abas.map(a => (
            <button key={a.id} onClick={() => setAbaAtiva(a.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${abaAtiva === a.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aba Preparação */}
      {abaAtiva === 'preparacao' && (
        <FluxoPreparacao
          equipamento={equipamento}
          colaboradores={colaboradores}
          tecnicos={tecnicos}
          onAtualizar={eq => setEquipamento(eq)}
          isTecnico={isTecnico}
          usuarioId={usuario?.id}
        />
      )}

      {/* Aba Informações */}
      {abaAtiva === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Monitor size={16} /> Informações</h3>
            {(() => {
              const statusGarantia = (() => {
                if (!equipamento.dataGarantia) return null
                const hoje = new Date(); hoje.setHours(0,0,0,0)
                const v = new Date(equipamento.dataGarantia); v.setHours(0,0,0,0)
                const t30 = new Date(hoje); t30.setDate(t30.getDate()+30)
                if (v < hoje) return 'GARANTIA_VENCIDA'
                if (v <= t30) return 'GARANTIA_VENCENDO'
                return null
              })()
              return (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Tipo', equipamento.tipo],
                    ['Marca', equipamento.marca],
                    ['Modelo', equipamento.modelo],
                    ['Serial', equipamento.serialNumber],
                    ['Patrimônio', equipamento.patrimonio],
                    ['Status', <StatusBadge key="s" status={equipamento.status} />],
                    ['Técnico', equipamento.tecnico?.nome],
                    ['Data de Entrega', equipamento.dataEntrega ? new Date(equipamento.dataEntrega).toLocaleDateString('pt-BR') : null],
                    ['Data de Garantia', equipamento.dataGarantia ? (
                      <span key="g" className="flex items-center gap-2">
                        {new Date(equipamento.dataGarantia).toLocaleDateString('pt-BR')}
                        {statusGarantia === 'GARANTIA_VENCIDA' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Vencida</span>
                        )}
                        {statusGarantia === 'GARANTIA_VENCENDO' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Vencendo</span>
                        )}
                      </span>
                    ) : null],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              )
            })()}
            {equipamento.observacao && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Observação</p>
                <p className="text-sm text-slate-600">{equipamento.observacao}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3"><User size={16} /> Colaborador Atual</h3>
              {vinculacaoAtiva ? (
                <div>
                  <p className="font-medium text-slate-800">{vinculacaoAtiva.usuario?.nome}</p>
                  <p className="text-sm text-slate-500">{vinculacaoAtiva.usuario?.funcao || '—'}</p>
                  <p className="text-xs text-slate-400 mt-1">Desde {new Date(vinculacaoAtiva.dataInicio).toLocaleDateString('pt-BR')}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Sem colaborador vinculado</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3"><Building2 size={16} /> Unidade</h3>
              <p className="text-sm font-medium text-slate-700">{equipamento.unidade?.nome || '—'}</p>
            </div>
            {equipamento.qrCode && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <h3 className="font-semibold text-slate-700 flex items-center justify-center gap-2 mb-3"><QrCode size={16} /> QR Code</h3>
                <img src={equipamento.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                <a href={equipamento.qrCode} download={`qr-${equipamento.serialNumber || equipamento.id}.png`}
                  className="text-xs text-blue-600 hover:underline mt-2 block">Baixar QR Code</a>
              </div>
            )}
            {equipamento.foto && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 px-4 py-3 border-b border-slate-100">Foto</p>
                <img src={`${import.meta.env.VITE_API_URL?.replace('/api','') || ''}${equipamento.foto}`}
                  alt="Foto do equipamento" className="w-full object-cover max-h-48" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aba Histórico */}
      {abaAtiva === 'historico' && (
        <div className="space-y-4">
          {historicoLoc.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Building2 size={16} /> Histórico de Localização</h3>
              <div className="space-y-3">
                {historicoLoc.map(h => (
                  <div key={h.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-violet-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        {h.unidadeAnterior?.nome || 'Sem unidade'} → {h.unidadeNova?.nome || 'Sem unidade'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(h.createdAt).toLocaleString('pt-BR')}
                        {h.tecnico?.nome && ` · ${h.tecnico.nome}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Clock size={16} /> Histórico</h3>
            {equipamento.historicos?.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum histórico registrado</p>
            ) : (
              <div className="space-y-3">
                {equipamento.historicos?.map(h => (
                  <div key={h.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{h.descricao || h.acao}</p>
                      <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Vinculações</h3>
            {equipamento.vinculacoes?.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma vinculação</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Colaborador</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Início</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Fim</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipamento.vinculacoes?.map(v => (
                    <tr key={v.id} className="border-b border-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-700">{v.usuario?.nome}</td>
                      <td className="py-2 px-3 text-slate-500">{new Date(v.dataInicio).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2 px-3 text-slate-500">{v.dataFim ? new Date(v.dataFim).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {v.ativa ? 'Ativa' : 'Encerrada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <EquipamentoModal
          equipamento={equipamento}
          unidades={unidades}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); carregar() }}
        />
      )}
    </div>
  )
}
