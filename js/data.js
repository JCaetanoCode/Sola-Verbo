// ============ CARREGAMENTO DE DADOS ============
function convertBibleFormat(jsonData, version) {
    if (jsonData.version && jsonData.books && Array.isArray(jsonData.books)) return jsonData;
    if (Array.isArray(jsonData)) {
        const vn = { ACF: 'Almeida Corrigida Fiel', ARA: 'Almeida Revista e Atualizada', ARC: 'Almeida Revista e Corrigida', AS21: 'Almeida Século 21', JFAA: 'João Ferreira de Almeida Atualizada', KJA: 'King James Atualizada', KJF: 'King James Fiel', NAA: 'Nova Almeida Atualizada', NBV: 'Nova Bíblia Viva', NTLH: 'Nova Tradução na Linguagem de Hoje', NVI: 'Nova Versão Internacional', NVT: 'Nova Versão Transformadora', TB: 'Tradução Brasileira' };
        return { version: version, name: vn[version] || `Versão ${version}`, books: jsonData.map(b => ({ name: b.name || b.abbrev || 'Desconhecido', abbrev: b.abbrev || b.name, chapters: b.chapters || [] })) };
    }
    return jsonData;
}

async function loadBibleData(version) {
    document.getElementById('book-list').innerHTML = '<div class="loading">Carregando versão</div>';
    const response = await fetch(`data/${version}.json`);
    if (!response.ok) throw new Error(`Erro ao carregar versão ${version}`);
    let jsonData = await response.json();
    jsonData = convertBibleFormat(jsonData, version);
    appState.bibleData = jsonData;
    appState.currentVersion = version;
}

async function loadCompareVersion() {
    try {
        const response = await fetch(`data/${appState.compareVersion}.json`);
        if (response.ok) {
            let jsonData = await response.json();
            appState.compareData = convertBibleFormat(jsonData, appState.compareVersion);
        }
    } catch (e) { }
}

// ============ REFERÊNCIAS CRUZADAS ============
function tskToKey(tskRef) {
    const parts = tskRef.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const bookCode = parts[0].toUpperCase();
    const chapter = parseInt(parts[1]);
    const verse = parseInt(parts[2]);
    const bookName = TSK_BOOK_MAP[bookCode];
    if (!bookName) return null;
    return `${bookName}-${chapter}-${verse}`;
}

function loadCrossrefFromStorage() {
    const stored = localStorage.getItem('crossrefDB');
    if (stored) {
        try {
            appState.crossrefDB = JSON.parse(stored);
            appState.crossrefLoaded = true;
            console.log('✓ Ref cruzadas carregadas do cache');
            return true;
        } catch (e) { }
    }
    return false;
}

async function loadCrossrefData() {
    if (appState.crossrefLoaded) return;
    console.log('📚 Carregando referências cruzadas...');
    let totalRefs = 0;

    for (let i = 1; i <= 32; i++) {
        try {
            const response = await fetch(`data/crossrefs/${i}.json`);
            if (!response.ok) continue;
            const data = await response.json();

            for (const entry of Object.values(data)) {
                if (entry.v && entry.r) {
                    const sourceKey = tskToKey(entry.v);
                    if (!sourceKey) continue;
                    const refs = [];
                    for (const refStr of Object.values(entry.r)) {
                        const refKey = tskToKey(refStr);
                        if (refKey) refs.push(refKey);
                    }
                    if (refs.length > 0) {
                        appState.crossrefDB[sourceKey] = refs;
                        totalRefs++;
                    }
                }
            }
        } catch (e) { }
    }

    appState.crossrefLoaded = true;
    console.log(`✓ ${totalRefs} versículos com referências`);
    if (totalRefs > 0) {
        localStorage.setItem('crossrefDB', JSON.stringify(appState.crossrefDB));
    }
}

// ============ METADADOS ============
function getBookMetadata(bookName) {
    if (!appState.bibleData || !appState.bibleData.books) return null;
    const book = findBook(bookName);
    if (!book) return null;
    return {
        name: book.name || bookName,
        chapters: book.chapters ? book.chapters.length : 0,
        testament: getTestament(bookName)
    };
}