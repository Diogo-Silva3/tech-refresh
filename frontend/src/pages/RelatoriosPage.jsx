import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, FileSpreadsheet, Tag, BarChart3, Users, Link2, Building2, Package, CalendarDays, AlertTriangle, Clock, Wrench, PenLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

function BtnPDF({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors min-w-[60px] justify-center">
      {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FileText size={13} /> PDF</>}
    </button>
  )
}

function BtnExcel({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors min-w-[68px] justify-center">
      {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FileSpreadsheet size={13} /> Excel</>}
    </button>
  )
}

export default function RelatoriosPage() {
  const [loadings, setLoadings] = useState({})
  const toast = useToast()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const RELATORIOS = [
    { tipo: 'geral',        icon: BarChart3,    label: t('todosEquipamentos'),                        desc: t('gerarRelatorios') },
    { tipo: 'disponiveis',  icon: Package,      label: t('disponiveis'),                              desc: t('semEquipamento') },
    { tipo: 'colaboradores',icon: Users,        label: t('colaboradores'),                            desc: t('colaboradores') },
    { tipo: 'vinculacoes',  icon: Link2,        label: t('atribuicoes'),                              desc: t('atribuicoes') },
    { tipo: 'porUnidade',   icon: Building2,    label: t('porUnidade'),                               desc: t('porUnidade') },
    { tipo: 'colabSemEquip',icon: Users,        label: `${t('colaboradores')} ${t('semEquipamento')}`, desc: t('semEquipamento') },
    { tipo: 'equipSemColab',icon: Package,      label: `Equipamentos sem Colaborador`,  desc: 'Equipamentos sem atribuição ativa' },
    { tipo: 'preparacao',   icon: Wrench,       label: t('preparacao'),                               desc: t('preparacao') },
    { tipo: 'agendamentos', icon: CalendarDays, label: t('agendamentosSemana'),                       desc: t('agendamentosSemana') },
    { tipo: 'improdutivos', icon: AlertTriangle,label: t('improdutivos'),                             desc: t('naoComparecimentos') },
    { tipo: 'sla',          icon: Clock,        label: t('sla'),                                      desc: t('tempoMedioTotal') },
  ]

  const setLoading = (key, val) => setLoadings(prev => ({ ...prev, [key]: val }))

  const exportarPDF = async (tipo) => {
    const key = 'pdf-' + tipo
    setLoading(key, true)
    const lang = i18n.language?.substring(0, 2) || 'pt'
    try {
      const url = tipo === 'improdutivos'
        ? `/relatorios/exportar/improdutivos?formato=pdf&lang=${lang}`
        : `/relatorios/exportar/pdf?tipo=${tipo}&lang=${lang}`
      const res = await api.get(url, { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([res.data]))
      a.setAttribute('download', `${tipo}-${Date.now()}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      toast.success('PDF gerado com sucesso')
    } catch { toast.error('Erro ao gerar PDF') }
    setLoading(key, false)
  }

  const exportarExcel = async (tipo) => {
    const key = 'excel-' + tipo
    setLoading(key, true)
    try {
      const url = tipo === 'improdutivos' ? '/relatorios/exportar/improdutivos?formato=excel' : `/relatorios/exportar/excel?tipo=${tipo}`
      const res = await api.get(url, { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([res.data]))
      a.setAttribute('download', `${tipo}-${Date.now()}.xlsx`)
      document.body.appendChild(a); a.click(); a.remove()
      toast.success('Excel gerado com sucesso')
    } catch { toast.error('Erro ao gerar Excel') }
    setLoading(key, false)
  }

  const exportarEtiquetas = async () => {
    setLoading('etiquetas', true)
    try {
      const res = await api.get('/relatorios/exportar/etiquetas', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([res.data]))
      a.setAttribute('download', `etiquetas-${Date.now()}.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
      toast.success('Etiquetas geradas com sucesso')
    } catch { toast.error('Erro ao gerar etiquetas') }
    setLoading('etiquetas', false)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('relatorios')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('gerarRelatorios')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] items-center px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('relatorios')}</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('exportar')}</span>
        </div>

        {RELATORIOS.map((r, i) => {
          const Icon = r.icon
          return (
            <div key={r.tipo}
              className={`flex items-center justify-between px-5 py-4 ${i < RELATORIOS.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <BtnPDF onClick={() => exportarPDF(r.tipo)} loading={loadings['pdf-' + r.tipo]} />
                <BtnExcel onClick={() => exportarExcel(r.tipo)} loading={loadings['excel-' + r.tipo]} />
              </div>
            </div>
          )
        })}

        <div className="flex items-center justify-between px-5 py-4 bg-violet-50 dark:bg-violet-500/5 border-t border-violet-100 dark:border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
              <Tag size={15} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t('etiquetasQR')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('etiquetasDesc')}</p>
            </div>
          </div>
          <button onClick={exportarEtiquetas} disabled={loadings['etiquetas']}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors min-w-[90px] justify-center">
            {loadings['etiquetas']
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Tag size={13} /> {t('etiquetasQR')}</>}
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-blue-50 dark:bg-blue-500/5 border-t border-blue-100 dark:border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <PenLine size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Assinaturas de Entrega</p>
              <p className="text-xs text-slate-400 mt-0.5">Visualizar e exportar assinaturas coletadas</p>
            </div>
          </div>
          <button onClick={() => navigate('/relatorios/assinaturas')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
            <PenLine size={13} /> Ver relatório
          </button>
        </div>
      </div>
    </div>
  )
}
