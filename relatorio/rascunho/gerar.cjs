// Rascunho do relatório final (Melhor Ideia 2026) em PNG, no visual do deck do orçamento.
// Cada slide é HTML 1920×1080; o Chrome tira a foto. Uso: node relatorio/rascunho/gerar.cjs
// Saída em relatorio/rascunho/saida (fora do git: traz telas reais do app).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const RAIZ = path.resolve(__dirname, '..', '..');
const SAIDA = path.join(__dirname, 'saida');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = (rel) => pathToFileURL(path.join(RAIZ, rel)).href;

const CAP = 'video/capturas/2026-10-11/';
const IMG = {
  megaCuritiba: url('relatorio/rascunho/midia/fotos/MEGA CURITIBA.png'),
  megaItajai: url('relatorio/rascunho/midia/fotos/MEGA ITAJAÍ.png'),
  megaEsteio: url('relatorio/rascunho/midia/fotos/MEGA ESTEIO.png'),
  fotoFim: url('relatorio/rascunho/midia/fotos/CORRETIVA.png'),
  escopoForm: url('video/01-previa-20s/midia/real/E01-escopo-servicos-fotos.png'),
  escopoLista: url(CAP + 'C01-escopos-lista.png'),
  deckCapa: url(CAP + 'escopo-ppci-docs/D02-slides-y0.png'),
  deckFoto: url('video/01-previa-20s/midia/real/E03-slides-registro-foto.png'),
  planilha: url(CAP + 'escopo-ppci-docs/D90-planilha-fornecedor.png'),
  logoCor: url('relatorio/marca/Capital Realty Logo RGB Color.png'),
  logoNeg: url('relatorio/marca/Capital Realty Logo RGB Negativo.png'),
};

const SECOES = ['O problema', 'A solução', 'Impacto', 'Qualidade e viabilidade', 'Entregue e próximos'];

// ---------- peças ----------
const trilha = (atual) => `<div class="trilha">${SECOES.map((s, i) =>
  `<div class="tr ${i + 1 === atual ? 'on' : i + 1 < atual ? 'feito' : ''}"><b>0${i + 1}</b> ${s}</div>`).join('')}</div>`;

const selo = (t) => `<div class="selo">⚠ PENDENTE · ${t}</div>`;

// o número da página vem da posição no deck (o argumento n fica só como referência de leitura)
function conteudo(_n, secao, titulo, sub, corpo, fonte, op = {}) {
  const n = S.length + 1;
  return `<section class="slide">
  ${trilha(secao)}
  ${op.selo ? selo(op.selo) : ''}
  <h1>${titulo}</h1>
  ${sub ? `<p class="sub">${sub}</p>` : ''}
  <div class="corpo">${corpo}</div>
  <footer><span>${fonte}</span><span>Gestão de Contratações · Melhor Ideia 2026 · ${n}</span></footer>
</section>`;
}

// recorte de uma captura: mostra a janela [x,y,w,h] da imagem original (largura natural W) numa caixa de largura L
function recorte(src, W, [x, y, w, h], L, extra = '') {
  const k = L / w;
  return `<div class="tela ${extra}" style="width:${L}px;height:${Math.round(h * k)}px">
    <img src="${src}" style="width:${Math.round(W * k)}px;left:${-Math.round(x * k)}px;top:${-Math.round(y * k)}px"></div>`;
}

// ---------- slides ----------
const S = [];

// 1. Capa
S.push(`<section class="slide capa">
  <div class="fotos"><div style="background-image:url('${IMG.megaCuritiba}')"></div><div style="background-image:url('${IMG.megaItajai}')"></div><div style="background-image:url('${IMG.megaEsteio}')"></div></div>
  <div class="linha-azul"></div>
  <img class="logo-capa" src="${IMG.logoCor}">
  <div class="capa-txt">
    <div class="kicker">MELHOR IDEIA 2026 · RELATÓRIO FINAL</div>
    <div class="nome">Gestão de Contratações</div>
    <div class="frase">A contratação começa no escopo.</div>
    <div class="frase2">Para toda área que monta escopo: Facilities, Propriedades, Engenharia e as demais.</div>
  </div>
  <footer><span>Guilherme Marques · Facilities · Capital Realty · 15/10/2026</span><span class="assin"><i></i>Começar melhor. Contratar melhor.</span></footer>
</section>`);

// 2. Sumário (o slide "Revisar antes da versão final" saiu em 15/10: o que não foi medido está declarado no próprio slide)
S.push(`<section class="slide sumario">
  <div class="kicker">SUMÁRIO</div>
  <h1 class="grande">A contratação começa no escopo</h1>
  <div class="sum-lista">${[
    ['O problema', 'O escopo passou a existir, mas sem padrão: o mesmo pedido gera respostas diferentes', '4–7'],
    ['A solução', 'Um cadastro, três documentos, um padrão', '8–10'],
    ['Impacto', 'O que diz quem usa e o uso real', '11–12'],
    ['Qualidade e viabilidade', 'Pedido vira versão; sem licença nova', '13–14'],
    ['Entregue e próximos passos', 'O que está em produção e o que vem', '15'],
  ].map(([t, d, p], i) => `<div class="sum-item"><div class="sum-n">0${i + 1}</div><div><div class="sum-t">${t}</div><div class="sum-d">${d}</div></div><div class="sum-p">${p.includes('–') ? 'slides' : 'slide'} ${p}</div></div>`).join('')}</div>
  <footer><span>Capital Realty · Facilities</span><span>Gestão de Contratações · Melhor Ideia 2026 · 2</span></footer>
</section>`);

