// ===================== НАСТРОЙКИ =====================
// ВСТАВЬТЕ ВАШ ID ТАБЛИЦЫ МЕЖДУ КАВЫЧКАМИ
const SHEET_ID = '1Vzq-Ljw4_-AJTOTty_xwp95qG45FszbgnbyrACuVgiM';
// URL для API OpenSheet
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/spots`;
// ======================================================

// ------------------------------
// 1. ДАННЫЕ ВОДОЁМОВ (18 штук)
// ------------------------------
const waterBodies = [
    { id: 'mosquito', name: 'оз. Комариное', description: 'Стартовый водоём. Плотва, окунь, ёрш.' },
    { id: 'winding', name: 'Извилистый ручей', description: 'Небольшая река с форелью и хариусом.' },
    { id: 'oldburg', name: 'Старый Острог', description: 'Крупное озеро. Лещ, карась, щука.' },
    { id: 'belaya', name: 'р. Белая', description: 'Горная река. Хариус, форель, таймень.' },
    { id: 'kuori', name: 'оз. Куори', description: 'Глубокое озеро с куорским гольцом и сигом.' },
    { id: 'bear', name: 'оз. Медвежье', description: 'Популярное место для ловли карпа и карася.' },
    { id: 'volkhov', name: 'р. Волхов', description: 'Крупная река. Сом, судак, жерех.' },
    { id: 'donets', name: 'р. Северский Донец', description: 'Река с разнообразной ихтиофауной.' },
    { id: 'sura', name: 'р. Сура', description: 'Крупная река. Лещ, язь, голавль.' },
    { id: 'ladoga', name: 'Ладожское озеро', description: 'Крупнейшее озеро Европы. Сиг, палия, корюшка.' },
    { id: 'amber', name: 'оз. Янтарное', description: 'Карповое озеро. Много трофейных экземпляров.' },
    { id: 'archipelago', name: 'Ладожский архипелаг', description: 'Морская рыбалка. Треска, пикша, палтус.' },
    { id: 'akhtuba', name: 'р. Ахтуба', description: 'Рыбное место. Сом, сазан, судак.' },
    { id: 'copper', name: 'оз. Медное', description: 'Небольшое уютное озеро. Окунь, щука, плотва.' },
    { id: 'tunguska', name: 'р. Нижняя Тунгуска', description: 'Сибирская река. Таймень, ленок, хариус.' },
    { id: 'yama', name: 'р. Яма', description: 'Река на Дальнем Востоке. Кета, горбуша, нерка.' },
    { id: 'norwegian', name: 'Норвежское море', description: 'Морская рыбалка. Треска, сайда, палтус.' },
    { id: 'elk', name: 'оз. Лосиное', description: 'Новый водоём. Окунь павлиний, лаврак.' }
];

// ------------------------------
// 2. ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ДАННЫХ ИЗ GOOGLE SHEETS
// ------------------------------
let fishingSpots = []; // Глобальная переменная для хранения загруженных точек

async function loadSpotsFromSheet() {
    try {
        console.log('Загрузка данных из Google Sheets...');
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        // OpenSheet возвращает массив объектов, где ключи — это ваши заголовки
        fishingSpots = data;
        console.log(`Загружено ${fishingSpots.length} точек.`);
        
        // После загрузки обновляем счётчик на главной странице
        const totalSpotsElem = document.getElementById('total-spots');
        if (totalSpotsElem) totalSpotsElem.textContent = fishingSpots.length;
        
        return fishingSpots;
    } catch (error) {
        console.error('Не удалось загрузить данные из таблицы:', error);
        fishingSpots = [];
        return [];
    }
}

// ------------------------------
// 3. ГЛАВНАЯ СТРАНИЦА: рендер списка
// ------------------------------
async function renderWaterBodyList() {
    const listEl = document.getElementById('location-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    waterBodies.forEach(wb => {
        const li = document.createElement('li');
        li.className = 'location-item';
        const link = document.createElement('a');
        link.href = `location.html?id=${wb.id}`;
        link.className = 'location-link';
        link.textContent = wb.name;
        li.appendChild(link);
        listEl.appendChild(li);
    });

    document.getElementById('total-locations').textContent = waterBodies.length;
    // Загружаем данные для отображения актуального количества точек
    await loadSpotsFromSheet();
}

// ------------------------------
// 4. СТРАНИЦА ВОДОЁМА
// ------------------------------
let currentLocationId = null;

async function initLocationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    currentLocationId = urlParams.get('id');
    if (!currentLocationId) return;

    const wb = waterBodies.find(w => w.id === currentLocationId);
    if (!wb) return;

    document.getElementById('location-name').textContent = wb.name;
    document.getElementById('location-description').textContent = wb.description;

    // Загружаем данные из таблицы перед отображением
    await loadSpotsFromSheet();
    renderSpotsTable();
    updateSpotStats();
    
    // Настройка модального окна
    setupAddSpotModal();
}

function renderSpotsTable() {
    const tbody = document.getElementById('spots-tbody');
    if (!tbody) return;

    const spotsForLocation = fishingSpots.filter(s => s.waterBodyId === currentLocationId);
    tbody.innerHTML = '';
    
    if (spotsForLocation.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Пока нет точек клёва для этого водоёма.</td></tr>';
        return;
    }

    spotsForLocation.forEach(spot => {
        const row = document.createElement('tr');
        // Добавляем проверку на существование полей, чтобы избежать ошибок
        row.innerHTML = `
            <td>${escapeHtml(spot.name || '—')}</td>
            <td>${escapeHtml(spot.fish || '—')}</td>
            <td>${escapeHtml(spot.coords || '—')}</td>
            <td>${escapeHtml(spot.bait || '—')}</td>
            <td>${escapeHtml(spot.groundbait || '—')}</td>
            <td>${spot.trophy || '—'}</td>
        `;
        tbody.appendChild(row);
    });
}

function setupAddSpotModal() {
    // Эта функция теперь будет показывать предупреждение
    const modal = document.getElementById('add-spot-modal');
    const addBtn = document.getElementById('add-spot-btn');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('spot-form');

    // Меняем действие кнопки: показываем сообщение, а не форму
    addBtn.addEventListener('click', () => {
        alert('⚠️ Добавление точек через сайт пока недоступно.\n\nВы можете добавить новую точку напрямую в Google Таблицу, и она появится на сайте после обновления страницы.');
        // Если нужно, можно скрыть форму
        // modal.classList.add('hidden'); 
    });

    // Закрытие модального окна оставляем, если оно всё же откроется
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Блокируем отправку формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Добавление через сайт недоступно. Пожалуйста, используйте Google Таблицу.');
    });
}

function updateSpotStats() {
    const statsEl = document.getElementById('spot-stats');
    if (!statsEl) return;
    const count = fishingSpots.filter(s => s.waterBodyId === currentLocationId).length;
    statsEl.innerHTML = `<p>📌 Всего точек на водоёме: <strong>${count}</strong></p>`;
}

// Простая функция для защиты от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ------------------------------
// 5. ЗАПУСК
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('location.html')) {
        initLocationPage();
    } else {
        renderWaterBodyList();
    }
});