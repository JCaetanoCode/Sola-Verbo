// ============ FILTROS ============
function updateBookFilter() {
    const ft = document.getElementById('filter-testament');
    const fb = document.getElementById('filter-book');
    const fc = document.getElementById('filter-chapter');
    const fv = document.getElementById('filter-verse');
    if (!ft || !fb || !fc || !fv) return;
    
    const cv = fb.value;
    
    fb.innerHTML = '<option value="all">Todos os livros</option>';
    let books = ft.value === 'all' ? [...BIBLE_BOOKS.old,...BIBLE_BOOKS.new] : BIBLE_BOOKS[ft.value];
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
    if (!fb || !fc || !fv) return;
    
    const selectedBook = fb.value;
    
    fc.innerHTML = '<option value="all">Todos os capítulos</option>';
    fv.innerHTML = '<option value="all">Todos os versículos</option>';
    
    if (selectedBook !== 'all') {
        const bookData = findBook(selectedBook);
        if (bookData && bookData.chapters) {
            const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
            const numChapters = chaptersArray.length;
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

function updateVerseFilter() {
    const fb = document.getElementById('filter-book');
    const fc = document.getElementById('filter-chapter');
    const fv = document.getElementById('filter-verse');
    if (!fb || !fc || !fv) return;
    
    const selectedBook = fb.value;
    const selectedChapter = fc.value;
    
    fv.innerHTML = '<option value="all">Todos os versículos</option>';
    
    if (selectedBook !== 'all' && selectedChapter !== 'all') {
        const bookData = findBook(selectedBook);
        if (bookData && bookData.chapters) {
            const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
            const chapterVerses = chaptersArray[selectedChapter - 1];
            if (chapterVerses && Array.isArray(chapterVerses)) {
                for (let i = 1; i <= chapterVerses.length; i++) {
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
    } else {
        fv.disabled = true;
    }
    
    fv.value = 'all';
    appState.searchFilter.verse = 'all';
}

function checkAutoNavigate() {
    const book = document.getElementById('filter-book')?.value;
    const chapter = document.getElementById('filter-chapter')?.value;
    const verse = document.getElementById('filter-verse')?.value;
    
    if (!book || !chapter || !verse) return;
    
    if (book !== 'all' && chapter !== 'all' && verse !== 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        hideAllViews();
        const cc = document.getElementById('chapter-content');
        if (cc) cc.style.display = 'block';
        loadChapter(parseInt(chapter) - 1);
        setTimeout(() => {
            const el = document.getElementById(`verse-${parseInt(verse) - 1}`);
            if (el) { el.style.background = 'var(--highlight)'; el.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(() => el.style.background = '', 2500); }
        }, 400);
    } else if (book !== 'all' && chapter !== 'all' && verse === 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        hideAllViews();
        const cc = document.getElementById('chapter-content');
        if (cc) cc.style.display = 'block';
        loadChapter(parseInt(chapter) - 1);
    } else if (book !== 'all' && chapter === 'all') {
        const bookTestament = getTestament(book);
        if (appState.currentTestament !== bookTestament) {
            appState.currentTestament = bookTestament;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === bookTestament));
        }
        appState.currentBook = { name: book, testament: bookTestament };
        hideAllViews();
        const cc = document.getElementById('chapter-content');
        if (cc) cc.style.display = 'block';
        renderChapterList(book);
    }
}

function hideAllViews() {
    ['book-list', 'chapter-content', 'compare-view-full', 'search-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ============ HISTÓRICO ============
function loadSearchHistory() { 
    const s = localStorage.getItem('searchHistory'); 
    if(s) appState.searchHistory = JSON.parse(s); 
}

function saveSearchHistory() { 
    localStorage.setItem('searchHistory', JSON.stringify(appState.searchHistory)); 
}

function addToSearchHistory(term, total) {
    appState.searchHistory = appState.searchHistory.filter(i => i.term.toLowerCase() !== term.toLowerCase());
    appState.searchHistory.unshift({term, total, date: new Date().toISOString()});
    if(appState.searchHistory.length > 20) appState.searchHistory = appState.searchHistory.slice(0,20);
    saveSearchHistory(); 
    renderSearchHistory();
}

function removeFromHistory(i) { 
    appState.searchHistory.splice(i,1); 
    saveSearchHistory(); 
    renderSearchHistory(); 
}

function clearSearchHistory() { 
    appState.searchHistory = []; 
    saveSearchHistory(); 
    renderSearchHistory(); 
    const historyDiv = document.getElementById('search-history');
    if (historyDiv) historyDiv.classList.remove('active');
}

function renderSearchHistory() {
    const h = document.getElementById('search-history');
    if(!h) return;
    if(!appState.searchHistory.length) { h.innerHTML = ''; return; }
    h.innerHTML = appState.searchHistory.map((item,i) => 
        `<div class="search-history-item" onclick="useHistoryTerm('${item.term.replace(/'/g,"\\'")}')">
            <span class="search-history-term">🔍 ${item.term}</span>
            <span class="search-history-count">${item.total} res.</span>
            <button class="search-history-remove" onclick="event.stopPropagation();removeFromHistory(${i})">×</button>
        </div>`
    ).join('') + '<div class="search-history-clear" onclick="clearSearchHistory()">Limpar histórico</div>';
}

function useHistoryTerm(t) { 
    const input = document.getElementById('search-input-main');
    if (input) {
        input.value = t; 
    }
    const historyDiv = document.getElementById('search-history');
    if (historyDiv) historyDiv.classList.remove('active');
    performSearch(); 
}

// ============ BUSCA GLOBAL ============
function performSearch() {
    const searchInput = document.getElementById('search-input-main');
    if (!searchInput) {
        console.error('Campo de busca não encontrado');
        return;
    }
    
    const term = searchInput.value.trim();
    if(!term){ 
        alert('Digite um termo para buscar'); 
        return; 
    }
    
    if(!appState.bibleData || !appState.bibleData.books){ 
        alert('Carregue uma versão primeiro'); 
        return; 
    }
    
    console.log('🔍 Buscando por:', term);
    
    appState.searchResults = [];
    appState.currentSearchIndex = -1;
    appState.currentSearchTerm = term;
    
    const historyDiv = document.getElementById('search-history');
    if (historyDiv) historyDiv.classList.remove('active');
    
    let totalFound = 0;
    
    appState.bibleData.books.forEach(book => {
        if (!book.chapters) return;
        
        let chaptersArray;
        if (Array.isArray(book.chapters)) {
            chaptersArray = book.chapters;
        } else if (typeof book.chapters === 'object') {
            chaptersArray = Object.keys(book.chapters)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(key => book.chapters[key]);
        } else {
            return;
        }
        
        chaptersArray.forEach((chapter, chapterIndex) => {
            if (!Array.isArray(chapter)) return;
            
            chapter.forEach((verse, verseIndex) => {
                if(typeof verse === 'string' && verse.toLowerCase().includes(term.toLowerCase())){
                    appState.searchResults.push({
                        book: book.name,
                        chapter: chapterIndex + 1,
                        verse: verseIndex + 1,
                        text: verse,
                        testament: getTestament(book.name)
                    });
                    totalFound++;
                }
            });
        });
    });
    
    console.log('✅ Resultados encontrados:', totalFound);
    
    if(totalFound > 0){
        addToSearchHistory(term, totalFound);
        
        const hero = document.getElementById('search-hero');
        if (hero) hero.style.display = 'none';
        
        const resultsPage = document.getElementById('search-results-page');
        if (resultsPage) {
            resultsPage.style.display = 'flex';
        }
        
        if (typeof resultsState !== 'undefined') {
            resultsState.filteredResults = [...appState.searchResults];
            resultsState.selectedBook = null;
        }
        
        renderSearchResultsPage();
    } else {
        addToSearchHistory(term, 0);
        alert(`Nenhum resultado encontrado para "${term}" em toda a Bíblia.`);
    }
}

// ============ NAVEGAÇÃO DE RESULTADOS ============
function navigateToNextResult() {
    if(!appState.searchResults.length) return;
    appState.currentSearchIndex = (appState.currentSearchIndex + 1) % appState.searchResults.length;
    navigateToResult();
}

function navigateToPrevResult() {
    if(!appState.searchResults.length) return;
    appState.currentSearchIndex = (appState.currentSearchIndex - 1 + appState.searchResults.length) % appState.searchResults.length;
    navigateToResult();
}

function navigateToResult() {
    const r = appState.searchResults[appState.currentSearchIndex];
    if (!r) return;
    
    if(appState.currentTestament !== r.testament){
        appState.currentTestament = r.testament;
        document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === r.testament));
    }
    
    appState.currentBook = { name: r.book, testament: r.testament };
    hideAllViews();
    const cc = document.getElementById('chapter-content');
    if (cc) cc.style.display = 'block';
    loadChapterForSearch(r.chapter - 1);
    setTimeout(() => {
        highlightSearchResults();
        const el = document.getElementById(`verse-${r.verse - 1}`);
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function loadChapterForSearch(ci) {
    const bd = findBook(appState.currentBook.name);
    if(!bd) return;
    
    const chaptersArray = Array.isArray(bd.chapters) ? bd.chapters : Object.values(bd.chapters);
    if(!chaptersArray[ci]) return;
    
    appState.currentChapter = ci;
    document.getElementById('chapter-title').textContent = `${bd.name} ${ci + 1}`;
    const vc = document.getElementById('verses-container');
    if (!vc) return;
    vc.innerHTML = '';
    
    chaptersArray[ci].forEach((verse, vi) => {
        const key = getVerseKey(bd.name, ci+1, vi+1);
        const mc = appState.markers[key] || '';
        const hn = appState.notes[key] ? true : false;
        const el = document.createElement('div');
        el.className = 'verse-container';
        el.id = `verse-${vi}`;
        if(hn) el.style.borderLeft = '3px solid var(--note-color)';
        if(mc) el.style.background = `var(--marker-${mc})`;
        el.innerHTML = `<div class="verse-number">${vi+1}</div><div class="verse-text">${verse||'&nbsp;'}${hn?'<span class="note-indicator">📝</span>':''}</div>
            <div class="verse-actions">
                <button class="verse-action-btn" onclick="event.stopPropagation();openNoteModal('${bd.name.replace(/'/g,"\\'")}',${ci+1},${vi+1})">📝</button>
                <button class="verse-action-btn" onclick="event.stopPropagation();toggleFavorite('${bd.name.replace(/'/g,"\\'")}',${ci+1},${vi+1},this)">${isFavorite(bd.name,ci+1,vi+1)?'⭐':'☆'}</button>
            </div>`;
        vc.appendChild(el);
    });
    
    const nav = document.querySelector('.search-results-nav');
    if (nav) nav.style.display = 'flex';
}

function highlightSearchResults() {
    if(!appState.currentSearchTerm || !appState.searchResults.length) return;
    clearSearchHighlights();
    document.querySelectorAll('#verses-container .verse-container').forEach(el => {
        const vt = el.querySelector('.verse-text');
        if(vt && vt.textContent.toLowerCase().includes(appState.currentSearchTerm.toLowerCase())){
            vt.innerHTML = vt.textContent.replace(new RegExp(`(${escapeRegExp(appState.currentSearchTerm)})`,'gi'), '<mark>$1</mark>');
            el.classList.add('verse-highlight');
        }
    });
    if(appState.currentSearchIndex >= 0){
        const cr = appState.searchResults[appState.currentSearchIndex];
        const el = document.getElementById(`verse-${cr.verse - 1}`);
        if(el){ el.classList.remove('verse-highlight'); el.classList.add('current-result'); }
    }
    const counter = document.getElementById('result-counter');
    if (counter) counter.textContent = `${appState.currentSearchIndex + 1} de ${appState.searchResults.length}`;
}

function clearSearchHighlights() {
    document.querySelectorAll('#verses-container .verse-container').forEach(el => {
        el.classList.remove('verse-highlight', 'current-result');
        const vt = el.querySelector('.verse-text');
        if(vt) vt.innerHTML = vt.textContent;
    });
}

function clearSearch() {
    appState.searchResults = [];
    appState.currentSearchIndex = -1;
    appState.currentSearchTerm = '';
    const nav = document.querySelector('.search-results-nav');
    if (nav) nav.style.display = 'none';
    const input = document.getElementById('search-input-main');
    if (input) input.value = '';
    if(appState.currentBook && appState.currentChapter !== null) loadChapter(appState.currentChapter);
}