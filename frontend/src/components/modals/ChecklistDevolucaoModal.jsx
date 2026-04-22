import { useState } from 'react'
import { X, ClipboardCheck } from 'lucide-react'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

export default function ChecklistDevolucaoModal({ atribuicao, onClose, onConfirm }) {
  const [estadoFisico, setEstadoFisico] = useState('sem_arranhoes')
  const [funcionamento, setFuncionamento] = useState('normal')
  const [acessorios, setAcessorios] = useState({ carregador: false, mouse: false })
  const [outrosAcessorios, setOutrosAcessorios] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const handleConfirm = () => {
    const checklist = {
      estadoFisico,
      funcionamento,
      acessorios: {
        ...acessorios,
        outros: outrosAcessorios || null,
      },
      observacoes: observacoes || null,
    }
    onConfirm(checklist)
  }

  const temProblema = estadoFisico === 'com_danos_visiveis' || funcionamento === 'com_problemas'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-blue-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Checklist de Devolução</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {atribuicao && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <div>
                <p className="text-xs text-slate-400">Colaborador</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{atribuicao.usuario?.nome}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-400">Equipamento</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {[atribuicao.equipamento?.marca, atribuicao.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
            </div>
          )}

          {/* Estado Físico */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Estado Físico</p>
            <div className="space-y-2">
              {[
                { value: 'sem_arranhoes', label: 'Sem arranhões' },
                { value: 'com_arranhoes_leves', label: 'Com arranhões leves' },
                { value: 'com_danos_visiveis', label: 'Com danos visíveis' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="estadoFisico"
                    value={opt.value}
                    checked={estadoFisico === opt.value}
                    onChange={() => setEstadoFisico(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className={`text-sm ${opt.value === 'com_danos_visiveis' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Funcionamento */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Funcionamento</p>
            <div className="space-y-2">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'com_problemas', label: 'Com problemas' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="funcionamento"
                    value={opt.value}
                    checked={funcionamento === opt.value}
                    onChange={() => setFuncionamento(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className={`text-sm ${opt.value === 'com_problemas' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Acessórios */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Acessórios Devolvidos</p>
            <div className="space-y-2">
              {[
                { key: 'carregador', label: 'Carregador' },
                { key: 'mouse', label: 'Mouse' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acessorios[item.key]}
                    onChange={e => setAcessorios(a => ({ ...a, [item.key]: e.target.checked }))}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                </label>
              ))}
              <div>
                <input
                  type="text"
                  value={outrosAcessorios}
                  onChange={e => setOutrosAcessorios(e.target.value)}
                  placeholder="Outros acessórios..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações adicionais sobre a devolução..."
              className={inputCls + ' resize-none'}
            />
          </div>

          {temProblema && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <span className="text-xs text-red-700 dark:text-red-400 font-medium">
                ⚠️ Será registrado como devolução com problema
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Confirmar Devolução
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
