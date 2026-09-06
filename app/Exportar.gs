/**
 * Capital Fornecedores — exportar a equalização
 *
 * Reproduz o layout da planilha EQU que a operação já conhece: blocos de
 * informações obrigatórias, árvore com código à esquerda, proponentes em
 * colunas, VALOR TOTAL, rodapé da proposta e histórico da negociação.
 *
 * A diferença deliberada: cada proponente ocupa DUAS colunas — unitário e
 * total. A EQU só tem o total da linha, e é justamente por isso que ela
 * nunca serviu como histórico de preço.
 *
 * Dois cuidados que definem o desenho:
 *
 * 1. Dinheiro é gravado como NÚMERO com formato de moeda, nunca como texto
 *    já formatado. Escrevendo "182,50" o Sheets reinterpreta e mostra
 *    "182,5"; e texto não soma, não ordena e não vira gráfico.
 * 2. Nada de fórmula. Se a exportação virar fonte editável paralela, o
 *    problema da fórmula quebrada volta inteiro — era o que viemos
 *    resolver. É retrato, não fonte.
 */

const CF_EXP_NOTURNO = '#151E49';
const CF_EXP_ROYAL = '#003D7B';
const CF_EXP_CLARO = '#EDF1F8';
const CF_EXP_LINHA = '#D6DEEC';
const CF_EXP_MOEDA = 'R$ #,##0.00';

