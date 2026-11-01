/* ============================================
   LUMIÈRE CRM — Admin Logic
   ============================================ */

let allBookings = [];
let currentFilter = 'all';
let searchQuery = '';

const API_BASE = window.location.origin;

async function loadData() {
    try {
        const [bookingsRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/api/bookings`),
            fetch(`${API_BASE}/api/stats`)
        ]);

        if (bookingsRes.ok) {
            allBookings = await bookingsRes.json();
            renderTable();
        }

        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('stat-total').textContent = stats.total_bookings;
            document.getElementById('stat-new').textContent = stats.new_bookings;
            document.getElementById('stat-revenue').textContent = stats.total_revenue.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('stat-master').textContent = stats.top_master.split(' ')[0] || '—';
        }
    } catch (err) {
        console.error('Error loading CRM data:', err);
    }
}

function renderTable() {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    let filtered = allBookings;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(b => b.status === currentFilter);
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(b =>
            (b.client_name && b.client_name.toLowerCase().includes(q)) ||
            (b.client_phone && b.client_phone.includes(q)) ||
            (b.booking_code && b.booking_code.toLowerCase().includes(q)) ||
            (b.master_name && b.master_name.toLowerCase().includes(q))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: rgba(253,251,249,0.4)">
                    <i class="ph ph-folder-open" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem"></i>
                    Записей не найдено
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        const cleanPhone = (b.client_phone || '').replace(/\D/g, '');
        const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

        return `
            <tr>
                <td>
                    <span class="booking-code">${b.booking_code || '#' + b.id}</span>
                </td>
                <td>
                    <span class="client-name">${b.client_name}</span>
                    <a href="tel:${b.client_phone}" class="client-phone">
                        <i class="ph ph-phone"></i> ${b.client_phone}
                    </a>
                    ${cleanPhone ? `
                        <a href="${waLink}" target="_blank" class="client-phone" style="color: #25D366; margin-left: 0.5rem">
                            <i class="ph ph-whatsapp-logo"></i> WA
                        </a>
                    ` : ''}
                </td>
                <td>
                    <div style="font-weight: 500">${b.booking_date}</div>
                    <div style="font-size: 0.75rem; color: var(--gold-light)"><i class="ph ph-clock"></i> ${b.booking_time}</div>
                </td>
                <td>
                    <div style="font-size: 0.8125rem">${b.master_name}</div>
                    ${b.is_four_hands ? '<span style="font-size: 0.65rem; color: var(--gold)">👑 4 руки</span>' : ''}
                </td>
                <td style="max-width: 250px">
                    <div style="font-size: 0.78rem; line-height: 1.3">${b.services}</div>
                    ${b.drink ? `<div style="font-size: 0.7rem; color: rgba(253,251,249,0.5); margin-top: 0.2rem">🍸 ${b.drink}</div>` : ''}
                    ${b.custom_note ? `<div style="font-size: 0.7rem; color: var(--gold-light); font-style: italic; margin-top: 0.2rem">«${b.custom_note}»</div>` : ''}
                </td>
                <td>
                    <span class="price-cell">${(b.total_price || 0).toLocaleString('ru-RU')} ₽</span>
                </td>
                <td>
                    <select class="status-select" onchange="updateStatus(${b.id}, this.value)">
                        <option value="new" ${b.status === 'new' ? 'selected' : ''}>🟡 Новая</option>
                        <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>🔵 Подтверждена</option>
                        <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>🟢 Завершена</option>
                        <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>🔴 Отменена</option>
                    </select>
                </td>
                <td>
                    <button class="btn-action" onclick="deleteBookingItem(${b.id})" title="Удалить запись">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            const booking = allBookings.find(b => b.id === id);
            if (booking) booking.status = newStatus;
            loadData();
        }
    } catch (e) {
        console.error('Failed to update status', e);
    }
}

async function deleteBookingItem(id) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            allBookings = allBookings.filter(b => b.id !== id);
            loadData();
        }
    } catch (e) {
        console.error('Failed to delete booking', e);
    }
}

function setFilter(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function handleSearch(val) {
    searchQuery = val;
    renderTable();
}

// Modal handling
function openAddModal() {
    document.getElementById('modal-add').classList.add('open');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('add-date').value = tomorrow.toISOString().split('T')[0];
}

function closeAddModal() {
    document.getElementById('modal-add').classList.remove('open');
}

async function handleAddSubmit(e) {
    e.preventDefault();
    const data = {
        client_name: document.getElementById('add-name').value.trim(),
        client_phone: document.getElementById('add-phone').value.trim(),
        booking_date: document.getElementById('add-date').value,
        booking_time: document.getElementById('add-time').value,
        master_name: document.getElementById('add-master').value,
        services: document.getElementById('add-services').value.trim() || 'Маникюр',
        drink: document.getElementById('add-drink').value,
        total_price: parseInt(document.getElementById('add-price').value) || 3600,
        is_four_hands: document.getElementById('add-four-hands').checked
    };

    try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeAddModal();
            loadData();
            alert('Запись успешно создана!');
        } else {
            alert('Ошибка при создании записи');
        }
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Poll updates every 20 seconds
    setInterval(loadData, 20000);
});
