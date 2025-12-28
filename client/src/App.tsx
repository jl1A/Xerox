import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import NewOrderAdmin from './pages/NewOrderAdmin';
import History from './pages/History';
import Directory from './pages/Directory';
import DirectoryDetails from './pages/DirectoryDetails';

// Simple Auth Guard Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('xerox_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Role Guard
const RoleRoute = ({ children, roles }: { children: React.ReactNode, roles: string[] }) => {
  const role = localStorage.getItem('xerox_role') || '';
  if (!roles.includes(role)) {
    // Redirect based on role if unauthorized
    if (role === 'diretoria') return <Navigate to="/diretoria" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const role = localStorage.getItem('xerox_role');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Dept & Admin Routes */}
          <Route index element={
            <RoleRoute roles={['dept', 'admin', 'xerox']}>
              <Dashboard />
            </RoleRoute>
          } />
          <Route path="novo-pedido" element={
            <RoleRoute roles={['dept', 'admin', 'xerox']}>
              <NewOrder />
            </RoleRoute>
          } />
          <Route path="novo-pedido-admin" element={
            <RoleRoute roles={['dept', 'admin', 'xerox']}>
              <NewOrderAdmin />
            </RoleRoute>
          } />
          <Route path="historico" element={
            <RoleRoute roles={['dept', 'admin', 'xerox']}>
              <History />
            </RoleRoute>
          } />

          {/* Diretoria Routes */}
          <Route path="diretoria" element={
            <RoleRoute roles={['diretoria', 'admin']}>
              <Directory />
            </RoleRoute>
          } />
          <Route path="diretoria-detalhes" element={
            <RoleRoute roles={['diretoria', 'admin']}>
              <DirectoryDetails />
            </RoleRoute>
          } />
        </Route>

        {/* Redirect root based on role if trying to access unavailable root */}
        <Route path="*" element={<Navigate to={role === 'diretoria' ? "/diretoria" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
