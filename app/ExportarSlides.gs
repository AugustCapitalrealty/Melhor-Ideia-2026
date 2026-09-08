/**
 * Segunda via do documento de equalização, desenhada no Google Slides.
 *
 * A via oficial continua sendo a planilha (`Exportar.gs`). Esta existe
 * porque no Slides a gente desenha, em vez de negociar com uma grade:
 *
 *  - a logo entra no tamanho que a gente quiser. Na planilha ela esbarra
 *    no teto de 1 milhão de pixels do `insertImage`, que foi o que
 *    quebrou a marca da Capital Realty por três tentativas;
 *  - não existe célula para mesclar. VALOR TOTAL e a variação ficam onde
 *    devem ficar porque são desenhados ali;
 *  - a marca cotada vira um selo de verdade, centralizado, e não um
 *    símbolo dentro de uma célula.
 *
 * E duas limitações que valem estar escritas aqui, porque mudam o que dá
 * para prometer:
 *
 *  1. **O tamanho da página é somente leitura na API.** Não dá para pedir
 *     A4 por código. Sem template, sai no padrão 16:9 (25,4 × 14,3 cm),
 *     que imprime em A4 paisagem com tarja em cima e embaixo. Para sair
 *     em A4 de verdade, basta criar UMA apresentação à mão com
 *     Arquivo > Configuração da página > Personalizado 29,7 × 21 cm e pôr
 *     o id dela em EX_TEMPLATE_ID: o gerador copia e desenha dentro.
 *
 *  2. **Não existe escrita em lote.** A planilha grava a grade toda num
 *     `setValues`; aqui cada elemento é uma chamada. Por isso a grade é
 *     paginada por número de linhas E de proponentes, e existe um teto
 *     declarado em EX_MAX_ELEMENTOS: acima dele o gerador para e diz,
 *     em vez de estourar os 6 minutos do Apps Script no meio.
 */

// As cores e a tipografia são as mesmas do material do Conselho (DS_CN,
// em Apresentacao_Conselho.gs). Um documento e uma apresentação da mesma
// casa não podem ter duas paletas — e o Apps Script compila tudo num
// namespace só, então é reuso direto, sem import.

/** Vazio = apresentação 16:9 nova. Com id = copia um template A4. */
const EX_TEMPLATE_ID = '';

const EX_MX = 24;          // margem lateral
const EX_TOPO = 62;        // primeira linha útil, abaixo do cabeçalho
const EX_RODAPE = 26;      // altura reservada no pé da página

/** Teto de segurança: acima disto o Apps Script não termina em 6 min. */
const EX_MAX_ELEMENTOS = 2800;

/** Colunas fixas da esquerda, em pontos. */
const EX_COL = { codigo: 32, qtd: 32, un: 28, descMin: 130 };

/** Alturas. */
const EX_H = { cabGrade: 26, linha: 17, secao: 20 };


// ==========================================
// PONTO DE ENTRADA
// ==========================================

/**
 * Gera a equalização como apresentação e devolve as duas URLs.
 *
 * Consome exatamente o mesmo modelo da via oficial — cfMapaEqualizacao_ —
 * de propósito: se as duas vias montassem os dados por conta própria,
 * elas divergiriam, e um documento contradizendo o outro na mesa da
 * Diretoria é pior que não ter a segunda via.
 */
function cfExportarEqualizacaoSlides_(idEq) {
  const m = cfMapaEqualizacao_(idEq);
  const eq = m.equalizacao;
  const props = m.proponentes;

  const orcamento = _exOrcamento_(m);
  if (orcamento.elementos > EX_MAX_ELEMENTOS) {
    throw new Error(
      'Esta equalização é grande demais para a via em Slides: ' +
      orcamento.itens + ' itens × ' + props.length + ' proponentes dariam cerca de ' +
      orcamento.elementos + ' elementos, e o Apps Script não termina de desenhar ' +
      'isso nos 6 minutos que tem. Use a exportação em planilha, que grava a ' +
      'grade inteira de uma vez.');
  }

  const nome = [eq.id, eq.empreendimento, eq.projeto].filter(Boolean).join(' — ');
  const deck = _exNovoDeck_(nome);
  const W = deck.getPageWidth();
  const H = deck.getPageHeight();

  const ctx = {
    deck: deck, W: W, H: H, m: m, eq: eq, props: props,
    pagina: 0, titulo: nome
  };

  // Um try/catch POR PÁGINA. Sem isso a primeira falha aborta o resto e o
  // resultado é um documento pela metade que não diz onde parou — e num
  // documento que vai à Diretoria isso é pior que o erro em si.
  const paginas = [].concat(
    [['Capa e decisão', _exPaginaCapa_]],
    [['Informações obrigatórias', _exPaginaCadastro_]],
    _exPaginasDaGrade_(ctx),
    [['Totais e legenda', _exPaginaTotais_]],
    [['Negociação e ressalvas', _exPaginaNegociacao_]],
    [['Responsáveis', _exPaginaResponsaveis_]]
  );

  paginas.forEach(function (p) {
    try {
      p[1](ctx, p[2]);
    } catch (e) {
      _exPaginaFalha_(ctx, p[0], e);
      Logger.log('FALHA na página "' + p[0] + '": ' + e.message);
    }
  });

  deck.saveAndClose();

  const arquivo = _exPdfDoDeck_(deck.getId(), nome);
  return {
    slides: 'https://docs.google.com/presentation/d/' + deck.getId() + '/edit',
    pdf: arquivo.getUrl(),
    paginas: paginas.length
  };
}

