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
  const faixas = { titulo: [], secao: [], grupo: [], total: [], cabecalho: [], rodape: [], livre: [], melhores: [],
                   // Percentual e link precisam ser aplicados DEPOIS do
                   // setValues da grade: ele reescreve a célula inteira e
                   // levaria junto o formato e a âncora do hyperlink.
                   percentual: [], links: [], assinatura: [], destaque: [] };

  const vazia = function () {
    const l = [];
    for (let i = 0; i < largura; i++) l.push('');
    return l;
  };
  const linha = function (conteudo) { grade.push(conteudo); return grade.length; };

  // ── scorecard: a decisão em cima, o detalhamento embaixo
  //
  //  Quem homologa não lê a equalização inteira para decidir — lê para
  //  conferir. Enterrar o valor recomendado depois de trinta linhas de
  //  cadastro é obrigar a busca visual num documento que já sabe a
  //  resposta.
  cfBlocoScorecard_(eq, props, linha, vazia, grade, merges, moeda, faixas,
                    largura, COL_ROTULO, COL_VALOR);

  // ── título
  linha(vazia());
  let l = linha(vazia());
  grade[l - 1][COL_ROTULO - 1] = 'INFORMAÇÕES OBRIGATÓRIAS';
  merges.push({ l: l, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.titulo.push(l);
  linha(vazia());

  // ── cabeçalho: à esquerda a compra, à direita os proponentes
  const empresa = cfEmpresaDoMega_(eq.empreendimento).nome;
  const ehDemercado = (empresa || '').toUpperCase().indexOf('DEMERCADO') >= 0;
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
    // Observação, e não "Nº da proposta": esse já aparece no rodapé, e
    // repetir campo num documento de conferência convida a divergência.
    ['Situação:', eq.status, 'Observação:', function () { return ''; }]
  ];

  let lLinhaEmpresa = null;
  cabecalho.forEach(function (c) {
    const li = vazia();
    li[COL_ROTULO - 1] = c[0];
    li[COL_VALOR - 1] = c[1] || '';
    // O rótulo da direita ocupa Qtd+Un. mescladas: sozinha, a coluna de
    // unidade tem 85px e cortava "Cidade/Estado:" no meio.
    li[COL_QTD - 1] = c[2];
    props.forEach(function (p, i) { li[colDe(i) - 1] = c[3](p); });
    const num = linha(li);
    if (c[0] === 'Empresa:') lLinhaEmpresa = num;
    merges.push({ l: num, c: COL_QTD, nl: 1, nc: 2 });
    props.forEach(function (p, i) { merges.push({ l: num, c: colDe(i), nl: 1, nc: 2 }); });
    faixas.cabecalho.push(num);
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
    else {
      props.forEach(function (p, i) {
        moeda.push({ l: num, c: colDe(i), n: 2 });
        if (item.menor && p.id === item.menor) {
          faixas.melhores.push({ l: num, c: colDe(i), nc: 2 });
        }
      });
    }
  });

  // ── totais
  li = vazia();
  li[COL_ROTULO - 1] = 'VALOR TOTAL';
  props.forEach(function (p, i) { li[colDe(i)] = p.calculado === null ? '' : p.calculado; });
  const lTotal = linha(li);
  merges.push({ l: lTotal, c: COL_ROTULO, nl: 1, nc: 4 });
  faixas.total.push(lTotal);
  props.forEach(function (p, i) { moeda.push({ l: lTotal, c: colDe(i), n: 2 }); });

  let menorTotIdx = null;
  props.forEach(function (p, i) {
    if (p.calculado !== null && p.calculado > 0) {
      if (menorTotIdx === null || p.calculado < props[menorTotIdx].calculado) {
        menorTotIdx = i;
      }
    }
  });
  if (menorTotIdx !== null) {
    faixas.melhores.push({ l: lTotal, c: colDe(menorTotIdx), nc: 2 });
  }

  // Distância até o menor. O total sozinho diz quanto custa; o spread diz
  // se a disputa foi apertada ou se um fornecedor está fora de mercado —
  // e é isso que decide se vale renegociar ou recotar.
  if (menorTotIdx !== null) {
    const base = props[menorTotIdx].calculado;
    li = vazia();
    li[COL_ROTULO - 1] = 'Variação sobre o menor';
    props.forEach(function (p, i) {
      if (p.calculado === null || p.calculado <= 0) { li[colDe(i)] = '—'; return; }
      li[colDe(i)] = (p.calculado - base) / base;
    });
    const lSpread = linha(li);
    merges.push({ l: lSpread, c: COL_ROTULO, nl: 1, nc: 4 });
    faixas.total.push(lSpread);
    props.forEach(function (p, i) {
      if (p.calculado === null || p.calculado <= 0) return;
      faixas.percentual.push({ l: lSpread, c: colDe(i) });
    });
    faixas.melhores.push({ l: lSpread, c: colDe(menorTotIdx), nc: 2 });
  }

  if (props.some(function (p) { return p.total !== null; })) {
    li = vazia();
    li[COL_ROTULO - 1] = 'VALOR TOTAL declarado no documento';
    props.forEach(function (p, i) { li[colDe(i)] = p.total === null ? '' : p.total; });
    const lDecl = linha(li);
    merges.push({ l: lDecl, c: COL_ROTULO, nl: 1, nc: 4 });
    faixas.total.push(lDecl);
    props.forEach(function (p, i) { moeda.push({ l: lDecl, c: colDe(i), n: 2 }); });

    let menorDeclIdx = null;
    props.forEach(function (p, i) {
      if (p.total !== null && p.total > 0) {
        if (menorDeclIdx === null || p.total < props[menorDeclIdx].total) {
          menorDeclIdx = i;
        }
      }
    });
    if (menorDeclIdx !== null) {
      faixas.melhores.push({ l: lDecl, c: colDe(menorDeclIdx), nc: 2 });
    }
  }

  linha(vazia());

  // ── rodapé da proposta
  const rodape = [
    ['Numero da Proposta:', function (p) { return p.numero || ''; }, false],
    ['Revisão do fornecedor:', function (p) { return p.revisao || ''; }, false],
    ['Data da Proposta:', function (p) { return p.data || ''; }, false],
    ['Condições de pagamento:', function (p) { return p.condicoes || ''; }, false],
    ['Lead time para início:', function (p) { return p.leadTime === null || p.leadTime === '' ? '' : p.leadTime + (p.leadTime == 1 ? ' dia' : ' dias'); }, false],
    ['Prazo de execução:', function (p) {
      var pe = p.prazoExecucao;
      if ((pe === null || pe === undefined || pe === '') && p.dataPrevInicio && p.dataPrevTermino) {
        var dIni = new Date(p.dataPrevInicio + 'T00:00:00');
        var dFim = new Date(p.dataPrevTermino + 'T00:00:00');
        if (!isNaN(dIni.getTime()) && !isNaN(dFim.getTime()) && dFim >= dIni) {
          pe = Math.max(1, Math.round((dFim.getTime() - dIni.getTime()) / 86400000));
        }
      }
      return (pe === null || pe === undefined || pe === '') ? '' : pe + (pe == 1 ? ' dia' : ' dias');
    }, false],
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
    faixas.rodape.push(num);
  });

  // ── a proposta assinada, a um clique
  //
  //  O mapa é a leitura de quem cotou; a proposta é a prova do que foi
  //  oferecido. Quem homologa precisa das duas na mesma tela, e procurar
  //  o PDF numa pasta do Drive é onde a conferência costuma parar.
  if (props.some(function (p) { return !!p.linkProposta; })) {
    li = vazia();
    li[COL_ROTULO - 1] = 'Proposta original:';
    props.forEach(function (p, i) {
      li[colDe(i) - 1] = p.linkProposta ? 'Abrir proposta ↗' : '—';
    });
    const lLink = linha(li);
    merges.push({ l: lLink, c: COL_ROTULO, nl: 1, nc: 4 });
    props.forEach(function (p, i) {
      merges.push({ l: lLink, c: colDe(i), nl: 1, nc: 2 });
      if (p.linkProposta) {
        faixas.links.push({ l: lLink, c: colDe(i), url: p.linkProposta, texto: 'Abrir proposta ↗' });
      }
    });
    faixas.rodape.push(lLink);
  }

  linha(vazia());

  // ── histórico da negociação
  const teveNegociacao = props.some(function (p) {
    return (p.propostaInicial !== null && p.propostaInicial !== undefined && p.propostaInicial !== '') ||
           (p.reducao !== null && p.reducao !== undefined && p.reducao !== '') ||
           (p.rodada && p.rodada !== 'inicial');
  });

  li = vazia();
  li[COL_ROTULO - 1] = 'Histórico da Negociação';
  const lHist = linha(li);
  merges.push({ l: lHist, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.secao.push(lHist);

  if (!teveNegociacao) {
    li = vazia();
    li[COL_ROTULO - 1] = 'Não houve renegociação nesta cotação — valores mantidos conforme propostas originais.';
    const numSemNeg = linha(li);
    merges.push({ l: numSemNeg, c: COL_ROTULO, nl: 1, nc: largura - 1 });
    faixas.cabecalho.push(numSemNeg);
  } else {
    li = vazia();
    li[COL_ROTULO - 1] = 'Rodada de negociação:';
    props.forEach(function (p, i) {
      li[colDe(i) - 1] = (p.rodada && p.rodada !== 'inicial') ? p.rodada : 'proposta original';
    });
    const numR = linha(li);
    merges.push({ l: numR, c: COL_ROTULO, nl: 1, nc: 4 });
    props.forEach(function (p, i) { merges.push({ l: numR, c: colDe(i), nl: 1, nc: 2 }); });
    faixas.rodape.push(numR);

    [['Proposta inicial:', 'propostaInicial'], ['Redução total da negociação:', 'reducao']]
      .forEach(function (c) {
        const li = vazia();
        li[COL_ROTULO - 1] = c[0];
        props.forEach(function (p, i) {
          const val = p[c[1]];
          li[colDe(i)] = (val === null || val === undefined || val === '') ? '—' : val;
        });
        const num = linha(li);
        merges.push({ l: num, c: COL_ROTULO, nl: 1, nc: 4 });
        props.forEach(function (p, i) {
          if (p[c[1]] !== null && p[c[1]] !== undefined && p[c[1]] !== '') {
            moeda.push({ l: num, c: colDe(i), n: 2 });
          } else {
            merges.push({ l: num, c: colDe(i), nl: 1, nc: 2 });
          }
        });
      });
  }

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
    faixas.livre.push(lTxt);
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

  cfBlocoAlcadas_(linha, vazia, merges, faixas, largura, COL_ROTULO, COL_VALOR);

  linha(vazia());
  li = vazia();
  li[COL_ROTULO - 1] = 'Retrato gerado em ' + cfDataHoraTexto_(new Date()) +
    ' por ' + cfUsuario_() + ' · valores estáticos, sem fórmula.';
  const lPe = linha(li);
  merges.push({ l: lPe, c: COL_ROTULO, nl: 1, nc: largura - 1 });

  cfPintarExportacao_(aba, grade, merges, moeda, faixas, largura, n, colDe, COL_VALOR, PRIMEIRA, lLinhaEmpresa, ehDemercado);

  // flush ANTES de exportar: as escritas ficam numa fila, e a URL de export
  // lê o arquivo do servidor. Sem isto o PDF sai em branco — a planilha
  // fica certa e o PDF, vazio, porque foram lidos em momentos diferentes.
  SpreadsheetApp.flush();

  // O PDF é gerado antes de mover. Mover para a pasta compartilhada troca o
  // arquivo de drive, e exportar em seguida pega a propagação pela metade.
  const pdf = cfPdfDaPlanilha_(ss.getId(), aba.getSheetId(), nome);

  const arquivo = DriveApp.getFileById(ss.getId());
  try { arquivo.moveTo(DriveApp.getFolderById(CF_PASTA_ID)); } catch (erro) {}
  cfLog_('exportar', 'equalizacao', idEq, JSON.stringify({ planilha: ss.getId(), pdf: pdf.getId() }));

  return { planilha: ss.getUrl(), pdf: pdf.getUrl() };
}

/** Escrita e formatação. Separado só para a função de cima caber na cabeça. */
function cfPintarExportacao_(aba, grade, merges, moeda, faixas, largura, n, colDe, COL_VALOR, PRIMEIRA, lLinhaEmpresa, ehDemercado) {
  aba.getRange(1, 1, grade.length, largura).setValues(grade);

  // Larguras pensadas para o rótulo mais longo de cada coluna:
  // "Data da equalização:" na B, "Cidade/Estado:" em D+E mescladas.
  aba.setColumnWidth(1, 22);
  aba.setColumnWidth(2, 180);
  aba.setColumnWidth(3, 330);
  aba.setColumnWidth(4, 70);
  aba.setColumnWidth(5, 85);
  for (let i = 0; i < n; i++) {
    aba.setColumnWidth(colDe(i), 125);
    aba.setColumnWidth(colDe(i) + 1, 125);
  }

  if (lLinhaEmpresa && ehDemercado) {
    try {
      if (aba && typeof aba.setRowHeight === 'function') aba.setRowHeight(lLinhaEmpresa, 46);
      if (aba && typeof aba.getRange === 'function') {
        try {
          aba.getRange(lLinhaEmpresa, COL_VALOR)
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle');
        } catch (eAlign) {}
      }
      const colocou = cfInserirLogoDemercado_(aba, COL_VALOR, lLinhaEmpresa, 330, 46);
      if (colocou) {
        try { aba.getRange(lLinhaEmpresa, COL_VALOR).setValue(''); } catch (eLimpa) {}
      }
    } catch (eLogo) {
      Logger.log('Aviso ao ajustar linha empresa: ' + eLogo);
    }
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
  aba.getRange(1, 2, grade.length, 1).setHorizontalAlignment('left').setWrap(true);

  // Quebra de linha onde o texto é imprevisível.
  //
  // Largura de coluna resolve o caso conhecido; quebra resolve o caso que
  // não dá para prever — razão social de fornecedor não tem tamanho máximo,
  // e "CONTABILISTA SUPRIMENTOS PARA ESCRITORIO" não cabe em coluna nenhuma
  // que ainda deixe a tabela caber na página. Célula cortada em documento
  // de conferência é informação perdida sem aviso.
  faixas.cabecalho.concat(faixas.rodape).forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1).setWrap(true).setVerticalAlignment('top');
  });
  faixas.secao.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1).setWrap(true);
  });
  // Os textos longos de aprovação ocupam a largura toda e precisam crescer
  // para baixo, não sumir à direita.
  aba.getRange(1, 2, grade.length, largura - 1).setVerticalAlignment('middle');
  faixas.livre.forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1).setWrap(true).setVerticalAlignment('top');
  });

  // Dado de proponente centralizado na coluna dele.
  //
  // Alinhado à esquerda, o texto de uma coluna encosta na anterior e a
  // leitura ambígua: não fica claro a qual fornecedor cada informação
  // pertence. Dinheiro é a exceção e continua à direita — número se
  // compara pela casa decimal, e é para isso que a coluna existe.
  // Centraliza o bloco inteiro de proponentes e depois devolve o dinheiro
  // para a direita. Nesta ordem: assim "não cotou" e qualquer texto solto
  // nas colunas de preço também ficam centralizados, sem precisar
  // enumerá-los um a um.
  aba.getRange(1, PRIMEIRA, grade.length, n * 2).setHorizontalAlignment('center');
  moeda.forEach(function (f) {
    aba.getRange(f.l, f.c, 1, f.n).setHorizontalAlignment('right');
  });

  // Centraliza colunas de Quantidade e Unidade no comparativo
  aba.getRange(1, 4, grade.length, 2).setHorizontalAlignment('center');

  // Centraliza dados dos proponentes no cabeçalho e rodapé
  faixas.cabecalho.concat(faixas.rodape).forEach(function (l) {
    for (let i = 0; i < n; i++) {
      aba.getRange(l, colDe(i), 1, 2).setHorizontalAlignment('center');
    }
  });

  // Destaque em verde para os melhores valores (menor preço por item e menor total)
  const CF_EXP_VERDE_FUNDO = '#E4F2EA';
  const CF_EXP_VERDE_TEXTO = '#1F7A4C';
  (faixas.melhores || []).forEach(function (m) {
    aba.getRange(m.l, m.c, 1, m.nc || 1)
      .setBackground(CF_EXP_VERDE_FUNDO)
      .setFontColor(CF_EXP_VERDE_TEXTO)
      .setFontWeight('bold');
  });
  (faixas.percentual || []).forEach(function (f) {
    aba.getRange(f.l, f.c, 1, 2).setNumberFormat('+0.0%;-0.0%;0.0%').setHorizontalAlignment('center');
  });

  // Linha para assinar: só a borda de baixo, grossa o suficiente para
  // sobreviver à impressão.
  (faixas.assinatura || []).forEach(function (f) {
    aba.getRange(f.l, f.c, 1, f.nc)
      .setBorder(null, null, true, null, null, null, CF_EXP_NOTURNO, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  });

  (faixas.destaque || []).forEach(function (f) {
    aba.getRange(f.l, f.c, 1, f.nc || 1).setFontWeight('bold').setFontSize(f.tamanho || 12);
  });

  // Por último, e não é preferência de estilo: o setValues lá em cima
  // reescreve a célula inteira e devolveria o rich text a texto puro. Foi
  // medido em spike — na ordem que o plano propunha, o link some.
  (faixas.links || []).forEach(function (f) {
    try {
      const rico = SpreadsheetApp.newRichTextValue()
        .setText(f.texto)
        .setLinkUrl(f.url)
        .build();
      aba.getRange(f.l, f.c).setRichTextValue(rico);
    } catch (erro) {
      // Link inválido não pode derrubar a exportação inteira: o texto já
      // está na célula, só deixa de ser clicável.
      Logger.log('Link não aplicado em ' + f.l + ',' + f.c + ': ' + erro);
    }
  });

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

  // Um PDF de uma página em branco tem uns poucos KB. Falhar aqui é melhor
  // que entregar um arquivo vazio com cara de sucesso — foi assim que o
  // problema passou despercebido da primeira vez.
  const tamanho = blob.getBytes().length;
  if (tamanho < 3000) {
    throw new Error('O PDF saiu praticamente vazio (' + tamanho + ' bytes). ' +
      'Tente de novo em alguns segundos — a planilha pode não ter terminado de gravar.');
  }
  try {
    return DriveApp.getFolderById(CF_PASTA_ID).createFile(blob);
  } catch (erro) {
    return DriveApp.createFile(blob);   // sem acesso à pasta: cai na raiz
  }
}

