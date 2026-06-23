import { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, FolderOpen, Database, Users, Monitor, ClipboardList, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

// ── Componentes Premium ──────────────────────────────────────────────────────

function DropZone({ onFile, accept, label, icon: Icon, isDragActive, setDragActive }) {
  const ref = useRef()
  const [arquivo, setArquivo] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    setArquivo(file)
    onFile(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => ref.current.click()}
      className={`relative overflow-hidden group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
        ${isDragActive 
          ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:scale-[1.01]'}`}
    >
      {/* Background glow para drag active */}
      {isDragActive && (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 animate-pulse" />
      )}

      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handleFile(e.target.files[0])} />
      
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${isDragActive ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20'}`}>
        <Icon size={32} className={`transition-colors ${isDragActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
      </div>

      {arquivo ? (
        <div className="relative z-10 space-y-1">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400 break-all">{arquivo.name}</p>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {(arquivo.size / 1024).toFixed(1)} KB • Clique para trocar
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-1.5">
          <p className={`text-sm font-bold transition-colors ${isDragActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
            {label}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Arraste a planilha ou <span className="text-blue-600 dark:text-blue-400 font-medium">clique para procurar</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
            <span className="text-[10px] font-mono font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">.XLSX</span>
            <span className="text-[10px] font-mono font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">.XLS</span>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewRico({ preview }) {
  if (!preview) return null;

  return (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Database size={14} /> Pré-visualização da Leitura
        </h4>
        <span className="text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
          {preview.total} linhas válidas
        </span>
      </div>
      
      <div>
        <p className="text-[10px] text-slate-400 mb-2 font-medium">Colunas identificadas pelo sistema:</p>
        <div className="flex flex-wrap gap-1.5">
          {preview.colunas.map((col, idx) => (
            <span key={idx} className="text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded shadow-sm">
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultadoCard({ resultado }) {
  if (!resultado) return null
  
  const isSucesso = resultado.erros === 0
  const isParcial = resultado.erros > 0 && (resultado.criados > 0 || resultado.atualizados > 0)
  
  const bgClass = isSucesso 
    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
    : isParcial
      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
      : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'

  const textClass = isSucesso ? 'text-emerald-800 dark:text-emerald-300' : isParcial ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300'
  const Icon = isSucesso ? CheckCircle : AlertCircle

  return (
    <div className={`mt-4 p-5 rounded-xl border shadow-sm ${bgClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} className={isSucesso ? 'text-emerald-600 dark:text-emerald-400' : isParcial ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'} />
        <p className={`font-bold text-sm ${textClass}`}>{resultado.message}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-white/40 dark:border-white/5 text-center">
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Criados</p>
          <p className="text-xl font-black text-slate-800 dark:text-white">{resultado.criados || 0}</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-white/40 dark:border-white/5 text-center">
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">Atualizados</p>
          <p className="text-xl font-black text-slate-800 dark:text-white">{resultado.atualizados || 0}</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-white/40 dark:border-white/5 text-center">
          <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">Erros</p>
          <p className="text-xl font-black text-slate-800 dark:text-white">{resultado.erros || 0}</p>
        </div>
      </div>
      
      {resultado.erros > 0 && resultado.detalhesErros && resultado.detalhesErros.length > 0 && (
        <div className="mt-3 text-xs bg-red-100/50 dark:bg-red-500/20 text-red-800 dark:text-red-200 p-3 rounded-lg border border-red-200/50 dark:border-red-500/30 max-h-32 overflow-y-auto">
          <p className="font-bold mb-1 flex items-center gap-1"><Info size={12}/> Detalhes dos erros:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {resultado.detalhesErros.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
            {resultado.detalhesErros.length > 10 && <li>... e mais {resultado.detalhesErros.length - 10} erros.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ImportacaoPage() {
  const [arquivoUsuarios, setArquivoUsuarios] = useState(null)
  const [arquivoEquipamentos, setArquivoEquipamentos] = useState(null)
  const [arquivoSolicitacoes, setArquivoSolicitacoes] = useState(null)

  const [dragU, setDragU] = useState(false)
  const [dragE, setDragE] = useState(false)
  const [dragS, setDragS] = useState(false)

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

  const preview = async (arquivo, setPreviewState) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    try {
      const res = await api.post('/importacao/preview', form)
      setPreviewState(res.data)
    } catch { toast.error('Erro ao ler planilha ou colunas não encontradas') }
  }

  const importarUsuarios = async () => {
    if (!arquivoUsuarios) return toast.error('Selecione um arquivo')
    setLoadingU(true)
    const form = new FormData()
    form.append('arquivo', arquivoUsuarios)
    try {
      const res = await api.post('/importacao/usuarios', form)
      const r = res.data.resultado || {}
      const normalizado = {
        message: res.data.mensagem || 'Importação finalizada',
        criados: r.criados || 0,
        atualizados: r.pulados || 0, // usando 'pulados' como secundário para mostrar no grid
        erros: r.erros || 0,
        detalhesErros: (r.detalhes || []).filter(d => d.status === 'ERRO').map(d => `Linha ${d.linha}: ${d.motivo}`)
      }
      setResultadoU(normalizado)
      if (normalizado.erros === 0) toast.success('Importação de colaboradores 100% concluída')
      else toast.warning('Importação finalizada com algumas inconsistências')
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
      const normalizado = {
        message: res.data.mensagem || 'Importação finalizada',
        criados: res.data.criados || 0,
        atualizados: res.data.atualizados || 0,
        erros: res.data.erros || 0,
        detalhesErros: (res.data.detalhes || []).filter(d => d.status === 'ERRO').map(d => `Linha ${d.linha}: ${d.motivo}`)
      }
      setResultadoE(normalizado)
      if (normalizado.erros === 0) toast.success('Importação de equipamentos 100% concluída')
      else toast.warning('Importação finalizada com algumas inconsistências')
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
      const r = res.data.resultados || {}
      const errosArr = r.erros || []
      const sucessoArr = r.sucesso || []
      const normalizado = {
        message: res.data.mensagem || 'Importação finalizada',
        criados: sucessoArr.length,
        atualizados: 0,
        erros: errosArr.length,
        detalhesErros: errosArr.map(d => `Linha ${d.linha}: ${(d.erros || []).join(', ')}`)
      }
      setResultadoS(normalizado)
      if (normalizado.erros === 0) toast.success('Importação de solicitações 100% concluída')
      else toast.warning('Importação finalizada com algumas inconsistências')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro na importação') }
    setLoadingS(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Central de Importação
          </h1>
          <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
            Faça a carga inicial ou atualize os dados do sistema em massa. Selecione o tipo de registro que deseja importar, verifique as colunas exigidas e arraste sua planilha mágica.
          </p>
        </div>
      </div>

      {/* Grid de Importações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card: Colaboradores */}
        <div className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Colaboradores</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Tabela de Usuários</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-5 border border-slate-100 dark:border-white/5">
            <span className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-200">Colunas Opcionais/Obrigatórias:</span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Nome</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Email</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Função</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Unidade</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <DropZone 
              accept=".xlsx,.xls" 
              label="Planilha de Colaboradores"
              icon={FileSpreadsheet}
              isDragActive={dragU}
              setDragActive={setDragU}
              onFile={(f) => { setArquivoUsuarios(f); setResultadoU(null); preview(f, setPreviewU) }} 
            />
            
            <PreviewRico preview={previewU} />
            <ResultadoCard resultado={resultadoU} />
          </div>

          <div className="pt-5 mt-auto">
            <button onClick={importarUsuarios} disabled={!arquivoUsuarios || loadingU}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:shadow-none flex items-center justify-center gap-2">
              {loadingU ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processando Planilha...</> : 'Executar Importação'}
            </button>
          </div>
        </div>

        {/* Card: Equipamentos */}
        <div className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Equipamentos</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Base de Ativos TI</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-5 border border-slate-100 dark:border-white/5">
            <span className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-200">Colunas Opcionais/Obrigatórias:</span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Tipo</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Marca</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Modelo</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Serial</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Status</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Unidade</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {projetos.length > 0 && (
              <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FolderOpen size={13} /> Vincular ao Projeto
                </label>
                <select value={projetoIdSelecionado} onChange={e => setProjetoIdSelecionado(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option value="">Nenhum Projeto Específico</option>
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}{p.ativo ? ' (ATIVO ATUALMENTE)' : ''}</option>
                  ))}
                </select>
              </div>
            )}

            <DropZone 
              accept=".xlsx,.xls" 
              label="Planilha de Equipamentos"
              icon={FileSpreadsheet}
              isDragActive={dragE}
              setDragActive={setDragE}
              onFile={(f) => { setArquivoEquipamentos(f); setResultadoE(null); preview(f, setPreviewE) }} 
            />
            
            <PreviewRico preview={previewE} />
            <ResultadoCard resultado={resultadoE} />
          </div>

          <div className="pt-5 mt-auto">
            <button onClick={importarEquipamentos} disabled={!arquivoEquipamentos || loadingE}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:shadow-none flex items-center justify-center gap-2">
              {loadingE ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processando Planilha...</> : 'Executar Importação'}
            </button>
          </div>
        </div>

        {/* Card: Solicitações */}
        <div className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Solicitações</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Logística & Atendimentos</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-5 border border-slate-100 dark:border-white/5">
            <span className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-200">Colunas Opcionais/Obrigatórias:</span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Nº Chamado</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Tipo</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Descrição</span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Status</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <DropZone 
              accept=".xlsx,.xls" 
              label="Planilha de Solicitações"
              icon={FileSpreadsheet}
              isDragActive={dragS}
              setDragActive={setDragS}
              onFile={(f) => { setArquivoSolicitacoes(f); setResultadoS(null); preview(f, setPreviewS) }} 
            />
            
            <PreviewRico preview={previewS} />
            <ResultadoCard resultado={resultadoS} />
          </div>

          <div className="pt-5 mt-auto">
            <button onClick={importarSolicitacoes} disabled={!arquivoSolicitacoes || loadingS}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:shadow-none flex items-center justify-center gap-2">
              {loadingS ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processando Planilha...</> : 'Executar Importação'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
