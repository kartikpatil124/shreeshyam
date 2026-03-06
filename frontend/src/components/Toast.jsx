import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'primary', onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    const iconMap = {
        success: 'ri-check-line',
        danger: 'ri-close-circle-line',
        warning: 'ri-alert-line',
        primary: 'ri-information-line'
    };

    return (
        <div className="toast" style={{ animationName: 'slideInRight' }}>
            <i className={iconMap[type] || iconMap.primary} style={{ color: `var(--${type})` }} />
            {message}
        </div>
    );
}
