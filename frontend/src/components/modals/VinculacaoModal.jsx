import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white'

export default function VinculacaoModal({ onClose, onSave }) {
  const { t } = useTranslation()
  const toast = useToast()
  const { usuario, isAdmin } = useAuth()
  
  const [usuarios, setUsuarios] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscaU, setBuscaU] = useState('')
  const [buscaE, setBuscaE] = useState('')

  const [form, setForm] = useState({
    usuarioId: '',
    equipamentoId: '',
    tecnicoId: '',
    observacao: '',
    numeroChamado: '',
    tipoOperacao: 'Desktop',
    softwaresDe: '',
    softwaresPara: '',
    dataAgendamento: '',
  })

  // Definição única das opções de operação
  const OPCOES_OPERACAO = [
    { value: 'Desktop', label: 'Desktop' },
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Troca de equipamento', label: t('trocaEquipamento') },
    { value: 'TABLET', label: 'TABLET' },
    { value: 'Smartphone', label: 'Smartphone' },
  ]

  // Carregar técnicos - Backend agora retorna apenas o técnico logado se não for admin
  useEffect(() => {
    api.get('/usuarios?role=TECNICO&comAcesso=true&limit=100&_t=' + Date.now())
      .then(r => {
        setTecnicos(r.data.data || [])
        // Se técnico, auto-preenche com o primeiro (que será ele mesmo)
        if (!isAdmin && r.data.data && r.data.data.length > 0) {
          setForm(f => ({ ...f, tecnicoId: String(r.data.data[0].id) }))
        }
      })
      .catch(() => {})
  }, [isAdmin])

  // Busca colaboradores - Alterado de 't' para 'timer' para evitar conflito com tradução
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (buscaU.length >= 1) {
        const res = await api.get(`/usuarios?busca=${buscaU}&semAcesso=true&limit=10`)
        setUsuarios(res.data.data || [])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [buscaU])

  // Busca equipamentos
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (buscaE.length >= 1) {
        const [r1, r2] = await Promise.all([
          api.get(`/equipamentos?busca=${buscaE}&status=DISPONIVEL&limit=10`),
          api.get(`/equipamentos?busca=${buscaE}&status=EM_USO&limit=10`),
        ])
        const disponiveis = r1.data.data || []
        const emUsoSemVinculo = (r2.data.data || []).filter(eq =>
          !eq.vinculacoes || eq.vinculacoes.length === 0
        )
        setEquipamentos([...disponiveis, ...emUsoSemVinculo])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [buscaE])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.usuarioId) return toast.error('Selecione um colaborador')
    if (!form.equipamentoId) return toast.error('Selecione um equipamento')
    if (!form.tecnicoId) return toast.error('Técnico responsável é obrigatório')
    
    setLoading(true)
    try {
      await api.post('/vinculacoes', {
        ...form,
        numeroChamado: form.numeroChamado || null,
        softwaresDe: form.softwaresDe || null,
        softwaresPara: form.softwaresPara || null,
        dataAgendamento: form.dataAgendamento ? form.dataAgendamento + ':00-03:00' : null,
      })
      toast.success('Atribuição criada com sucesso')
      onSave()
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Erro ao criar atribuição') 
    }
    setLoading(false)
  }

  const usuarioSelecionado = usuarios.find(u => u.id === parseInt(form.usuarioId))
  const equipamentoSelecionado = equipamentos.find(e => e.id === parseInt(form.equipamentoId))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{t('novaAtribuicao')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Colaborador */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('colaborador')} *</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={t('buscarColaborador')} value={buscaU}
                onChange={e => { setBuscaU(e.target.value); setForm(f => ({ ...f, usuarioId: '' })) }}
                className="pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white w-full" />
            </div>
            {usuarios.length > 0 && !form.usuarioId && (
              <div className="mt-1 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden max-h-40 overflow-y-auto shadow-sm bg-white dark:bg-slate-800">
                {usuarios.map(u => (
                  <button key={u.id} type="button"
                    onClick={() => { setForm(f => ({ ...f, usuarioId: u.id })); setBuscaU(u.nome); setUsuarios([]) }}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{u.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {u.funcao && <span className="text-xs text-slate-500">{u.funcao}</span>}
                      {u.unidade?.nome && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">{u.unidade.nome}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {form.usuarioId && usuarioSelecionado && (
              <div className="mt-1.5 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">✓ {usuarioSelecionado.nome}</span>
                <button type="button" onClick={() => { setForm(f => ({ ...f, usuarioId: '' })); setBuscaU('') }}
                  className="text-xs text-slate-400 hover:text-red-500 ml-auto">✕</button>
              </div>
            )}
          </div>

          {/* Equipamento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('equipamentoDisponivel')}</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={t('buscarEquipamento')} value={buscaE}
                onChange={e => { setBuscaE(e.target.value); setForm(f => ({ ...f, equipamentoId: '' })) }}
                className="pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white w-full" />
            </div>
            {equipamentos.length > 0 && !form.equipamentoId && (
              <div className="mt-1 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden max-h-36 overflow-y-auto bg-white dark:bg-slate-800">
                {equipamentos.map(eq => (
                  <button key={eq.id} type="button"
                    onClick={() => { setForm(f => ({ ...f, equipamentoId: eq.id })); setBuscaE(`${eq.marca || ''} ${eq.modelo || ''}`.trim()); setEquipamentos([]) }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{[eq.marca, eq.modelo].filter(Boolean).join(' ') || eq.tipo || 'Sem nome'}</p>
                    <p className="text-xs text-slate-400">{eq.serialNumber || ''} {eq.unidade?.nome ? `— ${eq.unidade.nome}` : ''}</p>
                  </button>
                ))}
              </div>
            )}
            {form.equipamentoId && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {equipamentoSelecionado ? `${equipamentoSelecionado.marca || ''} ${equipamentoSelecionado.modelo || ''}`.trim() : 'Selecionado'}</p>
            )}
          </div>

          {/* Técnico responsável */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('tecnicoResponsavel')}</label>
            {isAdmin ? (
              <select value={form.tecnicoId} onChange={e => setForm(f => ({ ...f, tecnicoId: e.target.value }))} className={inputCls} required>
                <option value="">{t('selecioneColaborador')}...</option>
                {tecnicos.map(tec => (
                  <option key={tec.id} value={String(tec.id)}>{tec.nome}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                {usuario?.nome || 'Carregando...'}
              </div>
            )}
          </div>

          {/* Tipo de operação - Ajustado o MAP para usar .value e .label */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('tipoOperacao')}</label>
            <select value={form.tipoOperacao} onChange={e => setForm(f => ({ ...f, tipoOperacao: e.target.value }))} className={inputCls}>
              {OPCOES_OPERACAO.map(opcao => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          {/* De/Para softwares */}
          {(form.tipoOperacao === 'Desktop' || form.tipoOperacao === 'Laptop' || form.tipoOperacao === 'Troca de equipamento') && (
            <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-900/30">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t('softwaresDe')} / {t('softwaresPara')}</p>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('softwaresDe')}</label>
                <textarea value={form.softwaresDe} onChange={e => setForm(f => ({ ...f, softwaresDe: e.target.value }))}
                  rows={3} placeholder="Ex: Office 2016..." className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('softwaresPara')}</label>
                <textarea value={form.softwaresPara} onChange={e => setForm(f => ({ ...f, softwaresPara: e.target.value }))}
                  rows={3} placeholder="Ex: Office 365..." className={inputCls + ' resize-none'} />
              </div>
            </div>
          )}

          {/* Aplicação - TABLET */}
          {form.tipoOperacao === 'TABLET' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aplicação</label>
              <select value={form.softwaresPara} onChange={e => setForm(f => ({ ...f, softwaresPara: e.target.value }))} className={inputCls}>
                <option value="">Selecione a aplicação...</option>
                <option>APDATA</option>
                <option>GB CONNECT</option>
                <option>MAXIMO PROD</option>
                <option>QUALIDADE PROD</option>
              </select>
            </div>
          )}

          {/* Aplicação - Smartphone */}
          {form.tipoOperacao === 'Smartphone' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aplicação</label>
              <select value={form.softwaresPara} onChange={e => setForm(f => ({ ...f, softwaresPara: e.target.value }))} className={inputCls}>
                <option value="">Selecione a aplicação...</option>
                <option>Corporativo</option>
                <option>Frontline</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('numeroChamado')}</label>
            <input type="text" value={form.numeroChamado} onChange={e => setForm(f => ({ ...f, numeroChamado: e.target.value }))}
              placeholder="Ex: INC0012345" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('dataAgendamento')}</label>
            <input type="datetime-local" value={form.dataAgendamento} onChange={e => setForm(f => ({ ...f, dataAgendamento: e.target.value }))} className={inputCls} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? 'Atribuindo...' : 'Atribuir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}