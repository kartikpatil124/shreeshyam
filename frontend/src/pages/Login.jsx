import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { admin, login } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to home
    useEffect(() => {
        if (admin) navigate('/');
    }, [admin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Invalid Email or Password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container">
                <div className="login-box card interactive">
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <img src="/assets/images/clean-logo.png" alt="Shree Shyam Steel Logo" style={{ height: '85px', width: 'auto', filter: 'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.7))' }} />
                    </div>
                    <h1 className="login-logo" style={{ marginTop: 0 }}>
                        Shree Shyam <span>Steel</span>
                    </h1>
                    <p className="login-subtitle">Secure Administration Portal</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@shreeshyamsteel.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Security Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        {error && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? (
                                <><i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }} /> Authenticating...</>
                            ) : (
                                <><i className="ri-login-circle-line" /> Authenticate</>
                            )}
                        </button>
                    </form>
                    <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            <i className="ri-arrow-left-line" /> Back to Home
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
