import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    applyActionCode,
    Auth,
    ActionCodeSettings
} from 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyEmail: (actionCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

// Action code settings to redirect user back to the app
const actionCodeSettings: ActionCodeSettings = {
    url: `https://${firebaseConfig.authDomain}`,
    handleCodeInApp: true,
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const signUp = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        try {
            await sendEmailVerification(userCredential.user, actionCodeSettings);
        } catch (error) {
            console.error("Failed to send verification email on signup:", error);
            // We do not re-throw the error.
            // This ensures that if the user is created but the email fails to send,
            // they are still logged in and taken to the 'verify email' screen,
            // where they can use the 'resend' button.
        }
    };

    const signIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password).then(() => {});
    };

    const logOut = () => {
        return signOut(auth);
    };

    const resendVerificationEmail = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser, actionCodeSettings);
        } else {
            throw new Error("No user is currently signed in to resend verification email.");
        }
    };
    
    const resetPassword = (email: string) => {
        return sendPasswordResetEmail(auth, email, actionCodeSettings);
    };

    const verifyEmail = (actionCode: string) => {
        return applyActionCode(auth, actionCode);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        signUp,
        signIn,
        logOut,
        resendVerificationEmail,
        resetPassword,
        verifyEmail,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};