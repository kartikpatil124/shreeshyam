// ==========================================
// ShyamSteel Admin Dashboard — Cookie Auth
// ==========================================

const headers = { 'Content-Type': 'application/json' };
const fetchOpts = { headers, credentials: 'include' };

// ── Auth Gate ──
async function verifyAuth() {
    try {
        const res = await fetch('/admin/verify-session', { credentials: 'include' });
        const data = await res.json();
        if (!data.authenticated) {
            window.location.href = '/login.html';
            return false;
        }
        document.getElementById('adminName').innerHTML =
            `<i class="ri-user-star-line"></i> ${data.admin.email.split('@')[0]}`;
        return true;
    } catch (e) {
        window.location.href = '/login.html';
        return false;
    }
}

function logout() {
    fetch('/admin/logout', { method: 'POST', credentials: 'include' })
        .then(() => window.location.href = '/');
}

// ── Toast System ──
function toast(msg, type = 'primary') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast';
    const iconMap = { success: 'ri-check-line', danger: 'ri-close-circle-line', warning: 'ri-alert-line', primary: 'ri-information-line' };
    t.innerHTML = `<i class="${iconMap[type] || iconMap.primary}" style="color:var(--${type})"></i> ${msg}`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ── Product Line Builder ──
let productLineCount = 0;
function addProductLine() {
    productLineCount++;
    const container = document.getElementById('productLinesContainer');
    const div = document.createElement('div');
    div.className = 'product-line card';
    div.style.backgroundColor = 'rgba(0,0,0,0.2)';
    div.style.marginBottom = '1rem';
    div.innerHTML = `
        <h5 style="margin-bottom: 0.5rem; display:flex; justify-content:space-between; color:var(--primary); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
            Product ${productLineCount} 
            ${productLineCount > 1 ? '<button type="button" class="btn btn-danger" style="padding:2px 8px; font-size:0.8rem;" onclick="this.closest(\'.product-line\').remove(); calcTotalAmount();">Remove</button>' : ''}
        </h5>
        <div class="form-group"><label>Product Name</label><input type="text" class="prod-name" required></div>
        <div class="form-group"><label>Product Size (Optional)</label><input type="text" class="prod-size"></div>
        <div class="form-group" style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="flex:1; min-width:120px;"><label>Price per Product</label><input type="number" class="prod-price" required oninput="calcFinalPrice(this)"></div>
            <div style="flex:1; min-width:120px;"><label>Quantity</label><input type="number" class="prod-qty" value="1" required oninput="calcFinalPrice(this)"></div>
            <div style="flex:1; min-width:120px;">
                <label>Tax</label>
                <select class="prod-gst" onchange="calcFinalPrice(this)" style="padding:0.85rem 1rem; background:rgba(0,0,0,0.4); border:1px solid var(--border); border-radius:8px; color:var(--text-main); width:100%;">
                    <option value="false">Without GST</option>
                    <option value="true">With GST (18%)</option>
                </select>
            </div>
        </div>
        <div class="form-group"><label>Final Price</label><input type="text" class="prod-final-price" readonly style="background:rgba(245,158,11,0.1); font-weight:bold; color:var(--primary); border-color:rgba(245,158,11,0.3);" value="0.00"></div>
        <div class="form-group"><label>Description (Optional)</label><input type="text" class="prod-desc"></div>
    `;
    container.appendChild(div);
}

function calcFinalPrice(element) {
    const line = element.closest('.product-line');
    const price = Number(line.querySelector('.prod-price').value) || 0;
    const qty = Number(line.querySelector('.prod-qty').value) || 0;
    const gst = line.querySelector('.prod-gst').value === 'true';
    let final = price * qty;
    if (gst) final += final * 0.18;
    line.querySelector('.prod-final-price').value = final.toFixed(2);
    calcTotalAmount();
}

function calcTotalAmount() {
    let total = 0;
    document.querySelectorAll('.prod-final-price').forEach(el => total += Number(el.value) || 0);
}

// ── Sidebar Navigation ──
document.querySelectorAll('#sidebarMenu li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelectorAll('#sidebarMenu li').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.section-container').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        const target = li.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        if (target === 'pending-orders') loadPending();
        if (target === 'completed-orders') loadCompleted();
        if (target === 'order-statistic') loadStats();
        if (target === 'order-entry') loadSuggestions();
    });
});

// ── Notifications ──
const notifBell = document.getElementById('notifBell');
const notifDropdown = document.getElementById('notifDropdown');
notifBell.addEventListener('click', () => notifDropdown.classList.toggle('active'));

function addNotification(msg) {
    const item = document.createElement('div');
    item.className = 'notif-item';
    item.innerHTML = `<i class="ri-alert-line"></i> <span>${msg}</span>`;
    notifDropdown.prepend(item);
    document.getElementById('notifDot').style.display = 'block';
    toast(msg, 'warning');
}