// 3. A ideia em uma página: o que é a solução, antes do problema
S.push(conteudo(3, 0,
  'Um sistema que guia a montagem do escopo, do cadastro ao documento que vai ao fornecedor',
  'A ideia em uma página. Já testada em escopos reais por Facilities (Mega Itajaí) e Propriedades',
  `<div class="quatro">${[
    ['Onde', 'Contratação de serviços de manutenção e obras nos Megas. Facilities e Propriedades montam o escopo que o fornecedor recebe para cotar.'],
    ['O que é', 'Um app no Google Workspace. A pessoa preenche um cadastro guiado: serviços por local, fotos, EAP, inclusões, exclusões e visita técnica.'],
    ['O que entrega', 'O sistema gera a apresentação, o PDF e a planilha do fornecedor no mesmo padrão, com a revisão numerada e o histórico guardado.'],
    ['Situação hoje', 'Aprovado pelo comitê em 11/09/2026. Em produção desde setembro; 4 escopos reais emitidos por Facilities (Mega Itajaí) e Propriedades.'],
  ].map(([t, x]) => `<div class="card"><div class="card-t">${t}</div><div class="card-x">${x}</div></div>`).join('')}</div>
  <div class="conclusao"><b>Por que começar pelo escopo:</b> é onde a contratação começa. Se ele é vago ou muda de formato, as propostas chegam diferentes e a equalização volta ao fornecedor.</div>`,
  'Fontes: reunião do comitê de 11/09/2026; revisões do PPCI de Itajaí desde 15/09/2026; contagem da tela Escopos, recontada em 15/10/2026 (slide 12).'));

// 4. Contexto: como o escopo era feito, na visão da gestão (antes da dor)
S.push(conteudo(3, 1,
  'De 2024 a 2026 o escopo passou a existir; faltavam padrão e estrutura',
  'Como cada Mega montava escopo, na visão do gerente de Propriedades e Facilities',
  `<table class="anos">
    <tr><th></th><th>Mega Itajaí</th><th>Mega Curitiba</th><th>Mega Esteio</th></tr>
    <tr><td>2024</td><td>Muitos serviços sem escopo; quando havia, sem padrão ou superficial. Às vezes o chamado servia de escopo</td><td>Montar escopo não era hábito</td><td>Não havia o hábito; escopo não era criado</td></tr>
    <tr><td>2025</td><td>Escopos mais detalhados, ainda usados muitas vezes como formalização de requisito</td><td>Começa, sem padrão. Um modelo em Word virou referência, mas demandava muito tempo e esforço</td><td>Começa: fácil de entender para quem é de fora, mas considerações importantes não ficavam claras</td></tr>
    <tr><td>2026</td><td>Mais claros; escopo obrigatório nas contratações, exceto abaixo de R$ 1 mil (lançadas via RM)</td><td>Obrigatório; com a mudança de gestão, os arquivos mudaram e surgiu um novo padrão</td><td class="sem">sem relato</td></tr>
  </table>
  <div class="conclusao"><b>“O ponto é questão de padronização e estrutura.”</b> Na equalização, era e ainda é comum voltar ao fornecedor por divergência de informação. Propriedades é a área mais madura.</div>`,
  'Fonte: relato escrito do gerente de Propriedades e Facilities, 14/10/2026, sobre os anos em que esteve à frente das áreas. Resumido sem mudar o sentido; sem nomes de quem monta escopo.'));

// 4. Escopos reais sem padrão (amostra enviada pelas áreas em 15/10)
const ANT = (f) => url('relatorio/rascunho/midia/antigos/' + f);
S.push(conteudo(4, 1,
  'Sem padrão, cada escopo sai num formato e deixa lacunas diferentes',
  '9 escopos reais dos três Megas, feitos em PowerPoint, Google Slides e Word, sem o sistema',
  `<div class="sem-padrao">
    <div class="sp-fotos">${[
      ['esteio-reservatorio-p7.png', 'Esteio · slide 960×540', '580 m³ no título, 520 m³ no texto'],
      ['itajai-labios-p7.png', 'Itajaí · slide 720×405', '28 páginas, a maioria de fotos e plantas'],
      ['curitiba-rfq002-p2.png', 'Curitiba · A4 (Word)', 'Outra estrutura de seções'],
    ].map(([f, r, x]) => `<div class="sp-item"><div class="sp-img ${f.includes('rfq') ? 'a4' : ''}"><img src="${ANT(f)}"></div><div class="sp-r">${r}</div><div class="sp-x">${x}</div></div>`).join('')}</div>
    <div class="sp-achados"><div class="fx-rot">NOS 9 ESCOPOS</div>
      <div class="ach"><b>3</b><span>formatos de página: dois tamanhos de slide e A4</span></div>
      <div class="ach"><b>0</b><span>com seção de inclusões e exclusões; o que o preço cobre fica espalhado ou não aparece</span></div>
      <div class="ach"><b>2</b><span>com data limite para a proposta</span></div>
      <div class="ach"><b>1</b><span>diz se a visita técnica é obrigatória</span></div>
      <div class="ach"><b>5</b><span>grafias de revisão (RV02, R02, R00, v01, “02”), quase sempre só no nome do arquivo</span></div>
    </div>
  </div>`,
  'Fonte: 9 escopos reais reunidos em 15/10/2026 (Itajaí 4, Esteio 2, Curitiba 3), lidos página a página. Amostra escolhida pela área, não aleatória; parte é de 2026, feita fora do sistema.'));

