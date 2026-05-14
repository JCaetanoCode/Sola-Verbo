// ============ DETECTOR DE EMOÇÕES ============
const emotionDictionary = {
    alegria: {
        words: ['alegria', 'feliz', 'felicidade', 'alegre', 'contentamento', 'júbilo', 'regozijo', 'exultação', 'gratidão', 'grato', 'abençoado', 'maravilhoso', 'ótimo', 'excelente', 'bom', 'boa', 'lindo', 'linda', 'abençoar', 'bênção', 'louvor', 'louvar', 'glória', 'aleluia', 'hosana', 'vitória', 'triunfo', 'celebrar', 'festa', 'cantar', 'dançar', 'sorrir', 'sorriso', 'obrigado', 'obrigada'],
        emoji: '😊',
        color: '#4CAF50',
        label: 'Alegria'
    },
    tristeza: {
        words: ['chorou', 'triste', 'tristeza', 'chorar', 'choro', 'lágrimas', 'lamento', 'lamentação', 'dor', 'sofrimento', 'angústia', 'aflição', 'desespero', 'soluço', 'gemido', 'pranto', 'pesar', 'abatido', 'abatimento', 'desanimado', 'desânimo', 'melancolia', 'depressão', 'saudade', 'solidão', 'sozinho', 'perdi', 'perder', 'morte', 'morrer'],
        emoji: '😢',
        color: '#2196F3',
        label: 'Tristeza'
    },
    raiva: {
        words: ['raiva', 'ira', 'furioso', 'fúria', 'ódio', 'odiar', 'cólera', 'indignação', 'revolta', 'revoltado', 'vingança', 'vingar', 'destruir', 'destruição', 'injustiça', 'injusto', 'maldade', 'mau', 'cruel', 'crueldade', 'violência', 'violento', 'irado', 'enfurecido', 'zangado', 'zanga', 'irritado', 'irritação'],
        emoji: '😠',
        color: '#F44336',
        label: 'Raiva'
    },
    motivacao: {
        words: ['força', 'forte', 'coragem', 'corajoso', 'perseverar', 'perseverança', 'resistir', 'resistência', 'lutar', 'luta', 'batalha', 'batalhar', 'vencer', 'vitória', 'conquistar', 'conquista', 'superar', 'superação', 'avançar', 'avanço', 'prosseguir', 'continuar', 'persistir', 'persistência', 'determinação', 'determinado', 'foco', 'focado', 'disciplina', 'disciplinado', 'esforço', 'dedicação'],
        emoji: '💪',
        color: '#FF9800',
        label: 'Motivação'
    },
    esperanca: {
        words: ['esperança', 'esperar', 'esperançoso', 'confiança', 'confiante', 'confiar', 'fé', 'crer', 'crença', 'acreditar', 'promessa', 'prometer', 'futuro', 'renovação', 'renovar', 'recomeçar', 'recomeço', 'oportunidade', 'novidade', 'novo', 'nova', 'reconstruir', 'restaurar', 'restauração', 'libertação', 'libertar', 'salvação', 'salvar', 'redenção', 'redentor'],
        emoji: '🌟',
        color: '#FFC107',
        label: 'Esperança'
    },
    amor: {
        words: ['amor', 'amar', 'amado', 'amada', 'carinho', 'carinhoso', 'afeto', 'afeição', 'paixão', 'apaixonado', 'coração', 'querido', 'querida', 'querer', 'bem-querer', 'ternura', 'terno', 'meigo', 'doce', 'doçura', 'cuidar', 'cuidado', 'proteger', 'proteção', 'abraçar', 'abraço', 'beijar', 'beijo', 'unir', 'união'],
        emoji: '❤️',
        color: '#E91E63',
        label: 'Amor'
    },
    medo: {
        words: ['medo', 'turbar', 'perturbar', 'temer', 'temor', 'medroso', 'assustado', 'assustar', 'susto', 'pavor', 'apavorado', 'terror', 'aterrorizar', 'pânico', 'inseguro', 'insegurança', 'dúvida', 'duvidar', 'incerteza', 'incerto', 'hesitar', 'hesitação', 'fraco', 'fraqueza', 'frágil', 'fragilidade', 'ameaça', 'ameaçar', 'perigo', 'perigoso'],
        emoji: '😨',
        color: '#9C27B0',
        label: 'Medo'
    },
    gratidao: {
        words: ['grato', 'grata', 'gratidão', 'agradecer', 'agradecido', 'agradecimento', 'obrigado', 'obrigada', 'reconhecer', 'reconhecimento', 'graça', 'favor', 'benção', 'abençoar', 'abençoado', 'dádiva', 'presente', 'bondade', 'misericórdia', 'compaixão', 'louvor', 'louvar', 'honra', 'honrar', 'glorificar', 'exaltar', 'engrandecer'],
        emoji: '🙏',
        color: '#00BCD4',
        label: 'Gratidão'
    }
};

// Estado do detector
let emotionDetectorActive = false;
let emotionUpdateTimeout = null;

