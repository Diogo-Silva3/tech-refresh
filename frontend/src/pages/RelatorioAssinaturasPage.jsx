import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, FileSpreadsheet, PenLine } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

export default function RelatorioAssinaturasPage() {
  const [atribuicoes, setAtribuicoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    api.get('/relatorios/assinaturas')
      .then(r => setAtribuicoes(r.data || []))
      .catch(() => toast.error('Erro ao carregar assinaturas'))
      .finally(() => setLoading(false))
  }, [])

  const exportarPDF = async () => {
    setLoadingPDF(true)
    try {
      const res = await api.get('/relatorios/assinaturas/pdf', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([res.data]))
      a.setAttribute('download', `assinaturas-${Date.now()}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      toast.success('PDF gerado com sucesso')
    } catch { toast.error('Erro ao gerar PDF') }
    setLoadingPDF(false)
  }

  const exportarExcel = async () => {
    setLoadingExcel(true)
    try {
      const res = await api.get('/relatorios/assinaturas/excel', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([res.data]))
      a.setAttribute('download', `assinaturas-${Date.now()}.xlsx`)
      document.body.appendChild(a); a.click(); a.remove()
      toast.success('Excel gerado com sucesso')
    } catch { toast.error('Erro ao gerar Excel') }
    setLoadingExcel(false)
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/relatorios')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PenLine size={20} className="text-blue-500" /> Relatório de Assinaturas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{atribuicoes.length} registros com assinatura</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarPDF} disabled={loadingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors">
            {loadingPDF
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FileText size={13} /> PDF</>}
          </button>
          <button onClick={exportarExcel} disabled={loadingExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors">
            {loadingExcel
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FileSpreadsheet size={13} /> Excel</>}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : atribuicoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <PenLine size={24} className="text-slate-300" />
            <p className="text-sm text-slate-400">Nenhuma assinatura registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Colaborador', 'Equipamento', 'Serial', 'Técnico', 'Data de Entrega', 'Assinatura'].map(h => (
                    <th key={h} className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atribuicoes.map(v => (
                  <tr key={v.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-100 text-xs">{v.usuario?.nome || '—'}</p>
                      <p className="text-[10px] text-slate-400">{v.usuario?.funcao || ''}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {v.equipamento?.serialNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {v.tecnico?.nome || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {v.dataFim ? new Date(v.dataFim).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {v.assinatura ? (
                        <img
                          src={v.assinatura}
                          alt="Assinatura"
                          className="max-h-12 border border-slate-200 dark:border-slate-600 rounded bg-white"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
