// ============ FILTROS ============
function updateBookFilter() {
    const ft = document.getElementById('filter-testament');
    const fb = document.getElementById('filter-book');
    const fc = document.getElementById('filter-chapter');
    const fv = document.getElementById('filter-verse');
    const cv = fb.value;

    fb.innerHTML = '<option value="all">Todos os livros</option>';
    let books = ft.value === 'all' ? [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new] : BIBLE_BOOKS[ft.value];
    books.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; fb.appendChild(o); });
    if (cv && books.includes(cv)) fb.value = cv;
    fb.disabled = false;

    fc.innerHTML = '<option value="all">Todos os capítulos</option>';
    fc.disabled = true;
    fc.value = 'all';

    fv.innerHTML = '<option value="all">Todos os versículos</option>';
    fv.disabled = true;
    fv.value = 'all';

    appState.searchFilter.testament = ft.value;
    appState.searchFilter.book = fb.value;
    appState.searchFilter.chapter = 'all';
    appState.searchFilter.verse = 'all';
}

function updateChapterFilter() {
    const fb = document.getElementById('filter-book');
    const fc = document.getElementById('filter-chapter');
    const fv = document.getElementById('filter-verse');
    const selectedBook = fb.value;

    fc.innerHTML = '<option value="all">Todos os capítulos</option>';
    fv.innerHTML = '<option value="all">Todos os versículos</option>';

    if (selectedBook !== 'all') {
        const bookData = findBook(selectedBook);
        if (bookData && bookData.chapters) {
            const numChapters = bookData.chapters.length;
            for (let i = 1; i <= numChapters; i++) {
                const o = document.createElement('option');
                o.value = i;
                o.textContent = `Capítulo ${i}`;
                fc.appendChild(o);
            }
            fc.disabled = false;
        } else {
            fc.disabled = true;
        }
    } else {
        fc.disabled = true;
    }

    fc.value = 'all';
    fv.disabled = true;
    fv.value = 'all';

    appState.searchFilter.chapter = 'all';
    appState.searchFilter.verse = 'all';
}

