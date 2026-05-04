// ============ NAVEGAÇÃO PRINCIPAL ============
function goHome() {
    appState.currentBook = null;
    appState.currentChapter = null;
    appState.searchResults = [];

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
        appState.currentChapter = null;
        document.getElementById('chapter-content').style.display = 'none';
        document.getElementById('book-list').style.display = 'block';
        renderBookList();
    } else if (appState.currentBook) {
        appState.currentBook = null;
        document.getElementById('book-list').style.display = 'block';
        document.getElementById('chapter-content').style.display = 'none';
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

    document.getElementById('chapter-title').textContent = `${bd.name} - ${bd.chapters.length} capítulos`;
    document.getElementById('verses-container').innerHTML =
        `<div class="chapter-navigation">${Array.from({ length: bd.chapters.length }, (_, i) => `<div class="chapter-link" onclick="loadChapter(${i})">${i + 1}</div>`).join('')}</div>`;
    appState.currentChapter = null;

    // Esconder botões de navegação quando estiver na lista de capítulos
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
}

function loadChapter(chapterIndex) {
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[chapterIndex]) { alert('Capítulo não encontrado'); return; }

    const chaptersArray = Array.isArray(bd.chapters) ? bd.chapters : Object.values(bd.chapters);
    if (!chaptersArray[chapterIndex]) { alert('Capítulo não encontrado'); return; }

    const chapterVerses = chaptersArray[chapterIndex];
    appState.currentChapter = chapterIndex;
    document.getElementById('chapter-title').textContent = `${bd.name} ${chapterIndex + 1}`;

    const vc = document.getElementById('verses-container');
    vc.innerHTML = '';

    // Container do parágrafo
    const paragraphDiv = document.createElement('div');
    paragraphDiv.className = 'verses-paragraph';

    // ===== INDICADOR DE INÍCIO DE CAPÍTULO =====
    const chapterStart = document.createElement('div');
    chapterStart.className = 'chapter-start-indicator';
    chapterStart.innerHTML = `
        <span class="chapter-start-label">Capítulo ${chapterIndex + 1}</span>
    `;
    paragraphDiv.appendChild(chapterStart);

    // ===== PRIMEIRO VERSÍCULO COM LETRA CAPITULAR =====
    if (chapterVerses.length > 0) {
        const firstVerse = chapterVerses[0];
        const firstKey = getVerseKey(bd.name, chapterIndex + 1, 1);
        const firstMc = appState.markers[firstKey] || '';
        const firstHn = appState.notes[firstKey] ? true : false;
        const firstHc = appState.crossrefDB[firstKey] && appState.crossrefDB[firstKey].length > 0;

        const firstVerseSpan = document.createElement('span');
        firstVerseSpan.className = 'verse-inline first-verse';
        firstVerseSpan.id = 'verse-0';
        if (firstHn) firstVerseSpan.classList.add('verse-has-note-inline');
        if (firstHc) firstVerseSpan.classList.add('verse-has-crossref-inline');
        if (firstMc) firstVerseSpan.style.background = `var(--marker-${firstMc})`;

        // Separar primeira letra do resto
        const firstLetter = firstVerse.charAt(0);
        const restOfVerse = firstVerse.slice(1);

        firstVerseSpan.innerHTML = `
            <sup class="verse-number-inline" data-verse="1" onclick="event.stopPropagation(); playVerseAudio(0)">1</sup>
            <span class="drop-cap">${firstLetter}</span><span class="verse-text-inline">${restOfVerse || '&nbsp;'}</span>
            <span class="verse-actions-inline">
                <button class="verse-action-btn-inline" onclick="event.stopPropagation(); playVerseAudio(0)" title="Ouvir">🔊</button>
                <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openNoteModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},1)" title="Nota">📝</button>
                <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openCrossrefModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},1)" title="Referências">🔗</button>
                <button class="verse-action-btn-inline" onclick="event.stopPropagation(); toggleFavorite('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},1,this)" title="Favorito">${isFavorite(bd.name, chapterIndex + 1, 1) ? '⭐' : '☆'}</button>
            </span>
        `;
        paragraphDiv.appendChild(firstVerseSpan);

        // ============ DETECTOR DE PARÁGRAFOS ============
        function isParagraphStart(verseText, previousVerseText) {
            if (!verseText) return false;

            const text = verseText.trim();

            // Palavras/frases que indicam início de parágrafo
            const paragraphStarters = [
                /^E\s+(disse|falou|chamou|havia|aconteceu|sucedeu)/i,
                /^Então\s/i,
                /^Depois\s+(destas|disso| disto)/i,
                /^Ora,\s/i,
                /^Assim\s+(diz|começou|terminou)/i,
                /^No\s+(princípio|dia|tempo|ano)/i,
                /^Eis\s+que\s/i,
                /^Disse\s+(Deus|Jesus|o Senhor|o SENHOR)/i,
                /^Respondeu\s/i,
                /^Perguntou\s/i,
                /^Exclamou\s/i,
                /^Ordenou\s/i,
                /^E\s+foi\s+(a tarde|a manhã)/i,
                /^Estas\s+(são|foram)/i,
                /^São\s+estas/i,
                /^E\s+(os|as)\s+(filhos|nomes|gerações)/i,
                /^Haja\s/i,
                /^Produza\s/i,
                /^Ajuntem-se\s/i,
                /^Apareça\s/i,
                /^Façamos\s/i,
                /^Não\s+(é|são|seja)/i
            ];

            for (const pattern of paragraphStarters) {
                if (pattern.test(text)) {
                    return true;
                }
            }

            // Se o versículo anterior terminou com ponto final e este começa com letra maiúscula após um assunto diferente
            if (previousVerseText && previousVerseText.trim().endsWith('.') &&
                text.charAt(0) === text.charAt(0).toUpperCase() &&
                text.charAt(0).match(/[A-ZÀ-Ú]/)) {
                // Verificar se é uma continuação natural ou novo parágrafo
                if (!text.match(/^(e|ou|mas|porém|todavia|contudo|porque|pois|também|assim|desta|deste|para|com|em|no|na|os|as|o|a|um|uma)\s/i)) {
                    return true;
                }
            }

            return false;
        }
    }

    // ===== DEMAIS VERSÍCULOS =====
    // Dentro do loadChapter, substitua o forEach dos demais versículos:

    // ===== DEMAIS VERSÍCULOS =====
    chapterVerses.slice(1).forEach((verse, vi) => {
        const actualIndex = vi + 1;
        const key = getVerseKey(bd.name, chapterIndex + 1, actualIndex + 1);
        const mc = appState.markers[key] || '';
        const hn = appState.notes[key] ? true : false;
        const hc = appState.crossrefDB[key] && appState.crossrefDB[key].length > 0;

        // Verificar se é início de parágrafo
        const previousVerse = chapterVerses[actualIndex - 1] || '';
        const isNewParagraph = isParagraphStart(verse, previousVerse);

        const verseSpan = document.createElement('span');
        verseSpan.className = 'verse-inline';
        if (isNewParagraph) verseSpan.classList.add('paragraph-start');
        verseSpan.id = `verse-${actualIndex}`;
        if (hn) verseSpan.classList.add('verse-has-note-inline');
        if (hc) verseSpan.classList.add('verse-has-crossref-inline');
        if (mc) verseSpan.style.background = `var(--marker-${mc})`;

        verseSpan.innerHTML = `
        ${isNewParagraph ? '<span class="paragraph-marker" title="Início de parágrafo">¶</span>' : ''}
        <sup class="verse-number-inline" data-verse="${actualIndex + 1}" onclick="event.stopPropagation(); playVerseAudio(${actualIndex})">${actualIndex + 1}</sup>
        <span class="verse-text-inline">${verse || '&nbsp;'}</span>
        <span class="verse-actions-inline">
            <button class="verse-action-btn-inline" onclick="event.stopPropagation(); playVerseAudio(${actualIndex})" title="Ouvir">🔊</button>
            <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openNoteModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${actualIndex + 1})" title="Nota">📝</button>
            <button class="verse-action-btn-inline" onclick="event.stopPropagation(); openCrossrefModal('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${actualIndex + 1})" title="Referências">🔗</button>
            <button class="verse-action-btn-inline" onclick="event.stopPropagation(); toggleFavorite('${bd.name.replace(/'/g, "\\'")}',${chapterIndex + 1},${actualIndex + 1},this)" title="Favorito">${isFavorite(bd.name, chapterIndex + 1, actualIndex + 1) ? '⭐' : '☆'}</button>
        </span>
    `;
        paragraphDiv.appendChild(verseSpan);
    });

    // ===== INDICADOR DE FIM DE CAPÍTULO =====
    const chapterEnd = document.createElement('div');
    chapterEnd.className = 'chapter-end-indicator';
    chapterEnd.innerHTML = `
        <span class="chapter-end-symbol">❖</span>
        <span class="chapter-end-label">Fim do Capítulo ${chapterIndex + 1}</span>
    `;
    paragraphDiv.appendChild(chapterEnd);

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
    vc.appendChild(paragraphDiv);
    // Atualizar botões de navegação
    updateChapterNavButtons();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (appState.searchResults.length > 0) highlightSearchResultsParagraph();
    if (appState.compareMode) { document.getElementById('compare-view').classList.add('active'); renderCompareView(); }

    // Mostrar botões de navegação
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    // Aplicar zoom salvo
    if (typeof currentZoom !== 'undefined') {
        const paragraph = document.querySelector('.verses-paragraph');
        if (paragraph) {
            paragraph.style.fontSize = `${currentZoom}%`;
        }
    }
}

