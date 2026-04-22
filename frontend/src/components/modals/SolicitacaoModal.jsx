import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

// ── Estado derivado (mesma lógica do backend) ────────────────────────────────

function derivarEstado(form) {
  if (form.dataEntrega)           return 'Entregue'
  if (form.dataChegada)           return 'Aguardando Entrega'
  if (form.dataColeta)            return 'Em Trânsito'
  if (form.dataSolicitacaoColeta) return 'Coleta Solicitada'
  if (form.dataEmissaoNF)         return 'Aguardando Coleta'
  if (form.dataSolicitacaoNF)     return 'NF Solicitada'
  if (form.dataDefinicao)         return 'Aguardando NF'
  return 'Aberto'
}

const ESTADO_BADGE = {
  'Aberto':              'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400',
  'Aguardando NF':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  'NF Solicitada':       'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  'Aguardando Coleta':   'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Coleta Solicitada':   'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  'Em Trânsito':         'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  'Aguardando Entrega':  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  'Entregue':            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
}

const NUMERO_CHAMADO_REGEX = /^(INC|TASK)\d+$/

function toDateInput(val) {
  if (!val) return ''
  return new Date(val).toISOString().split('T')[0]
}

const EMPTY_FORM = {
  numeroChamado: '',
  tipo: '',
  status: 'ABERTO',
  tecnicoId: '',
  unidadeId: '',
  descricao: '',
  observacoes: '',
  serialOrigem: '',
  equipamentoId: '',
  dataDefinicao: '',
  dataDefinicaoConfirmada: '',
  dataSolicitacaoNF: '',
  dataEmissaoNF: '',
  dataSolicitacaoColeta: '',
  dataColeta: '',
  previsaoChegada: '',
  dataChegada: '',
  dataEntrega: '',
}

