import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 30000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // Envia idioma atual para o backend (usado nos PDFs)
  const lang = localStorage.getItem('lang') || 'pt'
  config.headers['x-lang'] = lang
  
  // Tenta pegar projetoAtivo do localStorage
  let projetoAtivo = localStorage.getItem('projetoAtivo')
  if (projetoAtivo) {
    try {
      const projeto = JSON.parse(projetoAtivo)
      if (projeto?.id) {
        config.headers['x-projeto-id'] = projeto.id
      }
    } catch (e) {
      console.error('[API] Erro ao parsear projetoAtivo:', e)
    }
  }
  
  // Não sobrescreve Content-Type se for FormData (deixa o browser setar com boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const isLoginEndpoint = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
