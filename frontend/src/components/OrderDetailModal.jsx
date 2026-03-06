export default function OrderDetailModal({ order, onClose, onComplete, onEdit, onDelete }) {
    if (!order) return null;

    const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN');

    return (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="order-detail-card">
                {/* Header */}
                <div className="order-detail-header">
                    <h3>
                        <i className="ri-file-list-3-line" /> Order Details
                    </h3>
                    <button className="close-modal-btn interactive" onClick={onClose}>
                        <i className="ri-close-line" />
                    </button>
                </div>

                {/* Party Info */}
                <div className="order-detail-info">
                    <p className="order-party-name">
                        <strong>Party Name:</strong>{' '}
                        <span>{order.partyName}</span>
                    </p>
                    <div className="order-meta">
                        <span><i className="ri-calendar-line" /> {formatDate(order.orderDate)}</span>
                        <span><i className="ri-calendar-check-line" /> Due: {formatDate(order.dueDate)}</span>
                        <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                </div>

                {/* Products Table */}
                <div className="order-detail-products">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.products.map((p, i) => (
                                <tr key={i}>
                                    <td data-label="Product">{p.productName}</td>
                                    <td data-label="Size">{p.productSize || '-'}</td>
                                    <td data-label="Qty">{p.quantity}</td>
                                    <td data-label="Price">₹{p.price}</td>
                                    <td data-label="Total" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{p.finalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Grand Total */}
                <div className="order-detail-total">
                    Grand Total: <span>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                {/* Action Buttons */}
                <div className="order-detail-actions">
                    {order.status === 'pending' && (
                        <>
                            <button className="btn btn-success" onClick={() => { onComplete(order._id); onClose(); }}>
                                <i className="ri-check-line" /> Complete
                            </button>
                            <button className="btn btn-warning" onClick={() => { onEdit(order); onClose(); }}>
                                <i className="ri-edit-line" /> Edit
                            </button>
                        </>
                    )}
                    <button className="btn btn-danger" onClick={() => { onDelete(order._id); onClose(); }}>
                        <i className="ri-delete-bin-line" /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
