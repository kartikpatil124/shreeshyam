import { useState, useEffect, useRef } from 'react';
import { getStatistics } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default function OrderStatistics() {
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, dueToday: 0, overdue: 0 });
    const [trendData, setTrendData] = useState({ labels: [], data: [] });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await getStatistics();
            const d = res.data;
            setStats({ total: d.total, pending: d.pending, completed: d.completed, dueToday: d.dueToday, overdue: d.overdue });

            // Month trend
            const counts = {};
            (d.recentOrders || []).forEach(o => {
                const date = new Date(o.orderDate).toLocaleDateString('en-IN');
                counts[date] = (counts[date] || 0) + 1;
            });
            setTrendData({ labels: Object.keys(counts), data: Object.values(counts) });
        } catch { /* silent */ }
    };

    const doughnutData = {
        labels: ['Pending', 'Completed'],
        datasets: [{
            data: [stats.pending, stats.completed],
            backgroundColor: ['#f59e0b', '#10b981'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const lineData = {
        labels: trendData.labels,
        datasets: [{
            label: 'Orders (Last 30 Days)',
            data: trendData.data,
            borderColor: '#f59e0b',
            fill: true,
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const statCards = [
        { id: 'total', value: stats.total, label: 'Total Orders', icon: 'ri-global-line', className: '' },
        { id: 'pending', value: stats.pending, label: 'Pending', icon: 'ri-loader-4-line', className: '', style: { color: 'var(--warning)' } },
        { id: 'completed', value: stats.completed, label: 'Completed', icon: 'ri-checkbox-circle-line', className: 'glow-success' },
        { id: 'dueToday', value: stats.dueToday, label: 'Due Today', icon: 'ri-alert-line', className: 'glow-warning' },
        { id: 'overdue', value: stats.overdue, label: 'Overdue', icon: 'ri-alarm-warning-line', className: 'glow-danger' },
    ];

    return (
        <div className="section-container active">
            <h2 className="section-title"><i className="ri-dashboard-3-line" /> Order Statistics</h2>

            <div className="stats-grid">
                {statCards.map(s => (
                    <div key={s.id} className={`stat-card ${s.className}`}>
                        <h3 style={s.style}>{s.value}</h3>
                        <p>{s.label}</p>
                        <i className={s.icon} />
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="card chart-box interactive">
                    <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: "'Outfit', sans-serif" } } } }, cutout: '70%' }} />
                </div>
                <div className="card chart-box interactive">
                    <Line data={lineData} options={{
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { color: '#9ca3af' } },
                            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                        },
                        plugins: { legend: { display: false } }
                    }} />
                </div>
            </div>
        </div>
    );
}
