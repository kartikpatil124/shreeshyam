import { useState } from 'react';

export default function NotificationBell({ notifications }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="notification-bell interactive" onClick={() => setOpen(!open)}>
            <i className="ri-notification-3-line" />
            {notifications.length > 0 && (
                <div className="notification-dot" style={{ display: 'block' }} />
            )}
            {open && (
                <div className="notification-dropdown active">
                    {notifications.length === 0 ? (
                        <div className="notif-item">
                            <i className="ri-checkbox-circle-line" />
                            <span>No new notifications</span>
                        </div>
                    ) : (
                        notifications.map((n, i) => (
                            <div key={i} className="notif-item">
                                <i className="ri-alert-line" />
                                <span>{n}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
