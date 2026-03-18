import { useState, useEffect, useRef } from 'react';
import SmartInput from '../components/SmartInput';
import {
    createOrder, updateOrder,
    getProductSuggestions, getSizeSuggestions, getPartySuggestions,
    addProductSuggestion, addSizeSuggestion, addPartySuggestion
} from '../services/api';

export default function OrderEntry({ editingOrder, onOrderSaved, onToast }) {
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
        <div className="section-container active" ref={formRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}><i className="ri-magic-line" /> Order Workflow</h2>
            </div>

            <div className="card interactive" style={{ padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: '20px' }}>
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
                    <div style={{ marginBottom: '20px' }}>
                        {products.map((prod, idx) => (
                            <div key={idx} style={{ marginBottom: '1rem' }}>
                                {prod.isCollapsed ? (
                                    <div className="product-line card" style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', border: '1px solid var(--saas-border)', borderRadius: '12px', margin: 0 }} onClick={() => updateProduct(idx, 'isCollapsed', false)}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--saas-primary)', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold' }}>{idx + 1}</div>
                                            <div>
                                                <strong style={{ fontSize: '1.2rem', color: 'var(--saas-text)' }}>{prod.productName || 'Unnamed Product'}</strong>
                                                <div style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                                                    {prod.pricingType === 'per_piece' 
                                                        ? `${prod.pricePerPiece || 0}/pc × ${prod.quantity || 0} qty`
                                                        : `${prod.pricePerKg || 0}/kg × ${prod.weightPerItem || 0}kg × ${prod.quantity || 0} qty`}
                                                    {prod.gst ? ' (Incl. GST)' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <h4 style={{ color: 'var(--saas-text)', margin: 0, fontSize: '1.3rem' }}>₹{(prod.totalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                                            <div style={{ color: 'var(--saas-text-muted)', padding: '6px' }}><i className="ri-edit-line" style={{ fontSize: '1.2rem' }} /></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="product-line card" style={{ padding: '20px', border: '1px solid var(--saas-primary)', position: 'relative', margin: 0, boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.15)' }}>
                                        <h5 style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: 'var(--saas-primary)' }}>
                                            Editing Item #{idx + 1}
                                            {products.length > 1 && (
                                                <button type="button" className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'transparent', color: 'var(--saas-danger)', border: '1px solid var(--saas-danger)' }} onClick={() => removeProductLine(idx)}><i className="ri-delete-bin-line" /> Remove</button>
                                            )}
                                        </h5>
                                        <div className="form-group-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ flex: 2 }}>
                                                <SmartInput 
                                                    label="Product Name" 
                                                    value={prod.productName} 
                                                    onChange={(v) => updateProduct(idx, 'productName', v)} 
                                                    suggestions={productSugg} 
                                                    required 
                                                    placeholder="Search product..."
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <SmartInput 
                                                    label="Size (Opt)" 
                                                    value={prod.productSize} 
                                                    onChange={(v) => updateProduct(idx, 'productSize', v)} 
                                                    suggestions={sizeSugg} 
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                            <div style={{ flex: 1, minWidth: '100%' }}>
                                                <label style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Pricing Basis</label>
                                                <div className="pricing-toggle" style={{ display: 'flex', background: 'var(--saas-bg)', borderRadius: '8px', padding: '4px', border: '1px solid var(--saas-border)' }}>
                                                    <button type="button" className={prod.pricingType === 'per_piece' ? 'active' : ''} onClick={() => updateProduct(idx, 'pricingType', 'per_piece')} style={{ flex: 1, padding: '10px', background: prod.pricingType === 'per_piece' ? 'var(--saas-border)' : 'transparent', color: prod.pricingType === 'per_piece' ? 'var(--saas-primary)' : 'var(--saas-text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Per Piece</button>
                                                    <button type="button" className={prod.pricingType === 'per_kg' ? 'active' : ''} onClick={() => updateProduct(idx, 'pricingType', 'per_kg')} style={{ flex: 1, padding: '10px', background: prod.pricingType === 'per_kg' ? 'var(--saas-border)' : 'transparent', color: prod.pricingType === 'per_kg' ? 'var(--saas-primary)' : 'var(--saas-text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Per KG</button>
                                                </div>
                                            </div>
                                            
                                            {prod.pricingType === 'per_piece' ? (
                                                <div style={{ flex: 1, minWidth: '120px' }}>
                                                    <label>Price / Piece</label>
                                                    <input type="number" step="any" min="0" value={prod.pricePerPiece} onChange={(e) => updateProduct(idx, 'pricePerPiece', e.target.value)} required />
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ flex: 1, minWidth: '130px' }}>
                                                        <label>Price / KG</label>
                                                        <input type="number" step="any" min="0" value={prod.pricePerKg} onChange={(e) => updateProduct(idx, 'pricePerKg', e.target.value)} required />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '130px' }}>
                                                        <label>Weight (KG)</label>
                                                        <input type="number" step="any" min="0" value={prod.weightPerItem} onChange={(e) => updateProduct(idx, 'weightPerItem', e.target.value)} required />
                                                    </div>
                                                </>
                                            )}

                                            <div style={{ flex: 1, minWidth: '120px' }}>
                                                <label>Quantity</label>
                                                <input type="number" step="any" min="1" value={prod.quantity} onChange={(e) => updateProduct(idx, 'quantity', e.target.value)} required />
                                            </div>
                                            <div style={{ flex: 1, minWidth: '120px' }}>
                                                <label>Tax</label>
                                                <select
                                                    value={prod.gst ? 'true' : 'false'}
                                                    onChange={(e) => updateProduct(idx, 'gst', e.target.value === 'true')}
                                                    style={{ width: '100%', padding: '12px 16px', background: 'var(--saas-bg)', border: '1px solid var(--saas-border)', color: 'var(--saas-text)', borderRadius: '8px' }}
                                                >
                                                    <option value="false">No GST</option>
                                                    <option value="true">With GST (18%)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Subtle Calculation Readout (Removed old bulky UI) */}
                                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)' }}>Calculation Preview</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--saas-text)' }}>
                                                    {prod.pricingType === 'per_piece' && prod.pricePerPiece 
                                                        ? `${prod.pricePerPiece} × ${prod.quantity} =`
                                                        : prod.pricingType === 'per_kg' && prod.pricePerKg && prod.weightPerItem
                                                        ? `${prod.pricePerKg} × ${prod.weightPerItem} × ${prod.quantity} =`
                                                        : 'Enter details...'}
                                                </span>
                                            </div>
                                            <h2 style={{ margin: 0, color: 'var(--saas-success)' }}>₹{(prod.totalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
                                        </div>

                                        <button type="button" className="btn btn-primary w-100" onClick={() => saveAndAddNext(idx)} style={{ padding: '12px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                            <i className="ri-check-line" /> Save Item & Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-secondary w-100" style={{ marginBottom: '2rem', border: '2px dashed var(--saas-border)', background: 'transparent', color: 'var(--saas-text-muted)', padding: '12px', borderRadius: '12px' }} onClick={addProductLine}>
                        <i className="ri-add-line" /> Add Another Product
                    </button>

                    <div className="card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '80px', padding: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-calendar-event-line" /> Order Date</label>
                            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-calendar-schedule-line" /> Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="sticky-total">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--saas-text-muted)', fontWeight: '500' }}>Final Grand Total</span>
                                <h3 style={{ margin: 0, color: 'var(--saas-success)', fontSize: '1.5rem', fontWeight: 800 }}>
                                    ₹{products.reduce((acc, p) => acc + (p.totalPrice || p.finalPrice || 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                </h3>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 700 }}>
                                {editId ? <><i className="ri-save-line" /> Update</> : <><i className="ri-rocket-line" /> Submit Order</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
