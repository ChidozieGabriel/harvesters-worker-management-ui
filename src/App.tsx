import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AppRoutes from './routes';
import navigationService from './services/navigation';

const queryClient = new QueryClient();

// Navigation initializer component
function NavigationInitializer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize navigation service with React Router's navigate function
    navigationService.initialize(navigate);
  }, [navigate]);

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={import.meta.env.VITE_BASE_DIR}>
        <NavigationInitializer>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster />
          </div>
        </NavigationInitializer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;