/**
 * Atalho para rodar do editor do Apps Script, sem passar pela tela.
 *
 * Pega a equalização mais recente e desenha as duas vias, para comparar
 * lado a lado — que é a única forma de decidir qual vai à Diretoria.
 * Os links saem no registro de execução (Ver > Registros).
 */
function compararAsDuasVias() {
  const eqs = cfLerTudo_('Equalizacoes');
  if (!eqs.length) {
    Logger.log('Não há equalização na base. Rode setupBaseDeDados() e importe uma.');
    return;
  }
  const alvo = eqs[eqs.length - 1];
  Logger.log('Equalização: ' + alvo.ID + '  (' + (alvo.ID_EMPREENDIMENTO || '') + ')');

  const t0 = new Date().getTime();
  const planilha = cfExportarEqualizacao_(alvo.ID);
  const t1 = new Date().getTime();
  Logger.log('VIA OFICIAL (planilha) — ' + ((t1 - t0) / 1000).toFixed(1) + 's');
  Logger.log('  planilha: ' + planilha.planilha);
  Logger.log('  PDF:      ' + planilha.pdf);

  const slides = cfExportarEqualizacaoSlides_(alvo.ID);
  const t2 = new Date().getTime();
  Logger.log('VIA EM SLIDES — ' + ((t2 - t1) / 1000).toFixed(1) + 's, ' +
    slides.paginas + ' páginas');
  Logger.log('  apresentação: ' + slides.slides);
  Logger.log('  PDF:          ' + slides.pdf);

  // O tempo é metade da decisão. Se a via desenhada levar minutos numa
  // equalização comum, ela não serve para o dia a dia por mais bonita
  // que fique — e é melhor descobrir isso agora que na frente do comitê.
  Logger.log('Diferença de tempo: ' + (((t2 - t1) - (t1 - t0)) / 1000).toFixed(1) + 's');
}

/**
 * Quantos elementos o desenho vai custar, antes de começar a desenhar.
 *
 * É estimativa, e serve para uma coisa só: recusar cedo, com uma
 * mensagem que diz o que fazer, em vez de morrer no minuto seis com um
 * documento parcial no Drive.
 */
function _exOrcamento_(m) {
  const itens = (m.linhas || []).length;
  const n = (m.proponentes || []).length;
  // Por linha: fundo + código + descrição + qtd + unidade + 2 por proponente.
  const porLinha = 5 + n * 2;
  // As páginas fixas custam umas 220 formas somadas.
  return { itens: itens, elementos: 220 + itens * porLinha, porLinha: porLinha };
}

function _exNovoDeck_(nome) {
  if (EX_TEMPLATE_ID) {
    // O template existe só para carregar o tamanho de página A4, que a
    // API não deixa definir. Copiamos e limpamos os slides do modelo.
    const copia = DriveApp.getFileById(EX_TEMPLATE_ID).makeCopy(nome);
    const deck = SlidesApp.openById(copia.getId());
    deck.getSlides().forEach(function (s) { s.remove(); });
    return deck;
  }
  const deck = SlidesApp.create(nome);
  const primeiros = deck.getSlides();
  if (primeiros.length === 1) primeiros[0].remove();
  return deck;
}

/** O PDF vai para a mesma pasta da via oficial, com o mesmo critério. */
function _exPdfDoDeck_(deckId, nome) {
  const blob = DriveApp.getFileById(deckId).getAs('application/pdf')
    .setName(nome + ' (Slides).pdf');

  // Mesma guarda da via em planilha: um PDF praticamente vazio é uma
  // falha silenciosa com cara de sucesso.
  if (blob.getBytes().length < 3000) {
    throw new Error('O PDF saiu praticamente vazio (' + blob.getBytes().length +
      ' bytes). A apresentação pode não ter terminado de gravar.');
  }
  try {
    return DriveApp.getFolderById(CF_PASTA_ID).createFile(blob);
  } catch (erro) {
    return DriveApp.createFile(blob);
  }
}


// ==========================================
// ESTRUTURA DA PÁGINA
// ==========================================

