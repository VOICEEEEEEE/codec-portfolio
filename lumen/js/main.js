/**
 * LUMEN Luxury Renovation - Interactive Core Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    applySiteConfig();
    initMobileMenu();
    initCalculator();
    initQuiz();
    initBeforeAfter();
    initFaqAccordion();
    initModals();
    initSocialProofToasts();
    initForms();
}

/**
 * 1. Интеграция конфигурации (SITE_CONFIG)
 */
function applySiteConfig() {
    if (!window.SITE_CONFIG) return;
    const cfg = window.SITE_CONFIG;

    // Обновляем телефоны, название компании и ссылки
    document.querySelectorAll('.cfg-company-name').forEach(el => el.textContent = cfg.companyName);
    document.querySelectorAll('.cfg-phone').forEach(el => el.textContent = cfg.phone);
    document.querySelectorAll('.cfg-phone-link').forEach(el => el.href = `tel:${cfg.phoneClean}`);
    document.querySelectorAll('.cfg-whatsapp-link').forEach(el => el.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Здравствуйте! Хочу рассчитать стоимость ремонта.')}`);
    document.querySelectorAll('.cfg-telegram-link').forEach(el => el.href = `https://t.me/${cfg.telegramUsername}`);
    document.querySelectorAll('.cfg-city').forEach(el => el.textContent = cfg.city);
    document.querySelectorAll('.cfg-address').forEach(el => el.textContent = cfg.address);
    document.querySelectorAll('.cfg-workhours').forEach(el => el.textContent = cfg.workHours);
}

/**
 * 2. Мобильное меню
 */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

/**
 * 3. Интерактивный калькулятор ремонта
 */
function initCalculator() {
    const areaInput = document.getElementById('calcArea');
    const areaValDisplay = document.getElementById('calcAreaVal');
    const typeInputs = document.querySelectorAll('input[name="calcType"]');
    const styleInputs = document.querySelectorAll('input[name="calcStyle"]');
    const optionCheckboxes = document.querySelectorAll('.calc-extra-option');

    const totalCostEl = document.getElementById('calcTotalCost');
    const pricePerSqMEl = document.getElementById('calcPricePerSqM');
    const durationEl = document.getElementById('calcDuration');
    const discountEl = document.getElementById('calcDiscount');
    const lockCalcBtn = document.getElementById('lockCalcBtn');

    if (!areaInput || !totalCostEl) return;

    function calculate() {
        const cfg = window.SITE_CONFIG ? window.SITE_CONFIG.calculatorRates : null;
        const area = parseInt(areaInput.value, 10) || 60;
        areaValDisplay.textContent = `${area} м²`;

        // Получаем выбранный тип
        let selectedType = 'new';
        typeInputs.forEach(input => {
            if (input.checked) selectedType = input.value;
        });

        // Получаем выбранный стиль
        let selectedStyle = 'design';
        styleInputs.forEach(input => {
            if (input.checked) selectedStyle = input.value;
        });

        // Базовые ставки
        const baseTypeRate = cfg?.types[selectedType]?.rate || 14000;
        const styleMultiplier = cfg?.styles[selectedStyle]?.multiplier || 1.35;
        const daysFactor = cfg?.types[selectedType]?.daysPer10SqM || 7;

        let workRatePerSqM = Math.round(baseTypeRate * styleMultiplier);
        let extraTotal = 0;

        // Дополнительные опции
        optionCheckboxes.forEach(cb => {
            if (cb.checked) {
                const optKey = cb.value;
                const optCfg = cfg?.options[optKey];
                if (optCfg) {
                    if (optCfg.ratePerSqM) {
                        extraTotal += optCfg.ratePerSqM * area;
                    }
                    if (optCfg.flatFee) {
                        extraTotal += optCfg.flatFee;
                    }
                }
            }
        });

        const totalWorkCost = (workRatePerSqM * area) + extraTotal;
        const totalPerSqM = Math.round(totalWorkCost / area);
        const estimatedDays = Math.round((area / 10) * daysFactor + 20);
        const discountAmount = Math.round(totalWorkCost * 0.08); // 8% скидка онлайн

        // Анимируем/обновляем значения
        totalCostEl.textContent = `${totalWorkCost.toLocaleString('ru-RU')} ₽`;
        if (pricePerSqMEl) pricePerSqMEl.textContent = `${totalPerSqM.toLocaleString('ru-RU')} ₽/м²`;
        if (durationEl) durationEl.textContent = `~ ${estimatedDays} дней (${Math.round(estimatedDays / 30)} мес.)`;
        if (discountEl) discountEl.textContent = `${discountAmount.toLocaleString('ru-RU')} ₽`;

        // Сохраняем в глобальный стейт для передачи в заявку
        window.CURRENT_CALC_DATA = {
            area,
            type: selectedType,
            style: selectedStyle,
            totalCost: totalWorkCost,
            estimatedDays,
            discount: discountAmount
        };
    }

    areaInput.addEventListener('input', calculate);
    typeInputs.forEach(i => i.addEventListener('change', calculate));
    styleInputs.forEach(i => i.addEventListener('change', calculate));
    optionCheckboxes.forEach(i => i.addEventListener('change', calculate));

    calculate(); // Первый расчет при загрузке

    if (lockCalcBtn) {
        lockCalcBtn.addEventListener('click', () => {
            const modal = document.getElementById('calcLeadModal');
            if (modal) {
                const infoText = document.getElementById('calcModalSummary');
                if (infoText && window.CURRENT_CALC_DATA) {
                    infoText.innerHTML = `Площадь: <strong>${window.CURRENT_CALC_DATA.area} м²</strong> | Расчет: <strong>${window.CURRENT_CALC_DATA.totalCost.toLocaleString('ru-RU')} ₽</strong> | Скидка: <strong>${window.CURRENT_CALC_DATA.discount.toLocaleString('ru-RU')} ₽</strong>`;
                }
                openModal('calcLeadModal');
            }
        });
    }
}

/**
 * 4. Интерактивный Квиз (Multi-step Quiz)
 */
function initQuiz() {
    let currentStep = 1;
    const totalSteps = 4;
    const quizData = {
        propertyType: '',
        areaRange: '',
        timeline: '',
        gift: 'Скидка 10% + 3D планировка'
    };

    const stepContainers = document.querySelectorAll('.quiz-step');
    const progressBar = document.getElementById('quizProgressBar');
    const currentStepText = document.getElementById('quizCurrentStep');
    const nextBtn = document.getElementById('quizNextBtn');
    const prevBtn = document.getElementById('quizPrevBtn');

    if (!progressBar || stepContainers.length === 0) return;

    function updateStepUI() {
        stepContainers.forEach(el => {
            const stepNum = parseInt(el.getAttribute('data-step'), 10);
            el.classList.toggle('hidden', stepNum !== currentStep);
        });

        // Прогресс бар
        const percent = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${percent}%`;
        if (currentStepText) currentStepText.textContent = `${currentStep} из ${totalSteps}`;

        // Кнопка "Назад"
        if (prevBtn) {
            prevBtn.classList.toggle('hidden', currentStep === 1 || currentStep === totalSteps);
        }

        // Кнопка "Далее"
        if (nextBtn) {
            nextBtn.classList.toggle('hidden', currentStep === totalSteps);
        }
    }

    // Клик по карточкам с выбором
    document.querySelectorAll('.quiz-option').forEach(card => {
        card.addEventListener('click', () => {
            const stepEl = card.closest('.quiz-step');
            if (!stepEl) return;

            stepEl.querySelectorAll('.quiz-option').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const key = card.getAttribute('data-key');
            const val = card.getAttribute('data-val');
            if (key) quizData[key] = val;

            // Автоматический переход к следующему шагу через 250мс для удобства
            if (currentStep < totalSteps) {
                setTimeout(() => {
                    currentStep++;
                    updateStepUI();
                }, 250);
            }
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepUI();
            }
        });
    }

    // Отправка формы квиза на шаге 4
    const quizForm = document.getElementById('quizSubmitForm');
    if (quizForm) {
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = quizForm.querySelector('input[name="phone"]')?.value || '';
            const messenger = quizForm.querySelector('input[name="messenger"]:checked')?.value || 'WhatsApp';

            const payload = {
                source: 'Интерактивный Квиз (Скидка 10%)',
                phone: phone,
                messenger: messenger,
                details: `Недвижимость: ${quizData.propertyType || 'Не выбрано'}, Площадь: ${quizData.areaRange || 'Не выбрано'}, Сроки: ${quizData.timeline || 'Не выбрано'}`
            };

            sendLead(payload, () => {
                quizForm.innerHTML = `
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                        <h4 class="text-2xl font-bold text-white mb-2">Отлично! Ваш подарок зафиксирован</h4>
                        <p class="text-gray-300 mb-4">Мы закрепили за номером <strong>${phone}</strong> скидку 10% и 3D-планировку в подарок. Наш ведущий инженер свяжется с вами в течение 10 минут в ${messenger}.</p>
                    </div>
                `;
            });
        });
    }

    updateStepUI();
}

/**
 * 5. Интерактивный слайдер «До / После» (Before & After Slider)
 */
function initBeforeAfter() {
    const container = document.getElementById('beforeAfterContainer');
    const beforeWrapper = document.getElementById('baBeforeWrapper');
    const handle = document.getElementById('baHandle');
    const badgeBefore = document.getElementById('baBadgeBefore');
    const badgeAfter = document.getElementById('baBadgeAfter');

    if (!container || !beforeWrapper || !handle) return;

    let isDragging = false;

    function setPosition(xPos) {
        const rect = container.getBoundingClientRect();
        let posX = xPos - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;

        let percentage = (posX / rect.width) * 100;
        if (percentage < 1) percentage = 1;
        if (percentage > 99) percentage = 99;

        // Точное разделение через clip-path: слева ДО, справа ПОСЛЕ
        const clipVal = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        beforeWrapper.style.clipPath = clipVal;
        beforeWrapper.style.webkitClipPath = clipVal;
        handle.style.left = `${percentage}%`;

        // Симметричное плавное скрытие бейджей:
        // Если ползунок ушел влево (< 14%) — плавно скрываем "ДО"
        if (badgeBefore) {
            badgeBefore.style.opacity = percentage < 14 ? '0' : '1';
            badgeBefore.style.transform = percentage < 14 ? 'scale(0.85)' : 'scale(1)';
        }
        // Если ползунок ушел вправо (> 86%) — плавно скрываем "ПОСЛЕ"
        if (badgeAfter) {
            badgeAfter.style.opacity = percentage > 86 ? '0' : '1';
            badgeAfter.style.transform = percentage > 86 ? 'scale(0.85)' : 'scale(1)';
        }
    }

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setPosition(e.clientX);
    });

    // Сенсорные экраны (смартфоны / планшеты)
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        if (e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });

    // Инициализация на 50%
    const initialRect = container.getBoundingClientRect();
    if (initialRect.width) {
        setPosition(initialRect.left + initialRect.width / 2);
    }

    // Табы стилей портфолио
    document.querySelectorAll('.portfolio-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.portfolio-tab-btn').forEach(b => {
                b.classList.remove('bg-amber-500', 'text-gray-900');
                b.classList.add('bg-gray-800', 'text-gray-300');
            });
            btn.classList.remove('bg-gray-800', 'text-gray-300');
            btn.classList.add('bg-amber-500', 'text-gray-900');

            const afterImg = document.getElementById('baAfterImg');
            const beforeImg = document.getElementById('baBeforeImg');
            const projectTitle = document.getElementById('baProjectTitle');
            const projectMeta = document.getElementById('baProjectMeta');

            const afterSrc = btn.getAttribute('data-after');
            const beforeSrc = btn.getAttribute('data-before');
            const title = btn.getAttribute('data-title');
            const meta = btn.getAttribute('data-meta');

            if (afterImg && afterSrc) afterImg.src = afterSrc;
            if (beforeImg && beforeSrc) beforeImg.src = beforeSrc;
            if (projectTitle && title) projectTitle.textContent = title;
            if (projectMeta && meta) projectMeta.textContent = meta;

            // Сброс ползунка на центр при смене таба
            const rect = container.getBoundingClientRect();
            if (rect.width) {
                setPosition(rect.left + rect.width / 2);
            }
        });
    });
}

/**
 * 6. FAQ Аккордеон
 */
function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const header = item.querySelector('.faq-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Закрываем все
            items.forEach(i => i.classList.remove('active'));
            // Если текущий не был активен, открываем
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * 7. Модальные окна
 */
function initModals() {
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    };

    // Закрытие по крестику и фону
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal.id);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

/**
 * 8. Социальное доказательство (Всплывающие уведомления)
 */
function initSocialProofToasts() {
    const toast = document.getElementById('socialProofToast');
    const toastText = document.getElementById('socialProofText');
    if (!toast || !toastText) return;

    const notifications = [
        "Александр (ЖК «Сердце Столицы») только что рассчитал стоимость ремонта 85 м²",
        "Инженер выехал на замер в Раменки (квартира 110 м²)",
        "Екатерина скачала каталог готовых дизайн-проектов 2026",
        "Заключен договор на ремонт квартиры 92 м² (ЖК «Символ»)",
        "Дмитрий зафиксировал скидку 10% в онлайн-квизе"
    ];

    let index = 0;

    function showToast() {
        toastText.textContent = notifications[index];
        toast.classList.add('show');
        index = (index + 1) % notifications.length;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // Первый показ через 4 секунды, затем каждые 18 секунд
    setTimeout(() => {
        showToast();
        setInterval(showToast, 18000);
    }, 4000);
}

/**
 * 9. Обработка всех форм и отправка в Telegram / PHP
 */
function initForms() {
    // Форма в подвале
    const footerForm = document.getElementById('footerContactForm');
    if (footerForm) {
        footerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = footerForm.querySelector('input[name="name"]')?.value || '';
            const phone = footerForm.querySelector('input[name="phone"]')?.value || '';
            const comment = footerForm.querySelector('textarea[name="comment"]')?.value || '';

            sendLead({
                source: 'Главная форма в подвале',
                name,
                phone,
                details: comment
            }, () => {
                showSuccessNotification('Заявка успешно отправлена! Мы свяжемся с вами в течение 10 минут.');
                footerForm.reset();
            });
        });
    }

    // Модальная форма калькулятора
    const calcModalForm = document.getElementById('calcModalForm');
    if (calcModalForm) {
        calcModalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = calcModalForm.querySelector('input[name="phone"]')?.value || '';
            const calcData = window.CURRENT_CALC_DATA || {};

            sendLead({
                source: 'Форма фиксации расчета калькулятора',
                phone,
                details: `Площадь: ${calcData.area || 0} м², Тип: ${calcData.type || ''}, Стиль: ${calcData.style || ''}, Расчетная стоимость: ${calcData.totalCost || 0} руб.`
            }, () => {
                closeModal('calcLeadModal');
                showSuccessNotification(`Смета зафиксирована за номером ${phone}! PDF-расчет отправлен.`);
                calcModalForm.reset();
            });
        });
    }

    // Форма заказа обратного звонка
    const callbackForm = document.getElementById('callbackModalForm');
    if (callbackForm) {
        callbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = callbackForm.querySelector('input[name="name"]')?.value || '';
            const phone = callbackForm.querySelector('input[name="phone"]')?.value || '';

            sendLead({
                source: 'Заказ обратного звонка',
                name,
                phone,
                details: 'Клиент просит перезвонить'
            }, () => {
                closeModal('callbackModal');
                showSuccessNotification('Спасибо! Мы уже набираем ваш номер.');
                callbackForm.reset();
            });
        });
    }
}

/**
 * Функция отправки заявки
 */
function sendLead(data, onSuccess) {
    const cfg = window.SITE_CONFIG;

    console.log('Новый лид получен:', data);

    // 1. Отправка в Telegram Bot API напрямую с клиента (если настроено)
    if (cfg?.telegram?.enabled && cfg?.telegram?.botToken && cfg?.telegram?.botToken !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
        const text = `🔔 *Новая заявка с сайта!*\n\n` +
                     `📌 *Источник:* ${data.source}\n` +
                     (data.name ? `👤 *Имя:* ${data.name}\n` : '') +
                     `📞 *Телефон:* ${data.phone}\n` +
                     (data.messenger ? `💬 *Связь через:* ${data.messenger}\n` : '') +
                     (data.details ? `📝 *Детали:* ${data.details}\n` : '') +
                     `⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

        fetch(`https://api.telegram.org/bot${cfg.telegram.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: cfg.telegram.chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        }).catch(err => console.warn('Ошибка отправки в Telegram:', err));
    }

    // 2. Отправка на PHP обработчик (для хостинга)
    fetch('php/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(() => {
        // Игнорируем ошибку при локальном открытии без веб-сервера
    });

    // Вызываем коллбек успеха для красивого UX
    if (onSuccess) onSuccess();
}

/**
 * Показ красивого алерта об успехе
 */
function showSuccessNotification(message) {
    const alertEl = document.createElement('div');
    alertEl.className = 'fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-[-100px] opacity-0';
    alertEl.innerHTML = `
        <span class="text-2xl">✓</span>
        <span class="font-medium">${message}</span>
    `;
    document.body.appendChild(alertEl);

    setTimeout(() => {
        alertEl.classList.remove('translate-y-[-100px]', 'opacity-0');
    }, 10);

    setTimeout(() => {
        alertEl.classList.add('opacity-0', 'translate-y-[-50px]');
        setTimeout(() => alertEl.remove(), 400);
    }, 4500);
}
