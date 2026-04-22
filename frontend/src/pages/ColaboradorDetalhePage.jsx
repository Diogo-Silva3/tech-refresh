import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Monitor, Link2, User, Building2, Mail, Briefcase } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import StatusBadge from '../components/StatusBadge'

export default function ColaboradorDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [colaborador, setColaborador] = useState(null)
  const [vinculacoes, setVinculacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const [colRes, vinRes] = await Promise.all([
          api.get(`/usuarios/${id}`),
          api.get(`/vinculacoes?usuarioId=${id}&limit=100`),
        ])
        setColaborador(colRes.data)
        setVinculacoes(vinRes.data || [])
      } catch {
        toast.error('Erro ao carregar colaborador')
        navigate('/usuarios')
      }
      setLoading(false)
    }
    carregar()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!colaborador) return null

  const ativas = vinculacoes.filter(v => v.ativa)
  const historico = vinculacoes.filter(v => !v.ativa)

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/usuarios')}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{colaborador.nome}</h1>
          <p className="text-slate-400 text-xs mt-0.5">Detalhe do colaborador</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
            {colaborador.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5"><Mail size={10} /> Email</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{colaborador.email || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5"><Briefcase size={10} /> Função</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{colaborador.funcao || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5"><Building2 size={10} /> Unidade</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{colaborador.unidade?.nome || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5"><User size={10} /> Matrícula</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{colaborador.matricula || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Status</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colaborador.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}>
                {colaborador.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipamentos ativos */}
      <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <Monitor size={14} className="text-emerald-500" />
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Equipamentos em Uso</p>
          <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">{ativas.length}</span>
        </div>
        {ativas.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">Nenhum equipamento vinculado atualmente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/3">
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Equipamento</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Serial</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Status</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Desde</th>
                </tr>
              </thead>
              <tbody>
                {ativas.map(v => (
                  <tr key={v.id}
                    onClick={() => navigate(`/equipamentos/${v.equipamento?.id}`)}
                    className="border-t border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 cursor-pointer transition-colors">
                    <td className="py-2.5 px-4 text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      {[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400 font-mono">{v.equipamento?.serialNumber || '—'}</td>
                    <td className="py-2.5 px-4"><StatusBadge status={v.equipamento?.status} /></td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de vinculações */}
      <div className="bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <Link2 size={14} className="text-slate-400" />
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Histórico de Vinculações</p>
          <span className="ml-auto text-xs bg-slate-100 dark:bg-white/8 text-slate-500 px-2 py-0.5 rounded-full font-medium">{historico.length}</span>
        </div>
        {historico.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">Nenhum histórico de vinculação</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/3">
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Equipamento</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Serial</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Início</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Devolução</th>
                  <th className="text-left py-2.5 px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(v => (
                  <tr key={v.id}
                    onClick={() => navigate(`/equipamentos/${v.equipamento?.id}`)}
                    className="border-t border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 cursor-pointer transition-colors">
                    <td className="py-2.5 px-4 text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      {[v.equipamento?.marca, v.equipamento?.modelo].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400 font-mono">{v.equipamento?.serialNumber || '—'}</td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400">{v.dataFim ? new Date(v.dataFim).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-500 dark:text-slate-400">{v.motivoDevolucao || '—'}</td>
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