function _exNovaPagina_(ctx, titulo, subtitulo) {
  const slide = ctx.deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(DS_CN.colors.white);
  ctx.pagina++;

  // Faixa superior: barra de acento, título à esquerda, identificador à
  // direita. O identificador em TODA página é de propósito — folha solta
  // de um documento de conferência precisa dizer de onde veio.
  const bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, ctx.W, 3);
  bar.getFill().setSolidFill(DS_CN.colors.brandMed);
  bar.getBorder().setTransparent();

  _cnUmaLinha_(slide, EX_MX, 16, ctx.W * 0.55, 18, titulo,
    { fs: 12, fsMin: 8, bold: true, cor: DS_CN.colors.brandDark, align: 'L', folga: 6 });

  if (subtitulo) {
    _cnUmaLinha_(slide, EX_MX, 34, ctx.W * 0.55, 13, subtitulo,
      { fs: 7.5, fsMin: 6, cor: DS_CN.colors.textMuted,
        fonte: DS_CN.typography.body, align: 'L', folga: 6 });
  }

  const linha = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
    EX_MX, EX_TOPO - 10, ctx.W - EX_MX * 2, 0.75);
  linha.getFill().setSolidFill(DS_CN.colors.line);
  linha.getBorder().setTransparent();

  _exRodape_(ctx, slide);
  return slide;
}

function _exRodape_(ctx, slide) {
  const y = ctx.H - EX_RODAPE;
  const linha = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
    EX_MX, y - 4, ctx.W - EX_MX * 2, 0.75);
  linha.getFill().setSolidFill(DS_CN.colors.line);
  linha.getBorder().setTransparent();

  _cnUmaLinha_(slide, EX_MX, y, ctx.W * 0.6, 14, ctx.titulo,
    { fs: 6.5, fsMin: 5.5, cor: DS_CN.colors.textMuted,
      fonte: DS_CN.typography.body, align: 'L', folga: 6 });

  _cnUmaLinha_(slide, ctx.W - EX_MX - 120, y, 120, 14,
    'Página ' + ctx.pagina,
    { fs: 6.5, fsMin: 5.5, cor: DS_CN.colors.textMuted,
      fonte: DS_CN.typography.body, folga: 6 });
}

/**
 * O aviso de falha usa só insertShape e setText.
 *
 * Nada de helper: quando uma página quebra, o que costuma estar faltando
 * é justamente o helper. Um aviso que depende do que quebrou não aparece.
 */
function _exPaginaFalha_(ctx, nome, erro) {
  const slide = ctx.deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  const cx = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
    40, 60, ctx.W - 80, 90);
  cx.getFill().setSolidFill(DS_CN.colors.redBg);
  cx.getBorder().setTransparent();
  cx.getText().setText('Não consegui desenhar "' + nome + '".\n' +
    String(erro && erro.message ? erro.message : erro) +
    '\n\nO restante do documento foi gerado. A via oficial em planilha ' +
    'não é afetada por esta falha.');
}


// ==========================================
// PÁGINA 1 — A DECISÃO
// ==========================================

