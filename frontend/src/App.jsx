import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import EsqueciSenhaPage from './pages/EsqueciSenhaPage'
import RedefinirSenhaPage from './pages/RedefinirSenhaPage'
import DashboardPage from './pages/DashboardPage'
import EquipamentosPage from './pages/EquipamentosPage'
import EquipamentoDetalhePage from './pages/EquipamentoDetalhePage'
import UsuariosPage from './pages/UsuariosPage'
import UnidadesPage from './pages/UnidadesPage'
import VinculacoesPage from './pages/VinculacoesPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ImportacaoPage from './pages/ImportacaoPage'
import PreparacaoPage from './pages/PreparacaoPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import ChamadosPage from './pages/ChamadosPage'
import SolicitacoesPage from './pages/SolicitacoesPage'
import ColaboradorDetalhePage from './pages/ColaboradorDetalhePage'
import ClientesPage from './pages/ClientesPage'
import ProjetosPage from './pages/ProjetosPage'
import RelatorioAssinaturasPage from './pages/RelatorioAssinaturasPage'
import AuditoriaPage from './pages/AuditoriaPage'
import { useAuth } from './contexts/AuthContext'

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function SuperAdminRoute({ children }) {
  const { isSuperAdmin, loading } = useAuth()
  if (loading) return null
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
              <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="equipamentos" element={<EquipamentosPage />} />
                <Route path="equipamentos/:id" element={<EquipamentoDetalhePage />} />
                <Route path="preparacao" element={<PreparacaoPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="usuarios/:id" element={<ColaboradorDetalhePage />} />
                <Route path="atribuicoes" element={<VinculacoesPage />} />
                <Route path="chamados" element={<ChamadosPage />} />
                <Route path="solicitacoes" element={<SolicitacoesPage />} />
                <Route path="configuracoes" element={<ConfiguracoesPage />} />
                {/* Rotas exclusivas de Admin */}
                <Route path="unidades" element={<AdminRoute><UnidadesPage /></AdminRoute>} />
                <Route path="relatorios" element={<RelatoriosPage />} />
                <Route path="relatorios/assinaturas" element={<RelatorioAssinaturasPage />} />
                <Route path="importacao" element={<AdminRoute><ImportacaoPage /></AdminRoute>} />
                <Route path="auditoria" element={<AdminRoute><AuditoriaPage /></AdminRoute>} />
                <Route path="clientes" element={<SuperAdminRoute><ClientesPage /></SuperAdminRoute>} />
                <Route path="projetos" element={<SuperAdminRoute><ProjetosPage /></SuperAdminRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
