import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const EmailVerificationResult: React.FC<{
    success: boolean;
    error?: string;
    onNavigateToLogin: () => void;
}> = ({ success, error, onNavigateToLogin }) => {
    return (
        <div className="h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5 p-8 text-center">
                {success ? (
                    <>
                        <div className="mb-6">
                            <i className="fas fa-check-circle text-5xl text-teal-600"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-teal-800 mb-4">تم التحقق من بريدك الإلكتروني</h1>
                        <p className="text-slate-600 mb-6">
                            يمكنك الآن تسجيل الدخول بحسابك الجديد.
                        </p>
                        <button
                            onClick={onNavigateToLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            الذهاب إلى تسجيل الدخول
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <i className="fas fa-times-circle text-5xl text-red-500"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-red-700 mb-4">فشل التحقق</h1>
                        <p className="text-slate-600 mb-6">
                            {error || 'رابط التحقق غير صالح أو انتهت صلاحيته. يرجى محاولة التسجيل مرة أخرى أو طلب بريد إلكتروني جديد للتحقق.'}
                        </p>
                        <button
                            onClick={onNavigateToLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            الذهاب إلى تسجيل الدخول
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const EmailVerificationHandler: React.FC = () => {
    const { verifyEmail } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const oobCode = params.get('oobCode');

        if (oobCode) {
            const handleVerification = async () => {
                try {
                    await verifyEmail(oobCode);
                    setVerificationStatus('success');
                } catch (err: any) {
                    setVerificationStatus('error');
                    if (err.code === 'auth/invalid-action-code') {
                        setVerificationError('رابط التحقق غير صالح أو انتهت صلاحيته. يرجى محاولة التسجيل مرة أخرى أو طلب بريد إلكتروني جديد للتحقق.');
                    } else {
                        setVerificationError('حدث خطأ غير متوقع أثناء التحقق من البريد الإلكتروني. الرجاء المحاولة مرة أخرى.');
                    }
                }
            };
            handleVerification();
        } else {
            setVerificationStatus('error');
            setVerificationError('كود التحقق غير موجود.');
        }
    }, [verifyEmail]);

    const handleNavigateToLogin = () => {
        window.location.assign(window.location.origin);
    };

    if (verificationStatus === 'pending') {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="flex items-center text-xl text-slate-700">
                    <i className="fas fa-spinner fa-spin text-teal-600 text-4xl"></i>
                    <span className="mr-4">جاري التحقق من بريدك الإلكتروني...</span>
                </div>
            </div>
        );
    }

    return <EmailVerificationResult success={verificationStatus === 'success'} error={verificationError} onNavigateToLogin={handleNavigateToLogin} />;
};


const AppContainer: React.FC = () => {
    const { currentUser, loading } = useAuth();
    
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (mode === 'verifyEmail') {
        return <EmailVerificationHandler />;
    }

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