// ── Utility ──
function formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-IN');
}

// ── Load Pending Orders ──
async function loadPending() {
    const s = document.getElementById('searchPending').value;
    const start = document.getElementById('pendingStart').value;
    const end = document.getElementById('pendingEnd').value;
    let url = '/orders/pending';
    if (s) url = `/orders/search?query=${s}`;
    else if (start && end) url = `/orders/filter?startDate=${start}&endDate=${end}`;

    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('pendingTbody');
    tbody.innerHTML = '';
    if (!window.currentOrdersMap) window.currentOrdersMap = {};

    const today = new Date();
    data.forEach(o => {
        if (o.status !== 'pending') return;
        const due = new Date(o.dueDate);
        const diffHrs = (due - today) / (1000 * 60 * 60);
        if (diffHrs < 0 && diffHrs > -24) addNotification(`Overdue: ${o.partyName}`);
        else if (diffHrs >= 0 && diffHrs <= 24) addNotification(`Due Soon: ${o.partyName}`);

        const items = o.products || [];
        const main = items.length > 0 ? items[0].productName : 'No items';
        const display = items.length > 1 ? `${main} +${items.length - 1} more` : main;

        window.currentOrdersMap[o._id] = o;
        const tr = document.createElement('tr');
        tr.className = 'interactive';
        tr.onclick = (e) => { if (!e.target.closest('button')) openOrderDetails(o._id); };
        tr.innerHTML = `
            <td>${o.partyName || '-'}</td>
            <td>${display}</td>
            <td>₹${(o.totalAmount || 0).toLocaleString('en-IN')}</td>
            <td>${formatDate(o.orderDate)}</td>
            <td>${formatDate(o.dueDate)}</td>
            <td><span class="status-badge status-pending">Pending</span></td>
            <td class="table-actions">
                <button class="btn btn-success" onclick="completeOrder('${o._id}')"><i class="ri-check-line"></i></button>
                <button class="btn btn-danger" onclick="deleteOrder('${o._id}')"><i class="ri-delete-bin-line"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function completeOrder(id) {
    await fetch(`/orders/complete/${id}`, { method: 'PUT', credentials: 'include' });
    toast('Order marked as Completed!', 'success');
    loadPending();
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    await fetch(`/orders/delete/${id}`, { method: 'DELETE', credentials: 'include' });
    toast('Order Deleted!', 'danger');
    loadPending();
}

// ── Load Completed Orders ──
async function loadCompleted() {
    const s = document.getElementById('searchCompleted').value;
    const start = document.getElementById('completedStart').value;
    const end = document.getElementById('completedEnd').value;
    let url = '/orders/completed';
    if (s) url = `/orders/search?query=${s}`;
    else if (start && end) url = `/orders/filter?startDate=${start}&endDate=${end}`;

    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('completedTbody');
    tbody.innerHTML = '';
    if (!window.currentOrdersMap) window.currentOrdersMap = {};

    data.forEach(o => {
        window.currentOrdersMap[o._id] = o;
        if (o.status !== 'completed') return;
        const items = o.products || [];
        const main = items.length > 0 ? items[0].productName : 'No items';
        const display = items.length > 1 ? `${main} +${items.length - 1} more` : main;

        const tr = document.createElement('tr');
        tr.className = 'interactive';
        tr.onclick = (e) => { if (!e.target.closest('button')) openOrderDetails(o._id); };
        tr.innerHTML = `
            <td>${o.partyName || '-'}</td>
            <td>${display}</td>
            <td>₹${(o.totalAmount || 0).toLocaleString('en-IN')}</td>
            <td>${formatDate(o.orderDate)}</td>
            <td>${formatDate(o.dueDate)}</td>
            <td><span class="status-badge status-completed">Completed</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// ── Order Entry Submit ──
document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const partyName = document.getElementById('partyName').value;
    const orderDate = document.getElementById('orderDate').value;
    const dueDate = document.getElementById('dueDate').value;

    const products = [];
    let totalAmount = 0;

    document.querySelectorAll('.product-line').forEach(line => {
        const pName = line.querySelector('.prod-name').value;
        const pSize = line.querySelector('.prod-size').value;
        const pPrice = Number(line.querySelector('.prod-price').value) || 0;
        const pQty = Number(line.querySelector('.prod-qty').value) || 1;
        const pGst = line.querySelector('.prod-gst').value === 'true';
        const pFinal = Number(line.querySelector('.prod-final-price').value) || 0;
        const pDesc = line.querySelector('.prod-desc').value;
        totalAmount += pFinal;

        if (pName) {
            products.push({
                productName: pName, productSize: pSize,
                price: pPrice, quantity: pQty,
                gst: pGst, finalPrice: pFinal,
                description: pDesc
            });
        }
    });

    if (products.length === 0) return toast('Please add at least one product', 'danger');

    const editId = document.getElementById('orderForm').getAttribute('data-edit-id');
    const url = editId ? `/orders/update/${editId}` : '/orders/create';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyName, products, totalAmount, orderDate, dueDate })
    });

    if (res.ok) {
        if (editId) {
            document.getElementById('orderForm').removeAttribute('data-edit-id');
            document.querySelector('#orderForm button[type="submit"]').innerHTML = '<i class="ri-rocket-line"></i> Submit Order';
        }
        // Save suggestions
        await fetch('/suggestions/add-party', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partyName })
        });
        for (const p of products) {
            await fetch('/suggestions/add-product', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName: p.productName })
            });
            if (p.productSize) {
                await fetch('/suggestions/add-size', {
                    method: 'POST', credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productSize: p.productSize })
                });
            }
        }

        toast(editId ? 'Order Updated Successfully!' : 'Order Created Successfully!', 'success');
        addNotification(editId ? `Order Updated: ${partyName}` : `New Order: ${partyName}`);
        document.getElementById('orderForm').reset();
        document.getElementById('productLinesContainer').innerHTML = '';
        productLineCount = 0;
        addProductLine();
        loadSuggestions();
    }
});

