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
  megaCuritiba: url('relatorio/rascunho/midia/mega-curitiba.png'),
  megaItajai: url('relatorio/rascunho/midia/mega-itajai.png'),
  megaEsteio: url('relatorio/rascunho/midia/mega-esteio.png'),
  escopoForm: url('video/01-previa-20s/midia/real/E01-escopo-servicos-fotos.png'),
  escopoLista: url(CAP + 'C01-escopos-lista.png'),
  deckCapa: url(CAP + 'escopo-ppci-docs/D02-slides-y0.png'),
  deckFoto: url('video/01-previa-20s/midia/real/E03-slides-registro-foto.png'),
  planilha: url(CAP + 'escopo-ppci-docs/D90-planilha-fornecedor.png'),
};

const SECOES = ['O problema', 'A solução', 'Impacto', 'Qualidade e viabilidade', 'Próximos passos'];

// ---------- peças ----------
const trilha = (atual) => `<div class="trilha">${SECOES.map((s, i) =>
  `<div class="tr ${i + 1 === atual ? 'on' : i + 1 < atual ? 'feito' : ''}"><b>0${i + 1}</b> ${s}</div>`).join('')}</div>`;

const selo = (t) => `<div class="selo">⚠ PENDENTE · ${t}</div>`;

function conteudo(n, secao, titulo, sub, corpo, fonte, op = {}) {
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
  <div class="capa-txt">
    <div class="kicker">MELHOR IDEIA 2026 · RELATÓRIO FINAL</div>
    <div class="nome">Gestão de Contratações</div>
    <div class="frase">A contratação começa no escopo.</div>
  </div>
  <footer><span>Capital Realty · Facilities · 15/10/2026</span><span class="assin"><i></i>Começar melhor. Contratar melhor.</span></footer>
</section>`);

// 2. Revisar antes da versão final (alerta sempre ligado, como no orçamento)
S.push(`<section class="slide revisar">
  <div class="rev-tag">⚠ REVISAR ANTES DA VERSÃO FINAL</div>
  <h1>Faltam 4 itens; este slide some quando todos estiverem preenchidos</h1>
  <p class="sub">O que ainda não foi medido aparece aqui e no próprio slide, em vez de ficar só no registro.</p>
  <table class="pend">
    <tr><th>Item</th><th>Slide</th><th>O que falta</th><th>Quem</th><th>Até</th></tr>
    <tr><td><b>Tempo: PowerPoint × sistema</b></td><td>9</td><td>Cronometrar 2 ou 3 escopos, do primeiro campo ao PDF pronto</td><td>Guilherme</td><td>14/10</td></tr>
    <tr><td><b>Depoimentos de quem usa</b></td><td>11</td><td>2 ou 3 frases com nome, cargo e autorização para citar</td><td>Guilherme</td><td>14/10</td></tr>
    <tr><td><b>Escopos antigos em PowerPoint</b></td><td>6</td><td>2 ou 3 arquivos de Megas diferentes para o antes × depois</td><td>Guilherme</td><td>13/10</td></tr>
    <tr><td><b>Recontar o uso na base</b></td><td>10</td><td>Ler de novo a tela Escopos em produção no dia</td><td>Claude</td><td>14/10</td></tr>
  </table>
  <footer><span>Regra da casa: nenhum número sem método ao lado; nenhum ganho afirmado antes de medido.</span><span>Gestão de Contratações · Melhor Ideia 2026 · 2</span></footer>
</section>`);

// 3. Sumário
S.push(`<section class="slide sumario">
  <div class="kicker">SUMÁRIO</div>
  <h1 class="grande">A contratação começa no escopo</h1>
  <div class="sum-lista">${[
    ['O problema', 'O mesmo pedido gera respostas diferentes', '4–5'],
    ['A solução', 'Um cadastro, três documentos, um padrão', '6–8'],
    ['Impacto', 'Tempo, uso real e quem usa', '9–11'],
    ['Qualidade e viabilidade', 'Pedido vira versão; custo zero', '12–13'],
    ['Próximos passos', 'O que vem e o que pedimos', '14'],
  ].map(([t, d, p], i) => `<div class="sum-item"><div class="sum-n">0${i + 1}</div><div><div class="sum-t">${t}</div><div class="sum-d">${d}</div></div><div class="sum-p">slides ${p}</div></div>`).join('')}</div>
  <footer><span>Capital Realty · Facilities</span><span>Gestão de Contratações · Melhor Ideia 2026 · 3</span></footer>
</section>`);

// 4. A dor: casos reais da empresa, sem nomes nem valores
S.push(conteudo(4, 1,
  'Cada fornecedor entende o pedido de um jeito, porque o escopo deixa margem',
  'Três contratações reais da empresa: a resposta muda conforme quem lê o pedido',
  `<div class="tres">
    <div class="kpi"><div class="kpi-n">2 · 3 · 12</div><div class="kpi-t">visitas por ano, no mesmo item cotado como "1 verba"</div><div class="kpi-d">Manutenção de ar-condicionado: três proponentes, a mesma linha, entregas diferentes escondidas na observação. Um deles não emitia o laudo exigido em lei.</div></div>
    <div class="kpi"><div class="kpi-n">1 preço</div><div class="kpi-t">fechado para a mão de obra, sem abrir o que tem dentro</div><div class="kpi-d">Infraestrutura, passagem de cabos e instalação do painel ficaram sem valor. Não dá para saber o que foi considerado.</div></div>
    <div class="kpi"><div class="kpi-n">3 unidades</div><div class="kpi-t">VB, KG e M³ para o mesmo serviço, conforme o proponente</div><div class="kpi-d">Obra de fundação: cada empresa cotou na sua própria unidade. Comparar linha a linha deixa de ser justo.</div></div>
  </div>
  <div class="conclusao">Avaliar o fornecedor depois não corrige um pedido mal feito. <b>O problema nasce no escopo.</b></div>`,
  'Fonte: documentos reais de contratação da empresa analisados em 05/09/2026 (BASE_DE_CONHECIMENTO.md §8.4, §16.3 e §9.2). Sem nomes de fornecedores nem valores.'));
// 5. A ponte com a ideia aprovada
S.push(conteudo(5, 1,
  'O comitê pediu avaliar fornecedores; o campo mostrou que o problema nasce no escopo',
  'A ideia não foi trocada: cresceu na direção da causa',
  `<div class="linha-tempo">${[
    ['19/05/2026', 'O comitê aprova', 'Capital Fornecedores: avaliação de prestadores, ligada à decisão de compra.'],
    ['set/2026', 'A avaliação é construída', 'Cinco critérios com os pesos da ata e o gatilho depois da ordem de compra.'],
    ['05/09/2026', 'O campo mostra a causa', '28 documentos reais: as respostas divergem porque o escopo deixa margem.'],
    ['out/2026', 'O escopo entra em produção', 'Começa pelos 3 Megas, com revisões registradas e escopo base, para servir à empresa toda.'],
  ].map(([d, t, x], i) => `<div class="lt"><div class="lt-bola">${i + 1}</div><div class="lt-d">${d}</div><div class="lt-t">${t}</div><div class="lt-x">${x}</div></div>`).join('')}</div>
  <div class="caixa-azul"><b>Fornecedor e preço vão para o Fluig/RM,</b> onde o cadastro oficial já mora. Decisão de sustentabilidade: a empresa não mantém duas bases de fornecedores. <span class="prox">Próximo passo, ainda não integrado.</span></div>`,
  'Fontes: e-mail do comitê de 19/05/2026 (RESPOSTA_AO_COMITE.md), HISTORICO.md 05/09 e 11/10/2026.'));

// 6. A solução
S.push(conteudo(6, 2,
  'Um cadastro gera o deck, o PDF e a planilha do fornecedor',
  'Quem monta o escopo preenche uma vez; os três documentos saem coerentes, com a mesma EAP e a mesma revisão',
  `<div class="fluxo">
    <div class="fx-col"><div class="fx-rot">1 · O CADASTRO</div>${recorte(IMG.escopoForm, 1920, [270, 60, 1360, 940], 560)}</div>
    <div class="fx-seta">→</div>
    <div class="fx-col"><div class="fx-rot">2 · O DECK E O PDF</div>${recorte(IMG.deckCapa, 1920, [473, 20, 960, 330], 520)}${recorte(IMG.deckFoto, 1920, [473, 180, 960, 470], 520, 'mt')}</div>
    <div class="fx-seta">→</div>
    <div class="fx-col"><div class="fx-rot">3 · A PLANILHA DO FORNECEDOR</div>${recorte(IMG.planilha, 1920, [44, 160, 1566, 780], 420)}</div>
  </div>`,
  'Telas reais do app em produção: escopo "PPCI Prédio de Apoio Mega Itajaí", R9 de 22/09/2026. Capturas de 11/10/2026, sem o contato da responsável.'));

// 7. Antes × depois (pendente: escopos antigos)
S.push(conteudo(7, 2,
  'Um padrão de escopo para a empresa toda',
  'Antes, cada área montava o escopo do seu jeito no PowerPoint; agora todos saem do mesmo cadastro, com a mesma estrutura',
  `<div class="antes-depois">
    <div class="ad-lado"><div class="fx-rot">ANTES · POWERPOINT</div><div class="ad-antes">${['Curitiba', 'Itajaí', 'Esteio'].map((m) =>
      `<div class="vazio">Escopo antigo<br><b>Mega ${m}</b><br><span>aguardando arquivo</span></div>`).join('')}</div></div>
    <div class="ad-seta">→</div>
    <div class="ad-lado"><div class="fx-rot">DEPOIS · O PADRÃO</div>${recorte(IMG.deckCapa, 1920, [473, 20, 960, 330], 700)}
      <ul class="lista"><li>Mesma capa, mesma ordem e mesma escala de texto</li><li>Fotos junto do serviço que descrevem</li><li>Revisão numerada pelo sistema, com histórico</li></ul></div>
  </div>`,
  'Os escopos antigos entram quando os arquivos chegarem. O depois é o deck real do PPCI de Itajaí (R9).', { selo: 'escopos antigos' }));

// 8. Escopo base
S.push(conteudo(8, 2,
  'O próximo escopo já começa pronto',
  '"Usar como base" parte da última revisão emitida: o que é do serviço vem pronto; o que é do lugar e da data fica em branco',
  `<div class="base">
    <div class="base-col"><div class="kpi-n">9</div><div class="kpi-t">blocos vêm prontos</div>
      <div class="chips ok">${['Grupos de serviço', 'EAP', 'Objetivo', 'Inclusões', 'Exclusões', 'Aceite', 'Considerações', 'Visita técnica', 'Aviso ao proponente'].map((c) => `<span>${c}</span>`).join('')}</div>
      <div class="kpi-t mt2">ficam em branco</div>
      <div class="chips">${['Título', 'Mega', 'Endereço', 'Imagens', 'Fotos', 'Vistoria', 'Prazos', 'Contato', 'Armazém', 'Módulos'].map((c) => `<span>${c}</span>`).join('')}</div>
      <p class="nota">Cada escopo novo guarda de qual partiu ("partiu de…"), e o original mostra quantas vezes serviu de base.</p></div>
    <div class="base-tela">${recorte(IMG.escopoLista, 1920, [254, 224, 1400, 820], 820)}</div>
  </div>`,
  'Fonte: código do app (Escopos.gs, v76 de 11/10/2026) e HISTORICO.md. Tela real de produção, 11/10/2026.'));

// 9. Tempo (pendente)
S.push(conteudo(9, 3,
  'Montar um escopo: <span class="lacuna">__</span> min no sistema contra <span class="lacuna">__</span> no PowerPoint',
  'A medição é com gente e cronômetro, não por estimativa',
  `<div class="tempo">
    <div class="t-card"><div class="fx-rot">POWERPOINT</div><div class="t-n lacuna">__ min</div><div class="kpi-d">mediana de n escopos</div></div>
    <div class="t-card azul"><div class="fx-rot">SISTEMA</div><div class="t-n lacuna">__ min</div><div class="kpi-d">mediana de n escopos</div></div>
    <div class="metodo"><div class="fx-rot">MÉTODO</div><ul class="lista">
      <li>2 ou 3 escopos reais, de Megas diferentes</li>
      <li>Cronômetro do primeiro campo ao PDF pronto</li>
      <li>Registro de quem montou e se já conhecia o escopo</li>
      <li>Tabela crua no anexo; apresentado como amostra pequena</li></ul></div>
  </div>`,
  'Medição até 14/10/2026. Não usar estimativas antigas (~50 → 15 min, contagem de cliques): nunca foram cronometradas.', { selo: 'medição' }));

// 10. Uso real
S.push(conteudo(10, 3,
  'O escopo já está em uso: começou pelos três Megas',
  'Escopos emitidos para fornecedor, não protótipo; o mesmo padrão serve a qualquer área que contrata',
  `<div class="tres">
    <div class="kpi"><div class="kpi-n">6</div><div class="kpi-t">escopos reais na base</div><div class="kpi-d">Curitiba, Itajaí e Esteio. Mais 2 de teste, que não contam.</div></div>
    <div class="kpi"><div class="kpi-n">R9</div><div class="kpi-t">revisões do PPCI de Itajaí</div><div class="kpi-d">6 revisões geradas pelo sistema (R4 a R9), cada uma com deck, PDF e planilha.</div></div>
    <div class="kpi"><div class="kpi-n">10 dias</div><div class="kpi-t">da v71 à v77, em produção</div><div class="kpi-d">As mudanças vieram de pedidos de quem usa (slide 12).</div></div>
  </div>`,
  'Leitura da tela Escopos em produção em 11/10/2026. Recontar em 14/10 (escopos por Mega, revisões, usuários distintos, primeira e última data).', { selo: 'recontar 14/10' }));

// 11. Depoimentos (pendente)
S.push(conteudo(11, 3,
  'Quem usa diz',
  'O critério de Impacto cita a satisfação de colaboradores: aqui ela é dita por quem monta escopo',
  `<div class="tres">${[1, 2, 3].map((i) => `<div class="citacao"><div class="aspas">“</div><div class="lacuna-txt">Depoimento ${i}: uma frase sobre o que mudou ao montar escopo</div><div class="quem">Nome · cargo · Mega</div></div>`).join('')}</div>`,
  'Depoimentos com autorização para citar, coletados até 14/10/2026.', { selo: 'depoimentos' }));

// 12. Qualidade: pedido vira versão
S.push(conteudo(12, 4,
  'Pedido de quem usa vira versão publicada em dias',
  'Cada mudança passa por teste antes de ir para produção e pode voltar à versão anterior',
  `<div class="versoes">
    <div class="vs"><div class="vs-d">02/10</div><div class="vs-p"><b>Usuários:</b> "cada slide sai com fonte e cor diferentes", "fica tudo num canto", "a foto precisa estar junto da descrição"</div><div class="vs-v">v71 · v72 · v73<br><span>no mesmo dia</span></div></div>
    <div class="vs"><div class="vs-d">05/10</div><div class="vs-p"><b>Jonatas:</b> disclaimer padrão do Facilities no aviso ao proponente; classificar e reaproveitar escopos como base</div><div class="vs-v">v75 · v76<br><span>em 11/10</span></div></div>
    <div class="vs"><div class="vs-d">11/10</div><div class="vs-p"><b>Foco da entrega:</b> o app abre direto no escopo; preço e fornecedor ficam para o Fluig/RM</div><div class="vs-v">v77<br><span>no mesmo dia</span></div></div>
  </div>
  <div class="tres mt3">
    <div class="mini"><b>34</b> suítes de teste rodam antes de cada publicação</div>
    <div class="mini"><b>1 passo</b> para voltar à versão anterior, no mesmo link</div>
    <div class="mini"><b>Medido antes de corrigir:</b> o corpo saía em 7 tamanhos de fonte; passou a 1</div>
  </div>`,
  'Fontes: HISTORICO.md (02/10 e 11/10/2026), package.json (npm test). Os pedidos estão com as palavras de quem pediu.'));

// 13. Viabilidade
S.push(conteudo(13, 4,
  'Custo zero de infraestrutura e nenhum sistema paralelo',
  'Roda no que a empresa já tem e se mantém sem depender de uma pessoa só',
  `<div class="quatro">${[
    ['Infraestrutura', 'Google Workspace já contratado: Apps Script, Slides, Planilhas e Drive. Nenhuma licença nova.'],
    ['Arquivos', 'Deck, PDF e planilha ficam no Drive compartilhado do Facilities, com as revisões anteriores.'],
    ['Sem base duplicada', 'Fornecedor e preço vão para o Fluig/RM. O app cuida do escopo, que hoje não tem dono em sistema nenhum.'],
    ['Quem mantém', 'Documentação, testes e histórico no repositório. Segunda pessoa para publicar: <span class="lacuna-txt">a definir</span>.'],
  ].map(([t, x]) => `<div class="card"><div class="card-t">${t}</div><div class="card-x">${x}</div></div>`).join('')}</div>`,
  'O modo escopo é uma chave: preço, equalização e fornecedores continuam no código e voltam sem nova implantação.'));

// 14. Próximos passos
S.push(conteudo(14, 5,
  'Próximos passos e o que pedimos ao comitê',
  'Até a apresentação de novembro, com mais um mês de uso para mostrar',
  `<div class="dois">
    <div><div class="fx-rot">PRÓXIMOS PASSOS</div><ol class="passos">
      <li><b>Foto de celular:</b> reduzir no navegador; hoje foto acima de 5 MB ou HEIC é recusada</li>
      <li><b>Prévia</b> do deck antes de emitir uma revisão</li>
      <li><b>Integração com o Fluig/RM:</b> fornecedor e preço a partir do cadastro oficial</li>
      <li><b>Convite ao fornecedor</b> com o escopo e a planilha, e retorno pelo sistema</li></ol></div>
    <div class="pedido"><div class="fx-rot">O QUE PEDIMOS</div><ol class="passos">
      <li>Adotar o escopo do sistema como <b>padrão da empresa toda</b>, em toda área que contrata serviço</li>
      <li>Apoio da TI para a <b>integração com o Fluig/RM</b></li>
      <li>Uma <b>segunda pessoa</b> para a sustentação</li></ol></div>
  </div>`,
  'Proposta; os pedidos dependem da decisão do comitê.'));

// 15. Encerramento
S.push(`<section class="slide fim">
  <div class="fim-txt"><div class="kicker">GESTÃO DE CONTRATAÇÕES</div><div class="nome">Começar melhor.<br>Contratar melhor.</div>
  <div class="frase">Capital Realty · Facilities · Melhor Ideia 2026</div></div>
  <div class="fotos lado"><div style="background-image:url('${IMG.megaItajai}')"></div></div>
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
h1{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:48px;line-height:1.15;margin-top:128px;max-width:1500px;letter-spacing:-.5px}
.sub{font-size:26px;margin-top:16px;color:var(--txt);max-width:1500px}
.corpo{position:absolute;left:128px;right:128px;top:390px;bottom:120px}
footer{position:absolute;left:128px;right:128px;bottom:40px;border-top:2px solid var(--linha);padding-top:22px;display:flex;justify-content:space-between;font-size:18px;color:var(--mudo)}
footer span:first-child{max-width:1250px}
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
.lt{position:relative}
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
.card-t{font-family:Montserrat;font-weight:700;color:var(--navy);font-size:28px}
.card-x{font-size:23px;line-height:1.5;margin-top:18px}
.passos{padding-left:36px;font-size:25px;line-height:1.5}
.passos li{margin-bottom:20px}
.passos li::marker{font-family:Montserrat;font-weight:800;color:var(--azul2)}
.pedido{background:var(--navy);color:#fff;border-radius:12px;padding:36px}
.pedido .fx-rot{color:#9CC7FF}
.pedido b{color:#fff}
/* fim */
.fim{background:var(--navy)}
.fim .fotos.lado{position:absolute;right:0;top:0;bottom:0;width:760px;height:auto;display:flex}
.fim-txt{position:absolute;left:147px;top:330px}
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
