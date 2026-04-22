import { useState } from 'react'
import { Bookmark, BookmarkCheck, X, ChevronDown } from 'lucide-react'

/**
 * Componente de filtros salvos reutilizável.
 * @param {Array} filtrosSalvos - Lista de filtros salvos
 * @param {Function} onSalvar - (nome, filtrosAtuais) => void
 * @param {Function} onAplicar - (filtros) => void
 * @param {Function} onRemover - (id) => void
 * @param {Object} filtrosAtuais - Objeto com os filtros ativos no momento
 */
export default function FiltrosSalvos({ filtrosSalvos, onSalvar, onAplicar, onRemover, filtrosAtuais }) {
  const [aberto, setAberto] = useState(false)
  const [nomeNovo, setNomeNovo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleSalvar = () => {
    if (!nomeNovo.trim()) return
    onSalvar(nomeNovo, filtrosAtuais)
    setNomeNovo('')
    setSalvando(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title="Filtros salvos"
      >
        <Bookmark size={13} />
        <span className="hidden sm:inline">Filtros salvos</span>
        {filtrosSalvos.length > 0 && (
          <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {filtrosSalvos.length}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Salvar filtros atuais</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nomeNovo}
                onChange={e => setNomeNovo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSalvar()}
                placeholder="Nome do filtro..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-white/5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                onClick={handleSalvar}
                disabled={!nomeNovo.trim()}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
              >
                Salvar
              </button>
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtrosSalvos.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <BookmarkCheck size={18} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs text-slate-400">Nenhum filtro salvo ainda</p>
              </div>
            ) : (
              filtrosSalvos.map(f => (
                <div key={f.id}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                  <button
                    onClick={() => { onAplicar(f.filtros); setAberto(false) }}
                    className="flex-1 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {f.nome}
                  </button>
                  <button
                    onClick={() => onRemover(f.id)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors shrink-0"
                    title="Remover"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
