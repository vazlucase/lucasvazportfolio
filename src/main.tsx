import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import { SiteBoundary, SiteLoading } from './components/common/SiteBoundary';

const App = lazy(() => import('./App'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const isDashboard = /^\/(painel|admin)\/?$/.test(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SiteBoundary><Suspense fallback={<SiteLoading />}>
      {isDashboard ? <Dashboard /> : <App />}
    </Suspense></SiteBoundary>
  </React.StrictMode>
);
