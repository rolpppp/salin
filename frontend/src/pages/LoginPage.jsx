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
        <MobileShell title="Salin">
            <div className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-center">Log In to Your Account</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm">Password</label>
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
        </MobileShell>
    )
};

export default LoginPage;