import { useEffect, useState } from 'react'
import { FolderOpen, Plus, X, Calendar, Pencil, LayoutGrid, Monitor, Users, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all'

function ProjetoModal({ projeto, onClose, onSave }) {
  const toast = useToast()
  const { t } = useTranslation()
  const editando = !!projeto
  const [form, setForm] = useState({
    nome: projeto?.nome || '',
    descricao: projeto?.descricao || '',
    dataInicio: projeto?.dataInicio ? projeto.dataInicio.split('T')[0] : '',
    dataFim: projeto?.dataFim ? projeto.dataFim.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editando) {
        await api.put(`/projetos/${projeto.id}`, form)
        toast.success(t('salvoSucesso'))
      } else {
        await api.post('/projetos', form)
        toast.success(t('salvoSucesso'))
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || t('erroSalvar'))
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FolderOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{editando ? `Editar Projeto` : `Novo Projeto`}</h2>
              <p className="text-violet-100 text-xs">Defina o escopo e o cronograma</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nome do Projeto *</label>
              <input className={inputCls} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Tech Refresh Brasil 2026" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Descrição</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes ou objetivo do projeto..." />
            </div>
            
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">Cronograma (Opcional)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                  <input type="date" className={`${inputCls} pl-9`} value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
                  <span className="absolute -top-2 left-2 bg-white dark:bg-[#1a2235] px-1 text-[10px] font-bold text-slate-400">Data de Início</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                  <input type="date" className={`${inputCls} pl-9`} value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
                  <span className="absolute -top-2 left-2 bg-white dark:bg-[#1a2235] px-1 text-[10px] font-bold text-slate-400">Data Fim</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 transition-all flex justify-center items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editando ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const { clienteAtivo, projetoAtivo, setProjetoAtivo } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/projetos')
      setProjetos(res.data)
      return res.data
    } catch (err) {
      toast.error('Erro ao carregar projetos')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [clienteAtivo])

  const handleSave = async () => {
    setModalOpen(false)
    const lista = await carregar()
    if (editando && projetoAtivo?.id === editando.id && lista) {
      const atualizado = lista.find(p => p.id === editando.id)
      if (atualizado) setProjetoAtivo(atualizado)
    }
    setEditando(null)
  }

  const toggleAtivo = async (projeto) => {
    try {
      await api.put(`/projetos/${projeto.id}`, { nome: projeto.nome, ativo: !projeto.ativo })
      toast.success(projeto.ativo ? 'Projeto suspenso com sucesso' : 'Projeto reativado com sucesso')
      carregar()
    } catch { toast.error('Erro ao atualizar status do projeto') }
  }

  return (
    <div className="space-y-6">
      {/* Header Premium (Dinâmico conforme seleção de Cliente) */}
      {!clienteAtivo ? (
        <div className="flex flex-col items-center justify-center bg-slate-800 dark:bg-slate-900/50 rounded-2xl border border-slate-700 dark:border-white/5 py-16 px-6 text-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          <div className="relative z-10 w-20 h-20 bg-slate-700 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-600 dark:border-white/10 animate-bounce-slow">
            <Building2 size={32} className="text-blue-400" />
          </div>
          <h2 className="relative z-10 text-2xl font-black text-white mb-2">Nenhum Cliente Selecionado</h2>
          <p className="relative z-10 text-slate-400 max-w-md">Para visualizar ou gerenciar projetos, você precisa primeiro selecionar um cliente no menu de navegação lateral.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-r from-violet-700 to-fuchsia-700 dark:from-violet-900/80 dark:to-fuchsia-900/50 p-6 sm:p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FolderOpen size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                  Cliente: {clienteAtivo.nome}
                </span>
              </div>
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                Projetos
              </h1>
              <p className="text-violet-100 text-sm max-w-xl leading-relaxed">
                Organize seu inventário em diferentes projetos. Cada projeto possui seu próprio escopo, cronograma e equipamentos alocados.
              </p>
            </div>
            <div className="relative z-10">
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all backdrop-blur-sm">
                <Plus size={18} /> Novo Projeto
              </button>
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/5 p-6 animate-pulse h-48" />
              ))
            ) : projetos.length === 0 ? (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white dark:bg-[#1a2235] rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
                <LayoutGrid size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum projeto encontrado</h3>
                <p className="text-sm text-slate-500 dark:text-slate-500">Este cliente ainda não possui projetos cadastrados.</p>
              </div>
            ) : projetos.map(p => {
              const isAtivo = p.ativo;
              return (
                <div key={p.id} className={`group bg-white dark:bg-[#1a2235] rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${isAtivo ? 'border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50' : 'border-slate-200 dark:border-white/5 opacity-70 grayscale-[0.5]'}`}>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isAtivo ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                        <FolderOpen size={22} />
                      </div>
                      <div className="max-w-[150px]">
                        <p className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate" title={p.nome}>{p.nome}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block ${isAtivo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                          {isAtivo ? 'Em Andamento' : 'Encerrado'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => { setEditando(p); setModalOpen(true) }}
                      className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
                      <Pencil size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                    {p.descricao || 'Nenhuma descrição fornecida para este projeto.'}
                  </p>

                  <div className="flex flex-col gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                    {/* Linha do tempo visual */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5"><Calendar size={12}/> Início</div>
                      <div className="flex items-center gap-1.5"><Calendar size={12}/> Fim</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.dataInicio ? new Date(p.dataInicio).toLocaleDateString('pt-BR') : '—'}</span>
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${isAtivo ? 'bg-violet-500' : 'bg-slate-400'} w-full rounded-full opacity-50`}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.dataFim ? new Date(p.dataFim).toLocaleDateString('pt-BR') : '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Equipamentos</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <Monitor size={14} className="text-blue-500" /> {p._count?.equipamentos || 0}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Colaboradores</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <Users size={14} className="text-indigo-500" /> {p._count?.usuarios || 0}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => toggleAtivo(p)}
                    className={`w-full text-xs font-bold py-2.5 rounded-xl border transition-colors ${isAtivo ? 'border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:border-white/10 dark:text-slate-400 dark:hover:border-red-500/30 dark:hover:text-red-400 dark:hover:bg-red-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10'}`}>
                    {isAtivo ? 'Encerrar Projeto' : 'Reativar Projeto'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {modalOpen && <ProjetoModal projeto={editando} onClose={() => { setModalOpen(false); setEditando(null) }} onSave={handleSave} />}
    </div>
  )
}
