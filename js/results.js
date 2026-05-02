// ============ PÁGINA DE RESULTADOS ============
let resultsState = {
    filteredResults: [],
    selectedBook: null,
    sortOrder: 'relevance' // 'relevance' ou 'canonical'
};

// Exibir página de resultados
function showSearchResultsPage() {
    if (appState.searchResults.length === 0) return;
    
    resultsState.filteredResults = [...appState.searchResults];
    resultsState.selectedBook = null;
    
    // Esconder outras views
    document.getElementById('book-list').style.display = 'none';
    document.getElementById('chapter-content').style.display = 'none';
    document.getElementById('compare-view-full').style.display = 'none';
    document.querySelector('.search-results-nav').style.display = 'none';
    
    // Mostrar página de resultados
    document.getElementById('search-results-page').style.display = 'flex';
    
    renderSearchResultsPage();
}

// Esconder página de resultados
function hideSearchResultsPage() {
    document.getElementById('search-results-page').style.display = 'none';
}

// Renderizar a página completa de resultados
function renderSearchResultsPage() {
    renderResultsSummary();
    renderOccurrencesSidebar();
    renderResultsList();
}

// Resumo da busca
function renderResultsSummary() {
    const summary = document.getElementById('search-results-summary');
    const total = resultsState.filteredResults.length;
    const totalBooks = getOccurrencesFromResults(resultsState.filteredResults).length;
    
    summary.innerHTML = `
        🔍 <strong>${total}</strong> resultado${total !== 1 ? 's' : ''} 
        em <strong>${totalBooks}</strong> livro${totalBooks !== 1 ? 's' : ''} 
        para "<strong>${appState.currentSearchTerm}</strong>"
        ${appState.searchFilter.book !== 'all' ? ` <span style="color:var(--text3);">| Livro: ${appState.searchFilter.book}</span>` : ''}
        ${appState.searchFilter.testament !== 'all' ? ` <span style="color:var(--text3);">| ${appState.searchFilter.testament === 'old' ? 'AT' : 'NT'}</span>` : ''}
    `;
}

// Sidebar de ocorrências por livro
function renderOccurrencesSidebar() {
    const list = document.getElementById('results-occurrences-list');
    const occurrences = getOccurrencesFromResults(resultsState.filteredResults);
    
    list.innerHTML = `
        <div class="occurrence-book-item ${resultsState.selectedBook === null ? 'active' : ''}" 
             onclick="filterResultsByBook(null)">
            <span class="occurrence-book-name">📚 Todos os livros</span>
            <span class="occurrence-book-badge">${resultsState.filteredResults.length}</span>
        </div>
        ${occurrences.map(item => `
            <div class="occurrence-book-item ${resultsState.selectedBook === item.book ? 'active' : ''}" 
                 onclick="filterResultsByBook('${item.book.replace(/'/g,"\\'")}')">
                <span class="occurrence-book-name">📖 ${item.book}</span>
                <span class="occurrence-book-badge">${item.count}</span>
            </div>
        `).join('')}
    `;
}

// Filtrar resultados por livro
function filterResultsByBook(bookName) {
    resultsState.selectedBook = bookName;
    
    if (bookName === null) {
        resultsState.filteredResults = [...appState.searchResults];
    } else {
        resultsState.filteredResults = appState.searchResults.filter(r => r.book === bookName);
    }
    
    renderOccurrencesSidebar();
    renderResultsList();
    renderResultsSummary();
    
    // Scroll para o topo dos resultados
    document.getElementById('search-results-main').scrollIntoView({ behavior: 'smooth' });
}

