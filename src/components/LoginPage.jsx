import React, { useState } from 'react';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import supabase from '../supabase';

const LoginPage = ({ onLogin, users }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Use entered ID directly if it's an email, otherwise map to virtual domain
            const email = userId.includes('@') ? userId : `${userId.toLowerCase()}@madumaga.com`;

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (authError) {
                throw authError; // Throw to catch block
            }

            console.log("Logged in as:", data.user.email);
            // App.jsx listener will handle the redirect/state update

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || 'Sign in failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

            {/* Login Card */}
            <div className="w-full max-w-md z-10">
                <div className="bg-[#16191D]/80 backdrop-blur-xl border border-[#2C2E33] p-8 rounded-2xl shadow-2xl space-y-8 transform transition-all">
                    {/* Branding */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black font-bold text-2xl mb-2 shadow-lg shadow-white/10">✓</div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            MADUMAGA🔥
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">Welcome back, Please sign in</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-lg text-center animate-shake">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#0066FF] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="User ID"
                                    className="block w-full pl-10 pr-3 py-3 bg-[#1C1F26] border border-[#2C2E33] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all bg-[#1C1F26]/50"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#0066FF] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="block w-full pl-10 pr-10 py-3 bg-[#1C1F26] border border-[#2C2E33] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all bg-[#1C1F26]/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold">
                            <label className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#2C2E33] bg-[#1C1F26] text-[#0066FF] focus:ring-0 focus:ring-offset-0" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-[#0066FF] hover:underline">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
