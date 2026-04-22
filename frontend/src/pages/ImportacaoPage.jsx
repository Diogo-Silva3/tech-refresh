import { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

function DropZone({ onFile, accept, label }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)
  const [arquivo, setArquivo] = useState(null)

  const handleFile = (file) => { setArquivo(file); onFile(file) }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => ref.current.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${drag ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handleFile(e.target.files[0])} />
      <FileSpreadsheet size={32} className="mx-auto text-slate-400 mb-3" />
      {arquivo ? (
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{arquivo.name}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          <p className="text-xs text-slate-400 mt-1">Arraste ou clique para selecionar (.xlsx, .xls)</p>
        </>
      )}
    </div>
  )
}

function ResultadoCard({ resultado }) {
  if (!resultado) return null
  return (
    <div className={`p-4 rounded-xl border ${resultado.erros > 0 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        {resultado.erros > 0 ? <AlertCircle size={16} className="text-amber-600" /> : <CheckCircle size={16} className="text-green-600" />}
        <p className="font-medium text-slate-800 dark:text-slate-100">{resultado.message}</p>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-green-700 dark:text-green-400">✓ {resultado.criados} criados</span>
        <span className="text-blue-700 dark:text-blue-400">↻ {resultado.atualizados} atualizados</span>
        {resultado.erros > 0 && <span className="text-red-700 dark:text-red-400">✗ {resultado.erros} erros</span>}
      </div>
    </div>
  )
}

export default function ImportacaoPage() {
  const [arquivoUsuarios, setArquivoUsuarios] = useState(null)
  const [arquivoEquipamentos, setArquivoEquipamentos] = useState(null)
  const [arquivoSolicitacoes, setArquivoSolicitacoes] = useState(null)
  const [loadingU, setLoadingU] = useState(false)
  const [loadingE, setLoadingE] = useState(false)
  const [loadingS, setLoadingS] = useState(false)
  const [resultadoU, setResultadoU] = useState(null)
  const [resultadoE, setResultadoE] = useState(null)
  const [resultadoS, setResultadoS] = useState(null)
  const [previewU, setPreviewU] = useState(null)
  const [previewE, setPreviewE] = useState(null)
  const [previewS, setPreviewS] = useState(null)
  const [projetos, setProjetos] = useState([])
  const [projetoIdSelecionado, setProjetoIdSelecionado] = useState('')
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    api.get('/projetos').then(r => {
      setProjetos(r.data || [])
      const ativo = (r.data || []).find(p => p.ativo)
      if (ativo) setProjetoIdSelecionado(String(ativo.id))
    }).catch(() => {})
  }, [])

  const preview = async (arquivo, setPreview) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    try {
      const res = await api.post('/importacao/preview', form)
      setPreview(res.data)
    } catch { toast.error('Erro ao ler planilha') }
  }

  const importarUsuarios = async () => {
    if (!arquivoUsuarios) return toast.error('Selecione um arquivo')
    setLoadingU(true)
    const form = new FormData()
    form.append('arquivo', arquivoUsuarios)
    try {
      const res = await api.post('/importacao/usuarios', form)
      setResultadoU(res.data)
      toast.success('Importação de colaboradores concluída')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro na importação') }
    setLoadingU(false)
  }

  const importarEquipamentos = async () => {
    if (!arquivoEquipamentos) return toast.error('Selecione um arquivo')
    setLoadingE(true)
    const form = new FormData()
    form.append('arquivo', arquivoEquipamentos)
    if (projetoIdSelecionado) form.append('projetoId', projetoIdSelecionado)
    try {
      const res = await api.post('/importacao/equipamentos', form)
      setResultadoE(res.data)
      toast.success('Importação de equipamentos concluída')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro na importação') }
    setLoadingE(false)
  }

  const importarSolicitacoes = async () => {
    if (!arquivoSolicitacoes) return toast.error('Selecione um arquivo')
    setLoadingS(true)
    const form = new FormData()
    form.append('arquivo', arquivoSolicitacoes)
    try {
      const res = await api.post('/importacao/solicitacoes', form)
      setResultadoS(res.data)
      toast.success('Importação de solicitações concluída')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro na importação') }
    setLoadingS(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('importarPlanilha')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('importar')} {t('colaboradores').toLowerCase()} e {t('equipamentos').toLowerCase()}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Upload size={16} /> Importar Colaboradores
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
          Colunas esperadas: <strong>Nome</strong>, <strong>Função</strong> (ou Cargo), <strong>Email</strong>, <strong>Unidade</strong>
        </div>
        <DropZone accept=".xlsx,.xls" label="Selecionar planilha de colaboradores"
          onFile={(f) => { setArquivoUsuarios(f); setResultadoU(null); preview(f, setPreviewU) }} />
        {previewU && (
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <p className="font-medium mb-1">Preview ({previewU.total} linhas) — Colunas: {previewU.colunas.join(', ')}</p>
          </div>
        )}
        <ResultadoCard resultado={resultadoU} />
        <button onClick={importarUsuarios} disabled={!arquivoUsuarios || loadingU}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {loadingU ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('carregando')}</> : `${t('importar')} ${t('colaboradores')}`}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Upload size={16} /> Importar Equipamentos
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
          Colunas esperadas: <strong>Tipo</strong>, <strong>Marca</strong>, <strong>Modelo</strong>, <strong>Serial</strong> (ou N° Serie), <strong>Status</strong>, <strong>Unidade</strong>
        </div>
        {projetos.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FolderOpen size={12} /> Vincular ao Projeto
            </label>
            <select value={projetoIdSelecionado} onChange={e => setProjetoIdSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">Sem projeto</option>
              {projetos.map(p => (
                <option key={p.id} value={p.id}>{p.nome}{p.ativo ? ' (ativo)' : ''}</option>
              ))}
            </select>
          </div>
        )}
        <DropZone accept=".xlsx,.xls" label="Selecionar planilha de equipamentos"
          onFile={(f) => { setArquivoEquipamentos(f); setResultadoE(null); preview(f, setPreviewE) }} />
        {previewE && (
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <p className="font-medium mb-1">Preview ({previewE.total} linhas) — Colunas: {previewE.colunas.join(', ')}</p>
          </div>
        )}
        <ResultadoCard resultado={resultadoE} />
        <button onClick={importarEquipamentos} disabled={!arquivoEquipamentos || loadingE}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {loadingE ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('carregando')}</> : `${t('importar')} ${t('equipamentos')}`}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Upload size={16} /> Importar Solicitações
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
          Colunas esperadas: <strong>Número</strong>, <strong>Criado</strong>, <strong>DESCRIÇÃO</strong>, <strong>CHAMADO</strong>, <strong>Atribuído a</strong>, <strong>STATUS</strong>, <strong>Data da definição</strong>, <strong>Data da emissão da nota</strong>, <strong>Data da coleta</strong>, <strong>Previsão de chegada</strong>, <strong>Data de chegada</strong>, <strong>Data da Entrega</strong>, <strong>OBS</strong>
        </div>
        <DropZone accept=".xlsx,.xls" label="Selecionar planilha de solicitações"
          onFile={(f) => { setArquivoSolicitacoes(f); setResultadoS(null); preview(f, setPreviewS) }} />
        {previewS && (
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <p className="font-medium mb-1">Preview ({previewS.total} linhas) — Colunas: {previewS.colunas.join(', ')}</p>
          </div>
        )}
        <ResultadoCard resultado={resultadoS} />
        <button onClick={importarSolicitacoes} disabled={!arquivoSolicitacoes || loadingS}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {loadingS ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('carregando')}</> : 'Importar Solicitações'}
        </button>
      </div>
    </div>
  )
}
