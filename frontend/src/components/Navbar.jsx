import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        setMobileOpen(false);
        await logout();
        navigate('/');
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
            <div className="nav-brand">
                <Link to="/">Shyam<span>Steel.</span></Link>
            </div>

            <ul className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
                <li><a href="#home" onClick={closeMobile}>Home</a></li>
                <li><a href="#about" onClick={closeMobile}>About</a></li>
                <li><a href="#manufactured" onClick={closeMobile}>Manufactured</a></li>
                <li><a href="#traded" onClick={closeMobile}>Trading</a></li>
                {/* Show auth links inside mobile menu too */}
                {mobileOpen && (
                    <>
                        <li style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            {admin ? (
                                <>
                                    <Link to="/dashboard" onClick={closeMobile} style={{ display: 'block', padding: '0.8rem 0', color: 'var(--primary)', fontWeight: 600 }}>
                                        <i className="ri-dashboard-line" /> Dashboard
                                    </Link>
                                    <a href="#" onClick={handleLogout} style={{ display: 'block', padding: '0.8rem 0', color: '#ef4444', fontWeight: 600 }}>
                                        <i className="ri-logout-circle-line" /> Logout
                                    </a>
                                </>
                            ) : (
                                <Link to="/login" onClick={closeMobile} style={{ display: 'block', padding: '0.8rem 0', color: 'var(--primary)', fontWeight: 600 }}>
                                    <i className="ri-login-circle-line" /> Login
                                </Link>
                            )}
                        </li>
                    </>
                )}
            </ul>

            <div className="nav-actions">
                {admin ? (
                    <>
                        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
                            Dashboard
                        </Link>
                        <a href="#" className="btn btn-danger" style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem' }} onClick={handleLogout}>
                            Logout
                        </a>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem' }}>
                        Login
                    </Link>
                )}
                <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
                    <div className="bar" style={mobileOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
                    <div className="bar" style={mobileOpen ? { opacity: 0 } : {}} />
                    <div className="bar" style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
                </div>
            </div>
        </nav>
    );
}
