/**
 * Gestão de Contratações - apresentação ao Conselho.
 * Conteúdo e roteiro em ConselhoNarrativa.gs; identidade e componentes aqui.
 * gerarApresentacaoConselho() atualiza sempre CONSELHO_DECK_ID.
 * Os slides anteriores só são removidos após a nova geração completa.
 */

const DS_CN = {
  colors: {
    brandDark: '#151E49', brandMed: '#003D7B', brandLight: '#065CA9',
    brandSoft: '#E9F0FA',
    bgSlide: '#F6F8FC', white: '#FFFFFF',
    textMain: '#16213E', textBody: '#46516B', textMuted: '#8592AC',
    line: '#E4EAF3', lineStrong: '#CBD5E4',
    amberBg: '#FDF1D2', amberInk: '#7A5B00', amberSolid: '#E5A417',
    greenBg: '#DEF4E9', greenInk: '#0B5C34', greenSolid: '#1E9E62',
    redBg: '#FCE8E8', redInk: '#8C1D1D', redSolid: '#D64545'
  },
  typography: { titles: 'Montserrat', body: 'Open Sans' },
  logoId: '1XzLbDtTYUTj0AIMuKUUyALJxC4MxU7z4', logoW: 112, logoH: 32
};

/** Destino fixo informado pelo usuário em 10/09/2026. */
const CONSELHO_DECK_ID = '12mfzC9cx86QOmeJFLW8ZmB4crj6fkfSJyiEhP7bbJBg';

const CN_MX  = 32;   // margem lateral
const CN_TOP = 72;   // topo do conteúdo, logo abaixo do header

function _cnFimConteudo_(H) { return H - 55; }
function _cnTopoRodape_(H)  { return H - 47; }


// ==========================================
// PONTO DE ENTRADA
// ==========================================

function gerarApresentacaoConselho() {
  const deck = SlidesApp.openById(CONSELHO_DECK_ID);
  const anteriores = deck.getSlides(), idsAnteriores = anteriores.map(function(s){return s.getObjectId();});
  try {
    CN_ROTEIRO.forEach(function(p,i){_cnRenderNarrativa_(deck,p,i);});
  } catch(e) {
    deck.getSlides().filter(function(s){return idsAnteriores.indexOf(s.getObjectId())<0;}).forEach(function(s){s.remove();});
    throw e;
  }
  anteriores.forEach(function(s){s.remove();});
  deck.setName('Gestão de Contratações — Apresentação ao Conselho');
  const url = deck.getUrl();
  deck.saveAndClose();
  Logger.log('Apresentação atualizada: ' + CN_ROTEIRO.length + ' slides. ' + url);
  return url;
}


// ==========================================
// MEDIÇÃO DE TEXTO
// ==========================================
// A API do Slides não expõe métrica de fonte: estimamos pela largura média
// do caractere. Montserrat é mais larga que Open Sans; negrito soma ~4%.

const _CN_FATOR_FONTE = { 'Montserrat': 0.58, 'Open Sans': 0.52 };
const _CN_RECUO_TEXTBOX = 14;

function _cnLarguraTexto_(texto, fs, fonte, bold) {
  const f = (_CN_FATOR_FONTE[fonte] || 0.55) * (bold ? 1.04 : 1);
  return String(texto).length * fs * f;
}

function _cnLinhasTexto_(texto, larguraCaixa, fs, fonte, bold) {
  const util = Math.max(12, larguraCaixa - _CN_RECUO_TEXTBOX);
  return Math.max(1, Math.ceil(_cnLarguraTexto_(texto, fs, fonte, bold) / util));
}

/**
 * Texto curto que TEM que caber numa linha só.
 *
 * Duas defesas: a caixa é desenhada mais larga que o espaço visível (o
 * retângulo visível é outra shape, então esticar a TEXT_BOX não muda a
 * aparência e devolve o recuo que o Slides tinha roubado); e, se ainda
 * não couber, a fonte encolhe de 0,25 em 0,25 até fsMin.
 */
function _cnUmaLinha_(slide, x, y, w, h, texto, op) {
  const t = (texto === null || texto === undefined) ? '' : String(texto);
  if (t === '') return null;   // caixa vazia: estilizar lança "object has no text"

  const o = op || {};
  const fonte  = o.fonte || DS_CN.typography.titles;
  const centro = o.align !== 'L';
  const folga  = o.folga === undefined ? 12 : o.folga;
  const fsMin  = o.fsMin || 6;
  let   fs     = o.fs === undefined ? 10 : o.fs;

  const bx = centro ? x - folga : x;
  const bw = centro ? w + folga * 2 : w + folga;
  const util = bw - _CN_RECUO_TEXTBOX;
  while (fs > fsMin && _cnLarguraTexto_(t, fs, fonte, o.bold) > util) fs -= 0.25;

  const box = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, bx, y, bw, h);
  box.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  box.getText().setText(t).getTextStyle()
    .setFontSize(fs).setBold(!!o.bold).setItalic(!!o.italic)
    .setForegroundColor(o.cor || DS_CN.colors.textMain).setFontFamily(fonte);
  box.getText().getParagraphStyle().setParagraphAlignment(
    centro ? SlidesApp.ParagraphAlignment.CENTER : SlidesApp.ParagraphAlignment.START);
  return box;
}

