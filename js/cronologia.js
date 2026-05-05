// ============ CRONOLOGIA BÍBLICA ============
let cronologiaData = null;
let cronologiaEvangelhosData = null;
let cronologiaAtual = 'geral';

async function loadCronologia() {
    // Configurar listeners das sub-abas
    document.querySelectorAll('.cronologia-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.cronologia-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            cronologiaAtual = this.dataset.cron;
            carregarConteudo();
        });
    });
    
    // Carregar conteúdo inicial
    await carregarConteudo();
}

async function carregarConteudo() {
    const content = document.getElementById('cronologia-content');
    if (!content) return;
    
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    if (cronologiaAtual === 'geral') {
        if (!cronologiaData) {
            try {
                const response = await fetch('data/cronologia.json');
                if (!response.ok) throw new Error('Arquivo não encontrado');
                cronologiaData = await response.json();
            } catch (e) {
                content.innerHTML = `<div class="no-favorites">📭 Arquivo data/cronologia.json não encontrado.</div>`;
                return;
            }
        }
        renderCronologiaGeral();
    } else {
        if (!cronologiaEvangelhosData) {
            try {
                const response = await fetch('data/cronologia-evangelhos.json');
                if (!response.ok) throw new Error('Arquivo não encontrado');
                cronologiaEvangelhosData = await response.json();
            } catch (e) {
                content.innerHTML = `<div class="no-favorites">📭 Arquivo data/cronologia-evangelhos.json não encontrado.</div>`;
                return;
            }
        }
        renderCronologiaEvangelhos();
    }
}

