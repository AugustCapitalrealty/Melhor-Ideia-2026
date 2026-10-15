/**
 * Apresentação NATIVA (texto editável), no jeito do deck do orçamento: o PNG é só o fundo (formas, fotos, telas,
 * cartões) e todo texto é caixa de texto do Slides, em Montserrat e Open Sans, na mesma posição do rascunho.
 *
 * Como usar: função gerarApresentacaoNativa → Executar.
 * Entrada: pasta do Drive "APRESENTACAO-SLIDES-NATIVA" com bg-01.png … bg-16.png e layout.json
 * (gerados por relatorio/google-slides/extrair.cjs no repositório). A apresentação é criada nessa pasta.
 */
const PASTA_NATIVA = 'APRESENTACAO-SLIDES-NATIVA';
const RECUO_PT = 7.2;   // recuo interno da caixa de texto do Slides, que não desliga
const FOLGA = 1.06;     // a fonte do Slides mede um pouco diferente do Chrome: largura com folga para não quebrar antes

function gerarApresentacaoNativa() {
  const pastas = DriveApp.getFoldersByName(PASTA_NATIVA);
  if (!pastas.hasNext()) throw new Error('Pasta "' + PASTA_NATIVA + '" não encontrada no Drive.');
  const pasta = pastas.next();
  const arq = {};
  const it = pasta.getFiles();
  while (it.hasNext()) { const f = it.next(); arq[f.getName()] = f; }
  if (!arq['layout.json']) throw new Error('layout.json não está na pasta.');
  const layout = JSON.parse(arq['layout.json'].getBlob().getDataAsString('UTF-8'));

  const ap = SlidesApp.create(NOME_APRESENTACAO + ' (editável)');
  DriveApp.getFileById(ap.getId()).moveTo(pasta);
  const k = ap.getPageWidth() / 1920;
  const primeiro = ap.getSlides()[0];

  layout.forEach(function (sl, i) {
    const slide = i === 0 ? primeiro : ap.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    if (i === 0) slide.getPageElements().forEach(function (el) { el.remove(); });
    const bg = arq['bg-' + ('0' + sl.n).slice(-2) + '.png'];
    if (bg) slide.getBackground().setPictureFill(bg.getBlob());
    sl.blocos.forEach(function (b) { nativaTexto_(slide, b, k); });
    const titulo = (typeof TITULOS !== 'undefined' && TITULOS[i]) || '';
    if (titulo) slide.getNotesPage().getSpeakerNotesShape().getText().setText(titulo);
  });

  ap.saveAndClose();
  const url = 'https://docs.google.com/presentation/d/' + ap.getId() + '/edit';
  Logger.log(layout.length + ' slides (editável) · ' + url);
  return url;
}

function nativaTexto_(slide, b, k) {
  const trechos = b.trechos.filter(function (t) { return t.t; });
  if (!trechos.length) return;
  const maiusc = function (s) { return b.maiusc ? s.toUpperCase() : s; };
  const texto = trechos.map(function (t) { return maiusc(t.t); }).join('');
  if (!texto.trim()) return;

  const centro = b.alinhar === 'center', direita = b.alinhar === 'right' || b.alinhar === 'end';
  let w = b.w * k * FOLGA + RECUO_PT * 2, x = b.x * k - RECUO_PT;
  if (centro) x -= (w - (b.w * k + RECUO_PT * 2)) / 2;
  else if (direita) x -= (w - (b.w * k + RECUO_PT * 2));
  const caixa = slide.insertTextBox(texto, x, b.y * k - RECUO_PT, w, b.h * k + RECUO_PT * 2);
  try { caixa.getAutofit().disableAutofit(); } catch (_) { /* versões antigas da API */ }
  caixa.setContentAlignment(SlidesApp.ContentAlignment.TOP);

  const tr = caixa.getText();
  const tam0 = trechos[0].s || 16;
  tr.getParagraphStyle()
    .setParagraphAlignment(centro ? SlidesApp.ParagraphAlignment.CENTER : direita ? SlidesApp.ParagraphAlignment.END : SlidesApp.ParagraphAlignment.START)
    .setLineSpacing(Math.max(100, Math.round(b.altLinha / (tam0 * 1.2) * 100)))
    .setSpaceAbove(0).setSpaceBelow(0);

  let pos = 0;
  trechos.forEach(function (t) {
    const s = maiusc(t.t);
    if (!s.length) return;
    if (t.t === '\n') { pos += 1; return; }
    const st = tr.getRange(pos, pos + s.length).getTextStyle();
    st.setFontFamily(nativaFonte_(t.f)).setFontSize(Math.max(6, Math.round((t.s || tam0) * k * 10) / 10))
      .setBold(!!t.b).setItalic(!!t.i);
    const cor = nativaCor_(t.c);
    if (cor) st.setForegroundColor(cor);
    pos += s.length;
  });
}

function nativaFonte_(f) {
  const nome = String(f || '').split(',')[0].replace(/["']/g, '').trim();
  return /montserrat/i.test(nome) ? 'Montserrat' : 'Open Sans';
}

function nativaCor_(c) {
  const m = String(c || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m || (m[4] !== undefined && Number(m[4]) === 0)) return null;
  return '#' + [m[1], m[2], m[3]].map(function (v) { return ('0' + Math.round(Number(v)).toString(16)).slice(-2); }).join('');
}