export default function SolicitacaoModal({ solicitacao, onClose, onSave }) {
  const toast = useToast()
  const { isTecnico, isAdmin } = useAuth()
  const isEdit = !!solicitacao

  // Campos que apenas TÉCNICO pode editar
  const camposTecnico = ['dataDefinicao', 'dataChegada', 'dataEntrega']
  
  // Determinar se um campo é editável
  const ehEditavel = (campo) => {
    if (isAdmin) return true // ADMIN/SUPERADMIN pode editar tudo
    if (isTecnico) return camposTecnico.includes(campo) // TÉCNICO só esses 3
    return false
  }

  const [form, setForm] = useState(() => {
    if (!solicitacao) return { ...EMPTY_FORM }
    return {
      numeroChamado:           solicitacao.numeroChamado || '',
      tipo:                    solicitacao.tipo || '',
      status:                  solicitacao.status || 'ABERTO',
      tecnicoId:               solicitacao.tecnicoId || '',
      unidadeId:               solicitacao.unidadeId || '',
      descricao:               solicitacao.descricao || '',
      observacoes:             solicitacao.observacoes || '',
      serialOrigem:            solicitacao.serialOrigem || '',
      equipamentoId:           solicitacao.equipamentoId || '',
      dataDefinicao:           toDateInput(solicitacao.dataDefinicao),
      dataDefinicaoConfirmada: toDateInput(solicitacao.dataDefinicaoConfirmada),
      dataSolicitacaoNF:       toDateInput(solicitacao.dataSolicitacaoNF),
      dataEmissaoNF:           toDateInput(solicitacao.dataEmissaoNF),
      dataSolicitacaoColeta:   toDateInput(solicitacao.dataSolicitacaoColeta),
      dataColeta:              toDateInput(solicitacao.dataColeta),
      previsaoChegada:         toDateInput(solicitacao.previsaoChegada),
      dataChegada:             toDateInput(solicitacao.dataChegada),
      dataEntrega:             toDateInput(solicitacao.dataEntrega),
    }
  })

  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const [tecnicos, setTecnicos] = useState([])
  const [unidades, setUnidades] = useState([])
  const [equipamentos, setEquipamentos] = useState([])

  useEffect(() => {
    api.get('/usuarios?comAcesso=true&limit=200').then(r => setTecnicos(r.data?.data || r.data || [])).catch(() => {})
    api.get('/unidades').then(r => setUnidades(r.data || [])).catch(() => {})
    api.get('/equipamentos?limit=200').then(r => setEquipamentos(r.data?.data || [])).catch(() => {})
  }, [])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (erros[field]) setErros(prev => ({ ...prev, [field]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.numeroChamado.trim()) {
      e.numeroChamado = 'Número do chamado é obrigatório'
    } else if (!NUMERO_CHAMADO_REGEX.test(form.numeroChamado.trim())) {
      e.numeroChamado = 'Formato inválido. Use INC1234567 ou TASK1234567'
    }
    if (!form.tipo) e.tipo = 'Tipo é obrigatório'
    if (!form.tecnicoId) e.tecnicoId = 'Técnico é obrigatório'
    if (!form.unidadeId) e.unidadeId = 'Unidade é obrigatória'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        status:       form.status,
        tecnicoId:    parseInt(form.tecnicoId),
        unidadeId:    parseInt(form.unidadeId),
        equipamentoId: form.equipamentoId ? parseInt(form.equipamentoId) : null,
        // datas vazias → null
        dataDefinicao:           form.dataDefinicao || null,
        dataDefinicaoConfirmada: form.dataDefinicaoConfirmada || null,
        dataSolicitacaoNF:       form.dataSolicitacaoNF || null,
        dataEmissaoNF:           form.dataEmissaoNF || null,
        dataSolicitacaoColeta:   form.dataSolicitacaoColeta || null,
        dataColeta:              form.dataColeta || null,
        previsaoChegada:         form.previsaoChegada || null,
        dataChegada:             form.dataChegada || null,
        dataEntrega:             form.dataEntrega || null,
        serialOrigem:            form.tipo === 'TROCA' ? form.serialOrigem : null,
      }
      if (isEdit) {
        await api.put(`/solicitacoes/${solicitacao.id}`, payload)
      } else {
        await api.post('/solicitacoes', payload)
      }
      toast.success(isEdit ? 'Solicitação atualizada' : 'Solicitação criada')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar solicitação')
    }
    setLoading(false)
  }

  const estadoAtual = derivarEstado(form)

  const inputCls = (campo) => {
    const isReadonly = !ehEditavel(campo)
    return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white dark:bg-white/5 text-slate-800 dark:text-white transition-colors ${
      isReadonly ? 'bg-slate-50 dark:bg-white/3 cursor-not-allowed opacity-60' : ''
    } ${
      erros[campo]
        ? 'border-red-400 focus:ring-red-500/30'
        : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/30'
    }`
  }
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#1a2235] z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">
              {isEdit ? 'Editar Solicitação' : 'Nova Solicitação'}
            </h2>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[estadoAtual] || 'bg-slate-100 text-slate-500'}`}>
              {estadoAtual}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Campos obrigatórios */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Identificação</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nº Chamado *</label>
                <input
                  type="text"
                  value={form.numeroChamado}
                  onChange={set('numeroChamado')}
                  readOnly={!ehEditavel('numeroChamado')}
                  placeholder="INC1234567 ou TASK1234567"
                  className={inputCls('numeroChamado')}
                />
                {erros.numeroChamado && <p className="text-xs text-red-500 mt-1">{erros.numeroChamado}</p>}
              </div>
              <div>
                <label className={labelCls}>Tipo *</label>
                <select value={form.tipo} onChange={set('tipo')} disabled={!ehEditavel('tipo')} className={inputCls('tipo')}>
                  <option value="">Selecionar...</option>
                  <option value="TROCA">TROCA</option>
                  <option value="NOVO">NOVO</option>
                  <option value="RETORNO">RETORNO</option>
                  <option value="ENVIO">ENVIO</option>
                </select>
                {erros.tipo && <p className="text-xs text-red-500 mt-1">{erros.tipo}</p>}
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={set('status')} disabled={!ehEditavel('status')} className={inputCls('status')}>
                  <option value="ABERTO">Aberto</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="ENCERRADO">Encerrado</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Técnico *</label>
                <select value={form.tecnicoId} onChange={set('tecnicoId')} disabled={!ehEditavel('tecnicoId')} className={inputCls('tecnicoId')}>
                  <option value="">Selecionar...</option>
                  {tecnicos.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
                {erros.tecnicoId && <p className="text-xs text-red-500 mt-1">{erros.tecnicoId}</p>}
              </div>
              <div>
                <label className={labelCls}>Unidade *</label>
                <select value={form.unidadeId} onChange={set('unidadeId')} disabled={!ehEditavel('unidadeId')} className={inputCls('unidadeId')}>
                  <option value="">Selecionar...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
                {erros.unidadeId && <p className="text-xs text-red-500 mt-1">{erros.unidadeId}</p>}
              </div>
            </div>
          </div>

          {/* Campos opcionais */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Detalhes</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Descrição</label>
                <input type="text" value={form.descricao} onChange={set('descricao')} readOnly={!ehEditavel('descricao')} className={inputCls('descricao')} />
              </div>
              <div>
                <label className={labelCls}>
                  Observações
                  <span className="ml-1 text-slate-400 font-normal">({form.observacoes.length}/2000)</span>
                </label>
                <textarea
                  value={form.observacoes}
                  onChange={set('observacoes')}
                  maxLength={2000}
                  readOnly={!ehEditavel('observacoes')}
                  rows={3}
                  className={inputCls('observacoes') + ' resize-none'}
                />
              </div>
              {form.tipo === 'TROCA' && (
                <div>
                  <label className={labelCls}>Serial de Origem (equipamento defeituoso)</label>
                  <input type="text" value={form.serialOrigem} onChange={set('serialOrigem')} readOnly={!ehEditavel('serialOrigem')} className={inputCls('serialOrigem') + ' font-mono'} />
                </div>
              )}
              <div>
                <label className={labelCls}>Equipamento (opcional)</label>
                <select value={form.equipamentoId} onChange={set('equipamentoId')} disabled={!ehEditavel('equipamentoId')} className={inputCls('equipamentoId')}>
                  <option value="">Nenhum</option>
                  {equipamentos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.marca} {eq.modelo} — {eq.serialNumber}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pipeline — Datas das Etapas */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Pipeline — Datas das Etapas</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { field: 'dataDefinicao',           label: 'Definição' },
                { field: 'dataDefinicaoConfirmada', label: 'Confirmação Definição' },
                { field: 'dataSolicitacaoNF',       label: 'Solicitação NF' },
                { field: 'dataEmissaoNF',           label: 'Emissão NF' },
                { field: 'dataSolicitacaoColeta',   label: 'Solicitação Coleta' },
                { field: 'dataColeta',              label: 'Coleta' },
                { field: 'previsaoChegada',         label: 'Previsão Chegada' },
                { field: 'dataChegada',             label: 'Chegada' },
                { field: 'dataEntrega',             label: 'Entrega' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input 
                    type="date" 
                    value={form[field]} 
                    onChange={set(field)} 
                    readOnly={!ehEditavel(field)}
                    className={inputCls(field)} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