function cfDataHoraTexto_(d) {
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
}

/**
 * Insere a imagem da logo da Demercado diretamente na planilha de forma centralizada.
 * O blob incorporado na planilha garante que a imagem saia impressa no PDF sem depender de carregamento externo.
 */
function cfInserirLogoDemercado_(aba, col, lin, larguraCol, alturaLin) {
  try {
    const idLogo = '168kVyD9dXiZctYNl27f_-Ic9S1W3wm-T';
    let blob = null;
    try {
      blob = DriveApp.getFileById(idLogo).getBlob();
    } catch (eDrive) {
      try {
        const resp = UrlFetchApp.fetch('https://lh3.googleusercontent.com/d/' + idLogo);
        if (resp.getResponseCode() === 200) blob = resp.getBlob();
      } catch (eFetch) {}
    }
    if (blob && aba && aba.insertImage) {
      let colW = larguraCol || 330;
      let rowH = alturaLin || 46;
      try {
        if (typeof aba.getColumnWidth === 'function') {
          const w = aba.getColumnWidth(col);
          if (w && w > 50) colW = w;
        }
        if (typeof aba.getRowHeight === 'function') {
          const h = aba.getRowHeight(lin);
          if (h && h > 20) rowH = h;
        }
      } catch (eDim) {}

      const imgW = 140;
      const imgH = 42;
      const offsetX = Math.max(0, Math.round((colW - imgW) / 2));
      const offsetY = Math.max(0, Math.round((rowH - imgH) / 2));

      const img = aba.insertImage(blob, col, lin, offsetX, offsetY);
      if (img && img.setWidth && img.setHeight) {
        img.setWidth(imgW);
        img.setHeight(imgH);
      }
      return true;
    }
  } catch (erro) {
    Logger.log('Aviso: falha ao inserir logo Demercado via insertImage: ' + erro);
  }
  return false;
}


