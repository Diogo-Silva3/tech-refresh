import { useState, useEffect } from 'react'
import { X, Search, ArrowLeftRight } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white'

export default function TransferirModal({ atribuicao, onClose, onSave }) {
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [colaboradores, setColaboradores] = useState([])
  const [destinoId, setDestinoId] = useState('')
  const [destinoNome, setDestinoNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busca.length >= 1) {
        try {
          const res = await api.get(`/usuarios?semAcesso=true&busca=${busca}&limit=500`)
          setColaboradores(res.data.data || [])
        } catch {
          setColaboradores([])
        }
      } else {
        setColaboradores([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destinoId) return setErro('Selecione um colaborador de destino')
    setErro('')
    setLoading(true)
    try {
      await api.post(`/vinculacoes/${atribuicao.id}/transferir`, { usuarioDestinoId: destinoId })
      toast.success('Equipamento transferido com sucesso')
      onSave()
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao transferir equipamento')
    }
    setLoading(false)
  }

  const equipamentoNome = [atribuicao.equipamento?.marca, atribuicao.equipamento?.modelo]
    .filter(Boolean).join(' ') || atribuicao.equipamento?.tipo || '—'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-blue-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Transferir Equipamento</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Resumo da atribuição atual */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Colaborador atual</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{atribuicao.usuario?.nome}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Equipamento</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{equipamentoNome}</span>
            </div>
            {atribuicao.equipamento?.serialNumber && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Serial</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{atribuicao.equipamento.serialNumber}</span>
              </div>
            )}
          </div>

          {/* Busca de colaborador de destino */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Colaborador de destino *
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setDestinoId(''); setDestinoNome(''); setErro('') }}
                className="pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white w-full"
              />
            </div>

            {colaboradores.length > 0 && !destinoId && (
              <div className="mt-1 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden max-h-44 overflow-y-auto shadow-sm bg-white dark:bg-slate-800">
                {colaboradores.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setDestinoId(u.id); setDestinoNome(u.nome); setBusca(u.nome); setColaboradores([]) }}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0"
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-100">{u.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {u.funcao && <span className="text-xs text-slate-500">{u.funcao}</span>}
                      {u.unidade?.nome && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {u.unidade.nome}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {destinoId && (
              <div className="mt-1.5 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">✓ {destinoNome}</span>
                <button
                  type="button"
                  onClick={() => { setDestinoId(''); setDestinoNome(''); setBusca('') }}
                  className="text-xs text-slate-400 hover:text-red-500 ml-auto"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !destinoId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ArrowLeftRight size={14} />
              }
              {loading ? 'Transferindo...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
