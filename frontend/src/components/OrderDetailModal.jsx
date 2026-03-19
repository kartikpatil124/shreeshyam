export default function OrderDetailModal({ order, onClose, onComplete, onEdit, onDelete }) {
    if (!order) return null;

    const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN');

    return (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 'auto', background: 'var(--saas-card)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--saas-border)', boxShadow: 'var(--saas-shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--saas-border)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--saas-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Party Name</p>
                            <h2 style={{ margin: 0, color: 'var(--saas-text)', fontSize: '1.4rem', fontWeight: 700 }}>{order.partyName}</h2>
                        </div>
                        <span className="status-badge" style={{ 
                            background: order.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: order.status === 'completed' ? 'var(--saas-success)' : 'var(--saas-warning)',
                            padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>{order.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--saas-text-muted)' }}>
                        <span><i className="ri-calendar-event-line" style={{ marginRight: '6px' }} /> {formatDate(order.orderDate)}</span>
                        <span><i className="ri-calendar-schedule-line" style={{ marginRight: '6px' }} /> Due: {formatDate(order.dueDate)}</span>
                    </div>

                    <button title="Close" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--saas-bg)', border: '1px solid var(--saas-border)', color: 'var(--saas-text)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <i className="ri-close-line" />
                    </button>
                </div>

                {/* Product List */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: 'var(--saas-bg)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--saas-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {order.products.map((p, i) => (
                            <div key={i} style={{ background: 'var(--saas-card)', border: '1px solid var(--saas-border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--saas-text)' }}>{p.productName}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--saas-text-muted)', flexWrap: 'wrap' }}>
                                        <span>{p.pricingType === 'per_piece' ? 'Per Piece' : 'Per KG'}</span>
                                        {p.productSize && <><span style={{ opacity: 0.3 }}>|</span><span>{p.productSize}</span></>}
                                        {p.pricingType === 'per_kg' && p.weightPerItem && <><span style={{ opacity: 0.3 }}>|</span><span>{p.weightPerItem}kg</span></>}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--saas-text-muted)', marginTop: '4px' }}>
                                        {p.quantity} x ₹{p.pricingType === 'per_piece' ? p.pricePerPiece : p.pricePerKg}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--saas-primary)' }}>
                                    ₹{(p.totalPrice || p.finalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer/Totals */}
                <div style={{ padding: '24px', borderTop: '1px solid var(--saas-border)', background: 'var(--saas-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--saas-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grand Total</span>
                        <h2 style={{ margin: 0, color: 'var(--saas-success)', fontSize: '1.8rem', fontWeight: 800 }}>
                            ₹{(order.totalAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </h2>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {order.status === 'pending' && (
                            <>
                                <button className="btn" style={{ flex: '1 1 auto', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--saas-success)', border: 'none' }} onClick={() => { onComplete(order._id); onClose(); }}>
                                    <i className="ri-check-double-line" style={{ marginRight: '6px' }} /> Complete
                                </button>
                                <button className="btn btn-secondary" style={{ flex: '1 1 auto', borderColor: 'var(--saas-primary)', color: 'var(--saas-primary)' }} onClick={() => { onEdit(order); onClose(); }}>
                                    <i className="ri-pencil-line" style={{ marginRight: '6px' }} /> Edit
                                </button>
                            </>
                        )}
                        <button className="btn" style={{ flex: '1 1 auto', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--saas-danger)' }} onClick={() => { onDelete(order._id); onClose(); }}>
                            <i className="ri-delete-bin-line" style={{ marginRight: '6px' }} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
