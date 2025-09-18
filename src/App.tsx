import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Scenarios from './pages/Scenarios'
import Templates from './pages/Templates'
import DataStores from './pages/DataStores'
import Connections from './pages/Connections'
import Apps from './pages/Apps'
import Webhooks from './pages/Webhooks'
import Teams from './pages/Teams'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Help from './pages/Help'
import ScenarioBuilder from "./pages/ScenarioBuilder"
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// debug overlay removed here; page-level debug UI is used in Scenarios

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Check if current page is login
  const isLoginPage = location.pathname === "/login"

  useEffect(() => {
    const close = () => setSidebarOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  return (
    <div className="app-grid">
      {!isLoginPage && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      {!isLoginPage && <Topbar onHamburger={() => setSidebarOpen(s => !s)} />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} /> {/* default to login */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/data-stores" element={<DataStores />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/scenarios/new" element={<ScenarioBuilder />} />
        </Routes>
      </main>

      {/* global debug overlay removed */}
    </div>
  )
}
