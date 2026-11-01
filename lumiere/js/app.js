/* ============================================
   LUMIÈRE — Main Application Logic
   ============================================ */

import { servicesData, portfolioItems } from './data.js';

// ─── State ────────────────────────────────────
let currentCategory = 'manicure';
let selectedServiceIds = new Set();
let bookingState = {
    master: 'Алина Романова (Топ-стилист)',
    time: '13:30',
    customLookNote: ''
};

// ─── DOM References ───────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Service Catalog ──────────────────────────
function findServiceById(id) {
    for (const key in servicesData) {
        const found = servicesData[key].find(s => s.id === id);
        if (found) return found;
    }
    return null;
}

function renderServicesList() {
    const container = $('#services-list-container');
    if (!container) return;

    const items = servicesData[currentCategory];

    container.innerHTML = items.map(item => {
        const isSelected = selectedServiceIds.has(item.id);
        return `
            <div onclick="window.LumiereApp.toggleService('${item.id}')"
                 class="service-card ${isSelected ? 'selected' : ''}"
                 role="button" tabindex="0"
                 aria-pressed="${isSelected}">
                <div class="service-card-info">
                    <div>
                        <span class="service-card-name">${item.name}</span>
                        ${item.popular ? '<span class="service-badge-hit">Хит</span>' : ''}
                    </div>
                    <p class="service-card-desc">${item.desc}</p>
                    <div class="service-card-duration">
                        <i class="ph ph-clock"></i> ${item.duration} мин
                    </div>
                </div>
                <div class="service-card-right">
                    <span class="service-card-price">${item.price.toLocaleString('ru-RU')} ₽</span>
                    <div class="service-card-toggle">
                        <i class="ph ${isSelected ? 'ph-check-bold' : 'ph-plus'}"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function switchServiceCategory(cat) {
    currentCategory = cat;
    $$('.service-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = $(`#tab-${cat}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderServicesList();
}

function toggleService(id) {
    if (selectedServiceIds.has(id)) {
        selectedServiceIds.delete(id);
    } else {
        selectedServiceIds.add(id);
    }
    renderServicesList();
    updateCalculatorUI();
}

function clearCalculator() {
    selectedServiceIds.clear();
    const fourHandsToggle = $('#four-hands-toggle');
    if (fourHandsToggle) fourHandsToggle.checked = false;
    renderServicesList();
    updateCalculatorUI();
}

// ─── Calculator ───────────────────────────────
function getCalculatedTotals() {
    const selectedArr = Array.from(selectedServiceIds).map(findServiceById).filter(Boolean);
    const fourHands = $('#four-hands-toggle')?.checked || false;

    let subtotal = 0;
    let totalDuration = 0;

    selectedArr.forEach(s => {
        subtotal += s.price;
        totalDuration += s.duration;
    });

    let surcharge = 0;
    if (fourHands && selectedArr.length > 0) {
        surcharge = Math.round(subtotal * 0.15);
        if (selectedArr.length > 1) {
            totalDuration = Math.round(totalDuration * 0.55);
        }
    }

    const totalPrice = subtotal + surcharge;
    const hours = Math.floor(totalDuration / 60);
    const mins = totalDuration % 60;
    const timeText = hours > 0 ? `${hours} ч ${mins > 0 ? mins + ' мин' : ''}` : `${mins} мин`;

    return { selectedArr, subtotal, surcharge, totalPrice, totalDuration, timeText, fourHands };
}

function updateCalculatorUI() {
    const listEl = $('#calc-selected-list');
    const badgeEl = $('#calc-count-badge');
    const timeEl = $('#calc-total-time');
    const priceEl = $('#calc-total-price');
    const clearBtn = $('#calc-clear-btn');
    const mobileBar = $('#mobile-sticky-bar');

    if (!listEl) return;

    const { selectedArr, surcharge, totalPrice, timeText, fourHands } = getCalculatedTotals();
    badgeEl.textContent = selectedArr.length;

    if (selectedArr.length === 0) {
        listEl.innerHTML = `
            <div class="calc-empty">
                <i class="ph ph-sparkle"></i>
                <p>Отметьте услуги слева, чтобы собрать персональный сет</p>
            </div>
        `;
        timeEl.textContent = '0 мин';
        priceEl.textContent = '0 ₽';
        if (clearBtn) clearBtn.classList.remove('visible');
        if (mobileBar) mobileBar.classList.remove('visible');
        return;
    }

    if (clearBtn) clearBtn.classList.add('visible');
    if (mobileBar) mobileBar.classList.add('visible');

    let itemsHtml = selectedArr.map(s => `
        <div class="calc-item">
            <div>
                <div class="calc-item-name">${s.name}</div>
                <div class="calc-item-duration">${s.duration} мин</div>
            </div>
            <div class="calc-item-right">
                <span class="calc-item-price">${s.price.toLocaleString('ru-RU')} ₽</span>
                <button type="button" onclick="event.stopPropagation(); window.LumiereApp.toggleService('${s.id}')"
                        class="calc-remove-btn" aria-label="Удалить">
                    <i class="ph ph-x-circle"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (fourHands) {
        itemsHtml += `
            <div class="calc-item" style="color: var(--gold-dark); font-weight: 500; font-size: 0.75rem;">
                <span>👑 Сервис в 4 руки (+15%)</span>
                <span>+${surcharge.toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
    }

    listEl.innerHTML = itemsHtml;
    timeEl.textContent = timeText;
    priceEl.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;

    // Update mobile sticky bar
    const mobileCount = $('#mobile-bar-count');
    const mobilePrice = $('#mobile-bar-price');
    const mobileTime = $('#mobile-bar-time');
    if (mobileCount) mobileCount.textContent = `Выбрано услуг: ${selectedArr.length}${fourHands ? ' (в 4 руки)' : ''}`;
    if (mobilePrice) mobilePrice.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
    if (mobileTime) mobileTime.textContent = `• ${timeText}`;
}

// ─── Portfolio Gallery ────────────────────────
function renderGallery(filter = 'all') {
    const grid = $('#gallery-grid');
    if (!grid) return;

    const filtered = filter === 'all' ? portfolioItems : portfolioItems.filter(i => i.category === filter);

    grid.innerHTML = filtered.map(item => `
        <div class="gallery-item">
            <img src="${item.img}"
                 onerror="this.src='https://placehold.co/600x750/2E2B2C/DFC592?text=Lumiere+Nails'"
                 alt="${item.title}"
                 loading="lazy">
            <div class="gallery-item-overlay"></div>
            <div class="gallery-item-content">
                <div>
                    <span class="gallery-item-master">${item.master}</span>
                    <h3 class="gallery-item-title">${item.title}</h3>
                </div>
                <button type="button"
                        onclick="window.LumiereApp.openBookingModal('Хочу дизайн как в портфолио: ${item.title}')"
                        class="gallery-price-btn">
                    ${item.price}
                </button>
            </div>
        </div>
    `).join('');
}

function filterGallery(cat, btnEl) {
    $$('.gallery-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    if (btnEl) btnEl.classList.add('active');
    renderGallery(cat);
}

// ─── Booking Modal ────────────────────────────
function openBookingModal(customLook = '') {
    const modal = $('#booking-modal');
    const formContent = $('#booking-form-content');
    const successContent = $('#booking-success-content');
    const lookEl = $('#modal-summary-look');

    if (!modal) return;

    formContent.classList.remove('hidden');
    formContent.style.display = '';
    successContent.classList.remove('visible');
    successContent.style.display = 'none';
    $('#booking-error')?.classList.remove('visible');

    const { selectedArr, totalPrice, fourHands } = getCalculatedTotals();
    if (selectedArr.length > 0) {
        $('#modal-summary-price').textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
        $('#modal-summary-items').textContent = selectedArr.map(s => s.name).join(' + ') + (fourHands ? ' (Сервис в 4 руки)' : '');
    } else {
        $('#modal-summary-price').textContent = '3 600 ₽';
        $('#modal-summary-items').textContent = 'Комплекс «LUMIÈRE Signature» (Маникюр + Покрытие LUXIO)';
    }

    if (customLook && lookEl) {
        bookingState.customLookNote = customLook;
        lookEl.textContent = `✨ ${customLook}`;
        lookEl.classList.add('visible');
    } else if (lookEl) {
        lookEl.classList.remove('visible');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    const modal = $('#booking-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

function handleBackdropClick(e) {
    if (e.target.id === 'booking-modal') {
        closeBookingModal();
    }
}

function selectMaster(name, role, cardEl) {
    bookingState.master = `${name} (${role})`;
    $$('.master-card').forEach(card => card.classList.remove('active'));
    if (cardEl) cardEl.classList.add('active');
}

function selectTimeSlot(time, btn) {
    bookingState.time = time;
    $$('.time-slot').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

async function submitBooking() {
    const name = $('#guest-name')?.value.trim();
    const phone = $('#guest-phone')?.value.trim();
    const date = $('#booking-date')?.value;
    const drink = $('#guest-drink')?.value;
    const errorEl = $('#booking-error');

    if (!name || !phone) {
        errorEl?.classList.add('visible');
        return;
    }

    errorEl?.classList.remove('visible');

    const { selectedArr, totalPrice, fourHands, totalDuration } = getCalculatedTotals();
    const servicesTitle = selectedArr.map(s => s.name).join(' + ') || 'Комплекс «LUMIÈRE Signature»';

    const bookingPayload = {
        client_name: name,
        client_phone: phone,
        booking_date: date,
        booking_time: bookingState.time,
        master_name: bookingState.master,
        services: servicesTitle,
        drink: drink,
        total_price: totalPrice,
        duration_minutes: totalDuration || 90,
        is_four_hands: fourHands,
        custom_note: bookingState.customLookNote || ''
    };

    let bookingCode = 'LMR-' + Math.floor(1000 + Math.random() * 9000);

    // Save to backend API
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });
        if (response.ok) {
            const resData = await response.json();
            if (resData.booking?.booking_code) {
                bookingCode = resData.booking.booking_code;
            }
        }
    } catch (err) {
        console.warn('Backend API offline, saving to localStorage:', err);
    }

    // Save to local storage as fallback
    try {
        const localList = JSON.parse(localStorage.getItem('lumiere_bookings') || '[]');
        localList.push({ ...bookingPayload, booking_code: bookingCode, created_at: new Date().toISOString() });
        localStorage.setItem('lumiere_bookings', JSON.stringify(localList));
    } catch (e) {}

    const formContent = $('#booking-form-content');
    const successContent = $('#booking-success-content');

    formContent.classList.add('hidden');
    formContent.style.display = 'none';
    successContent.classList.add('visible');
    successContent.style.display = '';

    $('#success-details-text').innerHTML = `
        Благодарим, <strong>${name}</strong>!<br>
        Номер бронирования: <strong style="color:var(--gold-dark);font-family:monospace;letter-spacing:0.05em">${bookingCode}</strong><br><br>
        Запись к эксперту <strong>${bookingState.master}</strong> на <strong>${date} в ${bookingState.time}</strong> успешно создана.<br><br>
        Выбранный комплимент: <em>${drink}</em>.
    `;
}

// ─── Mobile Menu ──────────────────────────────
function toggleMobileMenu() {
    const menu = $('#mobile-menu');
    const icon = $('#mobile-menu-icon');
    if (!menu) return;

    menu.classList.toggle('open');
    const isOpen = menu.classList.contains('open');
    if (icon) icon.className = isOpen ? 'ph ph-x text-2xl' : 'ph ph-list text-2xl';
}

// ─── Scroll Effects ───────────────────────────
function initScrollEffects() {
    // Navbar scroll effect
    const navbar = $('#navbar');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }

        lastScrollY = scrollY;
    }, { passive: true });

    // Scroll reveal
    const revealElements = $$('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Back to top button
    const backToTopBtn = $('#back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ─── Preloader ────────────────────────────────
function initPreloader() {
    const preloader = $('#preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        }, 1000);
    });
}

// ─── Smooth Scroll for Anchor Links ───────────
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile menu if open
            const menu = $('#mobile-menu');
            if (menu?.classList.contains('open')) {
                toggleMobileMenu();
            }
        }
    });
}

