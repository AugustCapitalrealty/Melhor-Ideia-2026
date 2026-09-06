/**
 * Capital Fornecedores — exportar a equalização
 *
 * Gera uma planilha-retrato e o PDF dela. Dois cuidados que definem o
 * desenho:
 *
 * 1. Tudo sai como VALOR ESTÁTICO, nunca fórmula. Se a exportação virar
 *    uma fonte editável paralela, o problema da fórmula quebrada volta
 *    inteiro — e era exatamente o que viemos resolver.
 * 2. Arquivo salvo no Drive e devolvido como link, não empurrado como
 *    download. É compartilhável, auditável, e o web app não precisa lidar
 *    com blob no navegador.
 */

function cfExportarEqualizacao_(idEq) {
  const m = cfMapaEqualizacao_(idEq);
  const eq = m.equalizacao;
  const props = m.proponentes;

  const nome = [eq.id, eq.empreendimento, eq.projeto].filter(Boolean).join(' — ');
  const ss = SpreadsheetApp.create(nome);
  const aba = ss.getSheets()[0];
  aba.setName('Equalização');

  const linhas = [];
  const empresa = cfEmpresaDoMega_(eq.empreendimento).nome;

  linhas.push(['EQUALIZAÇÃO DE COTAÇÕES'].concat(props.map(function () { return ''; })));
  linhas.push(['Identificador', eq.id].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Empresa contratante', empresa].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Empreendimento', eq.empreendimento].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Projeto', eq.projeto].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Área', eq.area].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Data da equalização', eq.data].concat(props.slice(1).map(function () { return ''; })));
  linhas.push(['Situação', eq.status].concat(props.slice(1).map(function () { return ''; })));
  linhas.push([]);

  // ── comparativo
  linhas.push(['ITEM'].concat(props.map(function (p) { return p.nome; })));
  m.linhas.forEach(function (l) {
    const recuo = new Array(l.nivel + 1).join('    ');
    const rotulo = recuo + (l.codigo ? l.codigo + ' ' : '') + l.descricao +
      (l.quantidade !== null && l.quantidade !== undefined && l.quantidade !== ''
        ? ' (' + l.quantidade + (l.unidade ? ' ' + l.unidade : '') + ')' : '');

    linhas.push([rotulo].concat(props.map(function (p) {
      if (l.tipo === 'grupo') return '';
      const c = l.precos[p.id];
      if (!c) return '';
      if (c.status !== 'cotado' || c.valor === null) return 'não cotou';
      // Marca o menor no próprio texto: o PDF sai em preto e branco com
      // frequência, e cor sozinha não sobrevive à impressora.
      return (l.menor === p.id ? '* ' : '') + cfMoeda_(c.valor);
    })));
  });

  linhas.push(['TOTAL DOS ITENS'].concat(props.map(function (p) {
    return p.calculado === null ? '' : cfMoeda_(p.calculado);
  })));
  if (props.some(function (p) { return p.total !== null; })) {
    linhas.push(['TOTAL DECLARADO'].concat(props.map(function (p) {
      return p.total === null ? '' : cfMoeda_(p.total);
    })));
  }
  linhas.push([]);

  // ── dados da proposta
  linhas.push(['DADOS DA PROPOSTA'].concat(props.map(function () { return ''; })));
  const campos = [
    ['Nº da proposta', 'numero'], ['Revisão', 'revisao'],
    ['Data da proposta', 'data'], ['Validade até', 'validadeAte'],
    ['Condições de pagamento', 'condicoes'],
    ['Lead time (dias)', 'leadTime'], ['Prazo de execução (dias)', 'prazoExecucao'],
    ['Início previsto', 'dataPrevInicio'], ['Término previsto', 'dataPrevTermino'],
    ['Centro de custo', 'centroCusto'], ['Rodada', 'rodada']
  ];
  campos.forEach(function (c) {
    linhas.push([c[0]].concat(props.map(function (p) {
      const v = p[c[1]];
      return v === null || v === undefined ? '' : String(v);
    })));
  });
  linhas.push(['Proposta inicial'].concat(props.map(function (p) {
    return p.propostaInicial === null ? '' : cfMoeda_(p.propostaInicial);
  })));
  linhas.push(['Redução negociada'].concat(props.map(function (p) {
    return p.reducao === null ? '' : cfMoeda_(p.reducao);
  })));
  linhas.push([]);

  if (eq.detalhamento) linhas.push(['Serviço a aprovar', eq.detalhamento]);
  if (eq.premissas) linhas.push(['Premissas', eq.premissas]);
  if (eq.parecer) linhas.push(['Parecer', eq.parecer]);
  if (eq.vencedora) {
    const venceu = props.filter(function (p) { return p.id === eq.vencedora; })[0];
    if (venceu) linhas.push(['Proposta vencedora', venceu.nome]);
  }
  linhas.push([]);
  linhas.push(['Retrato gerado em', cfDataHoraTexto_(new Date()) + ' por ' + cfUsuario_()]);
  linhas.push(['* marca o menor preço da linha, entre quem cotou.']);

  // ── escrita e formatação
  const largura = Math.max.apply(null, linhas.map(function (l) { return l.length; }));
  const matriz = linhas.map(function (l) {
    const c = l.slice();
    while (c.length < largura) c.push('');
    return c;
  });

  aba.getRange(1, 1, matriz.length, largura).setValues(matriz);
  aba.getRange(1, 1, 1, largura).setFontWeight('bold').setFontSize(13);
  aba.setColumnWidth(1, 340);
  for (let c = 2; c <= largura; c++) aba.setColumnWidth(c, 150);
  aba.getRange(1, 2, matriz.length, largura - 1).setHorizontalAlignment('right');
  aba.setFrozenColumns(1);

  const arquivo = DriveApp.getFileById(ss.getId());
  try { arquivo.moveTo(DriveApp.getFolderById(CF_PASTA_ID)); } catch (erro) {}

  const pdf = cfPdfDaPlanilha_(ss.getId(), aba.getSheetId(), nome);

  cfLog_('exportar', 'equalizacao', idEq, JSON.stringify({ planilha: ss.getId(), pdf: pdf.getId() }));

  return { planilha: ss.getUrl(), pdf: pdf.getUrl() };
}

/**
 * PDF a partir da URL de export da planilha.
 *
 * Paisagem e ajuste à largura porque equalização é tabela larga: em
 * retrato, com 5 proponentes, as colunas quebram para a página seguinte e
 * o comparativo deixa de ser comparativo.
 */
function cfPdfDaPlanilha_(planilhaId, gid, nomeArquivo) {
  const params = [
    'format=pdf', 'size=A4', 'portrait=false', 'fitw=true',
    'gridlines=false', 'printtitle=false', 'sheetnames=false',
    'pagenumbers=CENTER',
    'top_margin=0.50', 'bottom_margin=0.50', 'left_margin=0.50', 'right_margin=0.50',
    'gid=' + gid
  ].join('&');

  const resposta = UrlFetchApp.fetch(
    'https://docs.google.com/spreadsheets/d/' + planilhaId + '/export?' + params,
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true }
  );

  if (resposta.getResponseCode() !== 200) {
    throw new Error('Não consegui gerar o PDF (HTTP ' + resposta.getResponseCode() + ').');
  }

  const blob = resposta.getBlob().setName(nomeArquivo + '.pdf');
  try {
    return DriveApp.getFolderById(CF_PASTA_ID).createFile(blob);
  } catch (erro) {
    return DriveApp.createFile(blob);   // sem acesso à pasta: cai na raiz
  }
}

function cfDataHoraTexto_(d) {
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
}