/**
 * O resumo que decide, no topo do documento.
 *
 * Antes deste bloco, quem homologava precisava percorrer o comparativo
 * inteiro para responder três perguntas: qual proposta, quanto custa e
 * quanto se economizou. As três respostas já existiam no documento —
 * estavam espalhadas por trinta linhas.
 *
 * Enquanto não há homologação, o bloco mostra a MENOR proposta e diz que
 * é recomendação, não decisão. Chamar de "vencedora" o que ninguém
 * homologou seria o documento decidindo no lugar de quem assina.
 */
function cfBlocoScorecard_(eq, props, linha, vazia, grade, merges, moeda, faixas,
                           largura, COL_ROTULO, COL_VALOR) {
  let homologado = false;
  let escolhido = null;

  if (eq.vencedora) {
    escolhido = props.filter(function (p) { return p.id === eq.vencedora; })[0] || null;
    homologado = !!escolhido;
  }

  // Política unificada de valor (alinhada com cfHomologar_):
  // 1. Se homologado e com valorFinal carimbado em ata/equalização, ele é a autoridade máxima.
  // 2. O total declarado no documento (com desconto/negociação global) prevalece.
  // 3. Caso não haja declarado, utiliza-se a soma calculada dos itens cotados.
  const valorDe = function (p) {
    if (!p) return null;
    if (homologado && eq.vencedora && p.id === eq.vencedora && eq.valorFinal !== null && eq.valorFinal !== undefined) {
      return eq.valorFinal;
    }
    return p.total !== null ? p.total : p.calculado;
  };

  if (!escolhido) {
    props.forEach(function (p) {
      const v = valorDe(p);
      if (v === null || v <= 0) return;
      if (!escolhido || v < valorDe(escolhido)) escolhido = p;
    });
  }

  const largo = largura - COL_VALOR + 1;   // de C até o fim da tabela

  const titulo = vazia();
  titulo[COL_ROTULO - 1] = homologado ? 'PROPOSTA HOMOLOGADA' : 'RESUMO PARA APROVAÇÃO';
  const lTit = linha(titulo);
  merges.push({ l: lTit, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.titulo.push(lTit);

  if (!escolhido) {
    const nada = vazia();
    nada[COL_ROTULO - 1] = 'Nenhuma proposta com valor apurado até o momento.';
    const lN = linha(nada);
    merges.push({ l: lN, c: COL_ROTULO, nl: 1, nc: largura - 1 });
    faixas.cabecalho.push(lN);
    linha(vazia());
    return;
  }

  const valor = valorDe(escolhido);

  // Maior proposta comparável: é contra ela que a disputa gerou economia.
  let maior = null;
  props.forEach(function (p) {
    const v = valorDe(p);
    if (v === null || v <= 0) return;
    if (maior === null || v > maior) maior = v;
  });

  // Rótulo em B, valor em C, explicação de D até o fim. O valor fica numa
  // célula só para poder ser número com formato de moeda — texto formatado
  // à mão é o que fazia "182,50" virar "182,5" na planilha.
  const escreve = function (rotulo, valorCelula, detalhe, ehMoeda, destaque) {
    const li = vazia();
    li[COL_ROTULO - 1] = rotulo;
    li[COL_VALOR - 1] = valorCelula;
    const num = linha(li);
    if (detalhe) {
      grade[num - 1][COL_VALOR] = detalhe;
      merges.push({ l: num, c: COL_VALOR + 1, nl: 1, nc: largo - 1 });
    } else {
      merges.push({ l: num, c: COL_VALOR, nl: 1, nc: largo });
    }
    if (ehMoeda) moeda.push({ l: num, c: COL_VALOR, n: 1 });
    if (destaque) faixas.destaque.push({ l: num, c: COL_VALOR, nc: 1, tamanho: 12 });
    faixas.cabecalho.push(num);
    return num;
  };

  escreve(homologado ? 'Proposta homologada:' : 'Menor proposta:',
    escolhido.nome,
    'CNPJ ' + (cfCnpjFormatado_(escolhido.cnpj) || '—') +
    (homologado ? '' : ' · recomendação por menor valor, ainda sem homologação'),
    false, true);

  let detalheValor = 'soma dos itens cotados';
  if (homologado && eq.valorFinal !== null && eq.valorFinal !== undefined) {
    if (escolhido.calculado !== null && Math.abs(valor - escolhido.calculado) > 0.01) {
      detalheValor = 'valor homologado com ajuste (soma dos itens: R$ ' + cfValorTexto_(escolhido.calculado) + ')';
    } else {
      detalheValor = 'valor homologado em ata';
    }
  } else if (escolhido.total !== null) {
    if (escolhido.calculado !== null && Math.abs(escolhido.total - escolhido.calculado) > 0.01) {
      detalheValor = 'total declarado com ajuste (soma dos itens: R$ ' + cfValorTexto_(escolhido.calculado) + ')';
    } else {
      detalheValor = 'total declarado no documento';
    }
  }

  escreve('Valor:', valor === null ? '—' : valor,
    detalheValor,
    valor !== null, true);

  // Economia da disputa: só existe se houve com quem comparar.
  if (maior !== null && valor !== null && maior > valor) {
    escreve('Economia na disputa:', maior - valor,
      cfPct_((maior - valor) / maior) + ' abaixo da proposta mais cara (R$ ' +
      cfValorTexto_(maior) + ')', true, false);
  } else if (props.length < 2) {
    escreve('Economia na disputa:', '—', 'proposta única: não houve comparação', false, false);
  }

  // Economia da negociação: o que a conversa com o fornecedor rendeu.
  const inicial = escolhido.propostaInicial;
  if (escolhido.reducao !== null && escolhido.reducao !== undefined && escolhido.reducao !== '') {
    escreve('Economia na negociação:', escolhido.reducao,
      inicial ? 'de R$ ' + cfValorTexto_(inicial) + ' para R$ ' + cfValorTexto_(valor) +
                ' (' + cfPct_(escolhido.reducao / inicial) + ')' : '',
      true, false);
  } else {
    escreve('Economia na negociação:', '—', 'não houve renegociação registrada', false, false);
  }

  const prazo = escolhido.dataPrevInicio ||
    (escolhido.leadTime !== null && escolhido.leadTime !== undefined && escolhido.leadTime !== ''
      ? escolhido.leadTime + (escolhido.leadTime == 1 ? ' dia após a OC' : ' dias após a OC')
      : '—');
  escreve('Início previsto:', prazo,
    escolhido.condicoes ? 'Pagamento: ' + escolhido.condicoes : '', false, false);

  linha(vazia());
}

/** Percentual com uma casa, no formato que se lê em português. */
function cfPct_(fracao) {
  if (fracao === null || fracao === undefined || !isFinite(fracao)) return '—';
  return (fracao * 100).toFixed(1).replace('.', ',') + '%';
}

/**
 * Valor em texto, para caber dentro de uma frase.
 * Feito à mão porque toLocaleString('pt-BR') depende de ICU completo, que
 * o runtime do Apps Script não garante — e um número que sai "1,234.56"
 * dentro de uma frase em português passa despercebido até alguém somar.
 */
function cfValorTexto_(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (!isFinite(n)) return '—';
  const negativo = n < 0;
  const partes = Math.abs(n).toFixed(2).split('.');
  const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (negativo ? '-' : '') + inteiro + ',' + partes[1];
}

/**
 * Quem assina o quê.
 *
 * A equalização circula entre três pessoas com responsabilidades
 * diferentes: quem cotou, quem valida o escopo e quem autoriza o gasto.
 * Sem o quadro, as três assinam no mesmo espaço em branco e depois não se
 * sabe quem validou o quê — que é exatamente a pergunta que uma auditoria
 * faz primeiro.
 */
function cfBlocoAlcadas_(linha, vazia, merges, faixas, largura, COL_ROTULO, COL_VALOR) {
  const largo = largura - COL_VALOR + 1;
  linha(vazia());

  let li = vazia();
  li[COL_ROTULO - 1] = 'HOMOLOGAÇÃO';
  const lTit = linha(li);
  merges.push({ l: lTit, c: COL_ROTULO, nl: 1, nc: largura - 1 });
  faixas.secao.push(lTit);

  li = vazia();
  li[COL_ROTULO - 1] = 'Decisão da Diretoria:';
  li[COL_VALOR - 1] = '(   ) Aprovado          (   ) Aprovado com ressalvas          (   ) Rejeitado';
  const lDec = linha(li);
  merges.push({ l: lDec, c: COL_VALOR, nl: 1, nc: largo });
  faixas.cabecalho.push(lDec);

  [['Elaborado por (Suprimentos):', 'nome, data e assinatura'],
   ['Parecer técnico (Gestor da área):', 'escopo validado — nome, data e assinatura'],
   ['Homologação (Diretoria Executiva):', 'nome, data e assinatura']].forEach(function (c) {
    const li = vazia();
    li[COL_ROTULO - 1] = c[0];
    li[COL_VALOR - 1] = c[1];
    const num = linha(li);
    merges.push({ l: num, c: COL_VALOR, nl: 1, nc: largo });
    faixas.cabecalho.push(num);
    faixas.assinatura.push({ l: num, c: COL_VALOR, nc: largo });
  });
}