function checkAutoNavigate() {
    const book = document.getElementById('filter-book').value;
    const chapter = document.getElementById('filter-chapter').value;
    const verse = document.getElementById('filter-verse').value;

    if (book !== 'all' && chapter !== 'all' && verse !== 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        loadChapter(parseInt(chapter) - 1);
        setTimeout(() => {
            const el = document.getElementById(`verse-${parseInt(verse) - 1}`);
            if (el) { el.style.background = 'var(--highlight)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.style.background = '', 2500); }
        }, 400);
    }
    else if (book !== 'all' && chapter !== 'all' && verse === 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        loadChapter(parseInt(chapter) - 1);
    }
    else if (book !== 'all' && chapter === 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        renderChapterList(book);
    }
}

function updateVerseFilter() {
    const fb = document.getElementById('filter-book');
    const fc = document.getElementById('filter-chapter');
    const fv = document.getElementById('filter-verse');
    const selectedBook = fb.value;
    const selectedChapter = fc.value;

    fv.innerHTML = '<option value="all">Todos os versículos</option>';

    if (selectedBook !== 'all' && selectedChapter !== 'all') {
        const bookData = findBook(selectedBook);
        if (bookData && bookData.chapters && bookData.chapters[selectedChapter - 1]) {
            const numVerses = bookData.chapters[selectedChapter - 1].length;
            for (let i = 1; i <= numVerses; i++) {
                const o = document.createElement('option');
                o.value = i;
                o.textContent = `Versículo ${i}`;
                fv.appendChild(o);
            }
            fv.disabled = false;
        } else {
            fv.disabled = true;
        }
    } else {
        fv.disabled = true;
    }

    fv.value = 'all';
    appState.searchFilter.verse = 'all';
}

// ============ HISTÓRICO ============
function loadSearchHistory() { const s = localStorage.getItem('searchHistory'); if (s) appState.searchHistory = JSON.parse(s); }
function saveSearchHistory() { localStorage.setItem('searchHistory', JSON.stringify(appState.searchHistory)); }
function addToSearchHistory(term, total) {
    appState.searchHistory = appState.searchHistory.filter(i => i.term.toLowerCase() !== term.toLowerCase());
    appState.searchHistory.unshift({ term, total, date: new Date().toISOString() });
    if (appState.searchHistory.length > 20) appState.searchHistory = appState.searchHistory.slice(0, 20);
    saveSearchHistory(); renderSearchHistory();
}
function removeFromHistory(i) { appState.searchHistory.splice(i, 1); saveSearchHistory(); renderSearchHistory(); }
function clearSearchHistory() { appState.searchHistory = []; saveSearchHistory(); renderSearchHistory(); document.getElementById('search-history').classList.remove('active'); }
function renderSearchHistory() {
    const h = document.getElementById('search-history');
    if (!appState.searchHistory.length) { h.innerHTML = ''; return; }
    h.innerHTML = appState.searchHistory.map((item, i) => `<div class="search-history-item" onclick="useHistoryTerm('${item.term.replace(/'/g, "\\'")}')"><span class="search-history-term">🔍 ${item.term}</span><span class="search-history-count">${item.total} res.</span><button class="search-history-remove" onclick="event.stopPropagation();removeFromHistory(${i})">×</button></div>`).join('') + '<div class="search-history-clear" onclick="clearSearchHistory()">Limpar histórico</div>';
}
function useHistoryTerm(t) { document.getElementById('search-input').value = t; document.getElementById('search-history').classList.remove('active'); performSearch(); }

// ============ BUSCA GLOBAL ============
function performSearch() {
    const term = document.getElementById('search-input').value.trim();
    if (!term) { alert('Digite um termo'); return; }
    if (!appState.bibleData) { alert('Carregue uma versão'); return; }
    appState.searchFilter.testament = document.getElementById('filter-testament').value;
    appState.searchFilter.book = document.getElementById('filter-book').value;
    appState.searchResults = []; appState.currentSearchIndex = -1; appState.currentSearchTerm = term;
    document.getElementById('search-history').classList.remove('active');
    let books = appState.bibleData.books;
    if (appState.searchFilter.book !== 'all') { const bd = findBook(appState.searchFilter.book); books = bd ? [bd] : []; }
    else if (appState.searchFilter.testament !== 'all') { const tb = BIBLE_BOOKS[appState.searchFilter.testament]; books = appState.bibleData.books.filter(b => tb.some(t => b.name.toLowerCase().includes(t.toLowerCase()) || (b.abbrev && b.abbrev.toLowerCase().includes(t.toLowerCase())))); }
    books.forEach(book => { if (!book.chapters) return; book.chapters.forEach((ch, ci) => { if (!Array.isArray(ch)) return; ch.forEach((verse, vi) => { if (typeof verse === 'string' && verse.toLowerCase().includes(term.toLowerCase())) { appState.searchResults.push({ book: book.name, chapter: ci + 1, verse: vi + 1, text: verse, testament: getTestament(book.name) }); } }); }); });
    addToSearchHistory(term, appState.searchResults.length);
    if (appState.searchResults.length > 0) { document.querySelector('.search-results-nav').style.display = 'flex'; let info = appState.searchFilter.book !== 'all' ? `em ${appState.searchFilter.book}` : appState.searchFilter.testament !== 'all' ? (appState.searchFilter.testament === 'old' ? 'no AT' : 'no NT') : ''; document.getElementById('search-info').textContent = `"${term}" ${info}`; navigateToNextResult(); }
    else { alert(`Nenhum resultado para "${term}"`); document.querySelector('.search-results-nav').style.display = 'none'; }

    // Após encontrar resultados, mostrar página de resultados
if (appState.searchResults.length > 0) {
    document.querySelector('.search-results-nav').style.display = 'flex';
    let info = appState.searchFilter.book !== 'all' ? `em ${appState.searchFilter.book}` : 
               appState.searchFilter.testament !== 'all' ? (appState.searchFilter.testament === 'old' ? 'no AT' : 'no NT') : '';
    document.getElementById('search-info').textContent = `"${term}" ${info}`;
    
    // Mostrar página de resultados em vez de navegar
    showSearchResultsPage();
    
    navigateToNextResult(); // Mantém para compatibilidade
}
}
function navigateToNextResult() { if (!appState.searchResults.length) return; appState.currentSearchIndex = (appState.currentSearchIndex + 1) % appState.searchResults.length; navigateToResult(); }
function navigateToPrevResult() { if (!appState.searchResults.length) return; appState.currentSearchIndex = (appState.currentSearchIndex - 1 + appState.searchResults.length) % appState.searchResults.length; navigateToResult(); }
function navigateToResult() { const r = appState.searchResults[appState.currentSearchIndex]; if (appState.currentTestament !== r.testament) { appState.currentTestament = r.testament; document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === r.testament)); } appState.currentBook = { name: r.book, testament: r.testament }; document.getElementById('book-list').style.display = 'none'; document.getElementById('chapter-content').style.display = 'block'; loadChapterForSearch(r.chapter - 1); setTimeout(() => { highlightSearchResults(); const el = document.getElementById(`verse-${r.verse - 1}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); }
function highlightSearchResults() { if (!appState.currentSearchTerm || !appState.searchResults.length) return; clearSearchHighlights(); document.querySelectorAll('#verses-container .verse-container').forEach(el => { const vt = el.querySelector('.verse-text'); if (vt && vt.textContent.toLowerCase().includes(appState.currentSearchTerm.toLowerCase())) { vt.innerHTML = vt.textContent.replace(new RegExp(`(${escapeRegExp(appState.currentSearchTerm)})`, 'gi'), '<mark>$1</mark>'); el.classList.add('verse-highlight'); } }); if (appState.currentSearchIndex >= 0) { const cr = appState.searchResults[appState.currentSearchIndex]; const el = document.getElementById(`verse-${cr.verse - 1}`); if (el) { el.classList.remove('verse-highlight'); el.classList.add('current-result'); } } document.getElementById('result-counter').textContent = `${appState.currentSearchIndex + 1} de ${appState.searchResults.length}`; }
function clearSearchHighlights() { document.querySelectorAll('#verses-container .verse-container').forEach(el => { el.classList.remove('verse-highlight', 'current-result'); const vt = el.querySelector('.verse-text'); if (vt) vt.innerHTML = vt.textContent; }); }
function clearSearch() { appState.searchResults = []; appState.currentSearchIndex = -1; appState.currentSearchTerm = ''; document.querySelector('.search-results-nav').style.display = 'none'; document.getElementById('search-input').value = ''; if (appState.currentBook && appState.currentChapter !== null) loadChapter(appState.currentChapter); }

// ============ OCORRÊNCIAS ============
function getOccurrencesByBook() { const occ = {}; appState.searchResults.forEach(r => { if (!occ[r.book]) occ[r.book] = { count: 0, testament: r.testament }; occ[r.book].count++; }); return Object.entries(occ).sort((a, b) => b[1].count - a[1].count).map(([book, data]) => ({ book, ...data })); }
function showOccurrences() { const occ = getOccurrencesByBook(); document.getElementById('occurrences-list').innerHTML = occ.map((item, i) => `<div class="occurrence-item" onclick="navigateToBook('${item.book.replace(/'/g, "\\'")}')"><span style="font-size:1.2rem;">${i + 1}.</span><span class="occurrence-book">${item.book} <small style="color:var(--text3);">(${item.testament === 'old' ? 'AT' : 'NT'})</small></span><span class="occurrence-count">${item.count}</span></div>`).join(''); document.getElementById('occurrences-total').innerHTML = `📊 Total: <strong>${appState.searchResults.length}</strong> em <strong>${occ.length}</strong> livro(s) para "<strong>${appState.currentSearchTerm}</strong>"`; document.getElementById('occurrences-modal').style.display = 'flex'; }
function navigateToBook(bookName) { document.getElementById('occurrences-modal').style.display = 'none'; appState.currentTestament = getTestament(bookName); document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === appState.currentTestament)); appState.currentBook = { name: bookName, testament: appState.currentTestament }; renderChapterList(bookName); }