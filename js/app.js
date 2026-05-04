// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadBibleData(appState.currentVersion);
        await loadCompareVersion();
        if (!loadCrossrefFromStorage()) loadCrossrefData();
        setupEventListeners();
        renderBookList();
        loadSearchHistory();
        updateBookFilter();
    } catch (e) {
        console.error('Erro na inicialização:', e);
        const bl = document.getElementById('book-list');
        if (bl) bl.innerHTML = '<div style="color:red;padding:20px;">Erro ao carregar.</div>';
    }
});

// ============ TROCAR DE ABA ============
function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    ['book-list', 'chapter-content', 'compare-view-full', 'search-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const resultsPage = document.getElementById('search-results-page');
    if (resultsPage) resultsPage.style.display = 'none';

    const hero = document.getElementById('search-hero');
    if (hero) hero.style.display = 'block';

    if (typeof stopChapterAudio === 'function') stopChapterAudio();

    switch (tab) {
        case 'old':
            appState.currentTestament = 'old';
            const blOld = document.getElementById('book-list');
            if (blOld) blOld.style.display = 'block';
            renderBookList();
            break;
        case 'new':
            appState.currentTestament = 'new';
            const blNew = document.getElementById('book-list');
            if (blNew) blNew.style.display = 'block';
            renderBookList();
            break;
        case 'search':
            const sv = document.getElementById('search-view');
            if (sv) sv.style.display = 'block';
            const si = document.getElementById('search-input-main');
            if (si) setTimeout(() => si.focus(), 100);
            break;
        case 'compare':
            const cv = document.getElementById('compare-view-full');
            if (cv) cv.style.display = 'block';
            if (typeof populateCompareBooks === 'function') populateCompareBooks();
            break;
    }
}

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    const $ = (id) => document.getElementById(id);

    // Seletor de versão
    const versionSelector = $('version-selector');
    if (versionSelector) {
        versionSelector.addEventListener('change', async e => {
            await loadBibleData(e.target.value);
            updateBookFilter();
            switchTab('old');
        });
    }

    // Navegação por abas
    document.querySelectorAll('.nav-item').forEach(b => {
        b.addEventListener('click', e => switchTab(e.target.dataset.tab));
    });

    // Botões
    const backButton = $('back-button');
    if (backButton) backButton.addEventListener('click', goBack);

    const homeButton = $('home-button');
    if (homeButton) homeButton.addEventListener('click', () => switchTab('old'));

    const favButton = $('favorites-button');
    if (favButton) favButton.addEventListener('click', showFavorites);

    const dictButton = $('dictionary-button');
    if (dictButton) dictButton.addEventListener('click', showDictionary);

    const scrollBtn = $('scroll-top-button');
    if (scrollBtn) scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Fechar modais
    ['close-favorites', 'close-occurrences', 'close-dictionary'].forEach(id => {
        const btn = $(id);
        if (btn) {
            const modalId = id.replace('close-', '') + '-modal';
            btn.addEventListener('click', () => {
                const modal = $(modalId);
                if (modal) modal.style.display = 'none';
            });
        }
    });

    // Filtros
    const filterTestament = $('filter-testament');
    if (filterTestament) filterTestament.addEventListener('change', updateBookFilter);

    const filterBook = $('filter-book');
    if (filterBook) filterBook.addEventListener('change', () => {
        updateChapterFilter();
        appState.searchFilter.book = filterBook.value;
        checkAutoNavigate();
    });

    const filterChapter = $('filter-chapter');
    if (filterChapter) filterChapter.addEventListener('change', () => {
        updateVerseFilter();
        appState.searchFilter.chapter = filterChapter.value;
        checkAutoNavigate();
    });

    const filterVerse = $('filter-verse');
    if (filterVerse) filterVerse.addEventListener('change', () => {
        appState.searchFilter.verse = filterVerse.value;
        checkAutoNavigate();
    });

    // Busca principal
    const searchButton = $('search-button-main');
    const searchInput = $('search-input-main');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
        searchInput.addEventListener('focus', () => {
            if (appState.searchHistory && appState.searchHistory.length > 0) {
                renderSearchHistory();
                const hd = $('search-history');
                if (hd) hd.classList.add('active');
            }
        });
    }

    document.addEventListener('click', e => {
        const searchBar = document.querySelector('.search-bar-large');
        if (searchBar && !searchBar.contains(e.target)) {
            const hd = $('search-history');
            if (hd) hd.classList.remove('active');
        }
    });

    // Resultados
    const prevResult = $('prev-result');
    if (prevResult) prevResult.addEventListener('click', navigateToPrevResult);

    const nextResult = $('next-result');
    if (nextResult) nextResult.addEventListener('click', navigateToNextResult);

    const showOcc = $('show-occurrences');
    if (showOcc) showOcc.addEventListener('click', () => {
        const cc = $('chapter-content');
        if (cc) cc.style.display = 'none';
        showSearchResultsPage();
    });

    const clearSrch = $('clear-search');
    if (clearSrch) clearSrch.addEventListener('click', clearSearch);

    const backResults = $('back-from-results');
    if (backResults) backResults.addEventListener('click', () => {
        const rp = $('search-results-page');
        if (rp) rp.style.display = 'none';
        const hero = $('search-hero');
        if (hero) hero.style.display = 'block';
        const si = $('search-input-main');
        if (si) { si.value = ''; si.focus(); }
    });

    // Comparação
    const compareGo = $('compare-btn-go');
    if (compareGo) compareGo.addEventListener('click', runCompare);

    const compareBook = $('compare-book');
    if (compareBook) compareBook.addEventListener('change', updateCompareChapters);

    // Áudio
    const playBtn = $('play-chapter');
    if (playBtn) playBtn.addEventListener('click', playChapterAudio);

    const pauseBtn = $('pause-chapter');
    if (pauseBtn) pauseBtn.addEventListener('click', pauseChapterAudio);

    const stopBtn = $('stop-chapter');
    if (stopBtn) stopBtn.addEventListener('click', stopChapterAudio);

    // Fechar modais clicando fora
    ['favorites-modal', 'occurrences-modal', 'note-modal', 'crossref-modal', 'dictionary-modal', 'content-modal'].forEach(id => {
        const modal = $(id);
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === e.currentTarget) modal.style.display = 'none';
            });
        }
    });

    // Salvar nota
    const saveNote = $('save-note-btn');
    if (saveNote) saveNote.addEventListener('click', saveCurrentNote);

    // Dicionário
    const dictSearch = $('dictionary-search');
    if (dictSearch) dictSearch.addEventListener('input', searchDictionary);

    // Navegação de capítulos
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');

