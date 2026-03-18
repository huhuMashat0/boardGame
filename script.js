const JSON_URL = 'https://huhumashat0.github.io/boardGame/games.json'; 
let gamesData = [];

async function fetchGames() {
    try {
        const response = await fetch(JSON_URL); 
        if (!response.ok) throw new Error('حدث خطأ أثناء جلب البيانات');
        gamesData = await response.json();
        renderGames(gamesData);
        renderTagsFilters(); 
        
        // 🌟 الجديد: التحقق من الرابط عند تحميل الصفحة وفتح اللعبة إن وجدت
        checkUrlForGame(); 

    } catch (error) {
        console.error("الخطأ:", error);
        document.getElementById('loading').innerHTML = `<div class="alert alert-danger">❌ فشل في جلب البيانات.</div>`;
    }
}

// 🌟 الجديد: دالة للتحقق مما إذا كان الزائر جاء من رابط مشاركة
function checkUrlForGame() {
    const hash = window.location.hash; // قراءة ما بعد الـ # في الرابط
    if (hash && hash.startsWith('#game-')) {
        // استخراج رقم اللعبة من الرابط
        const gameId = parseInt(hash.replace('#game-', ''));
        if (!isNaN(gameId)) {
            // فتح نافذة اللعبة بعد جزء من الثانية للتأكد من اكتمال رسم الصفحة
            setTimeout(() => {
                openGameModal(gameId);
            }, 300);
        }
    }
}

