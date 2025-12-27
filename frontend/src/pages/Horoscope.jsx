import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StartPage from './horoscope/StartPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function Horoscope() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <StartPage />
      </div>
    </QueryClientProvider>
  );
}
