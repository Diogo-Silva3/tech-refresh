import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clienteAtivo, setClienteAtivoState] = useState(() => {
    const saved = localStorage.getItem('clienteAtivo')
    return saved ? JSON.parse(saved) : null
  })
  const [projetoAtivo, setProjetoAtivoState] = useState(() => {
    const saved = localStorage.getItem('projetoAtivo')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (clienteAtivo?.id) {
      api.defaults.headers.common['x-empresa-id'] = clienteAtivo.id
    } else {
      delete api.defaults.headers.common['x-empresa-id']
    }
  }, [clienteAtivo])

  useEffect(() => {
    if (projetoAtivo?.id) {
      api.defaults.headers.common['x-projeto-id'] = projetoAtivo.id
      console.log('[AUTH] Header x-projeto-id setado:', projetoAtivo.id)
    } else {
      delete api.defaults.headers.common['x-projeto-id']
    }
  }, [projetoAtivo])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const savedCliente = localStorage.getItem('clienteAtivo')
      if (savedCliente) api.defaults.headers.common['x-empresa-id'] = JSON.parse(savedCliente).id
      const savedProjeto = localStorage.getItem('projetoAtivo')
      if (savedProjeto) api.defaults.headers.common['x-projeto-id'] = JSON.parse(savedProjeto).id
      api.get('/auth/me')
        .then(res => {
          setUsuario(res.data)
          // Se técnico tem projetoId atribuído e não está em localStorage, seta automaticamente
          if (res.data.role === 'TECNICO' && res.data.projetoId && !savedProjeto) {
            const projetoAtivo = { id: res.data.projetoId }
            localStorage.setItem('projetoAtivo', JSON.stringify(projetoAtivo))
            api.defaults.headers.common['x-projeto-id'] = res.data.projetoId
            setProjetoAtivoState(projetoAtivo)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('clienteAtivo')
          localStorage.removeItem('projetoAtivo')
          delete api.defaults.headers.common['Authorization']
          delete api.defaults.headers.common['x-empresa-id']
          delete api.defaults.headers.common['x-projeto-id']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha })
    const { token, usuario } = res.data
    
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // FORÇA salvar projetoId para técnico
    if (usuario.role === 'TECNICO' && usuario.projetoId) {
      localStorage.setItem('projetoAtivo', JSON.stringify({ id: usuario.projetoId }))
      api.defaults.headers.common['x-projeto-id'] = usuario.projetoId
      setProjetoAtivoState({ id: usuario.projetoId })
    }
    
    setUsuario(usuario)
    return usuario
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('clienteAtivo')
    localStorage.removeItem('projetoAtivo')
    delete api.defaults.headers.common['Authorization']
    delete api.defaults.headers.common['x-empresa-id']
    delete api.defaults.headers.common['x-projeto-id']
    setUsuario(null)
    setClienteAtivoState(null)
    setProjetoAtivoState(null)
  }

  const setClienteAtivo = (cliente) => {
    if (cliente) {
      localStorage.setItem('clienteAtivo', JSON.stringify(cliente))
      api.defaults.headers.common['x-empresa-id'] = cliente.id
    } else {
      localStorage.removeItem('clienteAtivo')
      delete api.defaults.headers.common['x-empresa-id']
    }
    // Limpa projeto ao trocar cliente
    localStorage.removeItem('projetoAtivo')
    delete api.defaults.headers.common['x-projeto-id']
    setProjetoAtivoState(null)
    setClienteAtivoState(cliente)
  }

  const setProjetoAtivo = (projeto) => {
    if (projeto) {
      localStorage.setItem('projetoAtivo', JSON.stringify(projeto))
      api.defaults.headers.common['x-projeto-id'] = projeto.id
    } else {
      localStorage.removeItem('projetoAtivo')
      delete api.defaults.headers.common['x-projeto-id']
    }
    setProjetoAtivoState(projeto)
  }

  const isSuperAdmin = usuario?.role === 'SUPERADMIN'
  const isAdmin = usuario?.role === 'ADMIN' || isSuperAdmin
  const isTecnico = usuario?.role === 'TECNICO'

  return (
    <AuthContext.Provider value={{
      usuario, loading, login, logout,
      isAdmin, isTecnico, isSuperAdmin,
      clienteAtivo, setClienteAtivo,
      projetoAtivo, setProjetoAtivo,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
