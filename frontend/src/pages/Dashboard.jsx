import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import Toast from '../components/Toast';
import OrderEntry from '../dashboard/OrderEntry';
import PendingOrders from '../dashboard/PendingOrders';
import CompletedOrders from '../dashboard/CompletedOrders';
import OrderStatistics from '../dashboard/OrderStatistics';
import SecuritySettings from '../dashboard/SecuritySettings';
import '../saas.css';

export default function Dashboard() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('order-entry');
    const [editingOrder, setEditingOrder] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const addToast = useCallback((message, type = 'primary') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const addNotification = useCallback((msg) => {
        setNotifications(prev => {
            if (prev.includes(msg)) return prev;
            return [msg, ...prev];
        });
    }, []);

    const handleEdit = (order) => {
        setEditingOrder(order);
        setActiveSection('order-entry');
    };

    const handleOrderSaved = () => {
        setEditingOrder(null);
        setRefreshKey(k => k + 1);
    };

    const sectionTitles = {
        'order-entry': 'Order Entry',
        'pending-orders': 'Pending Orders',
        'completed-orders': 'Completed Orders',
        'order-statistic': 'Order Statistics',
        'change-email': 'Security Settings',
    };

    const handleNavigate = (section) => {
        setActiveSection(section);
        setSidebarOpen(false);
    };

    return (
        <div className="saas-dashboard">
            {/* Global Navbar */}
            <nav className="global-navbar">
                <div className="nav-brand"><Link to="/">Shyam<span>Steel.</span></Link></div>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><a href="/#about">About</a></li>
                    <li><a href="/#manufactured">Manufactured</a></li>
                    <li><a href="/#traded">Trading</a></li>
                    <li><Link to="/dashboard" className="active-link">Dashboard</Link></li>
                </ul>
                <div className="nav-actions">
                    <span className="admin-name interactive">
                        <i className="ri-user-star-line" /> {admin?.email?.split('@')[0] || 'Admin'}
                    </span>
                    <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                        <i className="ri-logout-circle-line" /> Logout
                    </button>
                </div>
            </nav>

            {/* Dashboard Body */}
            <div className="dashboard-layout">
                {/* Mobile Sidebar Overlay */}
                <div
                    className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                    <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
                </div>

                <div className="main-area">
                    {/* Top Sub-Navbar */}
                    <div className="top-navbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button className="hamburger-dashboard" onClick={() => setSidebarOpen(true)}>
                                <i className="ri-menu-2-line" />
                            </button>
                            <div className="nav-title interactive">
                                <i className="ri-command-line" /> {sectionTitles[activeSection] || 'Control Center'}
                            </div>
                        </div>
                        <div className="nav-icons">
                            <NotificationBell notifications={notifications} />
                        </div>
                    </div>

                    {/* Content Sections */}
                    {activeSection === 'order-entry' && (
                        <OrderEntry editingOrder={editingOrder} onOrderSaved={handleOrderSaved} onToast={addToast} />
                    )}
                    {activeSection === 'pending-orders' && (
                        <PendingOrders key={refreshKey} onEdit={handleEdit} onToast={addToast} onNotification={addNotification} />
                    )}
                    {activeSection === 'completed-orders' && (
                        <CompletedOrders key={refreshKey} onToast={addToast} />
                    )}
                    {activeSection === 'order-statistic' && (
                        <OrderStatistics />
                    )}
                    {activeSection === 'change-email' && (
                        <SecuritySettings onToast={addToast} />
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button (Opens Order Entry) */}
            {activeSection !== 'order-entry' && (
                <button className="fab-mobile" onClick={() => handleNavigate('order-entry')} aria-label="Add Order">
                    <i className="ri-add-line" />
                </button>
            )}

            {/* Mobile Bottom Navigation (Visible only on mobile) */}
            <div className="bottom-nav">
                <button className={`bottom-nav-item ${activeSection === 'order-statistic' ? 'active' : ''}`} onClick={() => handleNavigate('order-statistic')}>
                    <i className="ri-dashboard-line" />
                    <span>Home</span>
                </button>
                <button className={`bottom-nav-item ${activeSection === 'pending-orders' ? 'active' : ''}`} onClick={() => handleNavigate('pending-orders')}>
                    <i className="ri-time-line" />
                    <span>Pending</span>
                </button>
                <button className={`bottom-nav-item ${activeSection === 'completed-orders' ? 'active' : ''}`} onClick={() => handleNavigate('completed-orders')}>
                    <i className="ri-checkbox-circle-line" />
                    <span>Done</span>
                </button>
                <button className={`bottom-nav-item ${activeSection === 'change-email' ? 'active' : ''}`} onClick={() => handleNavigate('change-email')}>
                    <i className="ri-settings-4-line" />
                    <span>Settings</span>
                </button>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(t => (
                    <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </div>
    );
}
