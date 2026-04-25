"use client";

import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthModeProvider } from "@/lib/auth-mode";

interface AuthContextType {
    user: any;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate session check or fetch from API
        const checkSession = async () => {
            try {
                // Here you would normally fetch /auth/me
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-full min-h-screen bg-slate-950 space-y-6">
                <div className="relative">
                    {/* Inner glowing core */}
                    <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse"></div>
                    
                    {/* Spinner */}
                    <div className="w-20 h-20 border-[3px] border-white/5 border-t-violet-500 rounded-full animate-spin"></div>
                    
                    {/* Centered Logo Placeholder / Pulse */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce"></div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-sm font-black tracking-[0.3em] text-white uppercase opacity-90">CodeSwayam Auth</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-1 h-1 bg-violet-500 rounded-full animate-ping"></span>
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Securing Session</p>
                    </div>
                </div>
                
                {/* Progress bar hint */}
                <div className="w-48 h-[1px] bg-white/5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            <AuthModeProvider>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                    {children}
                </GoogleOAuthProvider>
            </AuthModeProvider>
        </AuthContext.Provider>
    );
}
