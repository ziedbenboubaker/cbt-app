import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Auth: React.FC = () => {
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | React.ReactNode>('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { currentUser, signIn, signUp, logOut, resendVerificationEmail, resetPassword } = useAuth();

    useEffect(() => {
        if (currentUser) {
            setError('');
            setInfo('');
        }
    }, [currentUser]);
    
    useEffect(() => {
        setError('');
        setInfo('');
    }, [authMode]);

    useEffect(() => {
        let timer: number | undefined;
        if (resendCooldown > 0) {
            timer = window.setTimeout(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, [resendCooldown]);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);

        try {
            if (authMode === 'login') {
                await signIn(email, password);
            } else {
                if (password !== repeatPassword) {
                    setError('كلمات المرور غير متطابقة.');
                    setLoading(false);
                    return;
                }
                await signUp(email, password);
            }
        } catch (err: any) {
             if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                 setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError(
                    <span>
                        المستخدم موجود بالفعل.
                        <button onClick={() => setAuthMode('login')} className="font-bold underline mx-1 hover:text-teal-700">
                           تسجيل الدخول؟
                        </button>
                    </span>
                );
            } else {
                setError('فشل في المصادقة. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading || resendCooldown > 0) return;
        setError('');
        setInfo('');
        setLoading(true);
        try {
            await resendVerificationEmail();
            setInfo(`تم إرسال بريد إلكتروني جديد للتحقق إلى ${currentUser?.email}.`);
            setResendCooldown(60);
        } catch (err: any) {
            if (err.code === 'auth/too-many-requests') {
                setError("لقد أرسلنا الكثير من رسائل التحقق إلى هذا البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقًا.");
            } else {
                setError("فشل في إعادة إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقًا.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);
        try {
            await resetPassword(email);
            setInfo(`لقد أرسلنا رابط تغيير كلمة المرور إلى ${email}.`);
        } catch (err: any) {
             if (err.code === 'auth/user-not-found') {
                 setError('لا يوجد مستخدم بهذا البريد الإلكتروني.');
            } else if (err.code === 'auth/too-many-requests') {
                setError("لقد طلبنا إعادة تعيين كلمة المرور مرات عديدة جدًا. يرجى المحاولة مرة أخرى لاحقًا.");
            }
            else {
                setError('فشل في إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (currentUser && !currentUser.emailVerified) {
        return (
            <div className="h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5 p-8 text-center">
                    <div className="mb-6">
                        <i className="fas fa-envelope-open-text text-5xl text-teal-600"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-teal-800 mb-4">تحقق من بريدك الإلكتروني</h1>
                    <p className="text-slate-600 mb-6">
                        لقد أرسلنا رابط تحقق إلى <br />
                        <strong className="font-bold text-slate-800">{currentUser.email}</strong>
                        <br />
                        يرجى التحقق من بريدك الإلكتروني للوصول إلى حسابك.
                    </p>
                     {info && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 text-sm text-center" role="alert">{info}</div>}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm text-center" role="alert">{error}</div>}

                    <div className="space-y-4">
                        <button
                            onClick={handleResend}
                            disabled={loading || resendCooldown > 0}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 transition-colors"
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                             ) : resendCooldown > 0 ? (
                                `إعادة الإرسال بعد (${resendCooldown})`
                             ) : (
                                'إعادة إرسال البريد الإلكتروني'
                             )}
                        </button>
                        <button
                            onClick={async () => await logOut()}
                            className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            العودة إلى تسجيل الدخول
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (authMode === 'reset') {
        return (
            <div className="h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-teal-800">إعادة تعيين كلمة المرور</h1>
                    </div>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm text-right" role="alert">{error}</div>}
                    {info ? (
                        <div className="text-center">
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">{info}</div>
                            <button
                                onClick={() => { setAuthMode('login'); setInfo(''); }}
                                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                تسجيل الدخول
                            </button>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <p className="text-sm text-slate-600 text-center">أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.</p>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 text-right">البريد الإلكتروني</label>
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fas fa-envelope text-slate-400"></i>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                                focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 text-left dir-ltr"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 transition-colors"
                                >
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'احصل على رابط إعادة التعيين'}
                                </button>
                            </form>
                            <div className="mt-6 text-center">
                                <button onClick={() => { setAuthMode('login'); setError(''); setInfo(''); }} className="text-sm text-teal-600 hover:text-teal-800">
                                    العودة إلى تسجيل الدخول
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black ring-opacity-5 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-800">مساعدي العلاجي الشخصي</h1>
                    <p className="text-slate-500 mt-2">{authMode === 'login' ? 'قم بتسجيل الدخول للمتابعة' : 'أنشئ حساباً جديداً'}</p>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm text-right" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {authMode === 'signup' && (
                         <>
                            <div className="flex flex-col items-center">
                                <label htmlFor="photo-upload" className="cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-teal-500">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fas fa-user text-4xl text-slate-400"></i>
                                        )}
                                    </div>
                                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                                 <span className="text-sm text-slate-500 mt-2">تحميل صورة الملف الشخصي</span>
                            </div>
                             <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 text-right">الاسم الكامل</label>
                                <div className="relative mt-1">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fas fa-user text-slate-400"></i>
                                    </div>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={authMode === 'signup'}
                                        className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                            focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 text-left dir-ltr"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 text-right">البريد الإلكتروني</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-envelope text-slate-400"></i>
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                    focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 text-left dir-ltr"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 text-right">كلمة المرور</label>
                            {authMode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => { setAuthMode('reset'); setError(''); setInfo(''); }}
                                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                                >
                                    هل نسيت كلمة المرور؟
                                </button>
                            )}
                        </div>
                         <div className="relative mt-1">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 px-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none z-10"
                                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                    focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 text-left dir-ltr"
                            />
                        </div>
                    </div>
                     {authMode === 'signup' && (
                        <div>
                            <label htmlFor="repeat-password" className="block text-sm font-medium text-slate-700 text-right">تأكيد كلمة المرور</label>
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                    className="absolute inset-y-0 left-0 px-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none z-10"
                                    aria-label={showRepeatPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                >
                                    <i className={`fas ${showRepeatPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                                <input
                                    id="repeat-password"
                                    type={showRepeatPassword ? "text" : "password"}
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    required={authMode === 'signup'}
                                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                                        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 text-left dir-ltr"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 transition-colors"
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : (authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }} className="text-sm text-teal-600 hover:text-teal-800">
                        {authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب' : 'هل لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;