function renderCronologiaGeral() {
    const content = document.getElementById('cronologia-content');
    if (!content || !cronologiaData || !cronologiaData.cronologia_biblica) return;
    
    const data = cronologiaData.cronologia_biblica;
    let html = '';
    
    // ============ ANTIGO TESTAMENTO ============
    if (data.antigo_testamento) {
        html += '<div class="cronologia-section">';
        html += '<h3 class="cronologia-section-title">📜 Antigo Testamento</h3>';
        
        const at = data.antigo_testamento;
        
        // Pré-História
        if (at.pre_historia) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">🌍 Pré-História</h4>';
            html += '<ul class="cronologia-list">';
            at.pre_historia.eventos.forEach(e => {
                html += `<li class="cronologia-item">${e}</li>`;
            });
            html += '</ul></div>';
        }
        
        // Patriarcas
        if (at.patriarcas_2220_ac) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">👨‍👩‍👦 Patriarcas (~2220 a.C.)</h4>';
            html += '<div class="cronologia-figuras">';
            at.patriarcas_2220_ac.figuras_chave.forEach(f => {
                html += `<span class="cronologia-tag">${f}</span>`;
            });
            html += '</div></div>';
        }
        
        // Israel no Egito
        if (at.israel_no_egito_e_exodo_1900_ac) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">🇪🇬 Israel no Egito e Êxodo (~1900 a.C.)</h4>';
            html += '<ul class="cronologia-list">';
            at.israel_no_egito_e_exodo_1900_ac.eventos.forEach(e => {
                html += `<li class="cronologia-item">${e}</li>`;
            });
            html += '</ul></div>';
        }
        
        // Conquista e Juízes
        if (at.conquista_e_juizes_1400_ac) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">⚔️ Conquista e Juízes (~1400 a.C.)</h4>';
            html += '<ul class="cronologia-list">';
            at.conquista_e_juizes_1400_ac.eventos.forEach(e => {
                html += `<li class="cronologia-item">${e}</li>`;
            });
            html += '</ul></div>';
        }
        
        // Reino Unido
        if (at.reino_unido) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">👑 Reino Unido</h4>';
            html += '<div class="cronologia-timeline-compact">';
            for (const [rei, periodo] of Object.entries(at.reino_unido)) {
                html += `<div class="cronologia-rei">
                    <span class="rei-nome">${rei.charAt(0).toUpperCase() + rei.slice(1)}</span>
                    <span class="rei-periodo">${periodo}</span>
                </div>`;
            }
            html += '</div></div>';
        }
        
        // Reino Dividido
        if (at.reino_dividido) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">⚡ Reino Dividido</h4>';
            html += '<div class="cronologia-dois-reinos">';
            
            html += '<div class="cronologia-reino">';
            html += '<h5 class="reino-titulo">🟡 Judá (Reino do Sul)</h5>';
            at.reino_dividido.juda_reino_do_sul.forEach(item => {
                if (item.rei) {
                    html += `<div class="cronologia-rei"><span class="rei-nome">${item.rei}</span><span class="rei-periodo">${item.periodo}</span></div>`;
                } else if (item.evento) {
                    html += `<div class="cronologia-evento-destaque"><span>${item.evento}</span><span class="evento-data">${item.data}</span></div>`;
                }
            });
            html += '</div>';
            
            html += '<div class="cronologia-reino">';
            html += '<h5 class="reino-titulo">🔵 Israel (Reino do Norte)</h5>';
            at.reino_dividido.israel_reino_do_norte.forEach(item => {
                if (item.rei) {
                    html += `<div class="cronologia-rei"><span class="rei-nome">${item.rei}</span><span class="rei-periodo">${item.periodo}</span></div>`;
                } else if (item.evento) {
                    html += `<div class="cronologia-evento-destaque"><span>${item.evento}</span><span class="evento-data">${item.data}</span></div>`;
                }
            });
            html += '</div>';
            
            html += '</div></div>';
        }
        
        // Cativeiro e Restauração
        if (at.cativeiro_e_restauracao) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">🏗️ Cativeiro e Restauração</h4>';
            html += '<ul class="cronologia-list">';
            at.cativeiro_e_restauracao.eventos.forEach(e => {
                html += `<li class="cronologia-item"><strong>${e.evento}</strong> <span class="evento-data-peq">${e.data}</span></li>`;
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
    }
    
    // ============ PERÍODO INTERTESTAMENTÁRIO ============
    if (data.periodo_intertestamentario) {
        html += '<div class="cronologia-section">';
        html += '<h3 class="cronologia-section-title">📖 Período Intertestamentário</h3>';
        html += '<div class="cronologia-card">';
        html += '<div class="cronologia-timeline-compact">';
        data.periodo_intertestamentario["400_ac_a_1_ac"].forEach(item => {
            html += `<div class="cronologia-rei"><span class="rei-nome">${item.dominio || item.rei}</span><span class="rei-periodo">${item.periodo}</span></div>`;
        });
        html += '</div></div></div>';
    }
    
    // ============ NOVO TESTAMENTO ============
    if (data.novo_testamento) {
        html += '<div class="cronologia-section">';
        html += '<h3 class="cronologia-section-title">✝️ Novo Testamento</h3>';
        
        const nt = data.novo_testamento;
        
        if (nt.vida_de_jesus) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">👶 Vida de Jesus</h4>';
            html += '<div class="cronologia-timeline-compact">';
            for (const [evento, data] of Object.entries(nt.vida_de_jesus)) {
                html += `<div class="cronologia-rei"><span class="rei-nome">${evento.charAt(0).toUpperCase() + evento.slice(1).replace(/_/g, ' ')}</span><span class="rei-periodo">${data}</span></div>`;
            }
            html += '</div></div>';
        }
        
        if (nt.periodo_dos_apostolos) {
            html += '<div class="cronologia-card">';
            html += '<h4 class="cronologia-card-title">🕊️ Período dos Apóstolos</h4>';
            html += '<ul class="cronologia-list">';
            nt.periodo_dos_apostolos.eventos_chave.forEach(e => {
                html += `<li class="cronologia-item"><strong>${e.evento}</strong> <span class="evento-data-peq">${e.data}</span></li>`;
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
    }
    
    if (data.fonte) {
        html += `<div class="cronologia-fonte">📚 ${data.fonte}</div>`;
    }
    
    content.innerHTML = html;
}

function renderCronologiaEvangelhos() {
    const content = document.getElementById('cronologia-content');
    if (!content || !cronologiaEvangelhosData) return;
    
    const data = cronologiaEvangelhosData;
    let html = '';
    
    html += '<div class="cronologia-section">';
    html += `<h3 class="cronologia-section-title">✝️ ${data.titulo || 'Cronologia dos Evangelhos'}</h3>`;
    if (data.autor) html += `<p class="cronologia-autor">👤 Autor: ${data.autor}</p>`;
    if (data.descricao) html += `<p class="cronologia-descricao">${data.descricao}</p>`;
    html += '</div>';
    
    if (data.cronologia) {
        for (const [categoria, eventos] of Object.entries(data.cronologia)) {
            if (typeof eventos === 'string') {
                html += `<div class="cronologia-intersticio">
                    <span class="intersticio-icon">⏱️</span>
                    <span class="intersticio-texto">${eventos}</span>
                </div>`;
                continue;
            }
            
            const categoriaFormatada = categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            html += '<div class="cronologia-section">';
            html += `<h3 class="cronologia-section-title">📖 ${categoriaFormatada}</h3>`;
            html += '<div class="cronologia-card">';
            
            if (Array.isArray(eventos)) {
                eventos.forEach((evento, index) => {
                    html += `<div class="cronologia-evento-item">
                        <span class="evento-numero">${index + 1}</span>
                        <span class="evento-referencia">📖 ${evento.referencia || ''}</span>
                        <span class="evento-descricao">${evento.evento || ''}</span>
                        ${evento.paralelos ? `<span class="evento-paralelos">📋 ${evento.paralelos.join(', ')}</span>` : ''}
                    </div>`;
                });
            }
            
            html += '</div></div>';
        }
    }
    
    content.innerHTML = html || '<div class="no-favorites">Nenhum dado encontrado.</div>';
}