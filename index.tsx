
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-teal-600 text-4xl"></i>
            </div>
        );
    }
    
    return currentUser && currentUser.emailVerified ? <App /> : <Auth />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
        <AppContainer />
    </AuthProvider>
  </React.StrictMode>
);