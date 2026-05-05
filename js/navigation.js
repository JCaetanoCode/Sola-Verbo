// ============ NAVEGAÇÃO PRINCIPAL ============
function goHome() {
    appState.currentBook = null;
    appState.currentChapter = null;

    document.getElementById('book-list').style.display = 'block';
    document.getElementById('chapter-content').style.display = 'none';
    document.getElementById('compare-view-full').style.display = 'none';
    document.querySelector('.search-results-nav').style.display = 'none';

    renderBookList();
}

function goBack() {
    document.getElementById('compare-view-full').style.display = 'none';
    document.querySelector('.search-results-nav').style.display = 'none';

    if (appState.currentChapter !== null) {
        // Voltar para lista de capítulos
        appState.currentChapter = null;
        renderChapterList(appState.currentBook.name);
    } else if (appState.currentBook) {
        // Voltar para lista de livros
        appState.currentBook = null;
        document.getElementById('chapter-content').style.display = 'none';
        document.getElementById('book-list').style.display = 'block';
        renderBookList();
    }
}

// ============ RENDERIZAÇÃO DE LIVROS ============
function renderBookList() {
    const bl = document.getElementById('book-list');
    bl.style.display = 'block';
    document.getElementById('chapter-content').style.display = 'none';
    bl.innerHTML = '';

    const categories = BIBLE_STRUCTURE[appState.currentTestament];

    for (const [category, books] of Object.entries(categories)) {
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        bl.appendChild(categoryTitle);

        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'category-grid';

        books.forEach((book) => {
            const meta = getBookMetadata(book);
            const chaptersCount = meta ? meta.chapters : '?';

            const el = document.createElement('div');
            el.className = 'book-item';
            el.innerHTML = `
                <div class="book-name">${book}</div>
                <div class="book-chapters">${chaptersCount} cap.</div>
            `;
            el.addEventListener('click', () => {
                appState.currentBook = {
                    name: book,
                    testament: appState.currentTestament
                };
                renderChapterList(book);
            });
            categoryGrid.appendChild(el);
        });

        bl.appendChild(categoryGrid);
    }
}

// ============ RENDERIZAÇÃO DE CAPÍTULOS ============
function renderChapterList(bookName) {
    document.getElementById('book-list').style.display = 'none';
    document.getElementById('chapter-content').style.display = 'block';
    document.getElementById('compare-view-full').style.display = 'none';

    const bd = findBook(bookName);
    if (!bd) {
        alert(`Livro "${bookName}" não encontrado`);
        goHome();
        return;
    }

    const chaptersArray = Array.isArray(bd.chapters) ? bd.chapters : Object.values(bd.chapters);
    document.getElementById('chapter-title').textContent = `${bd.name} - ${chaptersArray.length} capítulos`;
    document.getElementById('verses-container').innerHTML =
        `<div class="chapter-navigation">${Array.from({ length: chaptersArray.length }, (_, i) => `<div class="chapter-link" onclick="loadChapter(${i})">${i + 1}</div>`).join('')}</div>`;
    appState.currentChapter = null;

    // Esconder botões de navegação
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
}

