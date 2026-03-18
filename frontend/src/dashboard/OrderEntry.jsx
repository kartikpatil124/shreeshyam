import { useState, useEffect, useRef } from 'react';
import SuggestionBar from '../components/SuggestionBar';
import Calculator from '../components/Calculator';
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
    const [showCalculator, setShowCalculator] = useState(false);

    const [partySugg, setPartySugg] = useState([]);
    const [productSugg, setProductSugg] = useState([]);
    const [sizeSugg, setSizeSugg] = useState([]);
    const formRef = useRef(null);

    function createEmptyProduct() {
        return { productName: '', productSize: '', price: 0, quantity: 1, priceType: 'pieces', gst: false, finalPrice: 0, description: '' };
    }

    // Load suggestions
    useEffect(() => {
        loadSuggestions();
    }, []);

    // Load editing order
    useEffect(() => {
        if (editingOrder) {
            setPartyName(editingOrder.partyName);
            setOrderDate(new Date(editingOrder.orderDate).toISOString().split('T')[0]);
            setDueDate(new Date(editingOrder.dueDate).toISOString().split('T')[0]);
            setProducts(editingOrder.products.map(p => ({ ...p })));
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
        // Recalc final price
        const p = updated[index];
        const base = (Number(p.price) || 0) * (Number(p.quantity) || 0);
        updated[index].finalPrice = p.gst ? +(base * 1.18).toFixed(2) : +base.toFixed(2);
        setProducts(updated);
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
        const totalAmount = validProducts.reduce((sum, p) => sum + (p.finalPrice || 0), 0);
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

            // Save suggestions
            await addPartySuggestion(partyName);
            for (const p of validProducts) {
                await addProductSuggestion(p.productName);
                if (p.productSize) await addSizeSuggestion(p.productSize);
            }

            // Reset form
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title"><i className="ri-magic-line" /> Smart Order Entry</h2>
                <button type="button" onClick={() => setShowCalculator(!showCalculator)} className="btn btn-secondary">
                    <i className="ri-calculator-line" /> {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
                </button>
            </div>
            {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

            <div className="card">
                <h4><i className="ri-brain-line" /> Smart Suggestions</h4>
                <SuggestionBar label="Parties:" items={partySugg} onSelect={(v) => setPartyName(v)} />
                <SuggestionBar label="Products:" items={productSugg} onSelect={(v) => {
                    const updated = [...products];
                    updated[updated.length - 1].productName = v;
                    setProducts(updated);
                }} />
                <SuggestionBar label="Sizes:" items={sizeSugg} onSelect={(v) => {
                    const updated = [...products];
                    updated[updated.length - 1].productSize = v;
                    setProducts(updated);
                }} />
            </div>

            <div className="card interactive">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><i className="ri-building-line" /> Party Name</label>
                        <input type="text" value={partyName} onChange={(e) => setPartyName(e.target.value)} required placeholder="Enter party/client name..." />
                    </div>

                    {products.map((prod, idx) => (
                        <div key={idx} className="product-line card" style={{ backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: '1rem' }}>
                            <h5 style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                                Product {idx + 1}
                                {products.length > 1 && (
                                    <button type="button" className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '0.8rem' }} onClick={() => removeProductLine(idx)}>Remove</button>
                                )}
                            </h5>
                            <div className="form-group"><label>Product Name</label><input type="text" value={prod.productName} onChange={(e) => updateProduct(idx, 'productName', e.target.value)} required /></div>
                            <div className="form-group"><label>Product Size (Optional)</label><input type="text" value={prod.productSize} onChange={(e) => updateProduct(idx, 'productSize', e.target.value)} /></div>
                            <div className="form-group form-group-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label>Unit</label>
                                    <select
                                        value={prod.priceType || 'pieces'}
                                        onChange={(e) => updateProduct(idx, 'priceType', e.target.value)}
                                        style={{ padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', width: '100%' }}
                                    >
                                        <option value="pieces">Per Piece</option>
                                        <option value="kg">Per Kg</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label>Price</label>
                                    <input type="number" value={prod.price} onChange={(e) => updateProduct(idx, 'price', e.target.value)} required />
                                </div>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label>Quantity</label>
                                    <input type="number" value={prod.quantity} onChange={(e) => updateProduct(idx, 'quantity', e.target.value)} required />
                                </div>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label>Tax</label>
                                    <select
                                        value={prod.gst ? 'true' : 'false'}
                                        onChange={(e) => updateProduct(idx, 'gst', e.target.value === 'true')}
                                        style={{ padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', width: '100%' }}
                                    >
                                        <option value="false">Without GST</option>
                                        <option value="true">With GST (18%)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Final Price</label>
                                <input type="text" readOnly value={prod.finalPrice.toFixed(2)} style={{ background: 'rgba(245,158,11,0.1)', fontWeight: 'bold', color: 'var(--primary)', borderColor: 'rgba(245,158,11,0.3)' }} />
                            </div>
                            <div className="form-group"><label>Description (Optional)</label><input type="text" value={prod.description} onChange={(e) => updateProduct(idx, 'description', e.target.value)} /></div>
                        </div>
                    ))}

                    <button type="button" className="btn btn-secondary w-100" style={{ marginBottom: '2rem' }} onClick={addProductLine}>
                        <i className="ri-add-line" /> Add Product
                    </button>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-calendar-event-line" /> Order Date</label>
                            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label><i className="ri-calendar-schedule-line" /> Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                        {editId ? <><i className="ri-save-line" /> Update Order</> : <><i className="ri-rocket-line" /> Submit Order</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
