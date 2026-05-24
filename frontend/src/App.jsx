import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import AssistenteIA from './components/AssistenteIA'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const EsqueciSenhaPage = lazy(() => import('./pages/EsqueciSenhaPage'))
const RedefinirSenhaPage = lazy(() => import('./pages/RedefinirSenhaPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EquipamentosPage = lazy(() => import('./pages/EquipamentosPage'))
const EquipamentoDetalhePage = lazy(() => import('./pages/EquipamentoDetalhePage'))
const UsuariosPage = lazy(() => import('./pages/UsuariosPage'))
const UnidadesPage = lazy(() => import('./pages/UnidadesPage'))
const VinculacoesPage = lazy(() => import('./pages/VinculacoesPage'))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'))
const ImportacaoPage = lazy(() => import('./pages/ImportacaoPage'))
const PreparacaoPage = lazy(() => import('./pages/PreparacaoPage'))
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'))
const ChamadosPage = lazy(() => import('./pages/ChamadosPage'))
const SolicitacoesPage = lazy(() => import('./pages/SolicitacoesPage'))
const ColaboradorDetalhePage = lazy(() => import('./pages/ColaboradorDetalhePage'))
const ClientesPage = lazy(() => import('./pages/ClientesPage'))
const ProjetosPage = lazy(() => import('./pages/ProjetosPage'))
const RelatorioAssinaturasPage = lazy(() => import('./pages/RelatorioAssinaturasPage'))
const AuditoriaPage = lazy(() => import('./pages/AuditoriaPage'))
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
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-screen gap-3 bg-[#f5f6fa] dark:bg-[#080c14]">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[12px] text-slate-400">Carregando portal...</p>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
                <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
                <Route path="/" element={<ProtectedRoute><Layout /><AssistenteIA /></ProtectedRoute>}>
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
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

