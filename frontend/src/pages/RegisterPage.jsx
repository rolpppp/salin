import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
    
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try{
            const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
            alert('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        } catch (error){
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Create Your Account</h2>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                    <p className="text-sm text-center">
                        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;