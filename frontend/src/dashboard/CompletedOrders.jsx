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

            <div className="card filters interactive">
                <div className="form-group">
                    <label><i className="ri-search-eye-line" /> Search</label>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search party, product, or amount..." />
                </div>
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={loadOrders}><i className="ri-filter-3-line" /> Filter</button>
            </div>

            <div className="card table-responsive card-view">
                <table className="responsive-table">
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
                                <tr key={o._id} className="interactive" onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                                    <td data-label="Party Name">{o.partyName || '-'}</td>
                                    <td data-label="Items">{display}</td>
                                    <td data-label="Total Amount">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                                    <td data-label="Order Date">{formatDate(o.orderDate)}</td>
                                    <td data-label="Due Date">{formatDate(o.dueDate)}</td>
                                    <td data-label="Status"><span className="status-badge status-completed">Completed</span></td>
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
