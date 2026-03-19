import React, { useState, useEffect, useRef } from 'react';

export default function SmartInput({ value, onChange, label, suggestions = [], placeholder, required, icon }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = suggestions.filter(s => s && s.toLowerCase().includes(value?.toLowerCase() || ''));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < filtered.length) {
                e.preventDefault();
                onChange(filtered[activeIndex]);
                setIsOpen(false);
                inputRef.current?.blur();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="form-group smart-input-group" ref={wrapperRef} style={{ position: 'relative', marginBottom: '16px' }}>
            {label && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--saas-text-muted)', marginBottom: '8px' }}>
                    {icon && <i className={icon} style={{ color: 'var(--saas-primary)', fontSize: '1.1rem' }} />} 
                    {label}
                </label>
            )}
            <div className="input-wrapper" style={{ position: 'relative' }}>
                <i className="ri-search-line" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--saas-text-muted)', fontSize: '1.2rem', pointerEvents: 'none' }} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    required={required}
                    placeholder={placeholder || `Search ${label}...`}
                    style={{ 
                        paddingLeft: '48px', 
                        paddingRight: '16px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                        width: '100%',
                        height: '48px',
                        borderRadius: '12px',
                        boxSizing: 'border-box'
                    }}
                    autoComplete="off"
                />
            </div>

            {isOpen && filtered.length > 0 && (
                <div className="smart-dropdown" style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 2000,
                    animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {filtered.map((item, idx) => (
                        <div
                            key={idx}
                            className={`smart-item ${activeIndex === idx ? 'active' : ''}`}
                            onClick={() => {
                                onChange(item);
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setActiveIndex(idx)}
                            style={{
                                padding: '14px 16px',
                                cursor: 'pointer',
                                color: '#18181b',
                                borderBottom: idx < filtered.length - 1 ? '1px solid #f4f4f5' : 'none',
                                background: activeIndex === idx ? '#f4f4f5' : 'transparent',
                                display: 'flex', flexDirection: 'column',
                                transition: 'background 0.15s ease'
                            }}
                        >
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item}</span>
                            <span style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
                                {label ? `${label.replace(' (Opt)', '')} Suggestion` : 'Suggestion'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