if (prevChapterBtn) {
    prevChapterBtn.addEventListener('click', () => navigateChapter(-1));
}

if (nextChapterBtn) {
    nextChapterBtn.addEventListener('click', () => navigateChapter(1));
}
}

// ============ COMPARAÇÃO ============
function populateCompareBooks() {
    const select = document.getElementById('compare-book');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um livro</option>';
    [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new].forEach(book => {
        const o = document.createElement('option');
        o.value = book;
        o.textContent = book;
        select.appendChild(o);
    });
}

function updateCompareChapters() {
    const bookSelect = document.getElementById('compare-book');
    const chapterSelect = document.getElementById('compare-chapter');
    if (!bookSelect || !chapterSelect) return;

    const bookName = bookSelect.value;
    chapterSelect.innerHTML = '<option value="">Selecione</option>';

    if (bookName) {
        const bookData = findBook(bookName);
        if (bookData && bookData.chapters) {
            const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
            for (let i = 1; i <= chaptersArray.length; i++) {
                const o = document.createElement('option');
                o.value = i;
                o.textContent = `Capítulo ${i}`;
                chapterSelect.appendChild(o);
            }
            chapterSelect.disabled = false;
        }
    } else {
        chapterSelect.disabled = true;
    }
}

async function runCompare() {
    const v1 = document.getElementById('compare-version-1')?.value;
    const v2 = document.getElementById('compare-version-2')?.value;
    const book = document.getElementById('compare-book')?.value;
    const chapter = document.getElementById('compare-chapter')?.value;

    if (!book || !chapter) { alert('Selecione livro e capítulo'); return; }

    let data1 = appState.bibleData;
    if (v1 !== appState.currentVersion) {
        try {
            const r = await fetch(`data/${v1}.json`);
            if (r.ok) data1 = convertBibleFormat(await r.json(), v1);
        } catch (e) { }
    }

    let data2 = appState.compareData;
    if (v2 !== appState.compareVersion) {
        try {
            const r = await fetch(`data/${v2}.json`);
            if (r.ok) data2 = convertBibleFormat(await r.json(), v2);
        } catch (e) { }
    }

    const bd1 = findBook(book, data1);
    const bd2 = findBook(book, data2);

    const chapters1 = bd1 ? (Array.isArray(bd1.chapters) ? bd1.chapters : Object.values(bd1.chapters)) : [];
    const chapters2 = bd2 ? (Array.isArray(bd2.chapters) ? bd2.chapters : Object.values(bd2.chapters)) : [];

    const verses1 = chapters1[chapter - 1] || [];
    const verses2 = chapters2[chapter - 1] || [];
    const max = Math.max(verses1.length, verses2.length);

    const pane1 = document.getElementById('compare-pane-1');
    const pane2 = document.getElementById('compare-pane-2');

    if (pane1) {
        pane1.innerHTML = `
            <h3 style="color:var(--gold);text-align:center;padding:10px;position:sticky;top:0;background:var(--surface);">📖 ${v1} - ${book} ${chapter}</h3>
            ${Array.from({ length: max }, (_, i) => `<div style="padding:6px 10px;font-size:0.82rem;color:var(--text2);${verses2[i] && verses1[i] !== verses2[i] ? 'background:rgba(255,200,50,0.08);border-left:2px solid var(--gold)' : ''}"><strong style="color:var(--verse-num);">${i + 1}.</strong> ${verses1[i] || '—'}</div>`).join('')}
        `;
    }

    if (pane2) {
        pane2.innerHTML = `
            <h3 style="color:var(--gold);text-align:center;padding:10px;position:sticky;top:0;background:var(--surface);">📖 ${v2} - ${book} ${chapter}</h3>
            ${Array.from({ length: max }, (_, i) => `<div style="padding:6px 10px;font-size:0.82rem;color:var(--text2);${verses1[i] && verses1[i] !== verses2[i] ? 'background:rgba(255,200,50,0.08);border-left:2px solid var(--gold)' : ''}"><strong style="color:var(--verse-num);">${i + 1}.</strong> ${verses2[i] || '—'}</div>`).join('')}
        `;
    }
}

// ============ REGISTRAR SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);

                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nova versão disponível
                            console.log('🔄 Nova versão disponível!');
                            if (confirm('Nova versão disponível! Atualizar agora?')) {
                                newWorker.postMessage('skipWaiting');
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ Service Worker falhou:', error);
            });
    });
}