// 5. A dor: casos reais da empresa, sem nomes nem valores
S.push(conteudo(4, 1,
  'Três casos reais mostram diferenças que o escopo precisa deixar explícitas',
  'Ofertas reais de manutenção nos Megas: diferenças de frequência, de preço por item, de valor e de prazo',
  `<div class="tres">
    <div class="kpi"><div class="kpi-n">2 · 3 · 12</div><div class="kpi-t">visitas por ano, no mesmo item cotado como “1 verba”</div><div class="kpi-d">Manutenção de ar-condicionado: três proponentes, a mesma linha; a diferença estava escondida na observação. A de 2 visitas não incluía o laudo PMOC com responsabilidade técnica previsto no pedido.</div></div>
    <div class="kpi"><div class="kpi-n">1 preço</div><div class="kpi-t">para a mão de obra inteira, sem valor por item</div><div class="kpi-d">Infraestrutura, passagem de cabos e instalação do painel vieram descritas, mas sem preço próprio. Não dá para comparar item a item com quem abriu.</div></div>
    <div class="kpi"><div class="kpi-n">3,3×</div><div class="kpi-t">entre a proposta mais barata e a mais cara, no mesmo serviço</div><div class="kpi-d">Lavagem do piso de um armazém do Mega Esteio: prazos de 4, 7 e 15 dias; uma separou máquina, produtos e mão de obra, outra deixou como “incluso”. O escopo era um parágrafo.</div></div>
  </div>
  <div class="conclusao"><b>O escopo precisa explicitar os requisitos antes da comparação.</b></div>`,
  'Fonte: documentos reais (BASE_DE_CONHECIMENTO §8.4 e §16.3; mapa original do PMOC; equalização da lavagem de piso do Mega Esteio, 06/04/2026). Ar-condicionado: Facilities; lavagem de piso: Propriedades. Ofertas, não serviços executados; sem nomes nem valores.'));
// 5. A ponte com a ideia aprovada
S.push(conteudo(5, 1,
  'Em 11/09, o comitê aprovou começar pelo escopo',
  'Da ideia inscrita (avaliar prestadores) ao caminho aprovado: começar onde as propostas divergem',
  `<div class="linha-tempo">${[
    ['29/04/2026', 'A inscrição', 'Capital Fornecedores: avaliação periódica de prestadores de serviço.'],
    ['19/05/2026', 'O comitê pede detalhes', 'Parte do processo já existe no Fluig: critérios, gatilho, indicadores e uso na decisão.'],
    ['11/09/2026', 'O comitê aprova o caminho', 'Reunião do comitê: seguir começando pelo escopo, onde as propostas começam a divergir.'],
    ['set/2026', 'O escopo entra em produção', 'Revisões do PPCI de Itajaí emitidas em 15/09 e 22/09.'],
  ].map(([d, t, x], i) => `<div class="lt"><div class="lt-bola">${i + 1}</div><div class="lt-d">${d}</div><div class="lt-t">${t}</div><div class="lt-x">${x}</div></div>`).join('')}</div>
  <div class="caixa-azul"><b>Aprovado pelo comitê:</b> a montagem do escopo, hoje em produção. <b>Projeto futuro com a TI:</b> fornecedor e preço no Fluig/RM, onde o cadastro oficial já mora, sem base duplicada.</div>`,
  'Fontes: e-mails de 29/04/2026 (inscrição) e 19/05/2026 (comitê); reunião "Comitê: Concurso Melhor Ideia" de 11/09/2026 (convite do calendário); revisões do PPCI de Itajaí (15/09 e 22/09/2026).'));
// 6. A solução
S.push(conteudo(6, 2,
  'Um cadastro alimenta a apresentação, o PDF e a planilha do fornecedor',
  '<b>O que é novo na empresa:</b> até aqui, cada área montava o escopo do seu jeito, em PowerPoint, Slides ou Word (slides 4 e 5). Agora um cadastro guiado gera os três documentos, numera a revisão e serve de base para o próximo escopo',
  `<div class="fluxo">
    <div class="fx-col"><div class="fx-rot">1 · O CADASTRO</div>${recorte(IMG.escopoForm, 1920, [270, 60, 1360, 940], 560)}</div>
    <div class="fx-seta">→</div>
    <div class="fx-col"><div class="fx-rot">2 · A APRESENTAÇÃO E O PDF</div>${recorte(IMG.deckCapa, 1920, [473, 20, 960, 330], 520)}${recorte(IMG.deckFoto, 1920, [473, 180, 960, 470], 520, 'mt')}</div>
    <div class="fx-seta">→</div>
    <div class="fx-col"><div class="fx-rot">3 · A PLANILHA DO FORNECEDOR</div>${recorte(IMG.planilha, 1920, [44, 160, 1566, 780], 420)}</div>
  </div>`,
  'Telas reais do app em produção: escopo “PPCI Prédio de Apoio Mega Itajaí”, R9 de 22/09/2026. Gerados em duas etapas (Slides e PDF, depois a planilha); neste exemplo, os três estão na R9. Capturas de 11/10/2026.'));

// 8. Sem padrão × o padrão
S.push(conteudo(8, 2,
  'Qualidade é padronização: todo escopo do sistema sai com a mesma estrutura e a revisão numerada',
  'As lacunas do slide 5 ganham lugar fixo no documento; o conteúdo ainda depende de quem preenche',
  `<div class="padrao">
    <div class="pd-capas">
      <div><div class="fx-rot">SEM O SISTEMA · 3 MEGAS, 3 JEITOS</div><div class="ad-antes">${[
        ['itajai-labios-p1.png', 'Itajaí'], ['esteio-reservatorio-p1.png', 'Esteio'], ['curitiba-facial-p1.png', 'Curitiba']].map(([f, m]) =>
        `<div><div class="sp-img"><img src="${ANT(f)}"></div><div class="sp-r">${m}</div></div>`).join('')}</div></div>
      <div class="ad-seta">→</div>
      <div><div class="fx-rot">COM O SISTEMA · O PADRÃO</div>${recorte(IMG.deckCapa, 1920, [473, 20, 960, 330], 470)}</div>
    </div>
    <table class="cmp">
      <tr><th></th><th>9 escopos sem o sistema</th><th>4 escopos reais do sistema</th></tr>
      <tr><td>Mesmo formato e mesma ordem de seções</td><td>não: 3 formatos</td><td class="ok">4 de 4</td></tr>
      <tr><td>Revisão numerada dentro do documento</td><td>1 de 9</td><td class="ok">4 de 4, em cada página</td></tr>
      <tr><td>Prazos da proposta</td><td>2 de 9</td><td class="ok">4 de 4</td></tr>
      <tr><td>Inclusões · exclusões · visita técnica</td><td>0 · 0 · 1 de 9</td><td>3 · 1 · 1 de 4 <span class="cmp-n">o padrão dá o lugar; o conteúdo depende de quem preenche</span></td></tr>
    </table>
  </div>`,
  'Esquerda: capas de escopos reais reunidos em 15/10/2026 (slide 5). Direita: PPCI de Itajaí (R9). Tabela: leitura dos 9 escopos e dos 4 PDFs reais do sistema em 15/10/2026; amostras pequenas, não é medição de qualidade das propostas.'));

