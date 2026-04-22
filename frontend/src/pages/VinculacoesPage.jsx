import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Link2, Unlink, Calendar, CheckCircle, XCircle, UserCog, ArrowLeftRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import VinculacaoModal from '../components/modals/VinculacaoModal'
import TransferirModal from '../components/modals/TransferirModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { SkeletonRow, EmptyState } from '../components/Skeleton'
import AssinaturaCanvas from '../components/AssinaturaCanvas'
import ChecklistDevolucaoModal from '../components/modals/ChecklistDevolucaoModal'
import FiltrosSalvos from '../components/FiltrosSalvos'
import { useFiltrosSalvos } from '../hooks/useFiltrosSalvos'

const STATUS_ENTREGA = {
  PENDENTE:       { label: 'Pendente',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  ENTREGUE:       { label: 'Entregue',        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  NAO_COMPARECEU: { label: 'Não compareceu',  color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

function ReagendarModal({ atribuicao, onClose, onSave }) {
  const toast = useToast()
  const [data, setData] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!data) return toast.error('Informe a nova data')
    setLoading(true)
    try {
      await api.put(`/vinculacoes/${atribuicao.id}/reagendar`, { dataAgendamento: data + ':00-03:00', motivo })
      toast.success('Reagendado com sucesso')
      onSave()
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao reagendar') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Reagendar Entrega</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Colaborador</p>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{atribuicao.usuario?.nome}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nova Data *</label>
            <input type="datetime-local" className={inputCls} value={data} onChange={e => setData(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Motivo</label>
            <input type="text" className={inputCls} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo do reagendamento..." />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium">
              {loading ? 'Salvando...' : 'Reagendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditarTecnicoModal({ atribuicao, onClose, onSave }) {
  const toast = useToast()
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicoId, setTecnicoId] = useState(atribuicao.tecnico?.id || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/usuarios?role=TECNICO&comAcesso=true&limit=100')
      .then(r => setTecnicos(r.data.data || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tecnicoId) return toast.error('Selecione um técnico')
    setLoading(true)
    try {
      await api.put(`/vinculacoes/${atribuicao.id}/tecnico`, { tecnicoId })
      toast.success('Técnico atualizado')
      onSave()
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao atualizar') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Alterar Técnico</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Colaborador</p>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{atribuicao.usuario?.nome}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Novo Técnico *</label>
            <select value={tecnicoId} onChange={e => setTecnicoId(e.target.value)} className={inputCls} required>
              <option value="">Selecione...</option>
              {tecnicos.map(tec => <option key={tec.id} value={tec.id}>{tec.nome}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VinculacoesPage() {
  const location = useLocation()
  const toast = useToast()
  const { isAdmin } = useAuth()
  const { t } = useTranslation()
  const { filtrosSalvos, salvarFiltro, removerFiltro } = useFiltrosSalvos('atribuicoes')

  // Inicializa filtros já com o state do dashboard (evita carregar duas vezes)
  const [filtroAtiva, setFiltroAtiva] = useState(() => {
    if (location.state?.filtroEntrega) return ''
    return location.state?.filtroAtiva ?? 'true'
  })
  const [filtroEntrega, setFiltroEntrega] = useState(location.state?.filtroEntrega || '')
  const [filtroTecnico, setFiltroTecnico] = useState('')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const [tecnicos, setTecnicos] = useState([])
  const [vinculacoes, setVinculacoes] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PAGE_SIZE = 25
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [obsEncerramento, setObsEncerramento] = useState('')
  const [reagendando, setReagendando] = useState(null)
  const [editandoTecnico, setEditandoTecnico] = useState(null)
  const [transferindo, setTransferindo] = useState(null)
  const [entregando, setEntregando] = useState(null)
  const [assinatura, setAssinatura] = useState(null)
  const [loadingEntrega, setLoadingEntrega] = useState(false)
  const [checklistEncerramento, setChecklistEncerramento] = useState(null)

  useEffect(() => {
    api.get('/usuarios?role=TECNICO&comAcesso=true&limit=100')
      .then(r => setTecnicos(r.data.data || []))
      .catch(() => {})
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroAtiva !== '') params.set('ativa', filtroAtiva)
      if (filtroEntrega) params.set('statusEntrega', filtroEntrega)
      params.set('page', page)
      params.set('limit', PAGE_SIZE)
      const res = await api.get(`/vinculacoes?${params}`)
      // Suporte a resposta paginada e não-paginada
      if (res.data?.data) {
        setVinculacoes(res.data.data)
        setTotal(res.data.total || 0)
        setTotalPages(res.data.totalPages || 1)
      } else {
        setVinculacoes(res.data)
        setTotal(res.data.length)
        setTotalPages(1)
      }
    } catch { toast.error('Erro ao carregar atribuições') }
    setLoading(false)
  }, [filtroAtiva, filtroEntrega, page])

  useEffect(() => { carregar() }, [carregar])

  // Reseta página ao mudar filtros
  useEffect(() => { setPage(1) }, [filtroAtiva, filtroEntrega, filtroTecnico])

  const handleEncerrar = async (id, obs, checklist) => {
    try {
      await api.put(`/vinculacoes/${id}/encerrar`, { observacao: obs || '', checklistDevolucao: checklist })
      toast.success('Devolução registrada com sucesso')
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao encerrar atribuição')
    }
  }

  const handleNaoCompareceu = async (v) => {
    try {
      await api.put(`/vinculacoes/${v.id}/nao-compareceu`)
      toast.success('Marcado como não compareceu')
      carregar()
      setReagendando(v) // abre reagendar automaticamente
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleEntregue = async (id, assinaturaData) => {
    setLoadingEntrega(true)
    try {
      await api.put(`/vinculacoes/${id}/entregue`, { assinatura: assinaturaData })
      toast.success('Marcado como entregue')
      carregar()
      setEntregando(null)
      setAssinatura(null)
    } catch { toast.error('Erro ao atualizar') }
    setLoadingEntrega(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('atribuicoes')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{total} registros</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> {t('novaAtribuicao')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            {[['true', 'Ativas'], ['false', 'Encerradas'], ['', 'Todas']].map(([val, label]) => (
              <button key={val} onClick={() => { setFiltroAtiva(val); setFiltroEntrega('') }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroAtiva === val && !filtroEntrega ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-l border-slate-200 dark:border-slate-600 pl-2">
            {[['PENDENTE', 'Agendadas'], ['ENTREGUE', 'Entregues'], ['NAO_COMPARECEU', 'Não compareceu']].map(([val, label]) => (
              <button key={val} onClick={() => { setFiltroEntrega(filtroEntrega === val ? '' : val); setFiltroAtiva('') }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroEntrega === val ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
          {isAdmin && tecnicos.length > 0 && (
            <div className="border-l border-slate-200 dark:border-slate-600 pl-2">
              <select value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">Todos os técnicos</option>
                {tecnicos.map(tec => <option key={tec.id} value={tec.id}>{tec.nome}</option>)}
              </select>
            </div>
          )}
          <div className="border-l border-slate-200 dark:border-slate-600 pl-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">De</span>
            <input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <span className="text-xs text-slate-400">até</span>
            <input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            {(filtroDataDe || filtroDataAte) && (
              <button onClick={() => { setFiltroDataDe(''); setFiltroDataAte('') }}
                className="text-xs text-red-400 hover:text-red-600">✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {['Colaborador','Unidade','Equipamento','Serial','Técnico','Tipo','Chamado','Agendamento','Entrega','Ações'].map(h => (
                  <th key={h} className={`py-3 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide ${h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
              ) : vinculacoes
                .filter(v => !filtroTecnico || String(v.tecnico?.id) === String(filtroTecnico))
                .filter(v => !filtroDataDe || new Date(v.dataInicio) >= new Date(filtroDataDe))
                .filter(v => !filtroDataAte || new Date(v.dataInicio) <= new Date(filtroDataAte + 'T23:59:59'))
                .length === 0 ? (
                <EmptyState icon={Link2} titulo="Nenhuma atribuição encontrada" descricao="Crie uma nova atribuição para começar" />
              ) : vinculacoes
                .filter(v => !filtroTecnico || String(v.tecnico?.id) === String(filtroTecnico))
                .filter(v => !filtroDataDe || new Date(v.dataInicio) >= new Date(filtroDataDe))
                .filter(v => !filtroDataAte || new Date(v.dataInicio) <= new Date(filtroDataAte + 'T23:59:59'))
                .map(v => {
                const se = STATUS_ENTREGA[v.statusEntrega] || STATUS_ENTREGA.PENDENTE
                return (
                  <tr key={v.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100 text-xs">{v.usuario?.nome}</p>
                      <p className="text-[10px] text-slate-400">{v.usuario?.funcao || ''}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">{v.usuario?.unidade?.nome || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">
                      {[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || v.equipamento?.tipo || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">{v.equipamento?.serialNumber || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">{v.tecnico?.nome || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span title={v.tipoOperacao || ''} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-400 whitespace-nowrap max-w-[80px] truncate block">
                        {v.tipoOperacao || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-500 dark:text-slate-400">{v.numeroChamado || '—'}</td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-500 dark:text-slate-400">
                      {v.dataAgendamento ? new Date(v.dataAgendamento).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      {v.reagendamentos && (() => { try { const r = JSON.parse(v.reagendamentos); return r.length > 0 ? <span className={`ml-1 text-[9px] px-1 rounded ${r.length >= 3 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-bold' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>{r.length}x reagend.</span> : null } catch { return null } })()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${se.color}`}>{se.label}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-end gap-1">
                        {v.ativa && (
                          <>
                            <button onClick={() => setReagendando(v)} title="Reagendar"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors">
                              <Calendar size={13} />
                            </button>
                            {v.statusEntrega !== 'ENTREGUE' && (
                              <button onClick={() => { setEntregando(v); setAssinatura(null) }} title="Marcar como entregue"
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors">
                                <CheckCircle size={13} />
                              </button>
                            )}
                            {v.statusEntrega !== 'NAO_COMPARECEU' && (
                              <button onClick={() => handleNaoCompareceu(v)} title="Não compareceu"
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors">
                                <XCircle size={13} />
                              </button>
                            )}
                            <button onClick={() => setEditandoTecnico(v)} title="Alterar técnico"
                              className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded transition-colors">
                              <UserCog size={13} />
                            </button>
                            <button onClick={() => setTransferindo(v)} title="Transferir equipamento"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors">
                              <ArrowLeftRight size={13} />
                            </button>
                            <button onClick={() => setChecklistEncerramento(v)} title="Registrar Devolução"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
                              <Unlink size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <VinculacaoModal onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); carregar() }} />
      )}

      {editandoTecnico && (
        <EditarTecnicoModal
          atribuicao={editandoTecnico}
          onClose={() => setEditandoTecnico(null)}
          onSave={() => { setEditandoTecnico(null); carregar() }}
        />
      )}

      {transferindo && (
        <TransferirModal
          atribuicao={transferindo}
          onClose={() => setTransferindo(null)}
          onSave={() => { setTransferindo(null); carregar() }}
        />
      )}

      {reagendando && (
        <ReagendarModal atribuicao={reagendando} onClose={() => setReagendando(null)} onSave={() => { setReagendando(null); carregar() }} />
      )}

      {entregando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Confirmar Entrega</h2>
              <button onClick={() => { setEntregando(null); setAssinatura(null) }} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400">Colaborador</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{entregando.usuario?.nome}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-400">Equipamento</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {[entregando.equipamento?.marca, entregando.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Assinatura do colaborador <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <AssinaturaCanvas onChange={setAssinatura} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => { setEntregando(null); setAssinatura(null) }}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
                  Cancelar
                </button>
                <button onClick={() => handleEntregue(entregando.id, assinatura)} disabled={loadingEntrega}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-medium flex items-center gap-2">
                  {loadingEntrega ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={14} />}
                  Confirmar Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {checklistEncerramento && (
        <ChecklistDevolucaoModal
          atribuicao={checklistEncerramento}
          onClose={() => setChecklistEncerramento(null)}
          onConfirm={(checklist) => {
            const vinc = checklistEncerramento
            setChecklistEncerramento(null)
            setConfirm({ id: vinc.id, checklist })
          }}
        />
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Registrar Devolução</h2>
              <button onClick={() => setConfirm(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">Tem certeza que deseja registrar a devolução? O equipamento voltará a ficar disponível.</p>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Observação (opcional)</label>
                <textarea value={obsEncerramento} onChange={e => setObsEncerramento(e.target.value)}
                  rows={3} placeholder="Ex: Colaborador saiu da empresa, equipamento devolvido em bom estado..."
                  className={inputCls + ' resize-none'} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
                <button onClick={() => { handleEncerrar(confirm.id, obsEncerramento, confirm.checklist); setConfirm(null); setObsEncerramento('') }}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                  Confirmar Devolução
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Página {page} de {totalPages} · {total} registros
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(1)}
              className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              «
            </button>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              return p <= totalPages ? (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {p}
                </button>
              ) : null
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Próxima
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(totalPages)}
              className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