function _exPaginaCapa_(ctx) {
  const slide = _exNovaPagina_(ctx, ctx.eq.id || 'Equalização',
    [ctx.eq.empreendimento, ctx.eq.projeto].filter(Boolean).join(' · '));

  const eq = ctx.eq;
  const props = ctx.props;
  const vencedora = props.filter(function (p) { return p.vencedora; })[0] || null;

  // A recomendação em cima, do tamanho que merece. Quem homologa não lê
  // a equalização para descobrir a resposta: lê para conferir.
  const larg = ctx.W - EX_MX * 2;
  const y = EX_TOPO + 6;

  if (vencedora) {
    _cnKPI_(slide, EX_MX, y, larg * 0.46, 76,
      'PROPOSTA RECOMENDADA',
      cfValorTexto_(vencedora.total),
      DS_CN.colors.brandMed,
      vencedora.nome,
      DS_CN.colors.brandSoft);
  } else {
    _cnKPI_(slide, EX_MX, y, larg * 0.46, 76,
      'PROPOSTA RECOMENDADA', 'em aberto', DS_CN.colors.textMuted,
      'nenhum proponente marcado como vencedor', DS_CN.colors.bgSlide);
  }

  // Concorrência e economia entre a maior e a menor proposta. Não é
  // saving: saving é contra a proposta inicial do vencedor, e vive no
  // painel. Aqui é a dispersão da cotação, e o rótulo diz isso.
  const totais = props.map(function (p) { return p.total; })
    .filter(function (v) { return v !== null && v !== undefined && v > 0; });

  const x2 = EX_MX + larg * 0.48;
  _cnKPI_(slide, x2, y, larg * 0.24, 76, 'PROPOSTAS COMPARADAS',
    String(props.length), DS_CN.colors.brandDark,
    totais.length < props.length
      ? (props.length - totais.length) + ' sem valor declarado' : 'todas com valor',
    DS_CN.colors.white);

  const x3 = EX_MX + larg * 0.74;
  if (totais.length >= 2) {
    const maior = Math.max.apply(null, totais);
    const menor = Math.min.apply(null, totais);
    _cnKPI_(slide, x3, y, larg * 0.26, 76, 'DISPERSÃO DA COTAÇÃO',
      cfPct_((maior - menor) / maior), DS_CN.colors.greenInk,
      'entre a maior e a menor proposta', DS_CN.colors.white);
  } else {
    _cnKPI_(slide, x3, y, larg * 0.26, 76, 'DISPERSÃO DA COTAÇÃO',
      '—', DS_CN.colors.textMuted,
      'precisa de duas propostas com valor', DS_CN.colors.white);
  }

  // Os proponentes, com o selo de IQF de cada um.
  const yProp = y + 92;
  _cnUmaLinha_(slide, EX_MX, yProp, 300, 14, 'PROPONENTES',
    { fs: 8, fsMin: 6.5, bold: true, cor: DS_CN.colors.textMuted, align: 'L', folga: 6 });

  const alturaCartao = 44;
  const gap = 8;
  const disponivel = ctx.H - EX_RODAPE - 16 - (yProp + 20);
  const cabem = Math.max(1, Math.floor((disponivel + gap) / (alturaCartao + gap)));

  props.slice(0, cabem).forEach(function (p, i) {
    const cy = yProp + 20 + i * (alturaCartao + gap);
    _cnCartao_(slide, EX_MX, cy, larg, alturaCartao,
      p.vencedora ? DS_CN.colors.greenSolid : DS_CN.colors.line,
      p.vencedora ? DS_CN.colors.greenBg : DS_CN.colors.white);

    _cnUmaLinha_(slide, EX_MX + 16, cy + 8, larg * 0.42, 16, p.nome,
      { fs: 10, fsMin: 7, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 6 });
    _cnUmaLinha_(slide, EX_MX + 16, cy + 24, larg * 0.42, 12,
      cfCnpjFormatado_(p.cnpj), { fs: 7, fsMin: 6, cor: DS_CN.colors.textMuted,
        fonte: DS_CN.typography.body, align: 'L', folga: 6 });

    _exSeloIqf_(slide, EX_MX + larg * 0.46, cy + 13, p.iqf);

    _cnUmaLinha_(slide, EX_MX + larg - 190, cy + 12, 174, 20,
      p.total !== null && p.total !== undefined ? cfValorTexto_(p.total) : 'sem valor declarado',
      { fs: 13, fsMin: 8, bold: true,
        cor: p.vencedora ? DS_CN.colors.greenInk : DS_CN.colors.textMain,
        align: 'L', folga: 6 });
  });

  if (props.length > cabem) {
    _cnUmaLinha_(slide, EX_MX, ctx.H - EX_RODAPE - 16, larg, 12,
      'e mais ' + (props.length - cabem) + ' proponente(s) — todos na grade comparativa',
      { fs: 7, fsMin: 6, italic: true, cor: DS_CN.colors.textMuted,
        fonte: DS_CN.typography.body, align: 'L', folga: 6 });
  }
}

/**
 * O selo de IQF, e o silêncio quando não há nota.
 *
 * Fornecedor sem avaliação não vira "0" nem some: vira "sem nota". Zero
 * seria inventar desempenho ruim para quem nunca foi avaliado, que é o
 * mesmo defeito que a taxa de vitória tinha quando exibia 0% sem disputa.
 */
function _exSeloIqf_(slide, x, y, iqf) {
  if (!iqf || iqf.nota === null || iqf.nota === undefined) {
    _cnPill_(slide, x, y, 92, 18, 'IQF sem nota',
      DS_CN.colors.bgSlide, DS_CN.colors.textMuted, 7);
    return;
  }
  const classe = iqf.classe || '';
  const cores = classe === 'A' ? [DS_CN.colors.greenBg, DS_CN.colors.greenInk]
              : classe === 'C' ? [DS_CN.colors.redBg, DS_CN.colors.redInk]
              : [DS_CN.colors.amberBg, DS_CN.colors.amberInk];

  const texto = 'IQF ' + iqf.nota + (classe ? ' · classe ' + classe : '') +
    (iqf.preliminar ? ' (prelim.)' : '');
  _cnPill_(slide, x, y, 132, 18, texto, cores[0], cores[1], 7);
}


// ==========================================
// PÁGINA 2 — CADASTRO
// ==========================================