// 8. Escopo base
S.push(conteudo(8, 2,
  'O próximo escopo parte do último emitido',
  '“Usar como base” parte da última revisão emitida: o que é do serviço vem pronto; o que é do lugar e da data fica em branco',
  `<div class="base">
    <div class="base-col"><div class="kpi-n">9</div><div class="kpi-t">grupos de conteúdo reaproveitados</div>
      <div class="chips ok">${['Grupos de serviço', 'EAP', 'Objetivo', 'Inclusões', 'Exclusões', 'Aceite', 'Considerações', 'Visita técnica', 'Aviso ao proponente'].map((c) => `<span>${c}</span>`).join('')}</div>
      <div class="kpi-t mt2">ficam em branco</div>
      <div class="chips">${['Título', 'Mega', 'Endereço', 'Imagens', 'Fotos', 'Vistoria', 'Prazos', 'Contato', 'Armazém', 'Módulos'].map((c) => `<span>${c}</span>`).join('')}</div>
      <p class="nota">Agrupados neste slide; a categoria também é copiada. Cada escopo novo guarda de qual partiu (“partiu de…”), e o original mostra quantas vezes serviu de base.</p></div>
    <div class="base-tela">${recorte(IMG.escopoLista, 1920, [254, 224, 1400, 820], 820)}</div>
  </div>`,
  'Fonte: código do app (Escopos.gs) e HISTORICO.md. Recurso publicado na v76, em 11/10/2026, depois do prazo de implementação (10/10). Tela real de produção.'));

// 10. O que diz quem usa (feedback do Mega Itajaí; tempo não cronometrado, declarado)
S.push(conteudo(10, 3,
  'Para o Facilities do Mega Itajaí, passada a adaptação, montar escopo ficou mais fácil',
  'Nos testes iniciais, o caminho guiado tirou o trabalho de configurar slide',
  `<div class="falas">
    <div class="fala"><div class="aspas">“</div>Vamos continuar usando, que facilita bastante.</div>
    <div class="fala"><div class="aspas">“</div>Fica muito mais padronizado. A gente não precisa ficar configurando slide.</div>
    <div class="fala"><div class="aspas">“</div>No começo a gente se bateu… mas depois que o pessoal pegar vai ser bem top.</div>
    <div class="fala"><div class="aspas">“</div>Acho que diminuiu o nosso tempo… porque a gente não tem o trabalho de ficar configurando.<div class="fala-tag">percepção, não medição</div></div>
  </div>
  <div class="tres mt3">
    <div class="mini"><b>Não medido:</b> o tempo não foi cronometrado. É a percepção de quem usa: 1 área, 1 conversa (14/10).</div>
    <div class="mini"><b>Adaptação:</b> houve um período de transição antes de o uso ficar natural.</div>
    <div class="mini"><b>Sem nome:</b> as falas são citadas como Facilities, Mega Itajaí.</div>
  </div>`,
  'Fonte: conversa com Facilities, Mega Itajaí, em 14/10/2026 (transcrição automática do Google Meet). Trechos literais, sem nome, com hesitações retiradas (…); a fala do tempo respondeu a uma pergunta direta.'));

// 10. Uso real
S.push(conteudo(10, 3,
  'Os escopos passam a ficar num só lugar, já com 4 reais de duas áreas',
  'Um repositório de escopos para a empresa toda: testado por Facilities e Propriedades; expansão proposta para Engenharia e demais áreas',
  `<div class="tres">
    <div class="kpi"><div class="kpi-n">1 lugar</div><div class="kpi-t">para todo escopo emitido</div><div class="kpi-d">Busca por Mega, categoria e situação, com todas as revisões e a apresentação e o PDF de cada uma. Antes, dependia de cada um salvar o arquivo na pasta certa; se esquecesse, o escopo se perdia.</div></div>
    <div class="kpi"><div class="kpi-n">4</div><div class="kpi-t">escopos reais emitidos</div><div class="kpi-d">A base mostra 8: Facilities, Mega Itajaí (3) e Propriedades, Mega Curitiba (1) são reais; os outros 4 foram teste ou exemplo e não contam.</div></div>
    <div class="kpi nao"><div class="kpi-n">—</div><div class="kpi-t">ainda não medido</div><div class="kpi-d">Tempo para montar, idas e voltas na equalização e comparabilidade das propostas. Medir nos próximos escopos, até a apresentação de novembro.</div></div>
  </div>`,
  'Recontado em 15/10/2026 na tela Escopos em produção (v77). “Se perdia”: relato de Facilities sobre a prática anterior, sem contagem de casos.'));

