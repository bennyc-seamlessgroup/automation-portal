import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy, useContext } from 'react'
import React from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
const Scenarios = lazy(() => import('./pages/Scenarios'))
const Templates = lazy(() => import('./pages/Templates'))
const DataStores = lazy(() => import('./pages/DataStores'))
const Connections = lazy(() => import('./pages/Connections'))
const Apps = lazy(() => import('./pages/Apps'))
const Webhooks = lazy(() => import('./pages/Webhooks'))
const Teams = lazy(() => import('./pages/Teams'))
const Billing = lazy(() => import('./pages/Billing'))
const Settings = lazy(() => import('./pages/Settings'))
const Help = lazy(() => import('./pages/Help'))
const ScenarioBuilder = lazy(() => import('./pages/ScenarioBuilder'))
const Login = lazy(() => import('./pages/Login'))
import Dashboard from './pages/Dashboard'

// 🔧 state context for scenarios (lightweight data layer)
import { ScenariosProvider } from './state/ScenariosContext'
import { AppsProvider, AppsContext } from './state/AppsContext'

// Background preloader component
const BackgroundPreloader: React.FC = () => {
  const location = useLocation();
  const { preload, hasLoadedInitially } = useContext(AppsContext) || { preload: async () => {}, hasLoadedInitially: false };

  useEffect(() => {
    // Load apps when user navigates away from login page (after "login")
    // But only if not already loaded initially
    if (location.pathname !== '/login' && !hasLoadedInitially) {
      console.log('[BackgroundPreloader] 🚀 User navigated away from login, triggering app load...');
      preload();
    }
  }, [location.pathname, hasLoadedInitially, preload]);

  return null;
};

// debug overlay is mounted per-page (e.g., in Scenarios)

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Check if current page is login
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    const close = () => setSidebarOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  return (
    <ScenariosProvider>
      <AppsProvider>
        <BackgroundPreloader />
        <div className="app-grid">
          {!isLoginPage && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {!isLoginPage && <Topbar onHamburger={() => setSidebarOpen(s => !s)} />}

          <main className="app-content">
            <Suspense fallback={<div>Loading…</div>}>
              <Routes>
                {/* default to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* auth / main */}
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* scenarios list + builder */}
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/scenarios/new" element={<ScenarioBuilder />} />
                {/* edit routes (both forms supported) */}
                <Route path="/scenarios/:id" element={<ScenarioBuilder />} />
                <Route path="/scenarios/:id/edit" element={<ScenarioBuilder />} />

                {/* other sections */}
                <Route path="/templates" element={<Templates />} />
                <Route path="/data-stores" element={<DataStores />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/webhooks" element={<Webhooks />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </Suspense>
          </main>

          {/* debug overlay removed globally */}
        </div>
      </AppsProvider>
    </ScenariosProvider>
  )
}