function _exPaginaCadastro_(ctx) {
  const slide = _exNovaPagina_(ctx, 'Informações obrigatórias',
    'os dados da compra e de cada proponente, como no documento oficial');

  const eq = ctx.eq;
  const larg = ctx.W - EX_MX * 2;
  const empresa = cfEmpresaDoMega_(eq.empreendimento).nome;

  const daCompra = [
    ['Identificador', eq.id],
    ['Empresa contratante', empresa],
    ['Empreendimento', eq.empreendimento],
    ['Projeto', eq.projeto],
    ['Grupo Centro de Custo', eq.grupoCentroCusto],
    ['Área', eq.area],
    ['Data da equalização', eq.data],
    ['Situação', cfStatusTexto_(eq.status)]
  ];

  const wEsq = larg * 0.33;
  _cnPainel_(slide, EX_MX, EX_TOPO, wEsq, 8 + daCompra.length * 22 + 26,
    'A COMPRA', DS_CN.colors.brandMed);

  daCompra.forEach(function (c, i) {
    const cy = EX_TOPO + 30 + i * 22;
    _cnUmaLinha_(slide, EX_MX + 14, cy, wEsq * 0.5, 12, c[0],
      { fs: 7, fsMin: 6, cor: DS_CN.colors.textMuted,
        fonte: DS_CN.typography.body, align: 'L', folga: 5 });
    _cnUmaLinha_(slide, EX_MX + 14, cy + 10, wEsq - 28, 13, c[1] || '—',
      { fs: 8.5, fsMin: 6.5, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 5 });
  });

  // Os proponentes, um cartão cada, lado a lado até caber.
  const xDir = EX_MX + wEsq + 12;
  const wDir = larg - wEsq - 12;
  const porLinha = Math.min(ctx.props.length, 3) || 1;
  const wCard = (wDir - (porLinha - 1) * 8) / porLinha;

  ctx.props.forEach(function (p, i) {
    const col = i % porLinha;
    const lin = Math.floor(i / porLinha);
    const cx = xDir + col * (wCard + 8);
    const cy = EX_TOPO + lin * 126;
    if (cy + 118 > ctx.H - EX_RODAPE) return;   // não invade o rodapé

    _cnCartao_(slide, cx, cy, wCard, 118,
      p.vencedora ? DS_CN.colors.greenSolid : DS_CN.colors.brandLight,
      DS_CN.colors.white);

    _cnUmaLinha_(slide, cx + 14, cy + 10, wCard - 28, 15, p.nome,
      { fs: 9, fsMin: 6.5, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 5 });

    const campos = [
      ['CNPJ', cfCnpjFormatado_(p.cnpj)],
      ['Contato', p.contato],
      ['Telefone', p.telefone],
      ['E-mail', p.email],
      ['Cidade/UF', [p.cidade, p.uf].filter(Boolean).join('/')],
      ['Proposta nº', p.numero]
    ];
    campos.forEach(function (c, j) {
      const fy = cy + 28 + j * 14;
      _cnUmaLinha_(slide, cx + 14, fy, wCard * 0.32, 12, c[0],
        { fs: 6.5, fsMin: 5.5, cor: DS_CN.colors.textMuted,
          fonte: DS_CN.typography.body, align: 'L', folga: 4 });
      _cnUmaLinha_(slide, cx + 14 + wCard * 0.33, fy, wCard * 0.63, 12, c[1] || '—',
        { fs: 7, fsMin: 5.5, cor: DS_CN.colors.textBody,
          fonte: DS_CN.typography.body, align: 'L', folga: 4 });
    });
  });
}


// ==========================================
// A GRADE COMPARATIVA, PAGINADA
// ==========================================

/**
 * Quantas páginas a grade vai ocupar, e o que vai em cada uma.
 *
 * O Slides não reflui: a página tem tamanho fixo e nada empurra nada.
 * Então a paginação é nossa, nos DOIS eixos — itens demais estouram para
 * baixo, proponentes demais estouram para o lado. O cabeçalho da grade se
 * repete em toda página, que é o que a planilha ganha de graça no PDF.
 */
function _exPaginasDaGrade_(ctx) {
  const itens = ctx.m.linhas || [];
  if (!itens.length) return [];

  // Quantos proponentes cabem: o que sobra depois das colunas fixas e de
  // uma largura mínima legível para a descrição.
  const larg = ctx.W - EX_MX * 2;
  const fixas = EX_COL.codigo + EX_COL.qtd + EX_COL.un + EX_COL.descMin;
  const porProponente = 92;
  const cabemProp = Math.max(1, Math.floor((larg - fixas) / porProponente));

  // Quantas linhas cabem na altura útil.
  const util = ctx.H - EX_RODAPE - 10 - (EX_TOPO + EX_H.cabGrade);
  const cabemLinhas = Math.max(1, Math.floor(util / EX_H.linha));

  const blocosProp = [];
  for (let i = 0; i < ctx.props.length; i += cabemProp) {
    blocosProp.push({ de: i, ate: Math.min(i + cabemProp, ctx.props.length) });
  }

  const blocosItens = [];
  for (let i = 0; i < itens.length; i += cabemLinhas) {
    blocosItens.push({ de: i, ate: Math.min(i + cabemLinhas, itens.length) });
  }

  const paginas = [];
  blocosProp.forEach(function (bp) {
    blocosItens.forEach(function (bi) {
      paginas.push(['Grade comparativa', _exPaginaGrade_, { prop: bp, itens: bi,
        totalProp: blocosProp.length, totalItens: blocosItens.length }]);
    });
  });
  return paginas;
}

