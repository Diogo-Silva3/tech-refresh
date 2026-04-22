import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function RedefinirSenhaPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (novaSenha !== confirmar) return setErro('As senhas não coincidem')
    if (novaSenha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres')
    setErro('')
    setLoading(true)
    try {
      await api.post('/auth/redefinir-senha', { token, novaSenha })
      setSucesso(true)
    } catch (err) {
      setErro(err?.response?.data?.error || 'Token inválido ou expirado')
    }
    setLoading(false)
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Link inválido.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white dark:bg-[#0f1623] rounded-2xl shadow-xl border border-slate-200/60 dark:border-white/[0.05] p-7">
          <div className="mb-6">
            <h2 className="text-[17px] font-bold text-slate-800 dark:text-white">Redefinir senha</h2>
            <p className="text-slate-400 text-[13px] mt-0.5">Digite sua nova senha</p>
          </div>

          {sucesso ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Lock size={22} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha redefinida com sucesso!</p>
              <button onClick={() => navigate('/login')}
                className="mt-2 text-xs text-blue-500 hover:underline">Ir para o login</button>
            </div>
          ) : (
            <>
              {erro && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{erro}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nova Senha</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={show ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                      required minLength={6} placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Confirmar Senha</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={show ? 'text' : 'password'} value={confirmar} onChange={e => setConfirmar(e.target.value)}
                      required minLength={6} placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-[13px]">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Salvar nova senha <ArrowRight size={14} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