// 12. Qualidade: pedido vira versão
S.push(conteudo(12, 4,
  'Pedido de quem usa vira versão publicada em dias',
  'Da v71 à v77 em 9 dias (02/10 a 11/10). Publicação versionada, com 34 scripts de teste automatizado',
  `<div class="versoes">
    <div class="vs"><div class="vs-d">02/10</div><div class="vs-p"><b>Usuários:</b> fonte e cor diferentes em cada slide, conteúdo num canto, foto longe da descrição</div><div class="vs-v">v71 · v72 · v73<br><span>no mesmo dia</span></div></div>
    <div class="vs"><div class="vs-d">05/10</div><div class="vs-p"><b>Pedido do Facilities:</b> disclaimer padrão no aviso ao proponente; classificar e reaproveitar escopos como base</div><div class="vs-v">v75 · v76<br><span>em 11/10</span></div></div>
    <div class="vs"><div class="vs-d">11/10</div><div class="vs-p"><b>Foco da entrega:</b> o app abre direto no escopo; preço e fornecedor ficam para o Fluig/RM</div><div class="vs-v">v77<br><span>no mesmo dia</span></div></div>
  </div>
  <div class="tres mt3">
    <div class="mini"><b>34</b> scripts automatizados no comando de testes; execução registrada antes da v77</div>
    <div class="mini"><b>Versionada:</b> a versão anterior pode voltar no mesmo link</div>
    <div class="mini"><b>Medido antes de corrigir:</b> o texto de corpo saía em 7 tamanhos; passou a 1</div>
  </div>`,
  'Fontes: HISTORICO.md (02/10 e 11/10/2026), package.json. Pedidos resumidos do registro; v75 a v77 são de 11/10, depois do prazo de implementação (10/10).'));

// 13. Viabilidade
S.push(conteudo(13, 4,
  'Sem licença nem servidor novo: roda no que a empresa já tem',
  'O custo é de pessoas (montar escopo e manter o app), não de infraestrutura',
  `<div class="quatro">${[
    ['Infraestrutura', 'Google Workspace já contratado: Apps Script, Slides, Planilhas e Drive. Nenhuma licença nova.'],
    ['Arquivos', 'Apresentação, PDF e planilha ficam no Drive compartilhado do Facilities, com as revisões anteriores.'],
    ['Projeto futuro', 'Fornecedor e preço serão um projeto futuro com a TI, no Fluig/RM, como aprovou o comitê. O app cuida do escopo.'],
    ['Quem mantém', 'Manutenção atual: Guilherme. Documentação, testes e histórico no repositório; transferência prevista para uma pasta no Workspace com acesso de todos.'],
  ].map(([t, x]) => `<div class="card"><div class="card-t">${t}</div><div class="card-x">${x}</div></div>`).join('')}</div>`,
  'Preço, equalização e fornecedores estão ocultos na tela (modo escopo), não apagados: o código e os dados continuam até a integração.'));

// 14. Entregue e próximos passos (prestação de contas; fornecedor e preço são OUTRO projeto, com a TI)
S.push(conteudo(14, 5,
  'Entregue: a montagem do escopo. Fornecedor e preço serão outro projeto, com a TI',
  'O que está em produção hoje e o projeto futuro com a TI',
  `<div class="dois">
    <div class="pedido"><div class="fx-rot">ENTREGUE · EM PRODUÇÃO</div><ol class="passos">
      <li><b>Cadastro do escopo:</b> serviços por local, imagens junto do serviço e EAP com quantidade, unidade e marca</li>
      <li><b>Documentos gerados:</b> apresentação, PDF e planilha do fornecedor, com o número da revisão</li>
      <li><b>Revisões registradas</b> desde 15/09 (exemplo: PPCI de Itajaí)</li>
      <li><b>Escopo base e busca</b> dos escopos emitidos (11/10)</li>
      <li><b>Planejado em 11/09 × entregue:</b> escopo primeiro → em produção desde 15/09; fornecedor e preço → projeto futuro com a TI</li></ol></div>
    <div><div class="pronto"><div class="fx-rot">PRONTO PARA OS OUTROS MEGAS</div>Com os ajustes pedidos pelo Mega Itajaí já publicados, o sistema está disponível para os demais Megas: <b>a transição pode começar a qualquer momento.</b></div><div class="caixa-ti grande"><div class="fx-rot">PROJETO FUTURO, COM A TI</div><b>Fornecedor e preço no Fluig/RM</b>, onde o cadastro oficial já mora, sem base duplicada. Foi o caminho aprovado pelo comitê em 11/09: começar pelo escopo e levar fornecedor e preço para a TI. Sem prazo definido.</div></div>
  </div>`,
  'Entregue: HISTORICO.md e revisões do PPCI de Itajaí. O projeto com a TI é proposta, sem data definida.'));
// 15. Encerramento
S.push(`<section class="slide fim">
  <div class="fim-txt"><img class="logo-fim" src="${IMG.logoNeg}"><div class="kicker">GESTÃO DE CONTRATAÇÕES</div><div class="nome">Começar melhor.<br>Contratar melhor.</div>
  <div class="frase">Guilherme Marques · Facilities · Capital Realty · Melhor Ideia 2026</div></div>
  <div class="fotos lado"><div style="background-image:url('${IMG.fotoFim}')"></div></div>
</section>`);