function _exPaginaGrade_(ctx, corte) {
  const props = ctx.props.slice(corte.prop.de, corte.prop.ate);
  const itens = (ctx.m.linhas || []).slice(corte.itens.de, corte.itens.ate);

  // O subtítulo diz onde a pessoa está. Documento paginado sem isso faz
  // o leitor perder o fio quando a grade quebra em quatro folhas.
  let onde = 'itens ' + (corte.itens.de + 1) + '–' + corte.itens.ate +
    ' de ' + (ctx.m.linhas || []).length;
  if (corte.totalProp > 1) {
    onde += ' · proponentes ' + (corte.prop.de + 1) + '–' + corte.prop.ate +
      ' de ' + ctx.props.length;
  }

  const slide = _exNovaPagina_(ctx, 'Grade comparativa', onde);

  const larg = ctx.W - EX_MX * 2;
  const wProp = (larg - EX_COL.codigo - EX_COL.qtd - EX_COL.un - EX_COL.descMin) / props.length;
  const wDesc = EX_COL.descMin + Math.max(0,
    (larg - EX_COL.codigo - EX_COL.qtd - EX_COL.un - EX_COL.descMin - wProp * props.length));

  const x = {
    codigo: EX_MX,
    desc: EX_MX + EX_COL.codigo,
    qtd: EX_MX + EX_COL.codigo + wDesc,
    un: EX_MX + EX_COL.codigo + wDesc + EX_COL.qtd,
    prop: function (i) {
      return EX_MX + EX_COL.codigo + wDesc + EX_COL.qtd + EX_COL.un + i * wProp;
    }
  };

  _exCabecalhoGrade_(ctx, slide, x, wDesc, wProp, props);

  itens.forEach(function (item, i) {
    const y = EX_TOPO + EX_H.cabGrade + i * EX_H.linha;
    _exLinhaGrade_(ctx, slide, x, wDesc, wProp, props, item, y, i);
  });
}

function _exCabecalhoGrade_(ctx, slide, x, wDesc, wProp, props) {
  const y = EX_TOPO;
  const larg = ctx.W - EX_MX * 2;

  const fundo = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
    EX_MX, y, larg, EX_H.cabGrade);
  fundo.getFill().setSolidFill(DS_CN.colors.brandDark);
  fundo.getBorder().setTransparent();

  const op = { fs: 7, fsMin: 5.5, bold: true, cor: DS_CN.colors.white,
               fonte: DS_CN.typography.body, folga: 4 };

  _cnUmaLinha_(slide, x.codigo, y, EX_COL.codigo, EX_H.cabGrade, 'Cód.', op);
  _cnUmaLinha_(slide, x.desc + 4, y, wDesc - 8, EX_H.cabGrade, 'Descrição',
    Object.assign({}, op, { align: 'L' }));
  _cnUmaLinha_(slide, x.qtd, y, EX_COL.qtd, EX_H.cabGrade, 'Qtd.', op);
  _cnUmaLinha_(slide, x.un, y, EX_COL.un, EX_H.cabGrade, 'Un.', op);

  props.forEach(function (p, i) {
    // O nome curto: a coluna tem 90 pontos e a razão social tem 60
    // caracteres. Cortar no meio é melhor que encolher a fonte até virar
    // ilegível — e o nome inteiro está na página de cadastro.
    _cnUmaLinha_(slide, x.prop(i), y + 2, wProp, 12, _exNomeCurto_(p.nome),
      Object.assign({}, op, { fs: 6.8 }));
    _cnUmaLinha_(slide, x.prop(i), y + 13, wProp, 11, 'unitário · total',
      { fs: 5.6, fsMin: 5, cor: DS_CN.colors.brandSoft,
        fonte: DS_CN.typography.body, folga: 4 });
  });
}

function _exLinhaGrade_(ctx, slide, x, wDesc, wProp, props, item, y, indice) {
  const larg = ctx.W - EX_MX * 2;
  const ehGrupo = item.tipo === 'grupo';

  // Faixa de fundo: grupo em destaque, itens em zebra discreta. É o que
  // deixa a leitura horizontal possível numa grade larga.
  if (ehGrupo || indice % 2 === 1) {
    const faixa = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
      EX_MX, y, larg, EX_H.linha);
    faixa.getFill().setSolidFill(ehGrupo ? DS_CN.colors.brandSoft : DS_CN.colors.bgSlide);
    faixa.getBorder().setTransparent();
  }

  const corTexto = ehGrupo ? DS_CN.colors.brandDark : DS_CN.colors.textMain;
  const base = { fs: 6.8, fsMin: 5.2, fonte: DS_CN.typography.body,
                 cor: corTexto, folga: 4 };

  _cnUmaLinha_(slide, x.codigo, y, EX_COL.codigo, EX_H.linha, item.codigo || '',
    Object.assign({}, base, { bold: ehGrupo }));
  _cnUmaLinha_(slide, x.desc + 4, y, wDesc - 8, EX_H.linha, item.descricao || '',
    Object.assign({}, base, { align: 'L', bold: ehGrupo }));

  if (ehGrupo) return;   // grupo não tem quantidade nem preço

  _cnUmaLinha_(slide, x.qtd, y, EX_COL.qtd, EX_H.linha,
    item.quantidade === null || item.quantidade === undefined ? '' : String(item.quantidade), base);
  _cnUmaLinha_(slide, x.un, y, EX_COL.un, EX_H.linha, item.unidade || '', base);

  props.forEach(function (p, i) {
    const c = item.precos ? item.precos[p.id] : null;
    const cotou = !!(c && c.status === 'cotado' && c.valor !== null && c.valor !== undefined);

    if (!cotou) {
      // Não cotou é uma informação, não um vazio. Vazio o leitor lê como
      // "esqueci de preencher"; o traço marcado diz que o fornecedor não
      // ofereceu aquele item — que é ressalva, e muda a comparação.
      _cnUmaLinha_(slide, x.prop(i), y, wProp, EX_H.linha, 'não cotou',
        Object.assign({}, base, { fs: 6, italic: true, cor: DS_CN.colors.textMuted }));
      return;
    }

    const ehMenor = item.menor && p.id === item.menor;
    if (ehMenor) {
      const marca = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
        x.prop(i) + 2, y + 1, wProp - 4, EX_H.linha - 2);
      marca.getFill().setSolidFill(DS_CN.colors.greenBg);
      marca.getBorder().setTransparent();
    }

    _cnUmaLinha_(slide, x.prop(i), y, wProp, EX_H.linha,
      cfValorTexto_(c.valor) + '  ·  ' + cfValorTexto_(c.total !== undefined ? c.total : c.valor),
      Object.assign({}, base, {
        bold: ehMenor,
        cor: ehMenor ? DS_CN.colors.greenInk : corTexto
      }));
  });
}

