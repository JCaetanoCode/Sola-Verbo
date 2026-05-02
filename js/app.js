// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadBibleData(appState.currentVersion);
        await loadCompareVersion();

        if (!loadCrossrefFromStorage()) {
            loadCrossrefData();
        }

        setupEventListeners();
        renderBookList();
        loadSearchHistory();
        updateBookFilter();
    } catch (e) {
        console.error('Erro na inicialização:', e);
        document.getElementById('book-list').innerHTML = '<div style="color:red;padding:20px;">Erro ao carregar. Verifique o console (F12).</div>';
    }
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    // Seletor de versão
    document.getElementById('version-selector').addEventListener('change', async e => {
        await loadBibleData(e.target.value);
        updateBookFilter();
        // Voltar para a aba AT
        document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
        document.querySelector('.nav-item[data-tab="old"]').classList.add('active');
        appState.currentTestament = 'old';
        goHome();

        // Adicionar listener para voltar da página de resultados
document.getElementById('back-from-results').addEventListener('click', () => {
    hideSearchResultsPage();
    document.getElementById('chapter-content').style.display = 'block';
});
    });

    // Navegação por abas
    document.querySelectorAll('.nav-item').forEach(b => {
        b.addEventListener('click', e => {
            const tab = e.target.dataset.tab;

            // Ativar aba clicada
            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            e.target.classList.add('active');

            // Esconder todas as views
            document.getElementById('book-list').style.display = 'none';
            document.getElementById('chapter-content').style.display = 'none';
            document.getElementById('compare-view-full').style.display = 'none';
            document.querySelector('.search-results-nav').style.display = 'none';

            // Resetar estado
            appState.currentBook = null;
            appState.currentChapter = null;
            appState.searchResults = [];

            if (tab === 'compare') {
                document.getElementById('compare-view-full').style.display = 'block';
                initCompareTab();
            } else if (tab === 'old' || tab === 'new') {
                appState.currentTestament = tab;
                document.getElementById('book-list').style.display = 'block';
                renderBookList();
            }
        });
    });

    // Botão voltar
    document.getElementById('back-button').addEventListener('click', goBack);

    // Botões de ação
    document.getElementById('home-button').addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
        document.querySelector('.nav-item[data-tab="old"]').classList.add('active');
        appState.currentTestament = 'old';
        goHome();
    });
    document.getElementById('favorites-button').addEventListener('click', showFavorites);
    document.getElementById('dictionary-button').addEventListener('click', showDictionary);
    document.getElementById('scroll-top-button').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Fechar modais
    document.getElementById('close-favorites').addEventListener('click', () => document.getElementById('favorites-modal').style.display = 'none');
    document.getElementById('close-occurrences').addEventListener('click', () => document.getElementById('occurrences-modal').style.display = 'none');
    document.getElementById('close-dictionary').addEventListener('click', () => document.getElementById('dictionary-modal').style.display = 'none');

    // Filtros
    document.getElementById('filter-testament').addEventListener('change', () => updateBookFilter());
    document.getElementById('filter-book').addEventListener('change', () => {
        updateChapterFilter();
        appState.searchFilter.book = document.getElementById('filter-book').value;
        checkAutoNavigate();
    });
    document.getElementById('filter-chapter').addEventListener('change', () => {
        updateVerseFilter();
        appState.searchFilter.chapter = document.getElementById('filter-chapter').value;
        checkAutoNavigate();
    });
    document.getElementById('filter-verse').addEventListener('change', () => {
        appState.searchFilter.verse = document.getElementById('filter-verse').value;
        checkAutoNavigate();
    });

    // Busca
    const si = document.getElementById('search-input');
    document.getElementById('search-button').addEventListener('click', performSearch);
    si.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
    si.addEventListener('focus', () => { if (appState.searchHistory.length) { renderSearchHistory(); document.getElementById('search-history').classList.add('active'); } });
    document.addEventListener('click', e => { if (!document.querySelector('.search-container').contains(e.target)) document.getElementById('search-history').classList.remove('active'); });

    // Navegação de resultados
    document.getElementById('prev-result').addEventListener('click', navigateToPrevResult);
    document.getElementById('next-result').addEventListener('click', navigateToNextResult);
    document.getElementById('show-occurrences').addEventListener('click', showOccurrences);
    document.getElementById('clear-search').addEventListener('click', clearSearch);

    // Comparação (aba dedicada)
    document.getElementById('compare-book').addEventListener('change', () => {
        updateCompareChapters();
        loadCompareView();
    });
    document.getElementById('compare-chapter').addEventListener('change', () => loadCompareView());
    document.getElementById('compare-version-1').addEventListener('change', () => loadCompareView());
    document.getElementById('compare-version-2').addEventListener('change', () => loadCompareView());

    // Fechar modais clicando fora
    ['favorites-modal', 'occurrences-modal', 'note-modal', 'crossref-modal', 'dictionary-modal'].forEach(id => {
        document.getElementById(id).addEventListener('click', e => { if (e.target === e.currentTarget) document.getElementById(id).style.display = 'none'; });
    });

    // Salvar nota
    document.getElementById('save-note-btn').addEventListener('click', saveCurrentNote);

    // Busca no dicionário
    document.getElementById('dictionary-search').addEventListener('input', searchDictionary);


    // Áudio
    document.getElementById('play-chapter').addEventListener('click', playChapter);
    document.getElementById('pause-chapter').addEventListener('click', pauseChapter);
    document.getElementById('stop-chapter').addEventListener('click', stopChapter);
    document.getElementById('audio-speed').addEventListener('change', () => {
        if (speechSynth.speaking) {
            const speed = parseFloat(document.getElementById('audio-speed').value);
            speechSynth.cancel();
            // Reiniciar com nova velocidade
            playChapter();
        }
    });

    // Carregar vozes
    window.speechSynthesis.onvoiceschanged = () => {
        initAudio();
    };
    initAudio();

    // No setupEventListeners, adicione:
    document.getElementById('play-chapter').addEventListener('click', playChapterAudio);
    document.getElementById('pause-chapter').addEventListener('click', pauseChapterAudio);
    document.getElementById('stop-chapter').addEventListener('click', stopChapterAudio);

    // Parar áudio ao navegar
    document.getElementById('back-button').addEventListener('click', () => {
        stopChapterAudio();
        goBack();
    });

    document.getElementById('home-button').addEventListener('click', () => {
        stopChapterAudio();
        goHome();
    });

}