import { useState, useEffect, useCallback } from 'react';
import { getCompletedOrders, searchOrders, filterOrders, deleteOrder } from '../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

export default function CompletedOrders({ onToast }) {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = useCallback(async () => {
        try {
            let res;
            if (search) {
                res = await searchOrders(search);
            } else if (startDate && endDate) {
                res = await filterOrders(startDate, endDate);
            } else {
                res = await getCompletedOrders();
            }
            setOrders(res.data.filter(o => o.status === 'completed'));
        } catch { /* silent */ }
    }, [search, startDate, endDate]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '-';

    const handleDelete = async (id) => {
        if (!confirm('Delete this completed order?')) return;
        await deleteOrder(id);
        onToast?.('Order Deleted!', 'danger');
        loadOrders();
    };

    return (
        <div className="section-container active">
            <h2 className="section-title"><i className="ri-check-double-line" /> Completed Orders</h2>

            <div className="card filters interactive" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                    <label><i className="ri-search-eye-line" style={{ marginRight: '6px' }}/> Search</label>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search party, product, or amount..." />
                </div>
                <div className="form-group" style={{ flex: '1 1 150px' }}>
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: '1 1 150px' }}>
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', flex: '1 1 120px' }}>
                    <button className="btn btn-primary w-100" onClick={loadOrders} style={{ height: '48px', margin: 0 }}><i className="ri-filter-3-line" /> Filter</button>
                </div>
            </div>

            <div className="card table-responsive card-view" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Party Name</th><th>Items</th><th>Total Amount</th><th>Order Date</th><th>Due Date</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No completed orders found</td></tr>
                        ) : orders.map(o => {
                            const items = o.products || [];
                            const main = items.length > 0 ? items[0].productName : 'No items';
                            const display = items.length > 1 ? `${main} +${items.length - 1} more` : main;
                            return (
                                <tr key={o._id} className="interactive" onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--saas-border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--saas-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td data-label="Party Name" style={{ padding: '16px 20px', fontWeight: 600 }}>{o.partyName || '-'}</td>
                                    <td data-label="Items" style={{ padding: '16px 20px' }}>{display}</td>
                                    <td data-label="Total Amount" style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--saas-success)' }}>₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                                    <td data-label="Order Date" style={{ padding: '16px 20px' }}>{formatDate(o.orderDate)}</td>
                                    <td data-label="Due Date" style={{ padding: '16px 20px' }}>{formatDate(o.dueDate)}</td>
                                    <td data-label="Status" style={{ padding: '16px 20px' }}><span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--saas-success)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Completed</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onComplete={() => { }}
                    onEdit={() => { }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