/** Nome de coluna: primeira palavra forte, sem sufixo societário. */
function _exNomeCurto_(nome) {
  const limpo = String(nome || '')
    .replace(/\b(LTDA|ME|EPP|EIRELI|S\/?A|S\.A\.?|COMERCIO|COM\.|INDUSTRIA|IND\.)\b/gi, '')
    .replace(/\s+/g, ' ').trim();
  return limpo.length > 22 ? limpo.slice(0, 21) + '…' : (limpo || nome || '');
}


// ==========================================
// TOTAIS, LEGENDA, NEGOCIAÇÃO E ASSINATURAS
// ==========================================

function _exPaginaTotais_(ctx) {
  const slide = _exNovaPagina_(ctx, 'Totais e comparação',
    'valor declarado por proponente e variação contra a menor proposta');

  const larg = ctx.W - EX_MX * 2;
  const props = ctx.props;
  const totais = props.map(function (p) { return p.total; })
    .filter(function (v) { return v !== null && v !== undefined && v > 0; });
  const menor = totais.length ? Math.min.apply(null, totais) : null;

  const alt = 30;
  props.forEach(function (p, i) {
    const y = EX_TOPO + 8 + i * (alt + 6);
    if (y + alt > ctx.H - EX_RODAPE - 90) return;

    const ehMenor = menor !== null && p.total === menor;
    _cnCartao_(slide, EX_MX, y, larg, alt,
      p.vencedora ? DS_CN.colors.greenSolid : (ehMenor ? DS_CN.colors.brandLight : DS_CN.colors.line),
      p.vencedora ? DS_CN.colors.greenBg : DS_CN.colors.white);

    _cnUmaLinha_(slide, EX_MX + 14, y + 7, larg * 0.4, 16, p.nome,
      { fs: 8.5, fsMin: 6.5, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 5 });

    _cnUmaLinha_(slide, EX_MX + larg * 0.45, y + 7, larg * 0.2, 16,
      p.total !== null && p.total !== undefined ? cfValorTexto_(p.total) : 'sem valor',
      { fs: 10, fsMin: 7, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 5 });

    // A variação contra a MENOR proposta, e não contra a primeira: é a
    // pergunta que quem homologa faz — quanto custa não escolher a mais
    // barata.
    if (menor !== null && p.total > 0) {
      const d = (p.total - menor) / menor;
      _cnUmaLinha_(slide, EX_MX + larg * 0.68, y + 7, larg * 0.3, 16,
        d === 0 ? 'menor proposta' : '+' + cfPct_(d) + ' sobre a menor',
        { fs: 8, fsMin: 6, bold: d === 0,
          cor: d === 0 ? DS_CN.colors.greenInk : DS_CN.colors.textBody,
          fonte: DS_CN.typography.body, align: 'L', folga: 5 });
    }
  });

  const yLeg = ctx.H - EX_RODAPE - 80;
  _cnPainel_(slide, EX_MX, yLeg, larg, 72, 'COMO LER ESTE DOCUMENTO', DS_CN.colors.brandMed);
  _cnParagrafo_(slide, EX_MX + 14, yLeg + 26, larg - 28, 42,
    'Fundo verde na grade = menor preço da linha.  “não cotou” = o proponente ' +
    'não ofereceu aquele item, e a comparação daquela linha é entre menos ' +
    'propostas.  A variação acima é contra a menor proposta desta equalização. ' +
    'A economia da negociação — proposta inicial contra valor contratado — não ' +
    'aparece aqui: ela vive no painel de saving, que soma o histórico do time.',
    { fs: 7.5, fsMin: 6, cor: DS_CN.colors.textBody, fonte: DS_CN.typography.body });
}

