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
        <div className="form-group smart-input-group" ref={wrapperRef} style={{ position: 'relative' }}>
            <label>{icon && <i className={icon} style={{ marginRight: '6px' }} />} {label}</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
                <i className="ri-search-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--saas-text-muted)' }} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    required={required}
                    placeholder={placeholder || `Search ${label}...`}
                    style={{ paddingLeft: '38px', transition: 'all 0.2s', width: '100%' }}
                    autoComplete="off"
                />
            </div>

            {isOpen && filtered.length > 0 && (
                <div className="smart-dropdown" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--saas-card)',
                    border: '1px solid var(--saas-border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--saas-shadow-lg)',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 2000,
                    animation: 'fadeInSlideDown 0.2s ease-out'
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
                                padding: '12px 16px',
                                cursor: 'pointer',
                                color: 'var(--saas-text)',
                                borderBottom: idx < filtered.length - 1 ? '1px solid var(--saas-border)' : 'none',
                                background: activeIndex === idx ? 'var(--saas-bg)' : 'transparent',
                                display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>{item}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--saas-text-muted)', marginTop: '2px' }}>Press Enter to select</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
