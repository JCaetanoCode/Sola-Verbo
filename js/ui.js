// ============ DICIONÁRIO ============
let dictionaryData = null;

async function loadDictionary() {
    if (dictionaryData && dictionaryData.biblioteca && dictionaryData.biblioteca.termos.length > 0) return;
    
    try {
        const response = await fetch('data/dictionary.json');
        if (response.ok) {
            dictionaryData = await response.json();
            console.log(`📚 Dicionário carregado: ${dictionaryData.biblioteca.totalTermos || dictionaryData.biblioteca.termos.length} termos`);
        }
    } catch (e) {
        console.log('Dicionário não encontrado');
        dictionaryData = { biblioteca: { termos: [] } };
    }
}

function showDictionary() {
    document.getElementById('dictionary-modal').style.display = 'flex';
    document.getElementById('dictionary-search').value = '';
    document.getElementById('dictionary-results').innerHTML = '<div class="no-favorites">📚 Digite um termo</div>';
    loadDictionary();
}

function searchDictionary() {
    const term = document.getElementById('dictionary-search').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('dictionary-results');
    
    if (!term) { resultsDiv.innerHTML = '<div class="no-favorites">📚 Digite um termo</div>'; return; }
    if (!dictionaryData?.biblioteca?.termos?.length) { resultsDiv.innerHTML = '<div class="no-favorites">📭 Dicionário não disponível</div>'; return; }
    
    const results = dictionaryData.biblioteca.termos.filter(item => 
        item.name?.toLowerCase().includes(term) || 
        item.definition?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
    ).slice(0, 20);
    
    resultsDiv.innerHTML = results.length === 0 
        ? '<div class="no-favorites">📭 Nenhum termo encontrado</div>'
        : results.map(item => `
            <div class="dictionary-item">
                <div class="dictionary-term">📖 ${item.name} ${item.category ? `<span class="dictionary-category">${item.category}</span>` : ''}</div>
                <div class="dictionary-definition">${item.definition}</div>
                ${item.reference ? `<div class="dictionary-reference">📖 ${item.reference}</div>` : ''}
                ${item.verse ? `<div class="dictionary-verse">"${item.verse}"</div>` : ''}
            </div>
        `).join('');
}

// ============ DICIONÁRIO NA ABA PRINCIPAL ============
function searchDictionaryMain() {
    const term = document.getElementById('dictionary-search-main')?.value?.trim()?.toLowerCase();
    const resultsDiv = document.getElementById('dictionary-results-main');
    
    if (!resultsDiv) return;
    if (!term) { resultsDiv.innerHTML = '<div class="no-favorites">📚 Digite um termo para buscar</div>'; return; }
    
    if (!dictionaryData?.biblioteca?.termos?.length) {
        resultsDiv.innerHTML = '<div class="loading">Carregando dicionário...</div>';
        loadDictionary().then(() => searchDictionaryMain());
        return;
    }
    
    const results = dictionaryData.biblioteca.termos.filter(item => 
        item.name?.toLowerCase().includes(term) || 
        item.definition?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.reference?.toLowerCase().includes(term)
    ).slice(0, 30);
    
    resultsDiv.innerHTML = results.length === 0 
        ? `<div class="no-favorites">📭 Nenhum termo encontrado para "${term}"</div>`
        : `<div class="dictionary-results-header">${results.length} resultado(s) para "<strong>${term}</strong>"${dictionaryData.biblioteca.titulo ? ` - ${dictionaryData.biblioteca.titulo}` : ''}</div>`
        + results.map(item => `
            <div class="dictionary-card">
                <div class="dictionary-card-term">📖 ${item.name} ${item.category ? `<span class="dictionary-category">${item.category}</span>` : ''}</div>
                <div class="dictionary-card-definition">${item.definition}</div>
                ${item.reference ? `<div class="dictionary-reference">📖 ${item.reference}</div>` : ''}
                ${item.verse ? `<div class="dictionary-verse">"${item.verse}"</div>` : ''}
            </div>
        `).join('');
}

// ============ FAVORITOS ============
function isFavorite(book, chapter, verse) { return appState.favorites.some(f => f.book===book&&f.chapter===chapter&&f.verse===verse); }
function saveFavorites() { localStorage.setItem('bibleFavorites', JSON.stringify(appState.favorites)); }

function toggleFavorite(book, chapter, verse, button) {
    const idx = appState.favorites.findIndex(f => f.book===book&&f.chapter===chapter&&f.verse===verse);
    if (idx > -1) { appState.favorites.splice(idx,1); button.textContent = '☆'; }
    else { appState.favorites.push({book,chapter,verse}); button.textContent = '⭐'; }
    saveFavorites();
}

function showFavorites() {
    const m = document.getElementById('favorites-modal');
    document.getElementById('favorites-list').innerHTML = appState.favorites.length === 0 ? '<div class="no-favorites">📌 Nenhum favorito</div>' : appState.favorites.map(f => `<div class="favorite-item"><div class="favorite-verse" onclick="navigateToFavorite('${f.book}',${f.chapter},${f.verse})">📖 ${f.book} ${f.chapter}:${f.verse}</div><button class="remove-favorite" onclick="event.stopPropagation();removeFavorite('${f.book}',${f.chapter},${f.verse})">×</button></div>`).join('');
    m.style.display = 'flex';
}

function removeFavorite(book, chapter, verse) {
    appState.favorites = appState.favorites.filter(f => !(f.book===book&&f.chapter===chapter&&f.verse===verse));
    saveFavorites(); showFavorites();
}

function navigateToFavorite(book, chapter, verse) {
    document.getElementById('favorites-modal').style.display = 'none';
    appState.currentTestament = getTestament(book);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === appState.currentTestament));
    appState.currentBook = {name:book, testament:appState.currentTestament};
    loadChapter(chapter-1);
    setTimeout(() => { const el = document.getElementById(`verse-${verse-1}`); if(el){ el.style.background='var(--highlight)'; el.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>el.style.background='',2000); } },300);
}