import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ titulo, mensagem, onConfirm, onCancel, tipo = 'danger' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${tipo === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          <AlertTriangle size={22} className={tipo === 'danger' ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white text-center mb-1">{titulo}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{mensagem}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg ${tipo === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'}`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