// ── Suggestions ──
async function loadSuggestions() {
    const [prodRes, sizeRes, partyRes] = await Promise.all([
        fetch('/suggestions/products', { credentials: 'include' }),
        fetch('/suggestions/sizes', { credentials: 'include' }),
        fetch('/suggestions/parties', { credentials: 'include' })
    ]);
    const products = await prodRes.json();
    const sizes = await sizeRes.json();
    const parties = await partyRes.json();

    const render = (arr, containerId, label, fillFn) => {
        const cont = document.getElementById(containerId);
        if (!cont) return;
        cont.innerHTML = `<strong>${label}</strong>`;
        const subset = arr.slice(-6);

        subset.forEach(item => {
            const span = document.createElement('span');
            span.className = 'sugg-chip';
            span.innerText = item;
            span.onclick = () => fillFn(item);
            cont.appendChild(span);
        });

        if (arr.length > 6) {
            const more = document.createElement('span');
            more.className = 'sugg-chip';
            more.style.background = 'rgba(245,158,11,0.1)';
            more.style.color = 'var(--primary)';
            more.innerText = `+${arr.length - 6} more`;
            more.onclick = () => {
                cont.innerHTML = `<strong>${label}</strong>`;
                arr.forEach(item => {
                    const span = document.createElement('span');
                    span.className = 'sugg-chip';
                    span.innerText = item;
                    span.onclick = () => fillFn(item);
                    cont.appendChild(span);
                });
            };
            cont.appendChild(more);
        }
    };

    render(parties, 'suggestionBarParties', 'Parties:', val => { document.getElementById('partyName').value = val; });
    render(products, 'suggestionBarProducts', 'Products:', val => {
        const lines = document.querySelectorAll('.prod-name');
        if (lines.length > 0) lines[lines.length - 1].value = val;
    });
    render(sizes, 'suggestionBarSizes', 'Sizes:', val => {
        const lines = document.querySelectorAll('.prod-size');
        if (lines.length > 0) lines[lines.length - 1].value = val;
    });
}

// ── Update Credentials ──
document.getElementById('credsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const np = document.getElementById('newPassword').value;
    const cp = document.getElementById('confirmPassword').value;
    if (np !== cp) return toast('Passwords do not match', 'danger');

    const payload = {
        currentEmail: document.getElementById('currEmail').value,
        currentPassword: document.getElementById('currPassword').value,
        newEmail: document.getElementById('newEmail').value,
        newPassword: np
    };

    const res = await fetch('/admin/update-credentials', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
        toast('Credentials Updated — Redirecting to login...', 'success');
        setTimeout(() => window.location.href = '/login.html', 2000);
    } else {
        toast(data.message, 'danger');
    }
});

// ── Charts & Stats ──
let ratioChartObj, trendChartObj;

