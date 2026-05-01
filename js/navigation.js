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
        `<div class="chapter-navigation">${Array.from({length:bd.chapters.length},(_,i)=>`<div class="chapter-link" onclick="loadChapter(${i})">${i+1}</div>`).join('')}</div>`;
    appState.currentChapter = null;
}

function loadChapter(chapterIndex) {
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[chapterIndex]) { 
        alert('Capítulo não encontrado'); 
        return; 
    }
    appState.currentChapter = chapterIndex;
    document.getElementById('chapter-title').textContent = `${bd.name} ${chapterIndex+1}`;
    const vc = document.getElementById('verses-container'); 
    vc.innerHTML = '';
    
    bd.chapters[chapterIndex].forEach((verse, vi) => {
        const key = getVerseKey(bd.name, chapterIndex+1, vi+1);
        const mc = appState.markers[key] || '';
        const hn = appState.notes[key] ? true : false;
        const hc = appState.crossrefDB[key] && appState.crossrefDB[key].length > 0;
        
        const el = document.createElement('div');
        el.className = 'verse-container'; 
        el.id = `verse-${vi}`;
        if (hn) el.classList.add('verse-has-note');
        if (hc) el.classList.add('verse-has-crossref');
        if (mc) el.style.background = `var(--marker-${mc})`;
        
        el.innerHTML = `
            <div class="verse-number">${vi+1}</div>
            <div class="verse-text">${verse||'&nbsp;'}${hn?'<span class="note-indicator">📝</span>':''}${hc?'<span class="note-indicator" style="color:var(--crossref-color);">🔗</span>':''}</div>
            <div class="verse-actions" style="position:relative;">
                <button class="verse-action-btn" onclick="event.stopPropagation();toggleMarkerPalette(${vi})" title="Marca-texto">🖍️</button>
                <div id="marker-palette-${vi}" class="marker-palette">
                    <div class="marker-color" data-color="yellow" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'yellow')"></div>
                    <div class="marker-color" data-color="green" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'green')"></div>
                    <div class="marker-color" data-color="blue" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'blue')"></div>
                    <div class="marker-color" data-color="pink" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'pink')"></div>
                    <div class="marker-color" data-color="orange" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'orange')"></div>
                    <span class="marker-clear" onclick="event.stopPropagation();setMarker('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},'none')">✕</span>
                </div>
                <button class="verse-action-btn" onclick="event.stopPropagation();openNoteModal('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1})" title="Nota">📝</button>
                <button class="verse-action-btn" onclick="event.stopPropagation();openCrossrefModal('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1})" title="Referências">🔗</button>
                <button class="verse-action-btn" onclick="event.stopPropagation();toggleFavorite('${bd.name.replace(/'/g,"\\'")}',${chapterIndex+1},${vi+1},this)" title="Favorito">${isFavorite(bd.name,chapterIndex+1,vi+1)?'⭐':'☆'}</button>
                <button class="verse-action-btn" onclick="event.stopPropagation();playVerse(${vi})" title="Ouvir versículo">🔊</button>
            </div>`;
        vc.appendChild(el);
    });
    
    window.scrollTo({top:0,behavior:'smooth'});
    if (appState.searchResults.length > 0) highlightSearchResults();
    
    document.addEventListener('click', function cp(e) { 
        if(!e.target.closest('.marker-palette')&&!e.target.closest('.verse-action-btn')) 
            document.querySelectorAll('.marker-palette').forEach(p=>p.classList.remove('show')); 
    }, {once:true});
}

function loadChapterForSearch(ci) {
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[ci]) return;
    appState.currentChapter = ci;
    document.getElementById('chapter-title').textContent = `${bd.name} ${ci+1}`;
    const vc = document.getElementById('verses-container'); 
    vc.innerHTML = '';
    
    bd.chapters[ci].forEach((verse, vi) => {
        const key = getVerseKey(bd.name, ci+1, vi+1);
        const mc = appState.markers[key] || '';
        const hn = appState.notes[key] ? true : false;
        const el = document.createElement('div');
        el.className = 'verse-container'; 
        el.id = `verse-${vi}`;
        if (hn) el.classList.add('verse-has-note');
        if (mc) el.style.background = `var(--marker-${mc})`;
        el.innerHTML = `<div class="verse-number">${vi+1}</div><div class="verse-text">${verse||'&nbsp;'}${hn?'<span class="note-indicator">📝</span>':''}</div><div class="verse-actions"><button class="verse-action-btn" onclick="event.stopPropagation();openNoteModal('${bd.name.replace(/'/g,"\\'")}',${ci+1},${vi+1})">📝</button><button class="verse-action-btn" onclick="event.stopPropagation();toggleFavorite('${bd.name.replace(/'/g,"\\'")}',${ci+1},${vi+1},this)">${isFavorite(bd.name,ci+1,vi+1)?'⭐':'☆'}</button></div>`;
        vc.appendChild(el);
    });
    document.querySelector('.search-results-nav').style.display = 'flex';
}