// ============ DETECTOR DE PARÁGRAFOS (FORA DO loadChapter) ============
function isParagraphStart(verseText, previousVerseText = "") {
    if (!verseText) return false;

    const text = verseText.trim();
    const prev = previousVerseText.trim();
    let score = 0;

    const strongParagraphStarters = [
        /^E\s+(disse|falou|chamou|havia|aconteceu|sucedeu)/i,
        /^Então\s/i,
        /^Depois\s+(destas|disso|disto)/i,
        /^Ora,\s/i,
        /^Assim\s+(diz|começou|terminou)/i,
        /^No\s+(princípio|dia|tempo|ano)/i,
        /^Naquele\s+tempo/i,
        /^Naqueles\s+dias/i,
        /^Passados\s+(os|alguns)\s+dias/i,
        /^Aconteceu\s/i,
        /^Sucedeu\s/i,
        /^Disse\s+(Deus|Jesus|o Senhor|o SENHOR)/i,
        /^(disse|falou|respondeu|replicou|clamou|gritou|perguntou|exclamou|ordenou)\s+/i,
        /^Levanta-te\s/i,
        /^Haja\s/i,
        /^Produza\s/i,
        /^Eis\s+que\s/i,
        /^Estas\s+(são|foram)/i,
        /^Ai\s+/i,
        /^Bem-aventurado/i,
        /^Portanto\s/i,
        /^Tendo\s/i,
        /^Chegando\s/i,
        /^Partindo\s/i,
        /^(filho|filhos)\s+de/i,
        /^gerou\s/i,
        /^viveu\s/i,
        /^morreu\s/i,
    ];

    const weakConnectors = /^(e|ou|mas|porém|todavia|contudo|porque|pois|também|assim|desta|deste|para|com|em|no|na|os|as|o|a|um|uma|então)\s/i;

    for (const pattern of strongParagraphStarters) {
        if (pattern.test(text)) {
            score += 3;
            break;
        }
    }

    if (prev && /[.!?]$/.test(prev)) score += 1;
    if (prev.endsWith(":")) score += 3;
    if (/^["'"]/.test(text)) score += 2;
    if (prev.length > 120 && text.length < 70) score += 1;
    if (text.length < 90 && (text.includes(";") || text.split(",").length >= 3)) score += 1;
    if (weakConnectors.test(text)) score -= 2;
    if (prev && /[.!?]$/.test(prev) && /^[A-ZÀ-Ú]/.test(text)) score += 1;

    return score >= 3;
}

