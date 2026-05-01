// ============ NOTAS ============
let currentNoteVerse = null;
function openNoteModal(book, chapter, verse) {
    currentNoteVerse = { book, chapter, verse };
    document.getElementById('note-verse-ref').textContent = `${book} ${chapter}:${verse}`;
    document.getElementById('note-textarea').value = appState.notes[getVerseKey(book, chapter, verse)] || '';
    document.getElementById('note-modal').style.display = 'flex';
}
function saveCurrentNote() {
    if (!currentNoteVerse) return;
    const key = getVerseKey(currentNoteVerse.book, currentNoteVerse.chapter, currentNoteVerse.verse);
    const text = document.getElementById('note-textarea').value.trim();
    if (text) appState.notes[key] = text; else delete appState.notes[key];
    localStorage.setItem('bibleNotes', JSON.stringify(appState.notes));
    document.getElementById('note-modal').style.display = 'none';
    loadChapter(appState.currentChapter);
}

// ============ REFERÊNCIAS CRUZADAS ============
function openCrossrefModal(book, chapter, verse) {
    const key = getVerseKey(book, chapter, verse);
    const refs = appState.crossrefDB[key] || [];
    const list = document.getElementById('crossref-list');

    if (!appState.crossrefLoaded) {
        list.innerHTML = '<div class="no-crossrefs">🔄 Carregando referências...</div>';
        loadCrossrefData().then(() => openCrossrefModal(book, chapter, verse));
        document.getElementById('crossref-modal').style.display = 'flex';
        return;
    }

    if (refs.length === 0) {
        list.innerHTML = '<div class="no-crossrefs">📭 Nenhuma referência encontrada.</div>';
    } else {
        list.innerHTML = refs.slice(0, 50).map(ref => {
            const [b, c, v] = ref.split('-');
            return `<div class="crossref-item" onclick="navigateToCrossRef('${b.replace(/'/g, "\\'")}',${c},${v})"><span class="crossref-arrow">↗</span><span class="crossref-text">📖 ${b} ${c}:${v}</span></div>`;
        }).join('');
    }
    document.getElementById('crossref-modal').style.display = 'flex';
}

function navigateToCrossRef(book, chapter, verse) {
    document.getElementById('crossref-modal').style.display = 'none';
    appState.currentTestament = getTestament(book);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.testament === appState.currentTestament));
    appState.currentBook = { name: book, testament: appState.currentTestament };
    loadChapter(chapter - 1);
    setTimeout(() => {
        const el = document.getElementById(`verse-${verse - 1}`);
        if (el) { el.style.background = 'var(--highlight)'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.style.background = '', 2500); }
    }, 300);
}

// ============ MARCA-TEXTO ============
function setMarker(book, chapter, verse, color) {
    const key = getVerseKey(book, chapter, verse);
    if (color === 'none') delete appState.markers[key];
    else appState.markers[key] = color;
    localStorage.setItem('bibleMarkers', JSON.stringify(appState.markers));
    loadChapter(appState.currentChapter);
    document.querySelectorAll('.marker-palette').forEach(p => p.classList.remove('show'));
}

function toggleMarkerPalette(vi) {
    const p = document.getElementById(`marker-palette-${vi}`);
    if (!p) return;
    document.querySelectorAll('.marker-palette').forEach(x => { if (x !== p) x.classList.remove('show'); });
    p.classList.toggle('show');
}

// ============ COMPARAÇÃO DE VERSÕES ============
async function toggleCompareView() {
    appState.compareMode = !appState.compareMode;
    const btn = document.getElementById('toggle-compare');
    const cv = document.getElementById('compare-view');
    if (appState.compareMode) {
        btn.classList.add('active'); btn.textContent = '📋 Ocultar';
        if (!appState.compareData) await loadCompareVersion();
        cv.classList.add('active'); renderCompareView();
    } else {
        btn.classList.remove('active'); btn.textContent = '📋 Comparar';
        cv.classList.remove('active');
    }
}

async function changeCompareVersion(v) { appState.compareVersion = v; await loadCompareVersion(); renderCompareView(); }

