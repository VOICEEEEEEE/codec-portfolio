/* ============================================
   LUMIÈRE — Service Catalog & Calculator Data
   ============================================ */

export const servicesData = {
    manicure: [
        {
            id: 'm1',
            name: 'Комплекс «LUMIÈRE Signature» (Снятие + Маникюр + Покрытие LUXIO)',
            desc: 'Пилочный, аппаратный или комбинированный маникюр, архитектура гелем и идеальный блик',
            duration: 90,
            price: 3600,
            popular: true
        },
        {
            id: 'm2',
            name: 'Эстетический маникюр без покрытия (Clean Girl Manicure)',
            desc: 'Бережная обработка кутикулы + полировка натуральной пластины минеральной пастой или лечебным лаком',
            duration: 45,
            price: 2200,
            popular: false
        },
        {
            id: 'm3',
            name: 'Японский глянцевый эко-маникюр P.Shine / Masura',
            desc: 'Глубокое восстановление пчелиным воском и жемчужной пудрой для глянцевого блеска на 3 недели',
            duration: 60,
            price: 2900,
            popular: false
        },
        {
            id: 'm4',
            name: 'Укрепление и четкая архитектура твердым гелем / акригелем',
            desc: 'Создание ультратонких торцов, поднятие клюющих ногтей и идеального квадрата',
            duration: 30,
            price: 1100,
            popular: true
        }
    ],
    pedicure: [
        {
            id: 'p1',
            name: 'SMART-педикюр полный с покрытием LUXIO в кресле-реклайнере',
            desc: 'Дисковая полировка стоп с молекулярным маслом, обработка пальчиков и тонкое покрытие',
            duration: 90,
            price: 4500,
            popular: true
        },
        {
            id: 'p2',
            name: 'Ферментативный Golden Trace педикюр (Атравматичный)',
            desc: 'Растворение натоптышей фруктовыми энзимами без аппаратов, эффект «шелковых пяточек»',
            duration: 80,
            price: 4900,
            popular: true
        },
        {
            id: 'p3',
            name: 'Экспресс-педикюр (Только обработка пальчиков + гель-лак)',
            desc: 'Идеально между полными визитами для поддержания безупречной эстетики',
            duration: 50,
            price: 3200,
            popular: false
        }
    ],
    design: [
        {
            id: 'd1',
            name: 'Арт-френч / Микро-френч (на все 10 ногтей)',
            desc: 'Ювелирная прорисовка тончайшей линии улыбки в классическом или цветном исполнении',
            duration: 25,
            price: 900,
            popular: true
        },
        {
            id: 'd2',
            name: 'Жемчужная втирка Glazed Donut / Шелковый Кошачий глаз',
            desc: 'Знаменитый эффект Хейли Бибер или глубокий магнитный перелив',
            duration: 20,
            price: 800,
            popular: true
        },
        {
            id: 'd3',
            name: 'Моделирование (наращивание) на верхние или нижние формы',
            desc: 'Эстетичное удлинение любой сложности с натуральной архитектурой',
            duration: 150,
            price: 6200,
            popular: false
        }
    ],
    spa: [
        {
            id: 's1',
            name: 'SPA-ритуал La Sultane de Saba «Марокканская Роза и Амбра»',
            desc: 'Пилинг гоммажем, теплое обертывание с маслом карите и расслабляющий массаж до локтя',
            duration: 30,
            price: 2100,
            popular: true
        },
        {
            id: 's2',
            name: 'Горячий массаж теплой арома-свечой из соевого воска',
            desc: 'Тающее масло ши и миндаля питает кожу рук и дарит нишевый шлейфовый аромат',
            duration: 15,
            price: 950,
            popular: false
        },
        {
            id: 's3',
            name: 'Холодная парафинотерапия Christina Fitzgerald',
            desc: 'Мгновенное спасение для сухой кожи рук, снятие отечности и глубокий лифтинг',
            duration: 25,
            price: 1500,
            popular: false
        }
    ]
};

export const portfolioItems = [
    {
        title: 'Clean Girl Milky Architecture',
        category: 'nude',
        master: 'Топ-стилист Алина',
        price: '3 600 ₽',
        img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80'
    },
    {
        title: 'Glazed Pearl & Micro French',
        category: 'french',
        master: 'Арт-директор Элина',
        price: '4 500 ₽',
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
    },
    {
        title: 'Velvet Cat-Eye & Золотая Поталь',
        category: 'art',
        master: 'Арт-директор Элина',
        price: '4 400 ₽',
        img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80'
    },
    {
        title: 'Натуральный кварц Luxio Blush',
        category: 'nude',
        master: 'VIP-мастер Маргарита',
        price: '3 600 ₽',
        img: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80'
    },
    {
        title: 'Классический тонкий френч на миндале',
        category: 'french',
        master: 'Топ-стилист Алина',
        price: '4 500 ₽',
        img: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=700&q=80'
    },
    {
        title: '3D-Текстуры и хромированный металл',
        category: 'art',
        master: 'Арт-директор Элина',
        price: '5 100 ₽',
        img: 'https://images.unsplash.com/photo-1599206676335-193c82b13c9e?auto=format&fit=crop&w=700&q=80'
    }
];