// ---------- estilo ----------
const CSS = `
@font-face{font-family:Montserrat;src:url('${url('relatorio/fontes/Montserrat[wght].ttf')}');font-weight:100 900}
@font-face{font-family:'Open Sans';src:url('${url('relatorio/fontes/OpenSans[wdth,wght].ttf')}');font-weight:300 800}
:root{--navy:#151E49;--azul:#003D7B;--azul2:#065CA9;--claro:#5BA3F5;--txt:#3F4A5E;--mudo:#8A94A6;--linha:#E3E8EF;--fundo:#F5F7FA;--lar:#C2410C;--lar-f:#FFF3E6}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden;background:#fff}
.slide{position:relative;width:1920px;height:1080px;padding:0 128px;font-family:'Open Sans';color:var(--txt);background:#fff;display:none}
.slide.ativo{display:flow-root}
h1{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:48px;line-height:1.15;margin-top:128px;max-width:1320px;letter-spacing:-.5px}
.sub{font-size:26px;margin-top:16px;color:var(--txt);max-width:1500px}
.corpo{position:absolute;left:128px;right:128px;top:390px;bottom:120px}
footer{position:absolute;left:128px;right:128px;bottom:40px;border-top:2px solid var(--linha);padding-top:22px;display:flex;justify-content:space-between;font-size:21px;color:#5B6578}
footer span:first-child{max-width:1200px}
footer span:last-child{white-space:nowrap;flex-shrink:0;margin-left:32px}
.trilha{position:absolute;left:128px;right:128px;top:48px;display:flex;gap:16px}
.tr{flex:1;border-top:4px solid var(--linha);padding-top:10px;font-size:17px;color:var(--mudo)}
.tr b{font-family:Montserrat;font-weight:700;margin-right:6px}
.tr.feito{border-color:var(--azul2)}
.tr.on{border-top:7px solid var(--azul2);color:var(--navy);font-weight:700;padding-top:7px}
.tr.on b,.tr.feito b{color:var(--azul2)}
.selo{position:absolute;right:128px;top:104px;background:var(--lar-f);color:var(--lar);border:2px solid var(--lar);font-family:Montserrat;font-weight:700;font-size:18px;padding:6px 16px;border-radius:6px}
.kicker{font-family:Montserrat;font-weight:700;color:var(--azul2);font-size:30px;letter-spacing:.5px}
.fx-rot{font-family:Montserrat;font-weight:700;color:var(--azul2);font-size:17px;letter-spacing:1px;margin-bottom:14px}
.tela{position:relative;overflow:hidden;border:1px solid var(--linha);border-radius:10px;box-shadow:0 10px 28px rgba(21,30,73,.12);background:#fff}
.tela img{position:absolute;max-width:none}
.mt{margin-top:18px}.mt2{margin-top:30px}.mt3{margin-top:40px}
/* capa */
.capa .fotos{position:absolute;left:0;right:0;top:0;height:560px;display:flex;gap:6px}
.fotos div{flex:1;background-size:cover;background-position:center;position:relative}
.fotos div::after{content:'';position:absolute;inset:0;background:rgba(21,30,73,.42)}
.linha-azul{position:absolute;left:0;right:0;top:560px;height:12px;background:var(--azul2)}
.capa-txt{position:absolute;left:147px;top:612px}
.capa .kicker{font-size:28px}
.nome{font-family:Montserrat;font-weight:800;color:var(--navy);font-size:104px;letter-spacing:-2px;line-height:1.05;margin-top:22px}
.frase{font-size:34px;color:var(--txt);margin-top:22px}
.frase2{font-size:24px;color:var(--azul2);margin-top:14px;font-weight:600}
.assin{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:22px;display:flex;align-items:center;gap:22px}
.assin i{display:inline-block;width:14px;height:14px;background:var(--claro)}
/* revisar */
.revisar{background:#fff}
.rev-tag{position:absolute;left:128px;top:70px;background:var(--lar);color:#fff;font-family:Montserrat;font-weight:700;font-size:20px;padding:8px 18px;border-radius:6px}
table.pend{margin-top:56px;width:100%;border-collapse:collapse;font-size:24px}
.pend th{text-align:left;font-family:Montserrat;font-size:17px;letter-spacing:1px;color:var(--mudo);text-transform:uppercase;border-bottom:2px solid var(--linha);padding:12px 16px}
.pend td{padding:22px 16px;border-bottom:1px solid var(--linha);vertical-align:top}
.pend td:nth-child(2){font-family:Montserrat;font-weight:700;color:var(--lar);text-align:center}
.pend tr td:first-child{border-left:5px solid var(--lar)}
/* sumário */
.sumario h1.grande{font-size:64px;margin-top:22px}
.sumario .kicker{position:absolute;top:120px;left:128px}
.sumario h1{position:absolute;top:150px}
.sum-lista{position:absolute;left:128px;right:128px;top:330px}
.sum-item{display:grid;grid-template-columns:140px 1fr 200px;align-items:center;border-top:2px solid var(--linha);padding:22px 0}
.sum-n{font-family:Montserrat;font-weight:800;font-size:56px;color:var(--claro)}
.sum-t{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:34px}
.sum-d{font-size:24px;margin-top:4px}
.sum-p{text-align:right;color:var(--mudo);font-size:20px}
/* kpis */
.dois-iguais{display:grid;grid-template-columns:1fr 1fr;gap:48px}
.tres{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.quatro{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.dois{display:grid;grid-template-columns:1.3fr 1fr;gap:70px}
.kpi{border-top:6px solid var(--azul2);padding-top:26px}
.kpi-n{font-family:Montserrat;font-weight:800;color:var(--navy);font-size:96px;line-height:1;letter-spacing:-2px}
.kpi-t{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:26px;margin-top:14px;line-height:1.25}
.kpi-d{font-size:22px;margin-top:14px;line-height:1.45}
.conclusao{margin-top:64px;font-size:32px;color:var(--navy);border-left:8px solid var(--azul2);padding:18px 30px;background:var(--fundo)}
.conclusao b{font-family:Montserrat}
/* linha do tempo */
.linha-tempo{display:grid;grid-template-columns:repeat(4,1fr);gap:30px;position:relative}
.linha-tempo::before{content:'';position:absolute;left:30px;right:30px;top:30px;height:4px;background:var(--linha)}
.lt{position:relative}.linha-tempo.cinco{grid-template-columns:repeat(5,1fr);gap:26px}
.lt-bola{width:62px;height:62px;border-radius:50%;background:var(--azul2);color:#fff;font-family:Montserrat;font-weight:800;font-size:28px;display:flex;align-items:center;justify-content:center;position:relative}
.lt:last-child .lt-bola{background:var(--navy)}
.lt-d{margin-top:22px;font-family:Montserrat;font-weight:700;color:var(--azul2);font-size:20px}
.lt-t{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:28px;margin-top:6px}
.lt-x{font-size:21px;margin-top:10px;line-height:1.45}
.caixa-azul{margin-top:70px;background:var(--navy);color:#fff;font-size:26px;padding:28px 36px;border-radius:10px;line-height:1.45}
.caixa-azul b{font-family:Montserrat}
.prox{display:inline-block;margin-left:10px;color:#9CC7FF;font-size:22px}
/* fluxo */
.fluxo{display:flex;align-items:flex-start;gap:26px}
.fx-seta{font-size:64px;color:var(--azul2);font-family:Montserrat;font-weight:700;margin-top:180px}
/* antes depois */
.antes-depois{display:grid;grid-template-columns:1fr 80px 1fr;gap:20px}
.ad-antes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.vazio{height:300px;border:3px dashed #F0B37E;background:var(--lar-f);border-radius:10px;display:flex;flex-direction:column;justify-content:center;text-align:center;font-size:22px;color:var(--lar);line-height:1.5}
.vazio span{font-size:18px}
.ad-seta{font-size:64px;color:var(--azul2);font-family:Montserrat;font-weight:700;margin-top:140px;text-align:center}
.lista{margin-top:26px;padding-left:28px;font-size:23px;line-height:1.7}
.lista li::marker{color:var(--azul2)}
/* base */
.base{display:grid;grid-template-columns:1fr 820px;gap:70px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chips span{font-size:19px;padding:7px 14px;border-radius:20px;background:var(--fundo);color:var(--mudo);border:1px solid var(--linha)}
.chips.ok span{background:#E8F1FB;color:var(--azul);border-color:#BFD8F2;font-weight:600}
.nota{margin-top:30px;font-size:21px;line-height:1.5}
/* tempo */
.tempo{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:40px}
.t-card{border:2px solid var(--linha);border-radius:12px;padding:36px;text-align:center}
.t-card.azul{border-color:var(--azul2);background:#F2F7FD}
.t-n{font-family:Montserrat;font-weight:800;font-size:110px;margin:20px 0}
.lacuna{color:var(--lar);background:var(--lar-f);border-radius:8px;padding:0 10px}
.lacuna-txt{color:var(--lar);font-style:italic}
.metodo{background:var(--fundo);border-radius:12px;padding:32px}
/* citações */
.citacao{border:3px dashed #F0B37E;background:var(--lar-f);border-radius:12px;padding:36px;height:420px;position:relative}
.aspas{font-family:Montserrat;font-weight:800;font-size:120px;color:#F0B37E;line-height:.8}
.citacao .lacuna-txt{font-size:28px;line-height:1.45;display:block;margin-top:10px}
.quem{position:absolute;bottom:34px;left:36px;font-family:Montserrat;font-weight:700;color:var(--lar);font-size:20px}
/* versões */
.versoes{border-top:2px solid var(--linha)}
.vs{display:grid;grid-template-columns:130px 1fr 240px;gap:30px;align-items:center;border-bottom:2px solid var(--linha);padding:22px 0}
.vs-d{font-family:Montserrat;font-weight:800;color:var(--azul2);font-size:30px}
.vs-p{font-size:23px;line-height:1.45}
.vs-v{font-family:Montserrat;font-weight:800;color:var(--navy);font-size:30px;text-align:right}
.vs-v span{font-family:'Open Sans';font-weight:400;font-size:19px;color:var(--mudo)}
.mini{background:var(--fundo);border-radius:10px;padding:22px 26px;font-size:22px;line-height:1.4}
.mini b{font-family:Montserrat;color:var(--navy);font-size:26px}
/* cards */
.card{border-top:6px solid var(--azul2);background:var(--fundo);padding:32px;border-radius:0 0 10px 10px;min-height:420px}
.quatro + .conclusao{margin-top:40px;font-size:26px}
.card-t{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:28px}
.card-x{font-size:23px;line-height:1.5;margin-top:18px}
.passos{padding-left:36px;font-size:25px;line-height:1.5}
.passos li{margin-bottom:20px}
.passos li::marker{font-family:Montserrat;font-weight:800;color:var(--azul2)}
.caixa-ti{margin-top:26px;border:3px dashed #9CC7FF;border-radius:12px;padding:22px 26px;font-size:23px;line-height:1.45;color:var(--navy)}.caixa-ti .fx-rot{margin-bottom:8px}.caixa-ti.grande{margin-top:24px;font-size:24px;line-height:1.5;padding:28px 34px;border-width:3px}.pronto{background:#E8F1FB;border-left:8px solid var(--azul2);border-radius:10px;padding:26px 30px;font-size:25px;line-height:1.45;color:var(--navy)}.pronto .fx-rot{margin-bottom:8px}
.pedido{background:var(--navy);color:#fff;border-radius:12px;padding:36px}
.pedido .fx-rot{color:#9CC7FF}
.pedido b{color:#fff}
.dois .passos{font-size:22px}.dois .passos li{margin-bottom:12px}
/* contexto por ano */
table.anos{width:100%;border-collapse:collapse;font-size:21px;line-height:1.4;margin-top:-40px}
.anos th{text-align:left;font-family:Montserrat;font-size:20px;color:var(--azul2);border-bottom:3px solid var(--azul2);padding:0 18px 12px}
.anos td{vertical-align:top;padding:16px 18px;border-bottom:1px solid var(--linha);width:31%}
.anos td:first-child{width:7%;font-family:Montserrat;font-weight:800;color:var(--navy);font-size:28px;padding-left:0}
.anos td.sem{color:var(--mudo);font-style:italic}
table.anos + .conclusao{margin-top:30px;font-size:24px;padding:16px 28px}
/* sem padrão */
.sem-padrao{display:grid;grid-template-columns:1fr 560px;gap:56px;margin-top:-30px}
.sp-fotos{display:grid;grid-template-columns:1.25fr 1.25fr .8fr;gap:22px;align-items:start}
.sp-img{border:1px solid var(--linha);border-radius:8px;overflow:hidden;box-shadow:0 8px 22px rgba(21,30,73,.12);background:#fff}
.sp-img img{display:block;width:100%}
.sp-img.a4{height:283px}.sp-img.a4 img{margin-top:-6%}
.sp-r{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:19px;margin-top:14px}
.sp-x{font-size:19px;line-height:1.4;margin-top:4px;color:var(--lar)}
.ach{display:grid;grid-template-columns:76px 1fr;align-items:baseline;border-top:2px solid var(--linha);padding:12px 0}
.ach b{font-family:Montserrat;font-weight:800;font-size:48px;color:var(--navy);line-height:1}
.ach span{font-size:21px;line-height:1.35}
.ad-antes .sp-r{font-size:18px;margin-top:8px}
/* padrão: capas + tabela */
.padrao{margin-top:-40px}
.pd-capas{display:grid;grid-template-columns:1fr 80px 470px;gap:16px;align-items:start}
.pd-capas .ad-antes .sp-img{height:150px}.pd-capas .ad-seta{margin-top:70px}
table.cmp{width:100%;border-collapse:collapse;margin-top:22px;font-size:22px}
.cmp th{text-align:left;font-family:Montserrat;font-size:18px;color:var(--azul2);border-bottom:3px solid var(--azul2);padding:6px 14px}
.cmp td{padding:9px 14px;border-bottom:1px solid var(--linha)}
.cmp td:first-child{font-weight:600;color:var(--navy);width:38%}
.cmp td:nth-child(2){color:var(--lar);width:24%}
.cmp td.ok{font-family:Montserrat;font-weight:700;color:var(--azul2)}
.cmp-n{display:block;font-size:17px;color:var(--mudo)}
.kpi.nao{border-top-color:var(--mudo)}.kpi.nao .kpi-n{color:var(--mudo)}
/* falas */
.falas{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:-20px}
.fala{border-top:6px solid var(--azul2);background:var(--fundo);border-radius:0 0 10px 10px;padding:22px 28px 30px;font-size:25px;line-height:1.45;color:var(--navy);min-height:300px;position:relative}
.fala .aspas{color:var(--claro);font-size:90px;height:52px}
.fala-tag{margin-top:16px;display:inline-block;font-family:Montserrat;font-weight:700;font-size:16px;color:var(--lar);background:var(--lar-f);border:1px solid var(--lar);border-radius:5px;padding:3px 10px}
/* marca: área de proteção = altura do "C" (brandbook p. 17) */
.logo-capa{position:absolute;right:128px;top:860px;height:76px}
.logo-fim{display:block;height:64px;margin-bottom:70px}
/* fim */
.fim{background:var(--navy)}
.fim .fotos.lado{position:absolute;right:0;top:0;bottom:0;width:760px;height:auto;display:flex}
.fim-txt{position:absolute;left:147px;top:250px}
.fim .kicker{color:var(--claro)}
.fim .nome{color:#fff;font-size:96px}
.fim .frase{color:#C9D3E6;font-size:28px;margin-top:40px}
`;