// Criar interface do detector de emoções
function createEmotionDetector() {
    // Verificar se já existe
    if (document.getElementById('emotion-detector')) return;
    
    const detector = document.createElement('div');
    detector.id = 'emotion-detector';
    detector.className = 'emotion-detector';
    detector.innerHTML = `
        <div class="emotion-detector-header">
            <span class="emotion-detector-title">🎭 Analisador de Emoções</span>
            <button class="emotion-close-btn" onclick="toggleEmotionDetector()" title="Fechar">×</button>
        </div>
        <div class="emotion-input-area">
            <textarea id="emotion-input" class="emotion-textarea" placeholder="Digite uma frase para análise emocional..." rows="3"></textarea>
            <div class="emotion-actions">
                <button id="emotion-analyze-btn" class="emotion-analyze-btn">🔍 Analisar</button>
                <button id="emotion-clear-btn" class="emotion-clear-btn">🗑️ Limpar</button>
            </div>
        </div>
        <div id="emotion-results" class="emotion-results">
            <div class="emotion-placeholder">Digite algo e clique em Analisar...</div>
        </div>
    `;
    
    document.body.appendChild(detector);
    
    // Event listeners
    document.getElementById('emotion-analyze-btn').addEventListener('click', analyzeEmotion);
    document.getElementById('emotion-clear-btn').addEventListener('click', clearEmotion);
    
    // Analisar em tempo real enquanto digita
    const input = document.getElementById('emotion-input');
    input.addEventListener('input', () => {
        clearTimeout(emotionUpdateTimeout);
        emotionUpdateTimeout = setTimeout(analyzeEmotion, 500);
    });
    
    // Atalho Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeEmotion();
        }
    });
    
    // Fechar com Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && emotionDetectorActive) {
            toggleEmotionDetector();
        }
    });
}

// Alternar detector
function toggleEmotionDetector() {
    const detector = document.getElementById('emotion-detector');
    if (!detector) {
        createEmotionDetector();
        emotionDetectorActive = true;
        setTimeout(() => {
            document.getElementById('emotion-input').focus();
        }, 100);
        return;
    }
    
    emotionDetectorActive = !emotionDetectorActive;
    detector.style.display = emotionDetectorActive ? 'block' : 'none';
    
    if (emotionDetectorActive) {
        setTimeout(() => {
            document.getElementById('emotion-input').focus();
        }, 100);
    }
}

// Analisar emoção do texto
function analyzeEmotion() {
    const input = document.getElementById('emotion-input');
    const resultsDiv = document.getElementById('emotion-results');
    if (!input || !resultsDiv) return;
    
    const text = input.value.trim().toLowerCase();
    
    if (!text) {
        resultsDiv.innerHTML = '<div class="emotion-placeholder">Digite algo e clique em Analisar...</div>';
        return;
    }
    
    // Separar palavras
    const words = text.split(/\s+/);
    
    // Contar ocorrências para cada emoção
    const scores = {};
    let totalMatches = 0;
    const matchedWords = {};
    
    for (const [emotion, data] of Object.entries(emotionDictionary)) {
        scores[emotion] = 0;
        matchedWords[emotion] = [];
        
        for (const word of words) {
            const cleanWord = word.replace(/[.,!?;:()""''\[\]{}]/g, '');
            if (data.words.includes(cleanWord)) {
                scores[emotion]++;
                matchedWords[emotion].push(cleanWord);
                totalMatches++;
            }
        }
    }
    
    // Ordenar por pontuação
    const sortedEmotions = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort(([_, a], [__, b]) => b - a);
    
    if (sortedEmotions.length === 0) {
        resultsDiv.innerHTML = `
            <div class="emotion-neutral">
                <span class="emotion-neutral-icon">😐</span>
                <p>Nenhuma emoção específica detectada.</p>
                <p class="emotion-hint">Tente palavras como: amor, tristeza, esperança, gratidão...</p>
            </div>
        `;
        return;
    }
    
    // Mostrar emoção predominante
    const dominant = sortedEmotions[0][0];
    const dominantData = emotionDictionary[dominant];
    
    // Calcular porcentagens
    const totalScore = sortedEmotions.reduce((sum, [_, s]) => sum + s, 0);
    
    resultsDiv.innerHTML = `
        <div class="emotion-dominant" style="border-left-color: ${dominantData.color}">
            <div class="emotion-dominant-header">
                <span class="emotion-dominant-emoji">${dominantData.emoji}</span>
                <span class="emotion-dominant-label">${dominantData.label}</span>
                <span class="emotion-dominant-score">${Math.round((scores[dominant] / totalScore) * 100)}%</span>
            </div>
            <div class="emotion-dominant-words">
                Palavras: ${matchedWords[dominant].map(w => `<span class="emotion-word-tag" style="background:${dominantData.color}">${w}</span>`).join(' ')}
            </div>
        </div>
        
        ${sortedEmotions.length > 1 ? `
        <div class="emotion-others">
            <div class="emotion-others-title">Outras emoções detectadas:</div>
            ${sortedEmotions.slice(1).map(([emotion, score]) => {
                const data = emotionDictionary[emotion];
                const percent = Math.round((score / totalScore) * 100);
                return `
                    <div class="emotion-bar-item">
                        <span class="emotion-bar-emoji">${data.emoji}</span>
                        <span class="emotion-bar-label">${data.label}</span>
                        <div class="emotion-bar-container">
                            <div class="emotion-bar-fill" style="width:${percent}%; background:${data.color};"></div>
                        </div>
                        <span class="emotion-bar-score">${percent}%</span>
                    </div>
                `;
            }).join('')}
        </div>
        ` : ''}
        
        <div class="emotion-total">
            ${totalMatches} palavra(s) emocional(is) encontrada(s) em ${words.length} palavra(s)
        </div>
    `;
}

// Limpar análise
function clearEmotion() {
    const input = document.getElementById('emotion-input');
    const resultsDiv = document.getElementById('emotion-results');
    if (input) input.value = '';
    if (resultsDiv) resultsDiv.innerHTML = '<div class="emotion-placeholder">Digite algo e clique em Analisar...</div>';
    if (input) input.focus();
}