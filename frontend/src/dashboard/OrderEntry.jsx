import { useState, useEffect, useRef } from 'react';
import SmartInput from '../components/SmartInput';
import {
    createOrder, updateOrder,
    getProductSuggestions, getSizeSuggestions, getPartySuggestions,
    addProductSuggestion, addSizeSuggestion, addPartySuggestion
} from '../services/api';

export default function OrderEntry({ editingOrder, onOrderSaved, onToast, onBack }) {
    const [partyName, setPartyName] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [products, setProducts] = useState([createEmptyProduct()]);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [partySugg, setPartySugg] = useState([]);
    const [productSugg, setProductSugg] = useState([]);
    const [sizeSugg, setSizeSugg] = useState([]);
    const formRef = useRef(null);

    function createEmptyProduct() {
        return { 
            productName: '', 
            productSize: '', 
            pricingType: 'per_piece', 
            pricePerPiece: '',
            pricePerKg: '',
            weightPerItem: '',
            quantity: 1, 
            gst: false, 
            totalPrice: 0, 
            description: '',
            isCollapsed: false 
        };
    }

    useEffect(() => {
        loadSuggestions();
    }, []);

    useEffect(() => {
        if (editingOrder) {
            setPartyName(editingOrder.partyName);
            setOrderDate(new Date(editingOrder.orderDate).toISOString().split('T')[0]);
            setDueDate(new Date(editingOrder.dueDate).toISOString().split('T')[0]);
            // Load editing items collapsed by default to look clean
            setProducts(editingOrder.products.map(p => ({ ...p, isCollapsed: true })));
            setEditId(editingOrder._id);
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [editingOrder]);

    const loadSuggestions = async () => {
        try {
            const [prodRes, sizeRes, partyRes] = await Promise.all([
                getProductSuggestions(), getSizeSuggestions(), getPartySuggestions()
            ]);
            setProductSugg(prodRes.data);
            setSizeSugg(sizeRes.data);
            setPartySugg(partyRes.data);
        } catch { /* silent */ }
    };

    const updateProduct = (index, field, value) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        
        const p = updated[index];
        let base = 0;
        const qty = Number(p.quantity) || 0;
        
        if (p.pricingType === 'per_piece') {
            base = (Number(p.pricePerPiece) || 0) * qty;
        } else {
            base = (Number(p.pricePerKg) || 0) * (Number(p.weightPerItem) || 0) * qty;
        }
        
        updated[index].totalPrice = p.gst ? +(base * 1.18).toFixed(2) : +base.toFixed(2);
        setProducts(updated);
    };

    const saveAndAddNext = (index) => {
        const p = products[index];
        if (!p.productName || !p.totalPrice) {
            onToast('Please complete required fields before saving item.', 'warning');
            return;
        }
        updateProduct(index, 'isCollapsed', true);
        if (index === products.length - 1) {
            setProducts([...products.map((pr, i) => i === index ? { ...pr, isCollapsed: true } : pr), createEmptyProduct()]);
        }
    };

    const addProductLine = () => {
        setProducts([...products, createEmptyProduct()]);
    };

    const removeProductLine = (index) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validProducts = products.filter(p => p.productName.trim());
        if (validProducts.length === 0) {
            onToast('Please add at least one product', 'danger');
            return;
        }
        const totalAmount = validProducts.reduce((sum, p) => sum + (p.totalPrice || p.finalPrice || 0), 0);
        const payload = { partyName, products: validProducts, totalAmount, orderDate, dueDate };

        setSubmitting(true);
        try {
            if (editId) {
                await updateOrder(editId, payload);
                onToast('Order Updated Successfully!', 'success');
            } else {
                await createOrder(payload);
                onToast('Order Created Successfully!', 'success');
            }

            await addPartySuggestion(partyName);
            for (const p of validProducts) {
                await addProductSuggestion(p.productName);
                if (p.productSize) await addSizeSuggestion(p.productSize);
            }

            setPartyName('');
            setOrderDate('');
            setDueDate('');
            setProducts([createEmptyProduct()]);
            setEditId(null);
            loadSuggestions();
            onOrderSaved?.();
        } catch (err) {
            onToast(err.response?.data?.message || 'Failed to save order', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="section-container active" ref={formRef} style={{ padding: '0 0 40px 0' }}>
            {/* Sticky Mobile Header */}
            <div className="mobile-header d-md-none" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 24px', background: 'rgba(24, 24, 27, 0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--saas-border)', margin: '0 -20px 24px -20px' }}>
                <button type="button" onClick={() => { if (onBack) onBack(); else window.dispatchEvent(new Event('popstate')); }} style={{ background: 'transparent', border: 'none', color: 'var(--saas-text)', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    <i className="ri-arrow-left-line" />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{editId ? 'Edit Order' : 'Order Workflow'}</h2>
            </div>
            
            {/* Desktop Header */}
            <div className="d-none d-md-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}><i className="ri-magic-line" style={{ color: 'var(--saas-primary)', marginRight: '8px' }} /> Order Workflow</h2>
            </div>

            <div className="card interactive" style={{ padding: '0 20px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
                        <SmartInput 
                            label="Party Name" 
                            icon="ri-building-line"
                            value={partyName} 
                            onChange={setPartyName} 
                            suggestions={partySugg} 
                            required 
                            placeholder="Search or enter party name..." 
                        />
                    </div>

                    {/* Tally Style Product Workflow */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'block' }}>Line Items</label>
                        {products.map((prod, idx) => (
                            <div key={idx} style={{ marginBottom: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                                {prod.isCollapsed ? (
                                    <div className="product-line card interactive" style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--saas-border)', borderRadius: '12px', margin: 0, background: 'var(--saas-card)' }} onClick={() => updateProduct(idx, 'isCollapsed', false)}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--saas-primary)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '0.85rem' }}>{idx + 1}</div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--saas-text-muted)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                                                <span style={{ color: 'var(--saas-text)', fontWeight: 600 }}>{prod.productName || 'Unnamed Product'}</span>
                                                <span style={{ opacity: 0.3 }}>|</span>
                                                {prod.pricingType === 'per_piece' ? (
                                                    <span>₹{prod.pricePerPiece || 0}/pc</span>
                                                ) : (
                                                    <>
                                                        <span>₹{prod.pricePerKg || 0}/kg</span>
                                                        <span style={{ opacity: 0.3 }}>|</span>
                                                        <span>{prod.weightPerItem || 0}kg</span>
                                                    </>
                                                )}
                                                <span style={{ opacity: 0.3 }}>|</span>
                                                <span>Qty: <strong style={{ color: 'var(--saas-text)' }}>{prod.quantity || 0}</strong></span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingLeft: '10px' }}>
                                            <span style={{ color: 'var(--saas-success)', fontWeight: 700, fontSize: '1.1rem' }}>₹{(prod.totalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); updateProduct(idx, 'isCollapsed', false); }} style={{ background: 'transparent', border: 'none', color: 'var(--saas-text-muted)', padding: '6px', cursor: 'pointer' }}><i className="ri-pencil-line" style={{ fontSize: '1.2rem' }} /></button>
                                                {products.length > 1 && (
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeProductLine(idx); }} style={{ background: 'transparent', border: 'none', color: 'var(--saas-text-muted)', padding: '6px', cursor: 'pointer' }}><i className="ri-delete-bin-line" style={{ fontSize: '1.2rem' }} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="product-line card" style={{ padding: '24px', border: '1px solid var(--saas-primary)', position: 'relative', margin: 0, boxShadow: 'var(--saas-glow)', borderRadius: '16px' }}>
                                        <h5 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', color: 'var(--saas-primary)', fontSize: '1.1rem', alignItems: 'center' }}>
                                            <span><i className="ri-edit-circle-line" style={{ marginRight: '8px' }} /> Editing Item #{idx + 1}</span>
                                            {products.length > 1 && (
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--saas-danger)', borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: '8px' }} onClick={() => removeProductLine(idx)}><i className="ri-delete-bin-line" /> Remove</button>
                                            )}
                                        </h5>
                                        <div className="form-group-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1 1 60%', minWidth: '200px' }}>
                                                <SmartInput 
                                                    label="Product Name" 
                                                    value={prod.productName} 
                                                    onChange={(v) => updateProduct(idx, 'productName', v)} 
                                                    suggestions={productSugg} 
                                                    required 
                                                    placeholder="Search product..."
                                                />
                                            </div>
                                            <div style={{ flex: '1 1 30%', minWidth: '150px' }}>
                                                <SmartInput 
                                                    label="Size (Opt)" 
                                                    value={prod.productSize} 
                                                    onChange={(v) => updateProduct(idx, 'productSize', v)} 
                                                    suggestions={sizeSugg} 
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                                            <div style={{ flex: '1 1 100%' }}>
                                                <label style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'block', fontWeight: 600 }}>Pricing Basis</label>
                                                <div className="pricing-toggle" style={{ display: 'flex', background: 'var(--saas-bg)', borderRadius: '12px', padding: '6px', border: '1px solid var(--saas-border)' }}>
                                                    <button type="button" className={prod.pricingType === 'per_piece' ? 'active' : ''} onClick={() => updateProduct(idx, 'pricingType', 'per_piece')} style={{ flex: 1, padding: '12px', background: prod.pricingType === 'per_piece' ? 'var(--saas-card)' : 'transparent', color: prod.pricingType === 'per_piece' ? 'var(--saas-primary)' : 'var(--saas-text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: prod.pricingType === 'per_piece' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Per Piece</button>
                                                    <button type="button" className={prod.pricingType === 'per_kg' ? 'active' : ''} onClick={() => updateProduct(idx, 'pricingType', 'per_kg')} style={{ flex: 1, padding: '12px', background: prod.pricingType === 'per_kg' ? 'var(--saas-card)' : 'transparent', color: prod.pricingType === 'per_kg' ? 'var(--saas-primary)' : 'var(--saas-text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: prod.pricingType === 'per_kg' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Per KG</button>
                                                </div>
                                            </div>
                                            
                                            {prod.pricingType === 'per_piece' ? (
                                                <div style={{ flex: 1, minWidth: '140px' }}>
                                                    <label><i className="ri-price-tag-3-line" style={{ marginRight: '6px' }}/>Price / Piece</label>
                                                    <input type="number" step="any" min="0" value={prod.pricePerPiece} onChange={(e) => updateProduct(idx, 'pricePerPiece', e.target.value)} required placeholder="0.00" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ flex: 1, minWidth: '140px' }}>
                                                        <label><i className="ri-scale-3-line" style={{ marginRight: '6px' }}/>Price / KG</label>
                                                        <input type="number" step="any" min="0" value={prod.pricePerKg} onChange={(e) => updateProduct(idx, 'pricePerKg', e.target.value)} required placeholder="0.00" />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '140px' }}>
                                                        <label><i className="ri-weight-line" style={{ marginRight: '6px' }}/>Weight (KG)</label>
                                                        <input type="number" step="any" min="0" value={prod.weightPerItem} onChange={(e) => updateProduct(idx, 'weightPerItem', e.target.value)} required placeholder="0.00" />
                                                    </div>
                                                </>
                                            )}

                                            <div style={{ flex: 1, minWidth: '120px' }}>
                                                <label><i className="ri-stack-line" style={{ marginRight: '6px' }}/>Quantity</label>
                                                <input type="number" step="any" min="1" value={prod.quantity} onChange={(e) => updateProduct(idx, 'quantity', e.target.value)} required placeholder="1" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: '140px' }}>
                                                <label><i className="ri-percent-line" style={{ marginRight: '6px' }}/>Tax</label>
                                                <select
                                                    value={prod.gst ? 'true' : 'false'}
                                                    onChange={(e) => updateProduct(idx, 'gst', e.target.value === 'true')}
                                                    style={{ width: '100%', padding: '14px 16px', background: 'var(--saas-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--saas-text)', borderRadius: '12px', height: '48px' }}
                                                >
                                                    <option value="false">No GST</option>
                                                    <option value="true">With GST (18%)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Subtle Calculation Readout (Removed old bulky UI) */}
                                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Total</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--saas-text)', opacity: 0.8 }}>
                                                    {prod.pricingType === 'per_piece' && prod.pricePerPiece 
                                                        ? `${prod.pricePerPiece} × ${prod.quantity} =`
                                                        : prod.pricingType === 'per_kg' && prod.pricePerKg && prod.weightPerItem
                                                        ? `${prod.pricePerKg} × ${prod.weightPerItem} × ${prod.quantity} =`
                                                        : 'Enter details...'}
                                                </span>
                                            </div>
                                            <h2 style={{ margin: 0, color: 'var(--saas-success)', fontSize: '1.8rem' }}>₹{(prod.totalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
                                        </div>

                                        <button type="button" className="btn btn-primary w-100" onClick={() => saveAndAddNext(idx)} style={{ padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: 600, borderRadius: '12px' }}>
                                            <i className="ri-check-double-line" style={{ fontSize: '1.2rem' }} /> Save Item & Summary
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-secondary w-100" style={{ marginBottom: '32px', border: '2px dashed var(--saas-border)', background: 'transparent', color: 'var(--saas-text-muted)', padding: '16px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600 }} onClick={addProductLine}>
                        <i className="ri-add-circle-line" style={{ fontSize: '1.2rem' }} /> Add Another Product
                    </button>

                    <div className="card" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px', padding: '24px', borderRadius: '16px' }}>
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label><i className="ri-calendar-event-line" style={{ marginRight: '6px' }}/> Order Date</label>
                            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label><i className="ri-calendar-schedule-line" style={{ marginRight: '6px' }}/> Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ padding: '24px', background: 'var(--saas-card)', borderRadius: '16px', border: '1px solid var(--saas-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--saas-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Final Grand Total</span>
                            <h3 style={{ margin: 0, color: 'var(--saas-success)', fontSize: '2rem', fontWeight: 800 }}>
                                ₹{products.reduce((acc, p) => acc + (p.totalPrice || p.finalPrice || 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </h3>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '16px', fontSize: '1.15rem', borderRadius: '12px', fontWeight: 700, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', height: '56px' }}>
                            {editId ? <><i className="ri-save-3-line" /> Update Order</> : <><i className="ri-rocket-2-line" /> Submit Order</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
