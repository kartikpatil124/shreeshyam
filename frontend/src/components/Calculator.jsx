import React, { useState } from 'react';

const Calculator = ({ onClose }) => {
    const [display, setDisplay] = useState('0');

    const handleNum = (num) => {
        setDisplay(display === '0' ? String(num) : display + num);
    };

    const handleOp = (op) => {
        setDisplay(display + ' ' + op + ' ');
    };

    const handleClear = () => {
        setDisplay('0');
    };

    const calculate = () => {
        try {
            // safely evaluate the expression
            // Replace x with * for eval
            const expression = display.replace(/x/g, '*');
            // eslint-disable-next-line
            const result = new Function('return ' + expression)();
            setDisplay(String(result));
        } catch (error) {
            setDisplay('Error');
        }
    };

    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
            background: 'var(--card-bg, #1e1e2d)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            width: '260px', color: '#fff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h5 style={{ margin: 0 }}><i className="ri-calculator-line" /> Calculator</h5>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><i className="ri-close-line" /></button>
            </div>
            <div style={{
                background: '#000', padding: '10px', borderRadius: '8px', 
                textAlign: 'right', fontSize: '1.2rem', marginBottom: '10px',
                minHeight: '40px', wordBreak: 'break-all'
            }}>
                {display}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button onClick={handleClear} className="btn btn-danger" style={{ gridColumn: 'span 2' }}>C</button>
                <button onClick={() => handleOp('/')} className="btn btn-secondary">/</button>
                <button onClick={() => handleOp('*')} className="btn btn-secondary">x</button>
                
                <button onClick={() => handleNum(7)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>7</button>
                <button onClick={() => handleNum(8)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>8</button>
                <button onClick={() => handleNum(9)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>9</button>
                <button onClick={() => handleOp('-')} className="btn btn-secondary">-</button>
                
                <button onClick={() => handleNum(4)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>4</button>
                <button onClick={() => handleNum(5)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>5</button>
                <button onClick={() => handleNum(6)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>6</button>
                <button onClick={() => handleOp('+')} className="btn btn-secondary">+</button>
                
                <button onClick={() => handleNum(1)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>1</button>
                <button onClick={() => handleNum(2)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>2</button>
                <button onClick={() => handleNum(3)} className="btn w-100" style={{ background: '#333', color: '#fff' }}>3</button>
                <button onClick={calculate} className="btn btn-primary" style={{ gridRow: 'span 2' }}>=</button>
                
                <button onClick={() => handleNum(0)} className="btn w-100" style={{ background: '#333', color: '#fff', gridColumn: 'span 2' }}>0</button>
                <button onClick={() => handleNum('.')} className="btn w-100" style={{ background: '#333', color: '#fff' }}>.</button>
            </div>
        </div>
    );
};

export default Calculator;
