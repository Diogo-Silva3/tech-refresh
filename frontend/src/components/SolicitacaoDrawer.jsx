import { X, Calendar, User, Building2, Package, Clock, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

const TIPO_BADGE = {
  TROCA:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  NOVO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  RETORNO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  ENVIO:   'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
}

const ETAPAS = [
  { key: 'dataDefinicao', label: 'Definição', icon: FileText },
  { key: 'dataSolicitacaoNF', label: 'Solicitação NF', icon: FileText },
  { key: 'dataEmissaoNF', label: 'Emissão NF', icon: FileText },
  { key: 'dataSolicitacaoColeta', label: 'Solicitação Coleta', icon: Package },
  { key: 'dataColeta', label: 'Coleta', icon: Package },
  { key: 'previsaoChegada', label: 'Previsão Chegada', icon: Clock },
  { key: 'dataChegada', label: 'Chegada', icon: Calendar },
  { key: 'dataEntrega', label: 'Entrega', icon: Calendar },
]

function formatDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(date) {
  if (!date) return null
  return new Date(date).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function SolicitacaoDrawer({ solicitacaoId, onClose }) {
  const [solicitacao, setSolicitacao] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!solicitacaoId) return
    
    const carregar = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/solicitacoes/${solicitacaoId}`)
        setSolicitacao(res.data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    
    carregar()
  }, [solicitacaoId])

  if (!solicitacaoId) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-[#0f1729] shadow-2xl z-50 overflow-y-auto animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0f1729] border-b border-slate-200 dark:border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Detalhes da Solicitação</h2>
            {solicitacao && (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{solicitacao.numeroChamado}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : solicitacao ? (
            <>
              {/* Informações Básicas */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TIPO_BADGE[solicitacao.tipo] || 'bg-slate-100 text-slate-500'}`}>
                    {solicitacao.tipo}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    solicitacao.status === 'ENCERRADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                    solicitacao.status === 'EM_ANDAMENTO' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' :
                    'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400'
                  }`}>
                    {solicitacao.status === 'EM_ANDAMENTO' ? 'Em andamento' : solicitacao.status === 'ENCERRADO' ? 'Encerrado' : 'Aberto'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    {solicitacao.estado}
                  </span>
                </div>

                {solicitacao.descricao && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Descrição</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{solicitacao.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {solicitacao.tecnico && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Técnico</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{solicitacao.tecnico.nome}</p>
                      </div>
                    </div>
                  )}
                  {solicitacao.unidade && (
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Unidade</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{solicitacao.unidade.nome}</p>
                      </div>
                    </div>
                  )}
                </div>

                {solicitacao.observacoes && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Observações</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{solicitacao.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Timeline de Etapas */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Timeline de Etapas</h3>
                <div className="space-y-3">
                  {ETAPAS.map((etapa, idx) => {
                    const data = solicitacao[etapa.key]
                    const concluida = !!data
                    const Icon = etapa.icon
                    
                    return (
                      <div key={etapa.key} className="flex gap-3">
                        {/* Linha vertical */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            concluida 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                          }`}>
                            <Icon size={14} />
                          </div>
                          {idx < ETAPAS.length - 1 && (
                            <div className={`w-0.5 h-8 ${concluida ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                          )}
                        </div>
                        
                        {/* Conteúdo */}
                        <div className="flex-1 pb-2">
                          <p className={`text-sm font-medium ${concluida ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                            {etapa.label}
                          </p>
                          {data && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatDate(data)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Histórico de Alterações */}
              {solicitacao.auditoria && solicitacao.auditoria.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Histórico de Alterações</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {solicitacao.auditoria.map((log) => (
                      <div key={log.id} className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{log.campo}</span>
                          <span className="text-slate-400">{formatDateTime(log.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <span className="line-through">{log.valorAnterior || '—'}</span>
                          <span>→</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{log.valorNovo || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-200 dark:border-white/8">
                <p>Criado em: {formatDateTime(solicitacao.dataCriacao || solicitacao.createdAt)}</p>
                <p>Última atualização: {formatDateTime(solicitacao.updatedAt)}</p>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Solicitação não encontrada</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