function renderCompareView() {
    if (!appState.currentBook || appState.currentChapter === null) return;
    const view = document.getElementById('compare-view');
    const bookName = appState.currentBook.name;
    const ci = appState.currentChapter;
    const b1 = findBook(bookName, appState.bibleData);
    const b2 = findBook(bookName, appState.compareData);
    if (!b1) { view.innerHTML = '<div class="no-favorites">Livro não encontrado.</div>'; return; }
    const v1 = b1.chapters[ci] || [];
    const v2 = b2 ? (b2.chapters[ci] || []) : [];
    const max = Math.max(v1.length, v2.length);
    const vers = ['ACF', 'ARA', 'ARC', 'AS21', 'JFAA', 'KJA', 'KJF', 'NAA', 'NBV', 'NTLH', 'NVI', 'NVT', 'TB'];
    view.innerHTML = `<div class="compare-pane"><h3>📖 ${appState.currentVersion}</h3>${Array.from({ length: max }, (_, i) => `<div class="compare-verse ${v2[i] && v1[i] !== v2[i] ? 'diff' : ''}"><span class="cv-num">${i + 1}.</span> ${v1[i] || '—'}</div>`).join('')}</div><div class="compare-pane"><h3>📖 <select onchange="changeCompareVersion(this.value)">${vers.map(v => `<option value="${v}" ${appState.compareVersion === v ? 'selected' : ''}>${v}</option>`).join('')}</select></h3>${Array.from({ length: max }, (_, i) => `<div class="compare-verse ${v1[i] !== v2[i] ? 'diff' : ''}"><span class="cv-num">${i + 1}.</span> ${v2[i] || '—'}</div>`).join('')}</div>`;
}

// ============ ABA DE COMPARAÇÃO DEDICADA ============
function initCompareTab() {
    // Popular lista de livros
    const bookSelect = document.getElementById('compare-book');
    bookSelect.innerHTML = '<option value="">Selecione um livro</option>';
    
    [...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new].forEach(book => {
        const opt = document.createElement('option');
        opt.value = book;
        opt.textContent = book;
        bookSelect.appendChild(opt);
    });
    
    document.getElementById('compare-chapter').disabled = true;
    document.getElementById('compare-chapter').innerHTML = '<option value="">Selecione</option>';
}

function updateCompareChapters() {
    const bookSelect = document.getElementById('compare-book');
    const chapterSelect = document.getElementById('compare-chapter');
    const selectedBook = bookSelect.value;
    
    chapterSelect.innerHTML = '<option value="">Selecione</option>';
    
    if (selectedBook) {
        const bookData = findBook(selectedBook);
        if (bookData && bookData.chapters) {
            for (let i = 0; i < bookData.chapters.length; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `Capítulo ${i + 1}`;
                chapterSelect.appendChild(opt);
            }
            chapterSelect.disabled = false;
        }
    } else {
        chapterSelect.disabled = true;
    }
}

async function loadCompareView() {
    const version1 = document.getElementById('compare-version-1').value;
    const version2 = document.getElementById('compare-version-2').value;
    const bookName = document.getElementById('compare-book').value;
    const chapterIndex = document.getElementById('compare-chapter').value;
    
    if (!bookName || chapterIndex === '') return;
    
    const pane1 = document.getElementById('compare-pane-1');
    const pane2 = document.getElementById('compare-pane-2');
    
    pane1.innerHTML = '<div class="loading">Carregando...</div>';
    pane2.innerHTML = '<div class="loading">Carregando...</div>';
    
    // Carregar versão 1
    let data1 = appState.bibleData;
    if (version1 !== appState.currentVersion) {
        try {
            const resp = await fetch(`data/${version1}.json`);
            if (resp.ok) data1 = convertBibleFormat(await resp.json(), version1);
        } catch(e) {}
    }
    
    // Carregar versão 2
    let data2 = appState.compareData;
    if (version2 !== appState.compareVersion) {
        try {
            const resp = await fetch(`data/${version2}.json`);
            if (resp.ok) data2 = convertBibleFormat(await resp.json(), version2);
        } catch(e) {}
    }
    
    const book1 = findBook(bookName, data1);
    const book2 = findBook(bookName, data2);
    
    const verses1 = book1 && book1.chapters[chapterIndex] ? book1.chapters[chapterIndex] : [];
    const verses2 = book2 && book2.chapters[chapterIndex] ? book2.chapters[chapterIndex] : [];
    const maxVerses = Math.max(verses1.length, verses2.length);
    
    pane1.innerHTML = `<div class="compare-pane-header">📖 ${bookName} ${parseInt(chapterIndex) + 1} - ${version1}</div>` +
        Array.from({length: maxVerses}, (_, i) => 
            `<div class="compare-verse-full ${verses2[i] && verses1[i] !== verses2[i] ? 'diff' : ''}">
                <span class="cv-num">${i + 1}.</span>${verses1[i] || '—'}
            </div>`
        ).join('');
    
    pane2.innerHTML = `<div class="compare-pane-header">📖 ${bookName} ${parseInt(chapterIndex) + 1} - ${version2}</div>` +
        Array.from({length: maxVerses}, (_, i) => 
            `<div class="compare-verse-full ${verses1[i] !== verses2[i] ? 'diff' : ''}">
                <span class="cv-num">${i + 1}.</span>${verses2[i] || '—'}
            </div>`
        ).join('');
}

