import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import CursorEffect from './components/CursorEffect';
import AiChatWidget from './components/AiChatWidget';
import AppRoutes from './routes';

const queryClient = new QueryClient();

function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <ErrorBoundary>
                        <Router>
                            <CursorEffect />

                            <div className="min-h-screen bg-transparent text-foreground transition-colors duration-500">
                                <Header />
                                <main className="min-h-screen">
                                    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
                                        <AppRoutes />
                                    </Suspense>
                                </main>
                                <Footer />

                                <AiChatWidget />
                            </div>
                        </Router>
                    </ErrorBoundary>
                </ToastProvider>
            </QueryClientProvider>
        </Provider>
    );
}

export default App;