// ============ CARREGAR CAPÍTULO ============
function loadChapter(chapterIndex) {
    const bd = findBook(appState.currentBook.name);
    if (!bd) { alert('Livro não encontrado'); return; }

    const chaptersArray = Array.isArray(bd.chapters) ? bd.chapters : Object.values(bd.chapters);
    if (!chaptersArray[chapterIndex]) { alert('Capítulo não encontrado'); return; }

    const chapterVerses = chaptersArray[chapterIndex];
    appState.currentChapter = chapterIndex;
    document.getElementById('chapter-title').textContent = `${bd.name} ${chapterIndex + 1}`;

    const vc = document.getElementById('verses-container');
    vc.innerHTML = '';

    // Barra de ferramentas
    const toolbarDiv = document.createElement('div');
    toolbarDiv.className = 'paragraph-toolbar';
    toolbarDiv.innerHTML = `
        <button class="toolbar-btn" onclick="toggleParagraphMarkers()" title="Mostrar/Esconder marcadores">¶</button>
        <button class="toolbar-btn" onclick="toggleMarkerPaletteParagraph()" title="Marca-texto">🖍️</button>
        <div id="marker-palette-paragraph" class="marker-palette" style="display:none;">
            <div class="marker-color" data-color="yellow" onclick="setMarkerParagraph('yellow')"></div>
            <div class="marker-color" data-color="green" onclick="setMarkerParagraph('green')"></div>
            <div class="marker-color" data-color="blue" onclick="setMarkerParagraph('blue')"></div>
            <div class="marker-color" data-color="pink" onclick="setMarkerParagraph('pink')"></div>
            <div class="marker-color" data-color="orange" onclick="setMarkerParagraph('orange')"></div>
            <span class="marker-clear" onclick="setMarkerParagraph('none')">✕</span>
        </div>
    `;
    vc.appendChild(toolbarDiv);

    // Container do parágrafo
    const paragraphDiv = document.createElement('div');
    paragraphDiv.className = 'verses-paragraph';

    // Início do capítulo
    const chapterStart = document.createElement('div');
    chapterStart.className = 'chapter-start-indicator';
    chapterStart.innerHTML = `<span class="chapter-start-label">Capítulo ${chapterIndex + 1}</span>`;
    paragraphDiv.appendChild(chapterStart);

    // Agrupar versículos em parágrafos
    let currentBlock = null;
    let blockIndex = 0;

    chapterVerses.forEach((verse, vi) => {
        const key = getVerseKey(bd.name, chapterIndex + 1, vi + 1);
        const mc = appState.markers[key] || '';
        const prevVerse = vi > 0 ? chapterVerses[vi - 1] : '';

        // Criar novo bloco de parágrafo se for o primeiro versículo ou início de parágrafo
        if (vi === 0 || isParagraphStart(verse, prevVerse)) {
            if (vi > 0) blockIndex++;
            currentBlock = document.createElement('span');
            currentBlock.className = `paragraph-block ${blockIndex % 2 === 0 ? 'even' : 'odd'}`;
            paragraphDiv.appendChild(currentBlock);
        }

        const verseSpan = document.createElement('span');
        verseSpan.className = 'verse-inline';
        if (vi > 0 && isParagraphStart(verse, prevVerse)) verseSpan.classList.add('paragraph-start');
        verseSpan.id = `verse-${vi}`;
        if (mc) verseSpan.style.background = `var(--marker-${mc})`;

        const paraMarker = (vi > 0 && isParagraphStart(verse, prevVerse)) ? '<span class="paragraph-marker" title="Início de parágrafo">¶</span>' : '';

        verseSpan.innerHTML = `
    ${paraMarker}
    <sup class="verse-number-inline" data-verse="${vi + 1}" onclick="event.stopPropagation(); playVerseAudio(${vi})">${vi + 1}</sup>
    <span class="verse-text-inline">${verse || '&nbsp;'}</span>
    <span class="verse-actions-inline">
        <button class="verse-action-btn-inline" onclick="event.stopPropagation(); playVerseAudio(${vi})" title="Ouvir">🔊</button>
        <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openNoteModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${vi + 1})" title="Nota">📝</button>
        <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openCrossrefModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${vi + 1})" title="Referências">🔗</button>
        <button class="verse-action-btn-inline" onclick="event.stopPropagation(); toggleFavorite('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${vi + 1},this)" title="Favorito">${isFavorite(bd.name, chapterIndex + 1, vi + 1) ? '⭐' : '☆'}</button>
    </span>
`;
        currentBlock.appendChild(verseSpan);
    });

    // Fim do capítulo
    const chapterEnd = document.createElement('div');
    chapterEnd.className = 'chapter-end-indicator';
    chapterEnd.innerHTML = `
        <span class="chapter-end-symbol">❖</span>
        <span class="chapter-end-label">Fim do Capítulo ${chapterIndex + 1}</span>
    `;
    paragraphDiv.appendChild(chapterEnd);

    // ===== BOTÃO VOLTAR AO TOPO =====
    const backToTopDiv = document.createElement('div');
    backToTopDiv.className = 'back-to-top-container';
    backToTopDiv.innerHTML = `
        <button class="back-to-top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Voltar ao topo">
            ⬆️ Voltar ao Topo
        </button>
    `;
    paragraphDiv.appendChild(backToTopDiv);

    vc.appendChild(paragraphDiv);

    // Atualizar navegação
    updateChapterNavButtons();
    // ... resto do código

    // Mostrar botões de navegação
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    // Aplicar zoom
    if (typeof currentZoom !== 'undefined') {
        paragraphDiv.style.fontSize = `${currentZoom}%`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (appState.searchResults.length > 0) highlightSearchResultsParagraph();
}

// Atualizar estado dos botões de navegação
function updateChapterNavButtons() {
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');

    if (!appState.currentBook || appState.currentChapter === null) return;

    const bookData = findBook(appState.currentBook.name);
    if (!bookData) return;

    const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);

    if (prevBtn) {
        prevBtn.disabled = appState.currentChapter === 0;
        prevBtn.style.display = 'flex';
    }

    if (nextBtn) {
        nextBtn.disabled = appState.currentChapter >= chaptersArray.length - 1;
        nextBtn.style.display = 'flex';
    }
}

