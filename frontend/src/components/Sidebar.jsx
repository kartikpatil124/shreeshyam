export default function Sidebar({ activeSection, onNavigate }) {
    const menuItems = [
        { id: 'order-entry', icon: 'ri-add-box-line', label: 'Order Entry' },
        { id: 'pending-orders', icon: 'ri-time-line', label: 'Pending Orders' },
        { id: 'completed-orders', icon: 'ri-checkbox-circle-line', label: 'Completed Orders' },
        { id: 'order-statistic', icon: 'ri-bar-chart-2-line', label: 'Order Statistics' },
        { id: 'change-email', icon: 'ri-settings-4-line', label: 'Security Settings' },
    ];

    return (
        <>
            <div className="sidebar-logo interactive">
                <i className="ri-shield-flash-line" /> Control<span>Center.</span>
            </div>
            <ul className="sidebar-nav">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={activeSection === item.id ? 'active' : ''}
                        onClick={() => onNavigate(item.id)}
                        style={item.id === 'change-email' ? { marginTop: 'auto' } : undefined}
                    >
                        <i className={item.icon} /> <span className="sidebar-label">{item.label}</span>
                    </li>
                ))}
            </ul>
        </>
    );
}