async function loadStats() {
    const res = await fetch('/orders/statistics', { credentials: 'include' });
    const data = await res.json();

    document.getElementById('statTotal').innerText = data.total;
    document.getElementById('statPending').innerText = data.pending;
    document.getElementById('statCompleted').innerText = data.completed;
    document.getElementById('statDueToday').innerText = data.dueToday;
    document.getElementById('statOverdue').innerText = data.overdue;

    if (ratioChartObj) ratioChartObj.destroy();
    if (trendChartObj) trendChartObj.destroy();

    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    const ctxRatio = document.getElementById('ratioChart').getContext('2d');
    ratioChartObj = new Chart(ctxRatio, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Completed'],
            datasets: [{ data: [data.pending, data.completed], backgroundColor: ['#f59e0b', '#10b981'], borderWidth: 0, hoverOffset: 10 }]
        },
        options: { plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
    });

    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    const counts = {};
    data.recentOrders.forEach(o => {
        const d = new Date(o.orderDate).toLocaleDateString('en-IN');
        counts[d] = (counts[d] || 0) + 1;
    });

    trendChartObj = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Orders (Last 30 Days)',
                data: Object.values(counts),
                borderColor: '#f59e0b', fill: true,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4, pointBackgroundColor: '#10b981',
                pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
            }]
        },
        options: {
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ── Modal Logic ──
function openOrderDetails(id) {
    const order = window.currentOrdersMap[id];
    if (!order) return;

    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailsContent');
    const editContent = document.getElementById('orderEditContent');
    const actions = document.getElementById('orderModalActions');

    content.style.display = 'block';
    editContent.style.display = 'none';

    let html = `
        <div style="margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; color: #fff;">
            <p style="margin-bottom: 0.5rem;"><strong>Party Name:</strong> <span style="color:var(--primary); font-size:1.1rem; font-weight:bold;">${order.partyName}</span></p>
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size: 0.9rem; color: var(--text-muted);">
                <span>Date: ${new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
                <span>Due Date: ${new Date(order.dueDate).toLocaleDateString('en-IN')}</span>
                <span>Status: <span class="status-badge status-${order.status}">${order.status}</span></span>
            </div>
        </div>
        <div style="max-height:300px; overflow-y:auto; margin-bottom:1rem;" class="table-responsive">
            <table style="width:100%; border-collapse:collapse; background:rgba(0,0,0,0.2);">
                <tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    `;
    order.products.forEach(p => {
        html += `<tr>
            <td>${p.productName}</td>
            <td>${p.productSize || '-'}</td>
            <td>${p.quantity}</td>
            <td>₹${p.price}</td>
            <td style="color:var(--primary); font-weight:bold;">₹${p.finalPrice}</td>
        </tr>`;
    });
    html += `</table></div>
        <h4 style="text-align:right; color:var(--primary); font-size:1.3rem;">Grand Total: ₹${order.totalAmount}</h4>
    `;
    content.innerHTML = html;

    actions.innerHTML = `
        ${order.status === 'pending' ? `<button class="btn btn-success" style="padding:0.5rem 1rem;" onclick="completeOrder('${order._id}'); closeOrderModal();"><i class="ri-check-line"></i> Complete</button>` : ''}
        ${order.status === 'pending' ? `<button class="btn btn-warning" style="padding:0.5rem 1rem;" onclick="editOrder('${order._id}')"><i class="ri-edit-line"></i> Edit</button>` : ''}
        <button class="btn btn-danger" style="padding:0.5rem 1rem;" onclick="deleteOrder('${order._id}'); closeOrderModal();"><i class="ri-delete-bin-line"></i> Delete</button>
    `;

    modal.classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function editOrder(id) {
    const order = window.currentOrdersMap[id];
    if (!order) return;

    document.querySelector('#sidebarMenu li[data-target="order-entry"]').click();
    closeOrderModal();
    toast('Editing order in Order Entry form...', 'primary');

    document.getElementById('partyName').value = order.partyName;
    document.getElementById('orderDate').value = new Date(order.orderDate).toISOString().split('T')[0];
    document.getElementById('dueDate').value = new Date(order.dueDate).toISOString().split('T')[0];

    const container = document.getElementById('productLinesContainer');
    container.innerHTML = '';
    productLineCount = 0;

    order.products.forEach(p => {
        addProductLine();
        const lines = container.querySelectorAll('.product-line');
        const last = lines[lines.length - 1];

        last.querySelector('.prod-name').value = p.productName || '';
        last.querySelector('.prod-size').value = p.productSize || '';
        last.querySelector('.prod-price').value = p.price || 0;
        last.querySelector('.prod-qty').value = p.quantity || 1;
        last.querySelector('.prod-gst').value = p.gst ? 'true' : 'false';
        last.querySelector('.prod-desc').value = p.description || '';
        last.querySelector('.prod-final-price').value = p.finalPrice || 0;
    });

    document.getElementById('orderForm').setAttribute('data-edit-id', order._id);
    document.querySelector('#orderForm button[type="submit"]').innerHTML = '<i class="ri-save-line"></i> Update Order';
}

// ── Initialize ──
(async () => {
    const ok = await verifyAuth();
    if (!ok) return;
    addProductLine();
    document.querySelector('#sidebarMenu li').click();
})();