/** Bloco de texto: pode ter várias linhas, encolhe até caber na altura. */
function _cnParagrafo_(slide, x, y, w, h, texto, op) {
  const t = (texto === null || texto === undefined) ? '' : String(texto);
  if (t === '') return null;

  const o = op || {};
  const fonte = o.fonte || DS_CN.typography.body;
  const espac = o.espac || 122;      // o Slides recusa espaçamento < 100
  const fsMin = o.fsMin || 6.5;
  let   fs    = o.fs === undefined ? 10 : o.fs;

  const alturaLinha = function (f) { return f * 1.2 * (espac / 100); };
  while (fs > fsMin && _cnLinhasTexto_(t, w, fs, fonte, o.bold) * alturaLinha(fs) > h) {
    fs -= 0.25;
  }

  const box = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, x, y, w, h);
  if (o.meio) box.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  box.getText().setText(t).getTextStyle()
    .setFontSize(fs).setBold(!!o.bold).setItalic(!!o.italic)
    .setForegroundColor(o.cor || DS_CN.colors.textBody).setFontFamily(fonte);
  box.getText().getParagraphStyle()
    .setParagraphAlignment(o.align === 'C' ? SlidesApp.ParagraphAlignment.CENTER
                                           : SlidesApp.ParagraphAlignment.START)
    .setLineSpacing(espac);
  return box;
}


// ==========================================
// ESTRUTURA DO SLIDE
// ==========================================

function _cnNovoSlide_(deck) {
  const slide = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(DS_CN.colors.bgSlide);
  return slide;
}

function _cnHeader_(slide, W, titulo, chips) {
  const bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, CN_MX, 11, 5, 34);
  bar.getFill().setSolidFill(DS_CN.colors.brandLight); bar.getBorder().setTransparent();

  const tituloX = CN_MX + 15;
  const tituloW = (W - CN_MX - DS_CN.logoW - 24) - tituloX;
  _cnUmaLinha_(slide, tituloX, 8, tituloW, 26, titulo,
    { fs: 17, fsMin: 11, bold: true, cor: DS_CN.colors.textMain, align: 'L', folga: 8 });

  let cx = tituloX;
  (chips || []).forEach(function (txt) {
    const w = _cnLarguraTexto_(txt, 7.5, DS_CN.typography.body, true) + 18;
    const pill = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, cx, 37, w, 15);
    pill.getFill().setSolidFill(DS_CN.colors.brandSoft); pill.getBorder().setTransparent();
    _cnUmaLinha_(slide, cx, 37, w, 15, txt,
      { fs: 7.5, fsMin: 6, bold: true, cor: DS_CN.colors.brandMed,
        fonte: DS_CN.typography.body, folga: 10 });
    cx += w + 6;
  });

  try {
    const logoBlob = DriveApp.getFileById(DS_CN.logoId).getBlob();
    slide.insertImage(logoBlob, W - CN_MX - DS_CN.logoW, 14, DS_CN.logoW, DS_CN.logoH);
  } catch (e) {
    Logger.log('Aviso (Header): logo não carregado. ' + e.message);
  }

  const sep = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, 0, 60, W, 60);
  sep.getLineFill().setSolidFill(DS_CN.colors.line); sep.setWeight(1);
  const acc = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, CN_MX, 60, CN_MX + 110, 60);
  acc.getLineFill().setSolidFill(DS_CN.colors.brandLight); acc.setWeight(3);
}

function _cnRodape_(slide, W, H, texto, cor) {
  const y = _cnTopoRodape_(H), h = 24;
  const faixa = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, CN_MX, y, W - 2 * CN_MX, h);
  faixa.getFill().setSolidFill(cor || DS_CN.colors.brandSoft); faixa.getBorder().setTransparent();
  const acc = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, CN_MX + 6, y + 5, 3, h - 10);
  acc.getFill().setSolidFill(DS_CN.colors.brandLight); acc.getBorder().setTransparent();
  _cnUmaLinha_(slide, CN_MX + 18, y, W - 2 * CN_MX - 32, h, texto,
    { fs: 8.6, fsMin: 6.5, italic: true, cor: DS_CN.colors.brandMed,
      fonte: DS_CN.typography.body, align: 'L', folga: 8 });
}

/**
 * Aviso de falha desenhado NO slide.
 *
 * Usa só insertShape e a paleta — nenhuma helper. Se dependesse delas,
 * quebraria junto e o slide voltaria a ficar em branco, que é o pior
 * resultado possível: ninguém leva para a reunião o que não viu falhar.
 */