// ---------- montar e fotografar ----------
fs.mkdirSync(SAIDA, { recursive: true });
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Melhor Ideia 2026 · rascunho</title><style>${CSS}</style></head>
<body>${S.join('\n')}
<script>const n=+(location.hash.slice(1)||1);document.querySelectorAll('.slide')[n-1].classList.add('ativo');</script></body></html>`;
const arq = path.join(__dirname, 'deck.html');
fs.writeFileSync(arq, html);

const so = process.argv.slice(2).map(Number).filter(Boolean);
const lista = so.length ? so : S.map((_, i) => i + 1);
const perfil = path.join(require('os').tmpdir(), 'chrome-rascunho-relatorio');
for (const n of lista) {
  const png = path.join(SAIDA, `slide-${String(n).padStart(2, '0')}.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--user-data-dir=${perfil}`, '--window-size=1920,1080', '--virtual-time-budget=4000',
    `--screenshot=${png}`, `${pathToFileURL(arq).href}#${n}`], { stdio: 'ignore' });
  console.log('ok', path.basename(png));
}

// folha de contato
const folha = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#2b2f3a;width:1920px;font-family:Arial}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:20px}.g div{color:#cbd2e0;font-size:14px}.g img{width:100%;display:block;border:1px solid #555}</style></head>
<body><div class="g">${S.map((_, i) => `<div><img src="slide-${String(i + 1).padStart(2, '0')}.png">${i + 1}</div>`).join('')}</div></body></html>`;
fs.writeFileSync(path.join(SAIDA, 'folha.html'), folha);
const linhas = Math.ceil(S.length / 4);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  `--user-data-dir=${perfil}`, `--window-size=1920,${40 + linhas * 290}`, '--virtual-time-budget=4000',
  `--screenshot=${path.join(SAIDA, 'folha.png')}`, pathToFileURL(path.join(SAIDA, 'folha.html')).href], { stdio: 'ignore' });
console.log('ok folha.png');
