import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

const LANGS = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err) {
      setErro(err?.response?.data?.error || err?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">

      {/* Animated wave background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066CC" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0099FF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00CCFF" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#003399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0066CC" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00AAFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0055BB" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Wave 1 */}
          <path fill="url(#g1)" style={{ animation: 'wave1 8s ease-in-out infinite' }}>
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M1440,0 C1200,100 900,0 600,150 C300,300 100,200 0,300 L0,900 L1440,900 Z;
                M1440,0 C1100,150 800,50 500,200 C200,350 50,250 0,350 L0,900 L1440,900 Z;
                M1440,0 C1200,100 900,0 600,150 C300,300 100,200 0,300 L0,900 L1440,900 Z
              "
            />
          </path>

          {/* Wave 2 */}
          <path fill="url(#g2)" opacity="0.6" style={{ animation: 'wave2 10s ease-in-out infinite' }}>
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M1440,100 C1100,0 800,200 500,100 C200,0 100,150 0,200 L0,900 L1440,900 Z;
                M1440,50 C1200,200 900,100 600,250 C300,400 100,300 0,400 L0,900 L1440,900 Z;
                M1440,100 C1100,0 800,200 500,100 C200,0 100,150 0,200 L0,900 L1440,900 Z
              "
            />
          </path>

          {/* Wave 3 */}
          <path fill="url(#g3)" opacity="0.4">
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="
                M1440,200 C1000,100 700,300 400,200 C100,100 0,250 0,300 L0,900 L1440,900 Z;
                M1440,150 C1100,300 800,150 500,300 C200,450 50,350 0,450 L0,900 L1440,900 Z;
                M1440,200 C1000,100 700,300 400,200 C100,100 0,250 0,300 L0,900 L1440,900 Z
              "
            />
          </path>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-4 flex items-center justify-between">
        <img src="/logo-ntt.png" alt="NTT Data" className="h-8 object-contain" />
        <div className="flex items-center gap-1">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                i18n.language?.startsWith(l.code.toLowerCase())
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-100 p-8">

          <h2 className="text-xl font-bold text-slate-800 mb-1">{t('bemVindo')}</h2>
          <p className="text-slate-400 text-sm mb-6">{t('acesseSistema')}</p>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800 placeholder:text-slate-300 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('senha')}</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={t('senhaPlaceholder')}
                  className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800 placeholder:text-slate-300 bg-slate-50"
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1">
              {loading ? t('entrando') : t('entrar')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => navigate('/esqueci-senha')}
              className="text-sm text-blue-600 hover:underline">
              Esqueci minha senha
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-4">
        <p className="text-xs text-white/70 drop-shadow">Desenvolvido por NTT Data · v2.0.0 · 2026</p>
      </footer>
    </div>
  )
}
