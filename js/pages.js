// ============ PÁGINAS DE CONTEÚDO ============

// Abrir página de conteúdo
function openContentPage(page) {
    const modal = document.getElementById('content-modal');
    const title = document.getElementById('content-title');
    const body = document.getElementById('content-body');

    const pages = {
        sobre: {
            title: '📖 Sobre o Sola Verbo',
            content: `
                <div class="content-page">
                    <div class="content-section">
                        <h3>O que é o Sola Verbo?</h3>
                        <p>O <strong>Sola Verbo</strong> é uma Bíblia de Estudo digital desenvolvida para auxiliar no aprofundamento das Escrituras Sagradas. O nome "Sola Verbo" vem do latim "Somente a Palavra", refletindo nosso compromisso com a centralidade da Bíblia.</p>
                    </div>
                    
                    <div class="content-section">
                        <h3>Funcionalidades</h3>
                        <ul>
                            <li>📖 <strong>13 Versões</strong> da Bíblia em português (ACF, ARA, NVI, NVT, KJA, etc.)</li>
                            <li>🔍 <strong>Busca Avançada</strong> com filtros por testamento, livro, capítulo e versículo</li>
                            <li>🖍️ <strong>Marca-texto</strong> com 5 cores para destacar versículos</li>
                            <li>📝 <strong>Notas Pessoais</strong> em cada versículo</li>
                            <li>🔗 <strong>Referências Cruzadas</strong> do Treasury of Scripture Knowledge (28.000+ conexões)</li>
                            <li>📋 <strong>Comparação de Versões</strong> lado a lado</li>
                            <li>📚 <strong>Dicionário Bíblico</strong> com mais de 1.000 termos</li>
                            <li>🔊 <strong>Áudio</strong> dos capítulos com controle de velocidade</li>
                            <li>⭐ <strong>Favoritos</strong> para salvar versículos</li>
                            <li>📊 <strong>Estatísticas</strong> de ocorrências por livro</li>
                        </ul>
                    </div>
                    
                    <div class="content-section">
                        <h3>Tecnologia</h3>
                        <p>Desenvolvido com tecnologias web modernas (HTML5, CSS3, JavaScript puro), o Sola Verbo funciona offline após o primeiro carregamento e é totalmente responsivo para celular, tablet e desktop.</p>
                    </div>
                    
                    <div class="content-section">
                        <h3>Versão</h3>
                        <p><strong>Versão 2.0</strong> - 2026</p>
                        <p>Desenvolvido por Jairo Caetano</p>
                    </div>
                </div>
            `
        },

        contato: {
            title: '✉️ Contato',
            content: `
                <div class="content-page">
                    <div class="content-section">
                        <h3>Entre em Contato</h3>
                        <p>Estamos sempre abertos a sugestões, críticas construtivas e relatos de bugs. Sua opinião é importante para melhorarmos o Sola Verbo.</p>
                        
                        <div class="contact-info">
                            <div class="contact-item">
                                <span class="contact-icon">👤</span>
                                <div>
                                    <strong>Desenvolvedor</strong>
                                    <p>Jairo Caetano</p>
                                </div>
                            </div>
                            
                            <div class="contact-item">
                                <span class="contact-icon">✉️</span>
                                <div>
                                    <strong>E-mail</strong>
                                    <p>emailcaetano@email.com</p>
                                </div>
                            </div>
                            
                            <div class="contact-item">
                                <span class="contact-icon">📍</span>
                                <div>
                                    <strong>Localização</strong>
                                    <p>Araçatuba - São Paulo - Brasil</p>
                                </div>
                            </div>
                            
                            <div class="contact-item">
                                <span class="contact-icon">💻</span>
                                <div>
                                    <strong>GitHub</strong>
                                    <p>https://jcaetanocode.github.io/sola-verbo/</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section">
                        <h3>Redes Sociais</h3>
                        <div class="social-links">
    <a href="https://facebook.com/seu-perfil" target="_blank" class="social-link">📘 Facebook</a>
    <a href="https://instagram.com/seu-perfil" target="_blank" class="social-link">📸 Instagram</a>
    <a href="https://twitter.com/seu-perfil" target="_blank" class="social-link">🐦 Twitter</a>
    <a href="http://www.youtube.com/@jairocaetano1" target="_blank" class="social-link">▶️ YouTube</a>
</div>
                    </div>
                </div>
            `
        },

        noticias: {
            title: '📰 Notícias e Atualizações',
            content: `
                <div class="content-page">
                    <div class="content-section">
                        <h3>Últimas Atualizações</h3>
                        
                        <div class="news-item">
                            <div class="news-date">01 de Maio de 2026</div>
                            <h4>🎉 Versão 2.0 Lançada!</h4>
                            <p>Nova interface luxuosa com tema dourado, suporte a 13 versões da Bíblia, referências cruzadas do TSK com mais de 28.000 conexões, dicionário bíblico com 1.000+ termos, e sistema de áudio para leitura dos capítulos.</p>
                        </div>
                        
                        <div class="news-item">
                            <div class="news-date">25 de Abril de 2026</div>
                            <h4>📚 Dicionário Bíblico Integrado</h4>
                            <p>Adicionado dicionário com termos teológicos, nomes bíblicos, lugares e conceitos importantes para auxiliar no estudo das Escrituras.</p>
                        </div>
                        
                        <div class="news-item">
                            <div class="news-date">15 de Abril de 2026</div>
                            <h4>🔊 Sistema de Áudio</h4>
                            <p>Implementada a leitura em voz alta dos capítulos com controle de velocidade, permitindo ouvir a Bíblia enquanto realiza outras atividades.</p>
                        </div>
                        
                        <div class="news-item">
                            <div class="news-date">01 de Abril de 2026</div>
                            <h4>🔗 Referências Cruzadas TSK</h4>
                            <p>Integração completa do Treasury of Scripture Knowledge com mais de 28.000 referências cruzadas conectando versículos de toda a Bíblia.</p>
                        </div>
                    </div>
                    
                    <div class="content-section">
                        <h3>Próximas Atualizações</h3>
                        <ul>
                            <li>🗺️ Mapas bíblicos interativos</li>
                            <li>📖 Planos de leitura anual</li>
                            <li>🌐 Suporte a mais idiomas</li>
                            <li>📱 Aplicativo nativo para Android e iOS</li>
                            <li>☁️ Sincronização de notas na nuvem</li>
                        </ul>
                    </div>
                </div>
            `
        },

        doar: {
            title: '❤️ Apoie o Projeto',
            content: `
                <div class="content-page">
                    <div class="content-section">
                        <h3>Por que doar?</h3>
                        <p>O <strong>Sola Verbo</strong> é um projeto gratuito e de código aberto, desenvolvido com dedicação para oferecer a melhor experiência de estudo bíblico possível.</p>
                        <p>Sua doação ajuda a:</p>
                        <ul>
                            <li>🖥️ Manter servidores e infraestrutura</li>
                            <li>📚 Adicionar mais versões da Bíblia</li>
                            <li>🗺️ Desenvolver novos recursos (mapas, planos de leitura)</li>
                            <li>📱 Criar aplicativos nativos para celular</li>
                            <li>🌐 Traduzir o Sola Verbo para outros idiomas</li>
                        </ul>
                    </div>
                    
                    <div class="content-section">
                        <h3>Formas de Doar</h3>
                        
                        <div class="donate-methods">
                            <div class="donate-method">
                                <span class="donate-icon">💎</span>
                                <div>
                                    <strong>PIX</strong>
                                    <p>Chave: emailcaetano@email.com</p>
                                </div>
                            </div>
                            
                            <div class="donate-method">
                                <span class="donate-icon">☕</span>
                                <div>
                                    <strong>Buy Me a Coffee</strong>
                                    <p>buymeacoffee.com/solaverbo</p>
                                </div>
                            </div>
                            
                            <div class="donate-method">
                                <span class="donate-icon">💻</span>
                                <div>
                                    <strong>GitHub Sponsors</strong>
                                    <p>github.com/sponsors/seu-usuario</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section">
                        <h3>Outras Formas de Ajudar</h3>
                        <ul>
                            <li>⭐ Dê uma estrela no GitHub</li>
                            <li>🐛 Reporte bugs e sugira melhorias</li>
                            <li>📢 Compartilhe com amigos e familiares</li>
                            <li>🙏 Ore pelo projeto</li>
                        </ul>
                    </div>
                    
                    <div class="content-section" style="text-align:center;">
                        <p style="font-size:1.2rem;color:var(--gold);">"Mais bem-aventurado é dar do que receber."</p>
                        <p style="color:var(--text3);">Atos 20:35</p>
                    </div>
                </div>
            `
        }
    };

    const pageData = pages[page];
    if (!pageData) return;

    title.innerHTML = pageData.title;
    body.innerHTML = pageData.content;
    modal.style.display = 'flex';
}

// Fechar modal de conteúdo
function closeContentPage() {
    document.getElementById('content-modal').style.display = 'none';
}