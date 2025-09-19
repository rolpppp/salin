import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Log In to Your Account</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Form inputs are identical to the register page */}
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                    <p className="text-sm text-center">
                        Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;