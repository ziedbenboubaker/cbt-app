import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | React.ReactNode>('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err: any) {
            // A more user-friendly error message
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                 setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('هذا البريد الإلكتروني مستخدم بالفعل.');
            } else {
                setError('فشل في المصادقة. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-800">مساعدي العلاجي الشخصي</h1>
                    <p className="text-slate-500 mt-2">{isLogin ? 'قم بتسجيل الدخول للمتابعة' : 'أنشئ حساباً جديداً'}</p>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm text-right" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 text-right">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-left dir-ltr"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 text-right">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-left dir-ltr"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 transition-colors"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-teal-600 hover:text-teal-800">
                        {isLogin ? 'ليس لديك حساب؟ إنشاء حساب' : 'هل لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;