// الدالة المحدثة لعرض الألعاب بالشكل المبسط
function renderGames(games) {
    const container = document.getElementById('games-container');
    const loading = document.getElementById('loading');
    
    loading.classList.add('d-none');
    container.classList.remove('d-none');
    container.innerHTML = '';

    games.forEach(game => {
        // بطاقة اللعبة المبسطة
        // أضفنا حدث onclick ليفتح النافذة المنبثقة
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm game-card position-relative" onclick="openGameModal(${game.id})">
                    
                    <button class="btn btn-sm share-btn text-dark border rounded-circle shadow" onclick="shareGame(event, ${game.id})" title="مشاركة اللعبة">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>

                    <img src="${game.game_image}" class="card-img-top game-img" alt="${game.game_name}">
                    <div class="card-body text-center p-3 d-flex flex-column justify-content-center">
                        <h5 class="card-title fw-bold text-primary mb-3">${game.game_name}</h5>
                        <div class="d-flex justify-content-around text-muted small mt-auto">
                            <span><i class="fa-solid fa-users text-primary"></i> ${game.min_players}-${game.max_players}</span>
                            <span><i class="fa-solid fa-clock text-success"></i> ${game.play_time} دقيقة</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

// دالة جديدة: فتح النافذة المنبثقة وتعبئة بيانات اللعبة بداخلها
// دالة فتح النافذة المنبثقة
function openGameModal(gameId) {
    const game = gamesData.find(g => g.id === gameId);
    if (!game) return;

    

    // 🌟 الجديد: تغيير رابط الصفحة ليحتوي على رقم اللعبة بدون إعادة تحميل الموقع
    window.history.pushState(null, null, `#game-${game.id}`);

    document.getElementById('modalGameTitle').innerText = game.game_name;
    document.getElementById('modalGameImage').src = game.game_image;
    document.getElementById('modalGameIdea').innerText = game.game_idea;
    document.getElementById('modalGamePlayers').innerText = `${game.min_players} - ${game.max_players}`;
    document.getElementById('modalGameTime').innerText = `${game.play_time} دقيقة`;
    document.getElementById('modalGameAge').innerText = `+${game.age}`;
    document.getElementById('modalGameDifficulty').innerText = game.difficulty;

    const tagsHtml = game.tags.map(tag => `<span class="badge bg-secondary me-1 mb-1">${tag}</span>`).join('');
    document.getElementById('modalGameTags').innerHTML = tagsHtml;

    let linksHtml = '';
    if(game.has_explanation_link) linksHtml += `<a href="${game.explanation_link}" target="_blank" class="btn btn-danger m-1"><i class="fa-brands fa-youtube"></i> فيديو الشرح</a>`;
    if(game.has_rules_guide) linksHtml += `<a href="${game.rules_guide_link}" target="_blank" class="btn btn-info text-white m-1"><i class="fa-solid fa-book"></i> القوانين</a>`;
    if(game.has_bbg_link) linksHtml += `<a href="${game.bbg_link}" target="_blank" class="btn btn-warning text-dark m-1"><i class="fa-solid fa-star"></i> BGG</a>`;
    document.getElementById('modalGameLinks').innerHTML = linksHtml;

    const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
    gameModal.show();
}

// دالة مشاركة اللعبة
function shareGame(event, gameId) {
    event.stopPropagation(); 
    const game = gamesData.find(g => g.id === gameId);
    
    // 🌟 الجديد: بناء الرابط المخصص للعبة الحالية
    const gameUrl = window.location.origin + window.location.pathname + `#game-${game.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: `لعبة: ${game.game_name}`,
            text: `تعرف على لعبة الطاولة الممتعة "${game.game_name}" 🎲!\n`,
            url: gameUrl // 🌟 استخدام الرابط المخصص بدلاً من الرابط العام
        }).catch(error => console.log('خطأ في المشاركة:', error));
    } else {
        // 🌟 تحسين التجربة في الكمبيوتر: إظهار نافذة لنسخ الرابط إذا كان المتصفح لا يدعم المشاركة
        prompt(`انسخ الرابط لمشاركة لعبة ${game.game_name}:`, gameUrl);
    }
}

// ==========================================
// قسم الفلترة (كما هو بطلبك الأخير)
// ==========================================
const searchInput = document.getElementById('searchInput');
const playersInput = document.getElementById('playersInput');
const difficultyInput = document.getElementById('difficultyInput');
const timeInput = document.getElementById('timeInput');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

function renderTagsFilters() {
    const tagsContainer = document.getElementById('tagsContainer');
    let allTags = new Set();
    gamesData.forEach(game => {
        if (game.tags) game.tags.forEach(tag => allTags.add(tag));
    });
    const uniqueTags = Array.from(allTags);
    tagsContainer.innerHTML = uniqueTags.map((tag, index) => `
        <div class="form-check form-check-inline m-0 bg-white border rounded px-2 py-1 shadow-sm d-flex align-items-center">
            <input class="form-check-input ms-2 mt-0 tag-checkbox" type="checkbox" value="${tag}" id="tag_${index}">
            <label class="form-check-label small text-dark" style="cursor: pointer;" for="tag_${index}">${tag}</label>
        </div>
    `).join('');
}

function filterGames() {
    const searchText = searchInput.value.toLowerCase().trim();
    const playersCount = parseInt(playersInput.value);
    const difficulty = difficultyInput.value;
    const maxTime = parseInt(timeInput.value);
    const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);

    const filteredGames = gamesData.filter(game => {
        const matchName = game.game_name.toLowerCase().includes(searchText);
        let matchPlayers = true;
        if (!isNaN(playersCount)) matchPlayers = (playersCount >= game.min_players && playersCount <= game.max_players);
        let matchDifficulty = true;
        if (difficulty !== "") matchDifficulty = (game.difficulty === difficulty);
        let matchTime = true;
        if (!isNaN(maxTime)) matchTime = (game.play_time <= maxTime);
        let matchTags = true;
        if (selectedTags.length > 0) matchTags = selectedTags.every(tag => game.tags.includes(tag));

        return matchName && matchPlayers && matchDifficulty && matchTime && matchTags;
    });
    renderGames(filteredGames);
}

applyFiltersBtn.addEventListener('click', filterGames);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterGames(); });

resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    playersInput.value = '';
    difficultyInput.value = '';
    timeInput.value = '';
    document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
    renderGames(gamesData);
});

window.addEventListener('DOMContentLoaded', () => {
    fetchGames(); 
});

// 🌟 الجديد: تنظيف الرابط عند إغلاق النافذة المنبثقة
document.getElementById('gameModal').addEventListener('hidden.bs.modal', () => {
    // إزالة #game-id من الرابط ليعود الرابط نظيفاً
    window.history.pushState(null, null, window.location.pathname + window.location.search);
});