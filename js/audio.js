// ============ SISTEMA DE ÁUDIO ============
const audioState = {
    isPlaying: false,
    isPaused: false,
    currentVerseIndex: 0,
    verses: [],
    utterance: null
};

// Verificar se o navegador suporta TTS
function checkTTS() {
    return 'speechSynthesis' in window;
}

// Configurar voz em português
function getPortugueseVoice() {
    const voices = speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.startsWith('pt-BR'));
    if (!voice) voice = voices.find(v => v.lang.startsWith('pt'));
    if (!voice) voice = voices.find(v => v.lang.startsWith('es'));
    if (!voice) voice = voices[0];
    return voice;
}

// Obter velocidade selecionada
function getAudioSpeed() {
    const speedSelect = document.getElementById('audio-speed');
    return speedSelect ? parseFloat(speedSelect.value) : 1;
}

// Mostrar/esconder botões de áudio
function updateAudioButtons(playing, paused) {
    const playBtn = document.getElementById('play-chapter');
    const pauseBtn = document.getElementById('pause-chapter');
    const stopBtn = document.getElementById('stop-chapter');
    
    if (!playBtn || !pauseBtn || !stopBtn) return;
    
    if (playing && !paused) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        stopBtn.style.display = 'flex';
    } else if (playing && paused) {
        playBtn.style.display = 'flex';
        playBtn.textContent = '▶️';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
    } else {
        playBtn.style.display = 'flex';
        playBtn.textContent = '🔊';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    }
}

// Tocar capítulo inteiro
async function playChapterAudio() {
    if (!checkTTS()) {
        alert('Seu navegador não suporta leitura em voz alta.');
        return;
    }
    
    if (!appState.currentBook || appState.currentChapter === null) {
        alert('Selecione um capítulo primeiro.');
        return;
    }
    
    const bookData = findBook(appState.currentBook.name);
    if (!bookData || !bookData.chapters[appState.currentChapter]) {
        alert('Capítulo não encontrado.');
        return;
    }
    
    // Se estava pausado, retomar
    if (audioState.isPaused) {
        speechSynthesis.resume();
        audioState.isPaused = false;
        updateAudioButtons(true, false);
        return;
    }
    
    // Parar qualquer áudio anterior
    stopChapterAudio();
    
    // Coletar versículos
    audioState.verses = bookData.chapters[appState.currentChapter];
    audioState.currentVerseIndex = 0;
    audioState.isPlaying = true;
    audioState.isPaused = false;
    
    updateAudioButtons(true, false);
    speakCurrentVerse();
}

// Pausar áudio
function pauseChapterAudio() {
    if (audioState.isPlaying) {
        speechSynthesis.pause();
        audioState.isPaused = true;
        updateAudioButtons(true, true);
    }
}

// Parar áudio completamente
function stopChapterAudio() {
    speechSynthesis.cancel();
    audioState.isPlaying = false;
    audioState.isPaused = false;
    audioState.currentVerseIndex = 0;
    audioState.verses = [];
    updateAudioButtons(false, false);
}

// Falar o versículo atual
function speakCurrentVerse() {
    if (!audioState.isPlaying || audioState.isPaused) return;
    
    if (audioState.currentVerseIndex >= audioState.verses.length) {
        // Capítulo terminou
        stopChapterAudio();
        return;
    }
    
    const verse = audioState.verses[audioState.currentVerseIndex];
    if (!verse || verse.trim() === '') {
        // Pular versículo vazio
        audioState.currentVerseIndex++;
        speakCurrentVerse();
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(verse);
    utterance.voice = getPortugueseVoice();
    utterance.rate = getAudioSpeed();
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'pt-BR';
    
    utterance.onend = function() {
        if (audioState.isPlaying && !audioState.isPaused) {
            audioState.currentVerseIndex++;
            speakCurrentVerse();
        }
    };
    
    utterance.onerror = function(e) {
        console.error('Erro no áudio:', e);
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
            audioState.currentVerseIndex++;
            speakCurrentVerse();
        }
    };
    
    audioState.utterance = utterance;
    speechSynthesis.speak(utterance);
}

// Tocar versículo individual
// Tocar versículo individual (modo parágrafo)
function playVerseAudio(verseIndex) {
    if (!checkTTS()) {
        alert('Seu navegador não suporta leitura em voz alta.');
        return;
    }
    
    if (!appState.currentBook || appState.currentChapter === null) return;
    
    const bookData = findBook(appState.currentBook.name);
    if (!bookData) return;
    
    const chaptersArray = Array.isArray(bookData.chapters) ? bookData.chapters : Object.values(bookData.chapters);
    if (!chaptersArray[appState.currentChapter]) return;
    
    const verse = chaptersArray[appState.currentChapter][verseIndex];
    if (!verse) return;
    
    // Parar áudio do capítulo se estiver tocando
    stopChapterAudio();
    
    const utterance = new SpeechSynthesisUtterance(verse);
    utterance.voice = getPortugueseVoice();
    utterance.rate = getAudioSpeed();
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'pt-BR';
    
    speechSynthesis.speak(utterance);
}

// Carregar vozes quando disponíveis
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function() {
        console.log('🎤 Vozes carregadas:', speechSynthesis.getVoices().length);
    };
}