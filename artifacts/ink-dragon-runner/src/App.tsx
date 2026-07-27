import React, { Component, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Game from '@/pages/Game';
import { SWUpdateBanner } from '@/components/SWUpdateBanner';

const queryClient = new QueryClient();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center text-[#2C1810]">
          <h1 className="text-4xl text-[#E34234] font-bold mb-4">🐲 遊戲載入發生微小狀況</h1>
          <p className="text-lg text-[#5A3E30] mb-6">別擔心，點擊下方按鈕即可重新啟動水墨墨龍冒險！</p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-[#E34234] text-white font-bold rounded-lg shadow-lg hover:bg-[#c73228] transition-colors"
          >
            重新載入遊戲
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Game />
          <SWUpdateBanner />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