// Navegar entre capítulos (anterior/próximo)
function navigateChapter(direction) {
    if (!appState.currentBook || appState.currentChapter === null) return;

    const bookData = findBook(appState.currentBook.name);
    if (!bookData) return;

    const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
    const newChapter = appState.currentChapter + direction;

    if (newChapter >= 0 && newChapter < chaptersArray.length) {
        loadChapter(newChapter);
    }
}

// ============ MARCA-TEXTO NO PARÁGRAFO ============
let selectedVerseForMarker = null;

function toggleMarkerPaletteParagraph() {
    const palette = document.getElementById('marker-palette-paragraph');
    if (palette) {
        palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Evento de seleção de versículo
document.addEventListener('click', function(e) {
    const verseInline = e.target.closest('.verse-inline');
    if (verseInline) {
        document.querySelectorAll('.verse-inline.selected-for-marker').forEach(el =>
            el.classList.remove('selected-for-marker')
        );
        verseInline.classList.add('selected-for-marker');
        selectedVerseForMarker = verseInline;
    }
});

function setMarkerParagraph(color) {
    if (!selectedVerseForMarker) {
        alert('Clique em um versículo primeiro para marcá-lo.');
        return;
    }

    const verseId = selectedVerseForMarker.id;
    const match = verseId.match(/verse-(\d+)/);
    if (!match) return;

    const verseIndex = parseInt(match[1]);
    const key = getVerseKey(appState.currentBook.name, appState.currentChapter + 1, verseIndex + 1);

    if (color === 'none') {
        delete appState.markers[key];
        selectedVerseForMarker.style.background = '';
    } else {
        appState.markers[key] = color;
        selectedVerseForMarker.style.background = `var(--marker-${color})`;
    }

    localStorage.setItem('bibleMarkers', JSON.stringify(appState.markers));
    document.getElementById('marker-palette-paragraph').style.display = 'none';
}

function toggleParagraphMarkers() {
    const paragraph = document.querySelector('.verses-paragraph');
    if (!paragraph) return;

    if (paragraph.classList.contains('show-paragraph-markers')) {
        paragraph.classList.remove('show-paragraph-markers');
        paragraph.classList.add('hide-paragraph-markers');
    } else {
        paragraph.classList.remove('hide-paragraph-markers');
        paragraph.classList.add('show-paragraph-markers');
    }
}

// ============ HIGHLIGHT DE BUSCA ============
function highlightSearchResultsParagraph() {
    if (!appState.currentSearchTerm || !appState.searchResults.length) return;
    clearSearchHighlights();

    document.querySelectorAll('.verse-text-inline').forEach(el => {
        const originalText = el.textContent;
        if (originalText.toLowerCase().includes(appState.currentSearchTerm.toLowerCase())) {
            el.innerHTML = originalText.replace(new RegExp(`(${escapeRegExp(appState.currentSearchTerm)})`, 'gi'), '<mark>$1</mark>');
            el.parentElement.classList.add('verse-highlight');
        }
    });

    if (appState.currentSearchIndex >= 0) {
        const cr = appState.searchResults[appState.currentSearchIndex];
        const el = document.getElementById(`verse-${cr.verse - 1}`);
        if (el) { el.classList.remove('verse-highlight'); el.classList.add('current-result'); }
    }

    const counter = document.getElementById('result-counter');
    if (counter) counter.textContent = `${appState.currentSearchIndex + 1} de ${appState.searchResults.length}`;
}

function clearSearchHighlights() {
    document.querySelectorAll('.verse-inline').forEach(el => {
        el.classList.remove('verse-highlight', 'current-result');
        const vt = el.querySelector('.verse-text-inline');
        if (vt) vt.innerHTML = vt.textContent;
    });
}