// Highlight para parágrafo
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

// Marca-texto no parágrafo
function toggleMarkerPaletteParagraph() {
    const palette = document.getElementById('marker-palette-paragraph');
    if (palette) palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
}

let selectedVerseForMarker = null;

// Adicionar evento de seleção de versículo para marca-texto
document.addEventListener('click', function (e) {
    const verseInline = e.target.closest('.verse-inline');
    if (verseInline) {
        // Desselecionar anterior
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

function toggleParagraphMode() {
    // Alternar entre parágrafo e versículos separados
    const paragraphDiv = document.querySelector('.verses-paragraph');
    if (!paragraphDiv) return;

    if (paragraphDiv.classList.contains('compact')) {
        paragraphDiv.classList.remove('compact');
    } else {
        paragraphDiv.classList.add('compact');
    }
}

function loadChapterForSearch(ci) {
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[ci]) return;
    appState.currentChapter = ci;
    document.getElementById('chapter-title').textContent = `${bd.name} ${ci + 1}`;
    const vc = document.getElementById('verses-container');
    vc.innerHTML = '';

    bd.chapters[ci].forEach((verse, vi) => {
        const key = getVerseKey(bd.name, ci + 1, vi + 1);
        const mc = appState.markers[key] || '';
        const hn = appState.notes[key] ? true : false;
        const el = document.createElement('div');
        el.className = 'verse-container';
        el.id = `verse-${vi}`;
        if (hn) el.classList.add('verse-has-note');
        if (mc) el.style.background = `var(--marker-${mc})`;
        el.innerHTML = `<div class="verse-number">${vi + 1}</div><div class="verse-text">${verse || '&nbsp;'}${hn ? '<span class="note-indicator">📝</span>' : ''}</div><div class="verse-actions"><button class="verse-action-btn" onclick="event.stopPropagation();openNoteModal('${bd.name.replace(/'/g, "\\'")}',${ci + 1},${vi + 1})">📝</button><button class="verse-action-btn" onclick="event.stopPropagation();toggleFavorite('${bd.name.replace(/'/g, "\\'")}',${ci + 1},${vi + 1},this)">${isFavorite(bd.name, ci + 1, vi + 1) ? '⭐' : '☆'}</button></div>`;
        vc.appendChild(el);
    });
    document.querySelector('.search-results-nav').style.display = 'flex';
}

// Navegar entre capítulos (anterior/próximo)
function navigateChapter(direction) {
    if (!appState.currentBook || appState.currentChapter === null) return;

    const bookData = findBook(appState.currentBook.name);
    if (!bookData) return;

    const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
    const newChapter = appState.currentChapter + direction;

    // Verificar se o capítulo existe
    if (newChapter >= 0 && newChapter < chaptersArray.length) {
        loadChapter(newChapter);
        updateChapterNavButtons();
    }
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
    }

    if (nextBtn) {
        nextBtn.disabled = appState.currentChapter >= chaptersArray.length - 1;
    }
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