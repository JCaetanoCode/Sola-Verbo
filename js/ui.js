// ============ DICIONÁRIO VIA GOOGLE SHEETS (CSV PÚBLICO) ============
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyKldWoX_tgEKPTgziJczUpROwUFNal0AAT11Mov-zLwfNb-nmfTnRb2REw6GsGhZgo_tR6T7fe6HC/pub?output=csv';

let dictionaryData = null;
let dictionaryLoading = false;

async function loadDictionary() {
    if (dictionaryData) return;
    if (dictionaryLoading) return;
    
    dictionaryLoading = true;
    console.log('📚 Carregando dicionário...');
    
    try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        const csvText = await response.text();
        
        // Parse CSV manual
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (const char of csvText) {
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === ',' && !inQuotes) { currentRow.push(currentCell.trim()); currentCell = ''; }
            else if (char === '\n' && !inQuotes) { currentRow.push(currentCell.trim()); rows.push(currentRow); currentRow = []; currentCell = ''; }
            else { currentCell += char; }
        }
        if (currentCell || currentRow.length) { currentRow.push(currentCell.trim()); rows.push(currentRow); }
        
        if (rows.length < 2) throw new Error('Planilha vazia');
        
        const headers = rows[0].map(h => h.toLowerCase().replace(/"/g, ''));
        const termos = [];
        
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (!cols[0]) continue;
            const termo = {};
            headers.forEach((header, index) => { termo[header] = (cols[index] || '').replace(/"/g, ''); });
            if (termo.name) { termo.id = i; termos.push(termo); }
        }
        
        dictionaryData = { 
            biblioteca: { 
                titulo: "Dicionário Bíblico", 
                dataExportacao: new Date().toLocaleString(), 
                totalTermos: termos.length, 
                termos: termos 
            } 
        };
        console.log(`✅ Dicionário carregado: ${termos.length} termos`);
    } catch (e) {
        console.error('❌ Erro:', e.message);
        dictionaryData = { biblioteca: { termos: [] } };
    }
    dictionaryLoading = false;
}

// ============ MODAL DO DICIONÁRIO ============
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
    if (!dictionaryData?.biblioteca?.termos?.length) { loadDictionary().then(() => searchDictionary()); return; }
    
    const results = dictionaryData.biblioteca.termos.filter(item => 
        item.name?.toLowerCase().includes(term) || item.definition?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term)
    ).slice(0, 20);
    
    resultsDiv.innerHTML = results.length === 0 
        ? '<div class="no-favorites">📭 Nenhum termo encontrado</div>'
        : results.map(item => `<div class="dictionary-item"><div class="dictionary-term">📖 ${item.name} ${item.category ? `<span class="dictionary-category">${item.category}</span>` : ''}</div><div class="dictionary-definition">${item.definition}</div>${item.reference ? `<div class="dictionary-reference">📖 ${item.reference}</div>` : ''}${item.verse ? `<div class="dictionary-verse">"${item.verse}"</div>` : ''}</div>`).join('');
}

// ============ ABA PRINCIPAL DO DICIONÁRIO ============
function searchDictionaryMain() {
    const term = document.getElementById('dictionary-search-main')?.value?.trim()?.toLowerCase();
    const resultsDiv = document.getElementById('dictionary-results-main');
    if (!resultsDiv) return;
    if (!term) { resultsDiv.innerHTML = '<div class="no-favorites">📚 Digite um termo para buscar</div>'; return; }
    if (!dictionaryData?.biblioteca?.termos?.length) { resultsDiv.innerHTML = '<div class="loading">Carregando...</div>'; loadDictionary().then(() => searchDictionaryMain()); return; }
    
    const results = dictionaryData.biblioteca.termos.filter(item => 
        item.name?.toLowerCase().includes(term) || item.definition?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term) || item.reference?.toLowerCase().includes(term)
    ).slice(0, 30);
    
    resultsDiv.innerHTML = results.length === 0 
        ? `<div class="no-favorites">📭 Nenhum termo encontrado para "${term}"</div>`
        : `<div class="dictionary-results-header">${results.length} resultado(s) para "<strong>${term}</strong>"</div>` + results.map(item => `<div class="dictionary-card"><div class="dictionary-card-term">📖 ${item.name} ${item.category ? `<span class="dictionary-category">${item.category}</span>` : ''}</div><div class="dictionary-card-definition">${item.definition}</div>${item.reference ? `<div class="dictionary-reference">📖 ${item.reference}</div>` : ''}${item.verse ? `<div class="dictionary-verse">"${item.verse}"</div>` : ''}</div>`).join('');
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