// ============ LEITURA EM VOZ ALTA ============
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;
let currentVerseIndex = -1;
let verseElements = [];

function initAudio() {
    speechSynth = window.speechSynthesis;
}

function speak(text, callback) {
    // Cancelar qualquer fala anterior
    speechSynth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = parseFloat(document.getElementById('audio-speed')?.value || 1);
    
    // Tentar usar voz feminina em português
    const voices = speechSynth.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    
    currentUtterance = utterance;
    
    utterance.onend = () => {
        if (callback) callback();
    };
    
    utterance.onerror = (e) => {
        console.log('Erro na fala:', e);
        isPlaying = false;
        updateAudioButtons(false);
    };
    
    speechSynth.speak(utterance);
}

function playChapter() {
    if (!appState.currentBook || appState.currentChapter === null) return;
    
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[appState.currentChapter]) return;
    
    const verses = bd.chapters[appState.currentChapter];
    verseElements = document.querySelectorAll('#verses-container .verse-container');
    
    if (verses.length === 0) return;
    
    isPlaying = true;
    updateAudioButtons(true);
    
    // Concatenar todos os versículos
    const fullText = verses.map((v, i) => `Versículo ${i + 1}. ${v}`).join('. ');
    
    // Destacar todos os versículos
    highlightSpeakingVerse(-1);
    
    speak(fullText, () => {
        isPlaying = false;
        updateAudioButtons(false);
        highlightSpeakingVerse(-1);
    });
    
    // Marcar versículo atual enquanto fala
    trackCurrentVerse(verses);
}

function playVerse(index) {
    if (!appState.currentBook || appState.currentChapter === null) return;
    
    const bd = findBook(appState.currentBook.name);
    if (!bd || !bd.chapters[appState.currentChapter]) return;
    
    const verse = bd.chapters[appState.currentChapter][index];
    if (!verse) return;
    
    // Parar capítulo se estiver tocando
    if (isPlaying) {
        speechSynth.cancel();
        isPlaying = false;
    }
    
    isPlaying = true;
    updateAudioButtons(true);
    highlightSpeakingVerse(index);
    
    const text = `Versículo ${index + 1}. ${verse}`;
    
    speak(text, () => {
        isPlaying = false;
        updateAudioButtons(false);
        highlightSpeakingVerse(-1);
    });
}

function trackCurrentVerse(verses) {
    // Estimar qual versículo está sendo falado baseado no tempo
    const speed = parseFloat(document.getElementById('audio-speed')?.value || 1);
    const avgCharsPerSecond = 15 * speed; // Caracteres por segundo aproximado
    let charCount = 0;
    const verseStartTimes = [];
    
    verses.forEach((v, i) => {
        verseStartTimes.push(charCount / avgCharsPerSecond);
        charCount += (`Versículo ${i + 1}. ${v}. `).length;
    });
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            highlightSpeakingVerse(-1);
            return;
        }
        
        const elapsed = (Date.now() - startTime) / 1000;
        let currentIdx = -1;
        
        for (let i = verseStartTimes.length - 1; i >= 0; i--) {
            if (elapsed >= verseStartTimes[i]) {
                currentIdx = i;
                break;
            }
        }
        
        highlightSpeakingVerse(currentIdx);
        if (currentIdx >= 0 && verseElements[currentIdx]) {
            verseElements[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 500);
}

function pauseChapter() {
    if (speechSynth.speaking) {
        speechSynth.pause();
        isPlaying = false;
        updateAudioButtons(false);
    }
}

function resumeChapter() {
    if (speechSynth.paused) {
        speechSynth.resume();
        isPlaying = true;
        updateAudioButtons(true);
    }
}

function stopChapter() {
    speechSynth.cancel();
    isPlaying = false;
    currentUtterance = null;
    updateAudioButtons(false);
    highlightSpeakingVerse(-1);
}

function highlightSpeakingVerse(index) {
    verseElements = document.querySelectorAll('#verses-container .verse-container');
    verseElements.forEach((el, i) => {
        if (i === index) {
            el.classList.add('verse-speaking');
        } else {
            el.classList.remove('verse-speaking');
        }
    });
}

function updateAudioButtons(playing) {
    const playBtn = document.getElementById('play-chapter');
    const pauseBtn = document.getElementById('pause-chapter');
    const stopBtn = document.getElementById('stop-chapter');
    
    if (!playBtn || !pauseBtn || !stopBtn) return;
    
    if (playing) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        stopBtn.style.display = 'flex';
    } else {
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    }
}