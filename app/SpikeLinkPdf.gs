/**
 * SPIKE — o hyperlink sobrevive à exportação em PDF?
 *
 * Arquivo temporário, de diagnóstico. Existe para responder uma pergunta
 * antes de escrever a funcionalidade, não para ficar no projeto: apague-o
 * assim que a resposta estiver anotada.
 *
 * O plano de Fase 1 afirma que setLinkUrl vira anotação clicável no PDF.
 * Ninguém testou isso aqui, e o nosso caminho de exportação não é a UI do
 * Sheets — é o endpoint ?format=pdf via UrlFetchApp, com token OAuth
 * (cfPdfDaPlanilha_). Afirmação sem teste não entra em documento que vai
 * para a Diretoria.
 *
 * De quebra, o spike mede as três ordens de escrita que o Exportar.gs usa
 * de fato, porque o snippet do plano aplica o rich text antes do
 * setValues — e setValues devolve a célula para texto puro.
 *
 * Rode: spikeLinkNoPdf   (neste arquivo, SpikeLinkPdf.gs)
 */

const SPIKE_URL = 'https://drive.google.com/file/d/1SPIKE-CAPITAL-FORNECEDORES/view';

function spikeLinkNoPdf() {
  const ss = SpreadsheetApp.create('SPIKE link no PDF — ' + cfDataHoraTexto_(new Date()));
  const aba = ss.getSheets()[0];
  const resultado = [];

  function link(texto) {
    return SpreadsheetApp.newRichTextValue()
      .setText(texto).setLinkUrl(SPIKE_URL).build();
  }
  function temLink(l, c) {
    const rt = aba.getRange(l, c).getRichTextValue();
    if (!rt) return false;
    const runs = rt.getRuns();
    for (let i = 0; i < runs.length; i++) if (runs[i].getLinkUrl()) return true;
    return false;
  }

  // ── Caso 1: a ordem que o plano propõe — rich text primeiro, setValues depois.
  aba.getRange(2, 2).setRichTextValue(link('CASO 1 — antes do setValues'));
  aba.getRange(2, 2, 1, 2).setValues([['CASO 1 — antes do setValues', '']]);
  resultado.push(['1. rich text ANTES de setValues', temLink(2, 2)]);

  // ── Caso 2: rich text depois do setValues, mas antes da pintura.
  aba.getRange(4, 2, 1, 2).setValues([['CASO 2 — antes da pintura', '']]);
  aba.getRange(4, 2).setRichTextValue(link('CASO 2 — antes da pintura'));
  aba.getRange(4, 2, 1, 2).setVerticalAlignment('middle').setFontSize(10);
  aba.getRange(4, 2, 1, 2).setBorder(true, true, true, true, false, false);
  resultado.push(['2. rich text antes de setFontSize/setBorder', temLink(4, 2)]);

  // ── Caso 3: rich text por último, depois de tudo — a ordem que eu proponho.
  aba.getRange(6, 2, 1, 2).setValues([['CASO 3 — por último', '']]);
  aba.getRange(6, 2, 1, 2).setVerticalAlignment('middle').setFontSize(10);
  aba.getRange(6, 2, 1, 2).setBackground('#E4F2EA');
  aba.getRange(6, 2).setRichTextValue(link('CASO 3 — por último'));
  resultado.push(['3. rich text por ÚLTIMO', temLink(6, 2)]);

  // ── Caso 4: célula mesclada, rich text depois do merge (1 célula, não 2).
  aba.getRange(8, 2, 1, 2).setValues([['CASO 4 — mesclada, 1 célula', '']]);
  aba.getRange(8, 2, 1, 2).merge();
  aba.getRange(8, 2).setRichTextValue(link('CASO 4 — mesclada, 1 célula'));
  resultado.push(['4. mesclada, escrita em 1 célula', temLink(8, 2)]);

  // ── Caso 5: célula mesclada, o range de 2 que o plano escreve.
  aba.getRange(10, 2, 1, 2).setValues([['CASO 5 — mesclada, range de 2', '']]);
  aba.getRange(10, 2, 1, 2).merge();
  let erro5 = '';
  try {
    aba.getRange(10, 2, 1, 2).setRichTextValue(link('CASO 5 — mesclada, range de 2'));
  } catch (e) {
    erro5 = String(e && e.message ? e.message : e);
  }
  resultado.push(['5. mesclada, escrita em range de 2' + (erro5 ? ' [ERRO: ' + erro5 + ']' : ''), temLink(10, 2)]);

  aba.setColumnWidth(2, 260);
  aba.setColumnWidth(3, 120);
  SpreadsheetApp.flush();

  // ── A pergunta que importa: o PDF sai com a anotação de link?
  const pdf = cfPdfDaPlanilha_(ss.getId(), aba.getSheetId(), 'SPIKE link no PDF');
  const bruto = pdf.getBlob().getDataAsString('ISO-8859-1');
  const urlNoPdf = bruto.indexOf('1SPIKE-CAPITAL-FORNECEDORES') >= 0;
  const anotacao = bruto.indexOf('/Annots') >= 0;
  const uri = bruto.indexOf('/URI') >= 0;

  Logger.log('══════ SPIKE: link no PDF ══════');
  Logger.log('Planilha: ' + ss.getUrl());
  Logger.log('PDF:      ' + pdf.getUrl());
  Logger.log('');
  Logger.log('── O link sobrevive na PLANILHA? ──');
  resultado.forEach(function (r) {
    Logger.log((r[1] ? '  SIM  ' : '  NÃO  ') + r[0]);
  });
  Logger.log('');
  Logger.log('── O link chega ao PDF? ──');
  Logger.log('  URL presente nos bytes do PDF: ' + (urlNoPdf ? 'SIM' : 'NÃO'));
  Logger.log('  PDF declara /Annots:           ' + (anotacao ? 'SIM' : 'NÃO'));
  Logger.log('  PDF declara /URI:              ' + (uri ? 'SIM' : 'NÃO'));
  Logger.log('  Tamanho do PDF: ' + pdf.getSize() + ' bytes');
  Logger.log('');
  Logger.log(urlNoPdf && uri
    ? 'VEREDITO: o link vai clicável no PDF. Fase 1 pode incluir LINK_PROPOSTA.'
    : 'VEREDITO: o link NÃO sobrevive ao PDF. Use o plano B — imprimir a URL em texto.');
  Logger.log('');
  Logger.log('Abra o PDF acima e tente clicar, para confirmar com o olho.');
  Logger.log('Depois rode limparSpikeLinkNoPdf() para jogar os dois na lixeira.');

  PropertiesService.getScriptProperties()
    .setProperty('spike_link_ids', ss.getId() + '|' + pdf.getId());

  return { planilha: ss.getUrl(), pdf: pdf.getUrl(), naPlanilha: resultado, noPdf: urlNoPdf && uri };
}

/** Manda planilha e PDF do spike para a lixeira. */
function limparSpikeLinkNoPdf() {
  const p = PropertiesService.getScriptProperties();
  const ids = (p.getProperty('spike_link_ids') || '').split('|');
  ids.forEach(function (id) {
    if (!id) return;
    try { DriveApp.getFileById(id).setTrashed(true); Logger.log('Lixeira: ' + id); }
    catch (e) { Logger.log('Não consegui apagar ' + id + ': ' + e); }
  });
  p.deleteProperty('spike_link_ids');
}
