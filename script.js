// ===================== НАСТРОЙКИ SHEETDB =====================
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/3pvy7m4t9ryo5';
// ==============================================================

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
// 2. ЗАГРУЗКА ТОЧЕК ИЗ SHEETDB
// ------------------------------
let fishingSpots = [];

async function loadSpotsFromSheetDB() {
    try {
        const response = await fetch(SHEETDB_API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        // SheetDB возвращает массив объектов, где ключи — это названия столбцов
        fishingSpots = data;
        console.log(`Загружено ${fishingSpots.length} точек`);
        
        const totalSpotsElem = document.getElementById('total-spots');
        if (totalSpotsElem) totalSpotsElem.textContent = fishingSpots.length;
        
        return fishingSpots;
    } catch (err) {
        console.error('Ошибка загрузки из SheetDB:', err);
        fishingSpots = [];
        return [];
    }
}

// ------------------------------
// 3. ДОБАВЛЕНИЕ НОВОЙ ТОЧКИ В SHEETDB
// ------------------------------
async function addSpotToSheetDB(spotData) {
    try {
        const response = await fetch(SHEETDB_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: spotData })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Точка добавлена в таблицу!', result);
        return result;
    } catch (err) {
        console.error('Ошибка при отправке:', err);
        throw err;
    }
}

// ------------------------------
// 4. ГЛАВНАЯ СТРАНИЦА
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
    await loadSpotsFromSheetDB();
}

// ------------------------------
// 5. СТРАНИЦА ВОДОЁМА
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
    
    await loadSpotsFromSheetDB();
    renderSpotsTable();
    updateSpotStats();
    setupAddSpotModal();
}

function renderSpotsTable() {
    const tbody = document.getElementById('spots-tbody');
    if (!tbody) return;
    
    const spots = fishingSpots.filter(s => s.waterBodyId === currentLocationId);
    tbody.innerHTML = '';
    
    if (spots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Нет точек клёва. Добавьте первую!</td></tr>';
        return;
    }
    
    spots.forEach(spot => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(spot.name)}</td>
            <td>${escapeHtml(spot.fish)}</td>
            <td>${escapeHtml(spot.coords)}</td>
            <td>${escapeHtml(spot.bait)}</td>
            <td>${escapeHtml(spot.groundbait || '—')}</td>
            <td>${spot.trophy || '—'}</td>
        `;
        tbody.appendChild(row);
    });
}

function setupAddSpotModal() {
    const modal = document.getElementById('add-spot-modal');
    const addBtn = document.getElementById('add-spot-btn');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('spot-form');
    
    if (!modal || !addBtn) return;
    
    addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('spot-name').value.trim();
        const fish = document.getElementById('spot-fish').value.trim();
        const coords = document.getElementById('spot-coords').value.trim();
        const bait = document.getElementById('spot-bait').value.trim();
        const groundbait = document.getElementById('spot-groundbait').value.trim();
        const trophy = document.getElementById('spot-trophy').value.trim();
        
        if (!name || !fish || !coords || !bait) {
            alert('Заполните все обязательные поля');
            return;
        }
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Сохранение...';
        
        try {
            await addSpotToSheetDB({
                name: name,
                fish: fish,
                coords: coords,
                bait: bait,
                groundbait: groundbait || '',
                trophy: trophy || '',
                waterBodyId: currentLocationId,
                createdAt: new Date().toISOString()
            });
            
            // Перезагружаем данные и обновляем таблицу
            await loadSpotsFromSheetDB();
            renderSpotsTable();
            updateSpotStats();
            form.reset();
            modal.classList.add('hidden');
            alert('Точка успешно добавлена!');
        } catch (err) {
            alert('Ошибка при добавлении: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '💾 Сохранить';
        }
    });
}

function updateSpotStats() {
    const statsEl = document.getElementById('spot-stats');
    if (!statsEl) return;
    const count = fishingSpots.filter(s => s.waterBodyId === currentLocationId).length;
    statsEl.innerHTML = `<p>📌 Всего точек на водоёме: <strong>${count}</strong></p>`;
}

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
// 6. ЗАПУСК
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('location.html')) {
        initLocationPage();
    } else {
        renderWaterBodyList();
    }
});