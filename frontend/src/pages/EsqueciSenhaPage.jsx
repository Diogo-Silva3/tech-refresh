import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await api.post('/auth/esqueci-senha', { email })
      setEnviado(true)
    } catch (err) {
      setErro(err?.response?.data?.error || 'Erro ao processar solicitação')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={14} /> Voltar ao login
        </button>

        <div className="bg-white dark:bg-[#0f1623] rounded-2xl shadow-xl border border-slate-200/60 dark:border-white/[0.05] p-7">
          <div className="mb-6">
            <h2 className="text-[17px] font-bold text-slate-800 dark:text-white">Esqueci minha senha</h2>
            <p className="text-slate-400 text-[13px] mt-0.5">Informe seu e-mail para receber as instruções</p>
          </div>

          {enviado ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Mail size={22} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail enviado!</p>
              <p className="text-xs text-slate-400">Se o e-mail estiver cadastrado, você receberá as instruções em breve. Verifique sua caixa de entrada.</p>
              <button onClick={() => navigate('/login')}
                className="mt-2 text-xs text-blue-500 hover:underline">Voltar ao login</button>
            </div>
          ) : (
            <>
              {erro && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{erro}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 dark:text-white" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-[13px]">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <> Enviar instruções <ArrowRight size={14} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
