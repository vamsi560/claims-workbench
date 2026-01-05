import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FNOLList } from './pages/FNOLList';
import { FNOLDetail } from './pages/FNOLDetail';
import { LLMMetrics } from './pages/LLMMetrics';
import { FNOLIngest } from './pages/FNOLIngest';

type Page = 'dashboard' | 'fnols' | 'metrics' | 'detail' | 'ingest';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedFNOLId, setSelectedFNOLId] = useState<string | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedFNOLId(null);
  };

  const handleSelectFNOL = (fnolId: string) => {
    setSelectedFNOLId(fnolId);
    setCurrentPage('detail');
  };

  const handleBackToList = () => {
    setCurrentPage('fnols');
    setSelectedFNOLId(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'fnols' && <FNOLList onSelectFNOL={handleSelectFNOL} />}
        {currentPage === 'metrics' && <LLMMetrics />}
        {currentPage === 'detail' && selectedFNOLId && (
          <FNOLDetail fnolId={selectedFNOLId} onBack={handleBackToList} />
        )}
        {currentPage === 'ingest' && <FNOLIngest />}
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