function _cnSlideFalha_(deck, nome, erro) {
  const slide = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill(DS_CN.colors.redBg);
  const cx = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 40, 120, 640, 120);
  cx.getText().setText('Falha ao gerar o slide "' + nome + '"\n\n' + erro.message);
  cx.getText().getTextStyle().setFontSize(14).setBold(true)
    .setForegroundColor(DS_CN.colors.redInk);
}


// ==========================================
// COMPONENTES
// ==========================================

function _cnCartao_(slide, x, y, w, h, corAcento, corFundo) {
  const card = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, w, h);
  card.getFill().setSolidFill(corFundo || DS_CN.colors.white);
  card.getBorder().setWeight(1).getLineFill().setSolidFill(DS_CN.colors.lineStrong);
  if (corAcento) {
    const acc = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y + 8, 4, h - 16);
    acc.getFill().setSolidFill(corAcento); acc.getBorder().setTransparent();
  }
  return y;
}

function _cnPill_(slide, x, y, w, h, texto, corFundo, corTexto, fs) {
  const pill = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, w, h);
  pill.getFill().setSolidFill(corFundo); pill.getBorder().setTransparent();
  _cnUmaLinha_(slide, x, y, w, h, texto,
    { fs: fs || 6.8, fsMin: 5.5, bold: true, cor: corTexto || DS_CN.colors.white,
      fonte: DS_CN.typography.body, folga: 12 });
}

function _cnKPI_(slide, x, y, w, h, label, valor, corInk, sub, corFundo) {
  _cnCartao_(slide, x, y, w, h, corInk, corFundo);
  const px = x + 16, pw = w - 30;
  _cnUmaLinha_(slide, px, y + 10, pw, 13, label,
    { fs: 7.5, fsMin: 6, bold: true, cor: DS_CN.colors.textMuted, align: 'L', folga: 8 });
  _cnUmaLinha_(slide, px, y + 25, pw, 26, valor,
    { fs: 17, fsMin: 10, bold: true, cor: corInk, align: 'L', folga: 8 });
  if (sub) {
    _cnUmaLinha_(slide, px, y + h - 24, pw, 16, sub,
      { fs: 7.6, fsMin: 6, cor: DS_CN.colors.textBody, fonte: DS_CN.typography.body,
        align: 'L', folga: 8 });
  }
}

function _cnPainel_(slide, x, y, w, h, titulo, cor) {
  const card = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, w, h);
  card.getFill().setSolidFill(DS_CN.colors.white);
  card.getBorder().setWeight(1).getLineFill().setSolidFill(DS_CN.colors.lineStrong);

  const barH = 22;
  const bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, barH);
  bar.getFill().setSolidFill(cor); bar.getBorder().setTransparent();
  _cnUmaLinha_(slide, x + 12, y, w - 24, barH, titulo,
    { fs: 8, fsMin: 6, bold: true, cor: DS_CN.colors.white, align: 'L', folga: 8 });

  return y + barH + 10;
}

/** Lista com marcador colorido. `itens` = [texto, ...] ou [[texto, cor], ...]. */
function _cnLista_(slide, itens, x, y, w, gap, corPadrao) {
  itens.forEach(function (item, i) {
    const txt = Array.isArray(item) ? item[0] : item;
    const cor = Array.isArray(item) ? item[1] : corPadrao;
    const cy = y + i * gap;
    const dot = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, x, cy + (gap - 7) / 2, 7, 7);
    dot.getFill().setSolidFill(cor || DS_CN.colors.brandLight);
    dot.getBorder().setTransparent();
    _cnUmaLinha_(slide, x + 13, cy, w - 13, gap, txt,
      { fs: 8.4, fsMin: 6.2, cor: DS_CN.colors.textMain,
        fonte: DS_CN.typography.body, align: 'L', folga: 10 });
  });
}

/** Linha "de → para": o que era na planilha, o que passou a ser. */
function _cnDePara_(slide, x, y, w, h, antes, depois) {
  const meio = 26;
  const wCol = (w - meio) / 2;

  const cA = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, wCol, h);
  cA.getFill().setSolidFill('#F1F3F8');
  cA.getBorder().setWeight(1).getLineFill().setSolidFill(DS_CN.colors.line);
  _cnParagrafo_(slide, x + 12, y + 6, wCol - 24, h - 12, antes,
    { fs: 8, fsMin: 6.2, cor: DS_CN.colors.textBody, meio: true });

  const seta = slide.insertShape(SlidesApp.ShapeType.RIGHT_ARROW, x + wCol + 5, y + h / 2 - 7, 16, 14);
  seta.getFill().setSolidFill(DS_CN.colors.brandLight); seta.getBorder().setTransparent();

  const cB = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x + wCol + meio, y, wCol, h);
  cB.getFill().setSolidFill(DS_CN.colors.white);
  cB.getBorder().setWeight(1).getLineFill().setSolidFill(DS_CN.colors.brandLight);
  _cnParagrafo_(slide, x + wCol + meio + 12, y + 6, wCol - 24, h - 12, depois,
    { fs: 8, fsMin: 6.2, bold: true, cor: DS_CN.colors.brandMed, meio: true });
}
