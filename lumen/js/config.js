/**
 * LUMEN Interior & Renovation - Конфигурационный файл
 * Здесь можно легко настроить сайт под любого клиента за 1 минуту без правок в коде!
 */
window.SITE_CONFIG = {
    // Основная информация о компании
    companyName: "LUMEN GROUP",
    city: "Москва и МО",
    phone: "+7 (495) 890-42-15",
    phoneClean: "+74958904215",
    whatsapp: "74958904215",
    telegramUsername: "lumen_renovate",
    email: "info@lumen-build.ru",
    workHours: "Ежедневно с 9:00 до 21:00",
    address: "г. Москва, Пресненская наб., 12, башня Федерация Восток, оф. 4102",

    // Настройки интеграции с Telegram-ботом
    // Для получения заявок прямо в Telegram:
    // 1. Создайте бота в @BotFather и вставьте токен сюда
    // 2. Узнайте свой chat_id через @userinfobot и вставьте сюда
    telegram: {
        enabled: true,
        botToken: "YOUR_TELEGRAM_BOT_TOKEN_HERE", // Например: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
        chatId: "YOUR_TELEGRAM_CHAT_ID_HERE"      // Например: 987654321
    },

    // Базовые ставки для интерактивного калькулятора (в рублях за кв. м)
    calculatorRates: {
        types: {
            new: { name: "Новостройка (с нуля)", rate: 12000, daysPer10SqM: 6 },
            secondary: { name: "Вторичка (с демонтажем)", rate: 15500, daysPer10SqM: 8 },
            cottage: { name: "Коттедж / Таунхаус", rate: 18000, daysPer10SqM: 9 }
        },
        styles: {
            capital: { name: "Капитальный ремонт", multiplier: 1.0 },
            design: { name: "Дизайнерский ремонт", multiplier: 1.35 },
            premium: { name: "Премиум / Эксклюзив", multiplier: 1.75 }
        },
        options: {
            designProject: { name: "Дизайн-проект 3D", ratePerSqM: 1800 },
            roughMaterials: { name: "Черновые материалы с доставкой", ratePerSqM: 6500 },
            smartHome: { name: "Система «Умный дом»", flatFee: 150000 },
            supervision: { name: "Авторский надзор архитектора", flatFee: 45000 }
        }
    }
};