// ─── Phone Input Mask ─────────────────────────
function initPhoneMask() {
    const phoneInput = $('#guest-phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }
        if (value.length > 10) value = value.substring(0, 10);

        let formatted = '+7';
        if (value.length > 0) formatted += ` (${value.substring(0, 3)}`;
        if (value.length >= 3) formatted += `)`;
        if (value.length > 3) formatted += ` ${value.substring(3, 6)}`;
        if (value.length > 6) formatted += `-${value.substring(6, 8)}`;
        if (value.length > 8) formatted += `-${value.substring(8, 10)}`;

        e.target.value = formatted;
    });
}

// ─── Initialize Everything ────────────────────
function init() {
    // Set booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const dateInput = $('#booking-date');
    if (dateInput) {
        dateInput.value = dateStr;
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Render initial content
    renderServicesList();
    updateCalculatorUI();
    renderGallery('all');

    // Init behaviors
    initScrollEffects();
    initSmoothScroll();
    initPhoneMask();
    initPreloader();

    // Escape closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBookingModal();
    });

    // Four hands toggle
    const fourHandsToggle = $('#four-hands-toggle');
    if (fourHandsToggle) {
        fourHandsToggle.addEventListener('change', updateCalculatorUI);
    }
}

// ─── Public API (for onclick handlers) ────────
window.LumiereApp = {
    switchServiceCategory,
    toggleService,
    clearCalculator,
    filterGallery,
    openBookingModal,
    openBookingWithSelected: () => openBookingModal(),
    closeBookingModal,
    handleBackdropClick,
    selectMaster,
    selectTimeSlot,
    submitBooking,
    toggleMobileMenu,
    updateCalculatorUI
};

// ─── Start ────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