// Renderizar lista de resultados
function renderResultsList() {
    const list = document.getElementById('results-list');
    const results = resultsState.filteredResults;
    
    if (results.length === 0) {
        list.innerHTML = `
            <div class="no-results-full">
                <div class="icon">📭</div>
                <p>Nenhum resultado encontrado.</p>
            </div>`;
        return;
    }
    
    // Ordenar resultados
    let sortedResults = [...results];
    if (resultsState.sortOrder === 'canonical') {
        sortedResults.sort((a, b) => {
            const allBooks = [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new];
            const indexA = allBooks.indexOf(a.book);
            const indexB = allBooks.indexOf(b.book);
            if (indexA !== indexB) return indexA - indexB;
            if (a.chapter !== b.chapter) return a.chapter - b.chapter;
            return a.verse - b.verse;
        });
    }
    
    // Barra de info e ordenação
    const infoBar = document.createElement('div');
    infoBar.className = 'results-info-bar';
    infoBar.innerHTML = `
        <span>Mostrando ${sortedResults.length} de ${appState.searchResults.length} resultados</span>
        <button class="results-sort-btn" onclick="toggleSortOrder()">
            📋 ${resultsState.sortOrder === 'relevance' ? 'Ordenar por livro' : 'Ordenar por relevância'}
        </button>
    `;
    
    list.innerHTML = '';
    list.appendChild(infoBar);
    
    // Cards de resultados
    sortedResults.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <span class="result-reference">📍 ${result.book} ${result.chapter}:${result.verse}</span>
                <span class="result-book-badge">${result.testament === 'old' ? 'AT' : 'NT'}</span>
            </div>
            <div class="result-text">${highlightTerm(result.text, appState.currentSearchTerm)}</div>
            <div class="result-actions">
                <button class="result-action-btn" onclick="event.stopPropagation(); navigateToResultFromPage(${index})" title="Ir para o versículo">📖 Abrir</button>
                <button class="result-action-btn" onclick="event.stopPropagation(); openNoteModal('${result.book.replace(/'/g,"\\'")}', ${result.chapter}, ${result.verse})" title="Adicionar nota">📝 Nota</button>
                <button class="result-action-btn" onclick="event.stopPropagation(); toggleFavoriteFromResults('${result.book.replace(/'/g,"\\'")}', ${result.chapter}, ${result.verse}, this)" title="Favorito">${isFavorite(result.book, result.chapter, result.verse) ? '⭐' : '☆'}</button>
            </div>
        `;
        
        // Clique no card inteiro para navegar
        card.addEventListener('click', () => navigateToResultFromPage(index));
        
        list.appendChild(card);
    });
}

// Destacar termo no texto
function highlightTerm(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Alternar ordenação
function toggleSortOrder() {
    resultsState.sortOrder = resultsState.sortOrder === 'relevance' ? 'canonical' : 'relevance';
    renderResultsList();
}

// Navegar para resultado a partir da página
function navigateToResultFromPage(index) {
    const result = resultsState.filteredResults[index];
    if (!result) return;
    
    // Atualizar estado
    appState.currentSearchIndex = appState.searchResults.indexOf(result);
    
    // Mudar testamento se necessário
    if (appState.currentTestament !== result.testament) {
        appState.currentTestament = result.testament;
        document.querySelectorAll('.nav-item').forEach(b => 
            b.classList.toggle('active', b.dataset.tab === result.testament)
        );
    }
    
    appState.currentBook = { name: result.book, testament: result.testament };
    
    // Esconder página de resultados
    hideSearchResultsPage();
    
    // Mostrar conteúdo do capítulo
    document.getElementById('chapter-content').style.display = 'block';
    loadChapterForSearch(result.chapter - 1);
    
    // Scroll e destaque
    setTimeout(() => {
        highlightSearchResults();
        const el = document.getElementById(`verse-${result.verse - 1}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// Favorito a partir dos resultados
function toggleFavoriteFromResults(book, chapter, verse, button) {
    const idx = appState.favorites.findIndex(f => f.book === book && f.chapter === chapter && f.verse === verse);
    if (idx > -1) {
        appState.favorites.splice(idx, 1);
        button.textContent = '☆';
    } else {
        appState.favorites.push({ book, chapter, verse });
        button.textContent = '⭐';
    }
    saveFavorites();
}

// Obter ocorrências dos resultados filtrados
function getOccurrencesFromResults(results) {
    const occ = {};
    results.forEach(r => {
        if (!occ[r.book]) occ[r.book] = { count: 0, testament: r.testament };
        occ[r.book].count++;
    });
    return Object.entries(occ)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([book, data]) => ({ book, ...data }));
}

// Substituir a função showOccurrences antiga
function showOccurrences() {
    showSearchResultsPage();
}