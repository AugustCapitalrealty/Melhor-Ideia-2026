/** Modelo de resposta do fornecedor: quantidades definidas, preços em branco. */
function esTextoPlanilha_(valor) {
  const s = String(valor == null ? '' : valor);
  return /^[=+@-]/.test(s) ? "'" + s : s;
}

function esModeloPlanilha_(d, id, revisao) {
  const linhas = [
    ['GESTÃO DE CONTRATAÇÕES — SOLICITAÇÃO DE COTAÇÃO', '', '', '', '', '', '', '', ''],
    [esTextoPlanilha_(d.titulo), '', '', '', '', '', '', '', ''],
    [esTextoPlanilha_(d.megaNome + ' · ' + [d.armazem, d.modulos].filter(Boolean).join(' · ')), '', '', '', '', '', '', '', ''],
    ['Escopo ' + id + ' · Revisão ' + revisao, '', '', '', '', '', '', '', ''],
    ['Fornecedor / razão social:', '', '', '', 'CNPJ:', '', '', '', ''],
    ['Contato / e-mail:', '', '', '', 'Validade da proposta:', '', '', '', ''],
    ['Prazo de entrega / execução:', '', '', '', 'Condição de pagamento:', '', '', '', ''],
    ['Preencha as células amarelas. Mantenha os itens, quantidades e referências. Indique exclusões nas observações.', '', '', '', '', '', '', '', ''],
    ['Código EAP', 'Descrição / serviços', 'Quantidade', 'Unidade', 'Marca / referência solicitada', 'Marca ofertada', 'Preço unitário (R$)', 'Total (R$)', 'Observações do fornecedor']
  ];
  const grupos = [];
  esNumerarEap_(d.itens).forEach(function (it) {
    const grupo = it.tipo === 'grupo';
    const locais = d.grupos.filter(function (g) { return it.grupos.indexOf(g.id) >= 0; }).map(function (g) { return g.titulo; }).join(' / ');
    linhas.push([it.codigo, esTextoPlanilha_(it.descricao + (locais ? '\nLocal: ' + locais : '')), grupo ? '' : it.quantidade, grupo ? '' : esTextoPlanilha_(it.unidade), grupo ? '' : esTextoPlanilha_(it.referencia), '', '', '', '']);
    if (grupo) grupos.push(linhas.length);
  });
  const fimItens = linhas.length;
  linhas.push(['', 'TOTAL DA PROPOSTA (R$)', '', '', '', '', '', '', '']);
  const totalLinha = linhas.length;
  linhas.push(['CONDIÇÕES DO ESCOPO', '', '', '', '', '', '', '', '']);
  [d.responsavel ? 'Responsável / contato: ' + d.responsavel : '', d.endereco, d.objetivo, d.consideracoes, d.prazo, d.visita ? 'Visita técnica prévia obrigatória.' : '', d.aviso].filter(Boolean).forEach(function (s) {
    linhas.push([esTextoPlanilha_(s), '', '', '', '', '', '', '', '']);
  });
  return { linhas: linhas, grupos: grupos, inicioItens: 10, fimItens: fimItens, totalLinha: totalLinha };
}

function apiEscopoGerarPlanilha(id, revisao) {
  return esApi_(function () {
    cfExigeAutorizacao_();
    esPreparar_();
    const r = esRevisao_(id, revisao), d = esNormalizar_(JSON.parse(r.CONTEUDO));
    esValidarItensCotacao_(d);
    const modelo = esModeloPlanilha_(d, id, Number(r.REVISAO));
    let ss;
    try {
      ss = SpreadsheetApp.create('Cotação - ' + d.titulo + ' - R' + r.REVISAO);
      DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(CF_PASTA_ID));
      ss.setSpreadsheetLocale('pt_BR');
      const aba = ss.getSheets()[0];
      aba.setName('Cotação');
      aba.getRange(10, 1, d.itens.length, 1).setNumberFormat('@');
      aba.getRange(1, 1, modelo.linhas.length, 9).setValues(modelo.linhas)
        .setFontFamily('Arial').setFontSize(10).setWrap(true).setVerticalAlignment('top');
      [1, 2, 3, 4, 8].forEach(function (linha) { aba.getRange(linha, 1, 1, 9).merge(); });
      aba.getRange(1, 1, 1, 9).setBackground('#151E49').setFontColor('#ffffff').setFontWeight('bold');
      aba.getRange(9, 1, 1, 9).setBackground('#003D7B').setFontColor('#ffffff').setFontWeight('bold');
      [5, 6, 7].forEach(function (linha) {
        aba.getRange(linha, 2, 1, 3).merge().setBackground('#fff2cc');
        aba.getRange(linha, 6, 1, 4).merge().setBackground('#fff2cc');
      });
      aba.getRange(10, 3, d.itens.length, 1).setNumberFormat('0.###');
      aba.getRange(10, 7, d.itens.length, 2).setNumberFormat('#,##0.00');
      aba.getRange(10, 6, d.itens.length, 4).setBackground('#fff2cc');
      modelo.grupos.forEach(function (linha) {
        aba.getRange(linha, 1, 1, 9).setBackground('#e8eef7').setFontWeight('bold');
      });
      aba.getRange(modelo.totalLinha, 1, 1, 7).merge().setValue('TOTAL DA PROPOSTA (R$)').setFontWeight('bold');
      aba.getRange(modelo.totalLinha, 8).setBackground('#fff2cc').setNumberFormat('#,##0.00');
      for (let linha = modelo.totalLinha + 1; linha <= modelo.linhas.length; linha++) aba.getRange(linha, 1, 1, 9).merge();
      [85, 440, 90, 90, 180, 170, 130, 130, 240].forEach(function (largura, i) { aba.setColumnWidth(i + 1, largura); });
      aba.setFrozenRows(9);
      SpreadsheetApp.flush();
      return { revisao: Number(r.REVISAO), planilha: ss.getUrl(), download: 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx' };
    } catch (e) {
      if (ss) { try { DriveApp.getFileById(ss.getId()).setTrashed(true); } catch (_) {} }
      throw e;
    }
  });
}
