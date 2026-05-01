// ============ FAVORITOS ============
function isFavorite(book, chapter, verse) { return appState.favorites.some(f => f.book === book && f.chapter === chapter && f.verse === verse); }
function saveFavorites() { localStorage.setItem('bibleFavorites', JSON.stringify(appState.favorites)); }

function toggleFavorite(book, chapter, verse, button) {
    const idx = appState.favorites.findIndex(f => f.book === book && f.chapter === chapter && f.verse === verse);
    if (idx > -1) { appState.favorites.splice(idx, 1); button.textContent = '☆'; }
    else { appState.favorites.push({ book, chapter, verse }); button.textContent = '⭐'; }
    saveFavorites();
}

function showFavorites() {
    const m = document.getElementById('favorites-modal');
    document.getElementById('favorites-list').innerHTML = appState.favorites.length === 0 ? '<div class="no-favorites">📌 Nenhum favorito</div>' : appState.favorites.map(f => `<div class="favorite-item"><div class="favorite-verse" onclick="navigateToFavorite('${f.book}',${f.chapter},${f.verse})">📖 ${f.book} ${f.chapter}:${f.verse}</div><button class="remove-favorite" onclick="event.stopPropagation();removeFavorite('${f.book}',${f.chapter},${f.verse})">×</button></div>`).join('');
    m.style.display = 'flex';
}

function removeFavorite(book, chapter, verse) {
    appState.favorites = appState.favorites.filter(f => !(f.book === book && f.chapter === chapter && f.verse === verse));
    saveFavorites(); showFavorites();
}

function navigateToFavorite(book, chapter, verse) {
    document.getElementById('favorites-modal').style.display = 'none';
    appState.currentTestament = getTestament(book);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === appState.currentTestament));
    appState.currentBook = { name: book, testament: appState.currentTestament };
    loadChapter(chapter - 1);
    setTimeout(() => { const el = document.getElementById(`verse-${verse - 1}`); if (el) { el.style.background = 'var(--highlight)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.style.background = '', 2000); } }, 300);
}

// ============ DICIONÁRIO ============
let dictionaryData = {};

async function loadDictionary() {
    if (Object.keys(dictionaryData).length > 0) return;
    try {
        const response = await fetch('data/dictionary.json');
        if (response.ok) dictionaryData = await response.json();
    } catch (e) { console.log('Dicionário não encontrado'); dictionaryData = {}; }
}

function showDictionary() {
    document.getElementById('dictionary-modal').style.display = 'flex';
    document.getElementById('dictionary-search').value = '';
    document.getElementById('dictionary-results').innerHTML = '<div class="no-favorites">📚 Digite um termo para buscar no dicionário</div>';
    loadDictionary();
}

function searchDictionary() {
    const term = document.getElementById('dictionary-search').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('dictionary-results');
    if (!term) { resultsDiv.innerHTML = '<div class="no-favorites">📚 Digite um termo</div>'; return; }
    if (Object.keys(dictionaryData).length === 0) { resultsDiv.innerHTML = '<div class="no-favorites">📭 Dicionário não disponível</div>'; return; }
    const results = Object.entries(dictionaryData).filter(([key, def]) => key.toLowerCase().includes(term) || (typeof def === 'string' && def.toLowerCase().includes(term))).slice(0, 20);
    resultsDiv.innerHTML = results.length === 0 ? '<div class="no-favorites">📭 Nenhum termo encontrado</div>' : results.map(([key, def]) => `<div class="dictionary-item"><div class="dictionary-term">📖 ${key}</div><div class="dictionary-definition">${def}</div></div>`).join('');
}