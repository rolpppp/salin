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

        const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        });

        if (error){
            setError(error.message);
        } else{
            alert('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        }
        setLoading(false);
    
    };

    return (
        <MobileShell title="Salin">
            <div className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-center">Create Your Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm">Confirm Password</label>
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
        </MobileShell>
    )
};

export default RegisterPage;