function cfExportarEqualizacao_(idEq) {
  const m = cfMapaEqualizacao_(idEq);
  const eq = m.equalizacao;
  const props = m.proponentes;
  const n = props.length;

  // A(1) vazia · B(2) código · C(3) descrição · D(4) qtd · E(5) unidade
  // depois, dois por proponente: unitário e total.
  const COL_ROTULO = 2, COL_VALOR = 3, COL_QTD = 4, COL_UN = 5, PRIMEIRA = 6;
  const largura = PRIMEIRA - 1 + n * 2;
  const colDe = function (i) { return PRIMEIRA + i * 2; };

  const nome = [eq.id, eq.empreendimento, eq.projeto].filter(Boolean).join(' — ');
  const ss = SpreadsheetApp.create(nome);
  const aba = ss.getSheets()[0];
  aba.setName('Equalização');

  const grade = [];
  const merges = [];        // {l, c, nl, nc}
  const moeda = [];         // {l, c, n}
  const faixas = { titulo: [], secao: [], grupo: [], total: [] };

  const vazia = function () {
    const l = [];
    for (let i = 0; i < largura; i++) l.push('');
    return l;
  };
  const linha = function (conteudo) { grade.push(conteudo); return grade.length; };

  // ── título
  linha(vazia());
  let l = linha(vazia());
  grade[l - 1][COL_ROTULO - 1] = 'INFORMAÇÕES OBRIGATÓRIAS';
  merges.push({ l: l, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.titulo.push(l);
  linha(vazia());

  // ── cabeçalho: à esquerda a compra, à direita os proponentes
  const empresa = cfEmpresaDoMega_(eq.empreendimento).nome;
  const cabecalho = [
    // O identificador carimbado no documento, não só no nome do arquivo:
    // sem ele o retrato não volta para a equalização que o gerou.
    ['Identificador:', eq.id, 'Razão:', function (p) { return p.nome; }],
    ['Empresa:', empresa, 'CNPJ:', function (p) { return cfCnpjFormatado_(p.cnpj); }],
    ['Empreendimento:', eq.empreendimento, 'Contato:', function (p) { return p.contato || ''; }],
    ['Projeto:', eq.projeto, 'Cidade/Estado:', function (p) {
      return [p.cidade, p.uf].filter(Boolean).join('/');
    }],
    ['Grupo Centro de Custo:', eq.grupoCentroCusto, 'Cód. Fornecedor:', function () { return ''; }],
    ['Área:', eq.area, 'Telefone:', function (p) { return p.telefone || ''; }],
    ['Data da equalização:', eq.data, 'Email:', function (p) { return p.email || ''; }],
    ['Situação:', eq.status, 'Nº da proposta:', function (p) { return p.numero || ''; }]
  ];

  cabecalho.forEach(function (c) {
    const li = vazia();
    li[COL_ROTULO - 1] = c[0];
    li[COL_VALOR - 1] = c[1] || '';
    li[COL_UN - 1] = c[2];
    props.forEach(function (p, i) { li[colDe(i) - 1] = c[3](p); });
    const num = linha(li);
    props.forEach(function (p, i) { merges.push({ l: num, c: colDe(i), nl: 1, nc: 2 }); });
  });

  linha(vazia());

  // ── comparativo
  let li = vazia();
  li[COL_ROTULO - 1] = 'Código';
  li[COL_VALOR - 1] = 'Descrição';
  li[COL_QTD - 1] = 'Qtd';
  li[COL_UN - 1] = 'Un.';
  props.forEach(function (p, i) { li[colDe(i) - 1] = p.nome; });
  const lCab = linha(li);
  props.forEach(function (p, i) { merges.push({ l: lCab, c: colDe(i), nl: 1, nc: 2 }); });
  faixas.secao.push(lCab);

  li = vazia();
  props.forEach(function (p, i) {
    li[colDe(i) - 1] = 'Unitário';
    li[colDe(i)] = 'Total';
  });
  const lSub = linha(li);
  faixas.secao.push(lSub);
  merges.push({ l: lCab, c: COL_ROTULO, nl: 2, nc: 1 });
  merges.push({ l: lCab, c: COL_VALOR, nl: 2, nc: 1 });
  merges.push({ l: lCab, c: COL_QTD, nl: 2, nc: 1 });
  merges.push({ l: lCab, c: COL_UN, nl: 2, nc: 1 });

  m.linhas.forEach(function (item) {
    const li = vazia();
    li[COL_ROTULO - 1] = item.codigo || '';
    li[COL_VALOR - 1] = new Array(item.nivel + 1).join('    ') + item.descricao;
    if (item.tipo !== 'grupo') {
      li[COL_QTD - 1] = item.quantidade === null || item.quantidade === undefined ? '' : item.quantidade;
      li[COL_UN - 1] = item.unidade || '';
      props.forEach(function (p, i) {
        const c = item.precos[p.id];
        if (!c) return;
        if (c.status !== 'cotado' || c.valor === null) { li[colDe(i) - 1] = 'não cotou'; return; }
        li[colDe(i) - 1] = c.valor;
        li[colDe(i)] = c.total === null ? '' : c.total;
      });
    }
    const num = linha(li);
    if (item.tipo === 'grupo') faixas.grupo.push(num);
    else props.forEach(function (p, i) {
      moeda.push({ l: num, c: colDe(i), n: 2 });
    });
  });

  // ── totais
  li = vazia();
  li[COL_ROTULO - 1] = 'VALOR TOTAL';
  props.forEach(function (p, i) { li[colDe(i)] = p.calculado === null ? '' : p.calculado; });
  const lTotal = linha(li);
  merges.push({ l: lTotal, c: COL_ROTULO, nl: 1, nc: 4 });
  faixas.total.push(lTotal);
  props.forEach(function (p, i) { moeda.push({ l: lTotal, c: colDe(i), n: 2 }); });

  if (props.some(function (p) { return p.total !== null; })) {
    li = vazia();
    li[COL_ROTULO - 1] = 'VALOR TOTAL declarado no documento';
    props.forEach(function (p, i) { li[colDe(i)] = p.total === null ? '' : p.total; });
    const lDecl = linha(li);
    merges.push({ l: lDecl, c: COL_ROTULO, nl: 1, nc: 4 });
    faixas.total.push(lDecl);
    props.forEach(function (p, i) { moeda.push({ l: lDecl, c: colDe(i), n: 2 }); });
  }

  linha(vazia());

  // ── rodapé da proposta
  const rodape = [
    ['Numero da Proposta:', function (p) { return p.numero || ''; }, false],
    ['Revisão do fornecedor:', function (p) { return p.revisao || ''; }, false],
    ['Data da Proposta:', function (p) { return p.data || ''; }, false],
    ['Condições de pagamento:', function (p) { return p.condicoes || ''; }, false],
    ['Lead time para início:', function (p) { return p.leadTime === null ? '' : p.leadTime + ' dias'; }, false],
    ['Prazo de execução:', function (p) { return p.prazoExecucao === null ? '' : p.prazoExecucao + ' dias'; }, false],
    ['Validade proposta:', function (p) { return p.validadeAte || ''; }, false],
    ['Faturamento Direto:', function (p) { return p.faturamentoDireto ? 'sim' : 'não'; }, false],
    ['Nome Centro de Custo:', function (p) { return p.centroCusto || ''; }, false],
    ['Data prevista para início:', function (p) { return p.dataPrevInicio || ''; }, false],
    ['Data prevista para término:', function (p) { return p.dataPrevTermino || ''; }, false]
  ];

  rodape.forEach(function (c) {
    const li = vazia();
    li[COL_ROTULO - 1] = c[0];
    props.forEach(function (p, i) { li[colDe(i) - 1] = c[1](p); });
    const num = linha(li);
    merges.push({ l: num, c: COL_ROTULO, nl: 1, nc: 4 });
    props.forEach(function (p, i) { merges.push({ l: num, c: colDe(i), nl: 1, nc: 2 }); });
  });

  linha(vazia());

  // ── histórico da negociação
  li = vazia();
  li[COL_ROTULO - 1] = 'Histórico da Negociação';
  const lHist = linha(li);
  merges.push({ l: lHist, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.secao.push(lHist);

  [['Proposta inicial:', 'propostaInicial'], ['Redução total da negociação:', 'reducao']]
    .forEach(function (c) {
      const li = vazia();
      li[COL_ROTULO - 1] = c[0];
      props.forEach(function (p, i) { li[colDe(i)] = p[c[1]] === null ? '' : p[c[1]]; });
      const num = linha(li);
      merges.push({ l: num, c: COL_ROTULO, nl: 1, nc: 4 });
      props.forEach(function (p, i) { moeda.push({ l: num, c: colDe(i), n: 2 }); });
    });

  linha(vazia());

  // ── textos longos, cada um ocupando a largura toda
  [['Detalhar o serviço a ser aprovado:', eq.detalhamento],
   ['Premissas da equalização:', eq.premissas],
   ['Favorável à contratação e por quê:', eq.parecer],
   ['Notas Capital Realty:', eq.notasCr]].forEach(function (c) {
    if (!c[1]) return;
    let li = vazia();
    li[COL_ROTULO - 1] = c[0];
    const lRot = linha(li);
    merges.push({ l: lRot, c: COL_ROTULO, nl: 1, nc: largura - 1 });
    faixas.secao.push(lRot);

    li = vazia();
    li[COL_ROTULO - 1] = c[1];
    const lTxt = linha(li);
    merges.push({ l: lTxt, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  });

  if (eq.vencedora) {
    const venceu = props.filter(function (p) { return p.id === eq.vencedora; })[0];
    if (venceu) {
      const li = vazia();
      li[COL_ROTULO - 1] = 'Proposta vencedora: ' + venceu.nome;
      const lv = linha(li);
      merges.push({ l: lv, c: COL_ROTULO, nl: 1, nc: largura - 1 });
      faixas.total.push(lv);
    }
  }

  linha(vazia());
  li = vazia();
  li[COL_ROTULO - 1] = 'Retrato gerado em ' + cfDataHoraTexto_(new Date()) +
    ' por ' + cfUsuario_() + ' · valores estáticos, sem fórmula.';
  const lPe = linha(li);
  merges.push({ l: lPe, c: COL_ROTULO, nl: 1, nc: largura - 1 });

  cfPintarExportacao_(aba, grade, merges, moeda, faixas, largura, n, colDe, COL_VALOR);

  const arquivo = DriveApp.getFileById(ss.getId());
  try { arquivo.moveTo(DriveApp.getFolderById(CF_PASTA_ID)); } catch (erro) {}

  const pdf = cfPdfDaPlanilha_(ss.getId(), aba.getSheetId(), nome);
  cfLog_('exportar', 'equalizacao', idEq, JSON.stringify({ planilha: ss.getId(), pdf: pdf.getId() }));

  return { planilha: ss.getUrl(), pdf: pdf.getUrl() };
}

/** Escrita e formatação. Separado só para a função de cima caber na cabeça. */
function cfPintarExportacao_(aba, grade, merges, moeda, faixas, largura, n, colDe, COL_VALOR) {
  aba.getRange(1, 1, grade.length, largura).setValues(grade);

  aba.setColumnWidth(1, 24);
  aba.setColumnWidth(2, 90);
  aba.setColumnWidth(3, 300);
  aba.setColumnWidth(4, 60);
  aba.setColumnWidth(5, 60);
  for (let i = 0; i < n; i++) {
    aba.setColumnWidth(colDe(i), 110);
    aba.setColumnWidth(colDe(i) + 1, 110);
  }

  merges.forEach(function (m) {
    try { aba.getRange(m.l, m.c, m.nl, m.nc).merge(); } catch (erro) {}
  });

  moeda.forEach(function (f) {
    aba.getRange(f.l, f.c, 1, f.n).setNumberFormat(CF_EXP_MOEDA);
  });

  const corpo = aba.getRange(1, 2, grade.length, largura - 1);
  corpo.setBorder(true, true, true, true, true, true, CF_EXP_LINHA, SpreadsheetApp.BorderStyle.SOLID);
  corpo.setVerticalAlignment('middle').setFontSize(10);

  faixas.titulo.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1)
      .setBackground(CF_EXP_NOTURNO).setFontColor('#FFFFFF')
      .setFontWeight('bold').setFontSize(13).setHorizontalAlignment('center');
  });
  faixas.secao.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1)
      .setBackground(CF_EXP_ROYAL).setFontColor('#FFFFFF').setFontWeight('bold');
  });
  faixas.grupo.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1).setBackground(CF_EXP_CLARO).setFontWeight('bold');
  });
  faixas.total.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1)
      .setBackground(CF_EXP_CLARO).setFontWeight('bold').setFontSize(11);
  });

  // Descrição alinhada à esquerda; todo o resto à direita, que é como se
  // lê número. Sem isto a coluna de texto fica centralizada e ilegível.
  aba.getRange(1, COL_VALOR, grade.length, 1).setHorizontalAlignment('left').setWrap(true);
  aba.getRange(1, 2, grade.length, 1).setHorizontalAlignment('left');
  // Sem congelar coluna: os títulos e rótulos são mesclados de B até o fim,
  // e o Sheets recusa congelar uma coluna que corta uma célula mesclada ao
  // meio. Como o PDF sai em paisagem ajustado à largura, não faz falta.
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