function _exPaginaNegociacao_(ctx) {
  const slide = _exNovaPagina_(ctx, 'Negociação e ressalvas',
    'o que ficou registrado além do preço');

  const larg = ctx.W - EX_MX * 2;
  const meia = (larg - 12) / 2;

  _cnPainel_(slide, EX_MX, EX_TOPO, meia, 150, 'CONDIÇÕES POR PROPONENTE',
    DS_CN.colors.brandMed);
  ctx.props.slice(0, 5).forEach(function (p, i) {
    const y = EX_TOPO + 28 + i * 24;
    _cnUmaLinha_(slide, EX_MX + 14, y, meia * 0.4, 12, _exNomeCurto_(p.nome),
      { fs: 7.5, fsMin: 6, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 5 });
    const cond = [p.condicoes, p.prazoExecucao ? 'prazo ' + p.prazoExecucao : '',
                  p.validadeAte ? 'validade ' + p.validadeAte : '']
      .filter(Boolean).join(' · ') || 'sem condições registradas';
    _cnUmaLinha_(slide, EX_MX + 14, y + 11, meia - 28, 12, cond,
      { fs: 6.5, fsMin: 5.5, cor: DS_CN.colors.textBody,
        fonte: DS_CN.typography.body, align: 'L', folga: 5 });
  });

  // As pendências que o parser não resolveu. Elas existem no modelo e
  // não podem sumir do documento: pendência escondida é pendência que
  // ninguém trata.
  const pend = ctx.m.pendencias || [];
  _cnPainel_(slide, EX_MX + meia + 12, EX_TOPO, meia, 150,
    'PENDÊNCIAS (' + pend.length + ')',
    pend.length ? DS_CN.colors.amberSolid : DS_CN.colors.greenSolid);

  if (!pend.length) {
    _cnUmaLinha_(slide, EX_MX + meia + 26, EX_TOPO + 30, meia - 28, 14,
      'Nenhuma pendência registrada nesta equalização.',
      { fs: 8, fsMin: 6.5, cor: DS_CN.colors.greenInk,
        fonte: DS_CN.typography.body, align: 'L', folga: 5 });
  } else {
    pend.slice(0, 6).forEach(function (p, i) {
      _cnUmaLinha_(slide, EX_MX + meia + 26, EX_TOPO + 28 + i * 19, meia - 40, 16,
        '• ' + (p.descricao || p.DESCRICAO || String(p)),
        { fs: 7, fsMin: 5.5, cor: DS_CN.colors.textBody,
          fonte: DS_CN.typography.body, align: 'L', folga: 5 });
    });
    if (pend.length > 6) {
      _cnUmaLinha_(slide, EX_MX + meia + 26, EX_TOPO + 28 + 6 * 19, meia - 40, 16,
        'e mais ' + (pend.length - 6) + ' na tela de pendências',
        { fs: 7, fsMin: 5.5, italic: true, cor: DS_CN.colors.textMuted,
          fonte: DS_CN.typography.body, align: 'L', folga: 5 });
    }
  }
}

function _exPaginaResponsaveis_(ctx) {
  const slide = _exNovaPagina_(ctx, 'Responsáveis',
    'quem elaborou e quem revisou esta equalização');

  const larg = ctx.W - EX_MX * 2;
  const meia = (larg - 40) / 2;
  const y = EX_TOPO + 40;

  // Duas assinaturas, e só duas. Quem revisou foi quem aprovou — o
  // quadro de alçadas saiu do documento por decisão de quem o assina.
  //
  // Os rótulos são os MESMOS da via oficial (cfBlocoAlcadas_). Duas vias
  // do mesmo documento com textos de assinatura diferentes é o tipo de
  // divergência que só aparece quando alguém já assinou a errada.
  [['Elaborado por (Suprimentos):', 'nome, data e assinatura'],
   ['Revisado por:', 'escopo e valores conferidos — nome, data e assinatura']]
  .forEach(function (a, i) {
    const x = EX_MX + i * (meia + 40);
    const linha = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y + 46, meia, 0.75);
    linha.getFill().setSolidFill(DS_CN.colors.lineStrong);
    linha.getBorder().setTransparent();

    _cnUmaLinha_(slide, x, y + 52, meia, 14, a[0],
      { fs: 8.5, fsMin: 6.5, bold: true, cor: DS_CN.colors.textMain,
        fonte: DS_CN.typography.body, align: 'L', folga: 5 });
    _cnUmaLinha_(slide, x, y + 64, meia, 12, a[1],
      { fs: 6.8, fsMin: 5.5, cor: DS_CN.colors.textMuted,
        fonte: DS_CN.typography.body, align: 'L', folga: 5 });
  });

  _cnUmaLinha_(slide, EX_MX, ctx.H - EX_RODAPE - 34, larg, 14,
    'Documento gerado em ' + cfDataHoraTexto_(new Date()) +
    ' · via alternativa em Google Slides · a via oficial é a exportação em planilha',
    { fs: 6.5, fsMin: 5.5, cor: DS_CN.colors.textMuted,
      fonte: DS_CN.typography.body, align: 'L', folga: 5 });
}
