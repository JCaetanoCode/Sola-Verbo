// ============ CONFIGURAÇÃO DOS LIVROS POR CATEGORIA ============
const BIBLE_STRUCTURE = {
    old: {
        "Pentateuco": ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio"],
        "Históricos": ["Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester"],
        "Poéticos e Sabedoria": ["Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares"],
        "Profetas Maiores": ["Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel"],
        "Profetas Menores": ["Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"]
    },
    new: {
        "Evangelhos": ["Mateus", "Marcos", "Lucas", "João"],
        "Histórico": ["Atos"],
        "Epístolas de Paulo": ["Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom"],
        "Epístolas Gerais": ["Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas"],
        "Profecia": ["Apocalipse"]
    }
};

const BIBLE_BOOKS = {
    old: Object.values(BIBLE_STRUCTURE.old).flat(),
    new: Object.values(BIBLE_STRUCTURE.new).flat()
};

const TSK_BOOK_MAP = {
    'GEN': 'Gênesis', 'EXO': 'Êxodo', 'LEV': 'Levítico', 'NUM': 'Números', 'DEU': 'Deuteronômio',
    'JOS': 'Josué', 'JDG': 'Juízes', 'RUT': 'Rute', '1SA': '1 Samuel', '2SA': '2 Samuel',
    '1KI': '1 Reis', '2KI': '2 Reis', '1CH': '1 Crônicas', '2CH': '2 Crônicas',
    'EZR': 'Esdras', 'NEH': 'Neemias', 'EST': 'Ester', 'JOB': 'Jó',
    'PSA': 'Salmos', 'PRO': 'Provérbios', 'ECC': 'Eclesiastes', 'SNG': 'Cantares',
    'ISA': 'Isaías', 'JER': 'Jeremias', 'LAM': 'Lamentações', 'EZK': 'Ezequiel',
    'DAN': 'Daniel', 'HOS': 'Oseias', 'JOL': 'Joel', 'AMO': 'Amós',
    'OBA': 'Obadias', 'JON': 'Jonas', 'MIC': 'Miqueias', 'NAH': 'Naum',
    'HAB': 'Habacuque', 'ZEP': 'Sofonias', 'HAG': 'Ageu', 'ZEC': 'Zacarias', 'MAL': 'Malaquias',
    'MAT': 'Mateus', 'MAR': 'Marcos', 'LUK': 'Lucas', 'JOH': 'João', 'ACT': 'Atos',
    'ROM': 'Romanos', '1CO': '1 Coríntios', '2CO': '2 Coríntios', 'GAL': 'Gálatas',
    'EPH': 'Efésios', 'PHP': 'Filipenses', 'COL': 'Colossenses',
    '1TH': '1 Tessalonicenses', '2TH': '2 Tessalonicenses',
    '1TI': '1 Timóteo', '2TI': '2 Timóteo', 'TIT': 'Tito', 'PHM': 'Filemom',
    'HEB': 'Hebreus', 'JAS': 'Tiago', '1PE': '1 Pedro', '2PE': '2 Pedro',
    '1JO': '1 João', '2JO': '2 João', '3JO': '3 João', 'JUD': 'Judas', 'REV': 'Apocalipse'
};

// ============ ESTADO GLOBAL ============
const appState = {
    currentVersion: 'ACF', compareVersion: 'ARA', currentTestament: 'old',
    currentBook: null, currentChapter: null, bibleData: null, compareData: null,
    searchResults: [], currentSearchIndex: -1, compareMode: false,
    favorites: JSON.parse(localStorage.getItem('bibleFavorites') || '[]'),
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    notes: JSON.parse(localStorage.getItem('bibleNotes') || '{}'),
    markers: JSON.parse(localStorage.getItem('bibleMarkers') || '{}'),
    crossrefDB: {},
    crossrefLoaded: false,
    currentSearchTerm: '',
    searchFilter: { testament: 'all', book: 'all', chapter: 'all', verse: 'all' }
};

// ============ FUNÇÕES UTILITÁRIAS ============
function findBook(bookName, data = appState.bibleData) {
    if (!data || !data.books) return null;
    const n = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
    const ns = n(bookName);
    let book = data.books.find(b => n(b.name) === ns || (b.abbrev && n(b.abbrev) === ns));
    if (book) return book;
    book = data.books.find(b => n(b.name).includes(ns) || ns.includes(n(b.name)) || (b.abbrev && n(b.abbrev).includes(ns)));
    if (book) return book;
    if (ns.includes('cant') || ns.includes('cantic')) {
        book = data.books.find(b => n(b.name).includes('cant') || n(b.name).includes('cantic'));
        if (book) return book;
    }
    return null;
}

function getTestament(bookName) { return BIBLE_BOOKS.old.includes(bookName) ? 'old' : 'new'; }
function getVerseKey(book, chapter, verse) { return `${book}-${chapter}-${verse}`; }
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }