import { useEffect, useState } from 'react'
import { FolderOpen, Plus, X, Calendar, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/5 text-slate-800 dark:text-white'

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">{editando ? `${t('editar')} ${t('projetos').slice(0,-1)}` : `${t('novo')} ${t('projetos').slice(0,-1)}`}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('projetos').slice(0,-1)} *</label>
            <input className={inputCls} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Tech Refresh 2026" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Início</label>
              <input type="date" className={inputCls} value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fim</label>
              <input type="date" className={inputCls} value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">{t('cancelar')}</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? t('carregando') : t('salvar')}
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
    // Atualiza projetoAtivo no contexto se o projeto editado for o ativo
    if (editando && projetoAtivo?.id === editando.id && lista) {
      const atualizado = lista.find(p => p.id === editando.id)
      if (atualizado) setProjetoAtivo(atualizado)
    }
    setEditando(null)
  }

  const toggleAtivo = async (projeto) => {
    try {
      await api.put(`/projetos/${projeto.id}`, { nome: projeto.nome, ativo: !projeto.ativo })
      toast.success(projeto.ativo ? 'Projeto encerrado' : 'Projeto reativado')
      carregar()
    } catch { toast.error('Erro ao atualizar projeto') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('projetos')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {clienteAtivo ? `Cliente: ${clienteAtivo.nome}` : t('selecioneColaborador')} · {projetos.length} {t('projetos').toLowerCase()}
          </p>
        </div>
        {clienteAtivo && (
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> {t('novo')} {t('projetos').slice(0,-1)}
          </button>
        )}
      </div>

      {!clienteAtivo ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center">
          <FolderOpen size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Selecione um cliente no menu lateral para ver os projetos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-36" />
            ))
          ) : projetos.length === 0 ? (
            <div className="col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center">
              <FolderOpen size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhum projeto cadastrado</p>
            </div>
          ) : projetos.map(p => (
            <div key={p.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 ${p.ativo ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/15 rounded-xl flex items-center justify-center">
                    <FolderOpen size={18} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{p.nome}</p>
                    {p.descricao && <p className="text-xs text-slate-400 mt-0.5">{p.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setEditando(p); setModalOpen(true) }}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                    {p.ativo ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
              </div>
              {(p.dataInicio || p.dataFim) && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                  <Calendar size={11} />
                  {p.dataInicio && <span>{new Date(p.dataInicio).toLocaleDateString('pt-BR')}</span>}
                  {p.dataInicio && p.dataFim && <span>→</span>}
                  {p.dataFim && <span>{new Date(p.dataFim).toLocaleDateString('pt-BR')}</span>}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span>{p._count?.equipamentos || 0} equipamentos</span>
                <span>{p._count?.usuarios || 0} colaboradores</span>
              </div>
              <button onClick={() => toggleAtivo(p)}
                className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${p.ativo ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-400'}`}>
                {p.ativo ? 'Encerrar Projeto' : 'Reativar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <ProjetoModal projeto={editando} onClose={() => { setModalOpen(false); setEditando(null) }} onSave={handleSave} />}
    </div>
  )
}
