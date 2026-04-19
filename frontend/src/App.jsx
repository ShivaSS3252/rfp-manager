import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RFPList from './pages/RFPList';
import RFPCreate from './pages/RFPCreate';
import RFPDetail from './pages/RFPDetail';
import ComparisonView from './pages/ComparisonView';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps" element={<RFPList />} />
          <Route path="/rfps/new" element={<RFPCreate />} />
          <Route path="/rfps/:id" element={<RFPDetail />} />
          <Route path="/rfps/:id/compare" element={<ComparisonView />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
