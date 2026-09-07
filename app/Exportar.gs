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
                   percentual: [], links: [], assinatura: [], destaque: [], notas: [], marca: [] };

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
                    largura, COL_ROTULO, COL_VALOR, m.pendencias);

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
    const refTxt = item.marcaReferencia ? ' [Ref: ' + item.marcaReferencia + ']' : '';
    li[COL_VALOR - 1] = new Array(item.nivel + 1).join('    ') + item.descricao + refTxt;
    if (item.tipo !== 'grupo') {
      li[COL_QTD - 1] = item.quantidade === null || item.quantidade === undefined ? '' : item.quantidade;
      li[COL_UN - 1] = item.unidade || '';
      props.forEach(function (p, i) {
        const c = item.precos[p.id];
        if (!c) return;
        if (c.status === 'incluso_em_outro_item') { li[colDe(i) - 1] = 'incluso'; return; }
        if (c.status === 'excluido') { li[colDe(i) - 1] = 'excluído'; return; }
        if (c.status === 'nao_aplicavel') { li[colDe(i) - 1] = 'não aplicável'; return; }
        if (c.status !== 'cotado' || c.valor === null) { li[colDe(i) - 1] = 'não cotou'; return; }
        li[colDe(i) - 1] = c.valor;
        li[colDe(i)] = c.total === null ? '' : c.total;
      });
    }
    const num = linha(li);
    if (item.tipo === 'grupo') faixas.grupo.push(num);
    else {
      props.forEach(function (p, i) {
        const c = item.precos[p.id];
        if (c && c.marcaCotada) {
          faixas.notas.push({ l: num, c: colDe(i), nota: 'Marca cotada: ' + c.marcaCotada });
        }
        moeda.push({ l: num, c: colDe(i), n: 2 });
        if (item.menor && p.id === item.menor) {
          faixas.melhores.push({ l: num, c: colDe(i), nc: 2 });
        }
      });

      // A marca abaixo do preço de quem a cotou.
      //
      // Fica numa linha própria, alinhada com a coluna do proponente,
      // porque é assim que se lê: o preço e a marca daquele fornecedor
      // um embaixo do outro. Numa lista à parte, o comprador teria que
      // reconstruir de cabeça quem cotou o quê.
      const temMarca = props.some(function (p) {
        const c = item.precos[p.id];
        return !!(c && c.marcaCotada);
      });
      if (temMarca) {
        const lm = vazia();
        lm[COL_VALOR - 1] = 'Marca cotada';
        props.forEach(function (p, i) {
          const c = item.precos[p.id];
          lm[colDe(i) - 1] = (c && c.marcaCotada) ? c.marcaCotada : '—';
        });
        const numM = linha(lm);
        props.forEach(function (p, i) {
          merges.push({ l: numM, c: colDe(i), nl: 1, nc: 2 });
        });
        faixas.marca.push(numM);
      }
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

  const temDeclarado = props.some(function (p) { return p.total !== null; });
  let lDecl = null;
  if (temDeclarado) {
    li = vazia();
    li[COL_ROTULO - 1] = 'VALOR TOTAL declarado no documento';
    props.forEach(function (p, i) { li[colDe(i)] = p.total === null ? '' : p.total; });
    lDecl = linha(li);
    merges.push({ l: lDecl, c: COL_ROTULO, nl: 1, nc: 4 });
    faixas.total.push(lDecl);
    props.forEach(function (p, i) { moeda.push({ l: lDecl, c: colDe(i), n: 2 }); });
  }

  // Base comercial unificada com o Scorecard para ranking e variação sobre o menor (A3 / E01)
  const valorComercialDe = function (p) {
    if (!p) return null;
    return p.total !== null ? p.total : p.calculado;
  };

  let menorComercialIdx = null;
  props.forEach(function (p, i) {
    const vc = valorComercialDe(p);
    if (vc !== null && vc > 0) {
      if (menorComercialIdx === null || vc < valorComercialDe(props[menorComercialIdx])) {
        menorComercialIdx = i;
      }
    }
  });

  if (menorComercialIdx !== null) {
    const base = valorComercialDe(props[menorComercialIdx]);
    li = vazia();
    li[COL_ROTULO - 1] = 'Variação sobre o menor';
    props.forEach(function (p, i) {
      const vc = valorComercialDe(p);
      if (vc === null || vc <= 0) { li[colDe(i)] = '—'; return; }
      li[colDe(i)] = (vc - base) / base;
    });
    const lSpread = linha(li);
    merges.push({ l: lSpread, c: COL_ROTULO, nl: 1, nc: 4 });
    faixas.total.push(lSpread);
    props.forEach(function (p, i) {
      const vc = valorComercialDe(p);
      if (vc === null || vc <= 0) return;
      faixas.percentual.push({ l: lSpread, c: colDe(i) });
    });
    faixas.melhores.push({ l: lSpread, c: colDe(menorComercialIdx), nc: 2 });
    if (temDeclarado && lDecl) {
      faixas.melhores.push({ l: lDecl, c: colDe(menorComercialIdx), nc: 2 });
    } else {
      faixas.melhores.push({ l: lTotal, c: colDe(menorComercialIdx), nc: 2 });
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
        var dIni = cfData_(p.dataPrevInicio);
        var dFim = cfData_(p.dataPrevTermino);
        if (dIni && dFim && dFim >= dIni) {
          pe = Math.max(1, Math.round((dFim.getTime() - dIni.getTime()) / 86400000));
        }
      }
      return (pe === null || pe === undefined || pe === '') ? '' : pe + (pe == 1 ? ' dia' : ' dias');
    }, false],
    ['Validade proposta:', function (p) { return p.validadeAte || ''; }, false],
    ['Faturamento Direto:', function (p) {
      if (!p.faturamentoDireto) return 'não';
      const v = cfNumero_(p.valorFaturamentoDireto);
      return v ? 'sim (' + cfMoedaTexto_(v) + ')' : 'sim';
    }, false],
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

  if (lLinhaEmpresa) {
    try {
      if (aba && typeof aba.setRowHeight === 'function') aba.setRowHeight(lLinhaEmpresa, 46);
      if (aba && typeof aba.getRange === 'function') {
        try {
          aba.getRange(lLinhaEmpresa, COL_VALOR)
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle');
        } catch (eAlign) {}
      }
      const colocou = cfInserirLogoEmpresa_(aba, COL_VALOR, lLinhaEmpresa, 330, 46, ehDemercado);
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
  // Menor, em itálico e recuada: é qualificação do preço acima, não um
  // dado concorrente. Com o mesmo peso do preço, a tabela passaria a
  // ter duas linhas de igual importância por item.
  (faixas.marca || []).forEach(function (l) {
    aba.getRange(l, 2, 1, largura - 1)
      .setFontSize(9).setFontStyle('italic').setFontColor('#5D6883');
    aba.getRange(l, COL_VALOR)
      .setHorizontalAlignment('right').setFontColor('#8A93A8');
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

  (faixas.notas || []).forEach(function (f) {
    try {
      aba.getRange(f.l, f.c).setNote(f.nota);
    } catch (erro) {
      Logger.log('Nota não aplicada em ' + f.l + ',' + f.c + ': ' + erro);
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
 * Onde procurar a logo de cada empresa.
 *
 * O ID abaixo é o último recurso, não o primeiro. Um identificador de
 * arquivo escrito no código só funciona enquanto ninguém mover, trocar
 * ou recriar o arquivo — e quando ele para de funcionar, corrigir exige
 * editar código e republicar, o que ninguém da operação faz.
 *
 * Por isso a busca tem quatro etapas, da mais fácil de consertar para a
 * mais difícil: a aba Config, um arquivo com nome conhecido na pasta do
 * projeto, o ID daqui, e por fim a URL pública.
 */
const CF_LOGO_DRIVE = {
  demercado:     '168kVyD9dXiZctYNl27f_-Ic9S1W3wm-T',
  // "RGB Color", e não a "RGB Positivo": a Positivo é o mesmo
  // desenho em preto chapado, e sai destoando ao lado da Demercado,
  // que é colorida. As duas são PNG, do mesmo dono, na mesma pasta.
  capitalRealty: '1toRVfIgamy4CWBT2Gv2mGd6V_W0OGISS'
};

/** Nome do arquivo procurado na pasta do projeto, por empresa. */
const CF_LOGO_ARQUIVO = {
  demercado:     'logo-demercado',
  capitalRealty: 'logo-capital-realty'
};

/** Chave na aba Config, por empresa. */
const CF_LOGO_CONFIG = {
  demercado:     'LOGO_DEMERCADO',
  capitalRealty: 'LOGO_CAPITAL_REALTY'
};

/**
 * A imagem da logo, de onde quer que ela venha.
 *
 * Devolve { blob, origem } ou null. A origem interessa: quando a logo
 * some, saber de qual das quatro fontes ela vinha é metade do conserto.
 */
/**
 * Quantos pixels tem o PNG, lendo o cabeçalho.
 *
 * O IHDR de um PNG traz largura e altura nos bytes 16..23. Ler isso
 * custa nada e evita descobrir o tamanho só quando o insertImage
 * estoura — que é tarde, porque ele estoura em silêncio dentro de um
 * try e o documento sai sem logo.
 *
 * Devolve null quando não é PNG: aí não dá para saber, e quem decide
 * é o insertImage mesmo.
 */
function cfDimensoesPng_(blob) {
  try {
    const b = blob.getBytes();
    if (!b || b.length < 24) return null;
    const u = function (i) { return b[i] & 0xFF; };
    // Assinatura PNG: 137 80 78 71
    if (u(0) !== 137 || u(1) !== 80 || u(2) !== 78 || u(3) !== 71) return null;
    const n = function (i) {
      return u(i) * 16777216 + u(i + 1) * 65536 + u(i + 2) * 256 + u(i + 3);
    };
    return { largura: n(16), altura: n(20) };
  } catch (e) {
    return null;
  }
}

/** Teto do insertImage: 1 milhão de pixels e 2 MB. */
const CF_LOGO_MAX_PIXELS = 1000000;

/**
 * A mesma imagem, pequena o bastante para caber na planilha.
 *
 * O insertImage recusa acima de 1 milhão de pixels. A logo da Capital
 * Realty tem 2643×493 = 1.302.999 e era recusada; a da Demercado tem
 * 886×281 = 248.966 e passava. Daí uma aparecer e a outra não, sem que
 * houvesse nada de errado com o arquivo, com a permissão ou com o
 * empreendimento.
 *
 * A redução vem do próprio Drive, pelo thumbnailLink com o lado maior
 * pedido em 1000px — para uma logo que será desenhada com 240px de
 * largura, sobra resolução de sobra.
 */
function cfLogoQueCabe_(blob, id, tentativas) {
  const d = cfDimensoesPng_(blob);
  if (!d || d.largura * d.altura <= CF_LOGO_MAX_PIXELS) return blob;

  const grande = d.largura + '×' + d.altura + ' = ' +
                 (d.largura * d.altura) + ' pixels, acima do teto de ' +
                 CF_LOGO_MAX_PIXELS;

  if (!id) {
    if (tentativas) tentativas.push('imagem grande demais (' + grande + ') e sem ID para reduzir');
    return blob;
  }

  try {
    const meta = UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + id +
      '?fields=thumbnailLink&supportsAllDrives=true',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true });
    if (meta.getResponseCode() !== 200) {
      if (tentativas) tentativas.push('redução: HTTP ' + meta.getResponseCode() + ' ao pedir a miniatura');
      return blob;
    }
    const link = JSON.parse(meta.getContentText()).thumbnailLink;
    if (!link) {
      if (tentativas) tentativas.push('redução: o Drive não devolveu miniatura para este arquivo');
      return blob;
    }
    // O link vem com o tamanho no fim (=s220). Pedir maior é só trocar.
    const grandeQb = link.replace(/=s\d+(-[a-z0-9]+)?$/i, '=s1000');
    const resp = UrlFetchApp.fetch(grandeQb, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      if (tentativas) tentativas.push('redução: HTTP ' + resp.getResponseCode() + ' ao baixar a miniatura');
      return blob;
    }
    const menor = resp.getBlob();
    if ((menor.getContentType() || '').indexOf('image/') !== 0) {
      if (tentativas) tentativas.push('redução: a miniatura veio como ' + menor.getContentType());
      return blob;
    }
    Logger.log('Logo reduzida para caber: era ' + grande + '.');
    return menor.setName('logo.png');
  } catch (e) {
    if (tentativas) tentativas.push('redução: ' + e);
    return blob;
  }
}

function cfLogoBlob_(chave) {
  const tentativas = [];

  const doId = function (id, origem) {
    if (!id) return null;
    try {
      const arq = DriveApp.getFileById(String(id).trim());
      const tipo = arq.getMimeType();
      if (tipo.indexOf('image/') !== 0) {
        tentativas.push(origem + ': o arquivo é ' + tipo + ', não uma imagem');
        return null;
      }
      return { blob: cfLogoQueCabe_(arq.getBlob(), arq.getId(), tentativas),
               origem: origem + ' (' + arq.getName() + ')' };
    } catch (e) {
      tentativas.push(origem + ': ' + e);
      return null;
    }
  };

  // 1. Aba Config — o jeito de corrigir sem tocar em código.
  try {
    const alvo = CF_LOGO_CONFIG[chave];
    const linha = cfLerTudo_('Config').filter(function (c) {
      return String(c.CHAVE || '').trim().toUpperCase() === alvo;
    })[0];
    if (linha && linha.VALOR) {
      // Aceita a URL inteira do Drive ou só o ID.
      const bruto = String(linha.VALOR).trim();
      const m = bruto.match(/\/d\/([A-Za-z0-9_-]+)/);
      const r = doId(m ? m[1] : bruto, 'aba Config');
      if (r) return r;
    }
  } catch (e) {
    tentativas.push('aba Config: ' + e);
  }

  // 2. Arquivo com nome conhecido na pasta do projeto — basta soltar a
  //    imagem lá, sem ID nenhum para copiar.
  try {
    const pasta = DriveApp.getFolderById(CF_PASTA_ID);
    const prefixo = cfNormalizar_(CF_LOGO_ARQUIVO[chave]);
    const arquivos = pasta.getFiles();
    while (arquivos.hasNext()) {
      const arq = arquivos.next();
      if (cfNormalizar_(arq.getName()).indexOf(prefixo) !== 0) continue;
      if (arq.getMimeType().indexOf('image/') !== 0) continue;
      return { blob: cfLogoQueCabe_(arq.getBlob(), arq.getId(), tentativas),
               origem: 'pasta do projeto (' + arq.getName() + ')' };
    }
    tentativas.push('pasta do projeto: nenhum arquivo de imagem começando com "' +
                    CF_LOGO_ARQUIVO[chave] + '"');
  } catch (e) {
    tentativas.push('pasta do projeto: ' + e);
  }

  // 3. O ID escrito no código, pelo DriveApp.
  const doCodigo = doId(CF_LOGO_DRIVE[chave], 'ID no código');
  if (doCodigo) return doCodigo;

  // 4. O mesmo ID, mas pela API do Drive com o token da execução.
  //
  //    Não é redundância do passo anterior: o DriveApp resolve pelo
  //    índice do usuário e falha em arquivo de Drive compartilhado ou
  //    de outra conta; a API busca o conteúdo direto e alcança tudo o
  //    que o token alcança.
  const idBruto = CF_LOGO_DRIVE[chave];
  try {
    const resp = UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + idBruto + '?alt=media&supportsAllDrives=true',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      const b = resp.getBlob();
      const tipo = b.getContentType() || '';
      if (tipo.indexOf('image/') === 0) {
        return { blob: cfLogoQueCabe_(b.setName('logo.png'), idBruto, tentativas),
                 origem: 'API do Drive (token da execução)' };
      }
      tentativas.push('API do Drive: devolveu ' + tipo + ', não uma imagem');
    } else {
      tentativas.push('API do Drive: HTTP ' + resp.getResponseCode());
    }
  } catch (e) {
    tentativas.push('API do Drive: ' + e);
  }

  // 5. A URL pública. Última porque é a que menos depende de
  //    permissão — e por isso a que menos costuma funcionar quando as
  //    outras falharam.
  try {
    const resp = UrlFetchApp.fetch('https://lh3.googleusercontent.com/d/' + CF_LOGO_DRIVE[chave],
                                   { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      return { blob: resp.getBlob(), origem: 'URL pública' };
    }
    tentativas.push('URL pública: HTTP ' + resp.getResponseCode());
  } catch (e) {
    tentativas.push('URL pública: ' + e);
  }

  Logger.log('Logo "' + chave + '" não encontrada. Tentativas:');
  tentativas.forEach(function (t) { Logger.log('   · ' + t); });
  return null;
}

/**
 * Guarda uma cópia da logo na pasta do projeto.
 *
 * Depois disto, a exportação para de depender de permissão em arquivo
 * de terceiro: o arquivo passa a ser desta instalação, na pasta desta
 * instalação, encontrado pelo nome. É a diferença entre uma logo que
 * funciona hoje e uma que continua funcionando quando alguém arrumar o
 * Drive da empresa.
 *
 * Rode: fixarLogosNaPasta   (neste arquivo, Exportar.gs)
 */
function fixarLogosNaPasta() {
  const pasta = DriveApp.getFolderById(CF_PASTA_ID);

  [['demercado', 'Demercado'], ['capitalRealty', 'Capital Realty']].forEach(function (par) {
    const chave = par[0], nome = par[1];
    const achada = cfLogoBlob_(chave);

    if (!achada) {
      Logger.log(nome + ': nenhuma fonte devolveu a imagem — nada a fixar.');
      Logger.log('   Rode diagnosticarLogos() para ver o motivo de cada uma,');
      Logger.log('   ou suba o PNG na pasta com o nome ' + CF_LOGO_ARQUIVO[chave] + '.png');
      return;
    }

    if (achada.origem.indexOf('pasta do projeto') === 0) {
      Logger.log(nome + ': já está na pasta — ' + achada.origem);
      return;
    }

    const arq = pasta.createFile(achada.blob.setName(CF_LOGO_ARQUIVO[chave] + '.png'));
    Logger.log(nome + ': copiada de ' + achada.origem);
    Logger.log('   agora em ' + arq.getUrl());
  });

  Logger.log('');
  Logger.log('A partir daqui a exportação lê da pasta do projeto, sem depender');
  Logger.log('de permissão em arquivo de fora.');
}

/**
 * Desenha as duas logos lado a lado, numa aba só para isso.
 *
 * Existe para separar duas perguntas que se confundem: "a logo da
 * Capital Realty está quebrada?" e "esta equalização é da Capital
 * Realty?". A empresa não é escolhida — ela é derivada do Mega, e
 * Curitiba é Demercado. Uma equalização de Curitiba sai com a logo da
 * Demercado porque está certa, não porque a outra falhou.
 *
 * Aqui as duas são desenhadas pela MESMA rotina da exportação, sem
 * depender de Mega nenhum. Se as duas aparecem, o que estava errado
 * era o empreendimento do teste. Se só uma aparece, o defeito é real
 * e o log diz de que fonte cada uma veio.
 *
 * Rode: testarAsDuasLogos   (neste arquivo, Exportar.gs)
 */
function testarAsDuasLogos() {
  const planilha = cfPlanilha_();
  const NOME = 'Teste de Logos';

  let aba = planilha.getSheetByName(NOME);
  if (aba) {
    // Imagem sobre a grade não sai com clear(): tem de ser removida uma
    // a uma, ou o teste seguinte mostra a logo da rodada anterior.
    aba.getImages().forEach(function (i) { i.remove(); });
    aba.clear();
  } else {
    aba = planilha.insertSheet(NOME);
  }

  aba.setColumnWidth(1, 200);
  aba.setColumnWidth(2, 330);
  aba.getRange('A1').setValue('Empresa').setFontWeight('bold');
  aba.getRange('B1').setValue('Logo, pela mesma rotina da exportação').setFontWeight('bold');

  const casos = [
    { nome: 'Demercado (Curitiba)', ehDemercado: true, linha: 2 },
    { nome: 'Capital Realty (Esteio, Itajaí)', ehDemercado: false, linha: 3 }
  ];

  Logger.log('Desenhando as duas logos na aba "' + NOME + '".');
  Logger.log('');

  casos.forEach(function (c) {
    aba.setRowHeight(c.linha, 46);
    aba.getRange(c.linha, 1).setValue(c.nome);
    const colocou = cfInserirLogoEmpresa_(aba, 2, c.linha, 330, 46, c.ehDemercado);
    if (!colocou) {
      aba.getRange(c.linha, 2).setValue('— não desenhou —').setFontColor('#b00020');
    }
    Logger.log(c.nome + ': ' + (colocou ? 'desenhou' : 'NÃO desenhou'));
  });

  Logger.log('');
  Logger.log('Abra a aba "' + NOME + '" e olhe as duas linhas.');
  Logger.log('As duas aparecendo: a logo está boa, e o que estava errado era o');
  Logger.log('empreendimento da equalização de teste — a empresa vem do Mega,');
  Logger.log('e Curitiba é Demercado.');
  Logger.log('Só uma aparecendo: o defeito é real, e as linhas acima dizem de');
  Logger.log('que fonte cada logo veio.');
  return NOME;
}

/**
 * Insere a logo da empresa contratante na planilha, centralizada.
 *
 * O blob é incorporado na planilha, e não carregado por URL, para a
 * imagem sair impressa no PDF sem depender de o leitor ter acesso ao
 * arquivo original.
 *
 * Quando falha, devolve false e o chamador deixa o nome da empresa em
 * texto — o documento continua correto, só menos bonito. Mas a falha é
 * REGISTRADA com o motivo: silenciosa, ela vira "a logo sumiu" semanas
 * depois, sem ninguém saber de qual das duas etapas.
 */
function cfInserirLogoEmpresa_(aba, col, lin, larguraCol, alturaLin, ehDemercado) {
  const empresa = ehDemercado ? 'Demercado' : 'Capital Realty';
  const chave = ehDemercado ? 'demercado' : 'capitalRealty';
  try {
    const achada = cfLogoBlob_(chave);
    const blob = achada ? achada.blob : null;
    if (!blob) {
      Logger.log('Logo ' + empresa + ' não inserida — o documento sai com o nome em texto. ' +
                 'Rode diagnosticarLogos() para ver o motivo de cada fonte.');
    } else {
      Logger.log('Logo ' + empresa + ': ' + achada.origem);
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

      // A caixa em que a logo tem de caber.
      const maxW = Math.min(240, Math.max(80, colW - 24));
      const maxH = Math.max(20, rowH - 6);

      const img = aba.insertImage(blob, col, lin, 0, 0);

      // Cada logo tem a sua proporção — a da Capital Realty é quase
      // duas vezes mais alongada que a da Demercado. Um tamanho fixo
      // para as duas acerta uma e deforma a outra, então aqui a
      // imagem é encaixada na caixa mantendo a proporção dela.
      let imgW = maxW;
      let imgH = maxH;
      try {
        const natW = img && img.getWidth ? img.getWidth() : 0;
        const natH = img && img.getHeight ? img.getHeight() : 0;
        if (natW > 0 && natH > 0) {
          const escala = Math.min(maxW / natW, maxH / natH);
          imgW = Math.max(1, Math.round(natW * escala));
          imgH = Math.max(1, Math.round(natH * escala));
        }
      } catch (eDim2) {}

      if (img && img.setWidth && img.setHeight) {
        img.setWidth(imgW);
        img.setHeight(imgH);
      }
      // Centralizar depois de saber o tamanho final.
      try {
        if (img && img.setAnchorCellXOffset) {
          img.setAnchorCellXOffset(Math.max(0, Math.round((colW - imgW) / 2)));
          img.setAnchorCellYOffset(Math.max(0, Math.round((rowH - imgH) / 2)));
        }
      } catch (eOff) {}
      return true;
    }
  } catch (erro) {
    Logger.log('Logo ' + empresa + ': insertImage falhou — ' + erro);
  }
  return false;
}

/**
 * Por que a logo não apareceu, fonte por fonte.
 *
 * A inserção é tolerante a falha de propósito — logo ausente não pode
 * derrubar uma exportação. O preço disso é que ela some sem explicação,
 * e o documento sai com o nome da empresa em texto como se fosse o
 * desenho. Esta função paga a diferença.
 *
 * Rode: diagnosticarLogos   (neste arquivo, Exportar.gs)
 */
function diagnosticarLogos() {
  Logger.log('═══ Logos das empresas contratantes ═══');
  Logger.log('');
  Logger.log('A busca tem quatro etapas, da mais fácil de consertar para a mais');
  Logger.log('difícil. A primeira que devolver uma imagem vence.');
  Logger.log('');

  [['demercado', 'Demercado'], ['capitalRealty', 'Capital Realty']].forEach(function (par) {
    const chave = par[0], nome = par[1];
    Logger.log('──────── ' + nome + ' ────────');

    // 1. Config
    let valorConfig = '';
    try {
      const linha = cfLerTudo_('Config').filter(function (c) {
        return String(c.CHAVE || '').trim().toUpperCase() === CF_LOGO_CONFIG[chave];
      })[0];
      valorConfig = linha ? String(linha.VALOR || '').trim() : '';
    } catch (e) {}
    Logger.log('1. Aba Config, chave ' + CF_LOGO_CONFIG[chave] + ': ' +
               (valorConfig ? valorConfig : '(vazia)'));

    // 2. Pasta do projeto
    try {
      const pasta = DriveApp.getFolderById(CF_PASTA_ID);
      const prefixo = cfNormalizar_(CF_LOGO_ARQUIVO[chave]);
      let achou = '';
      const arquivos = pasta.getFiles();
      while (arquivos.hasNext() && !achou) {
        const arq = arquivos.next();
        if (cfNormalizar_(arq.getName()).indexOf(prefixo) === 0) {
          achou = arq.getName() + ' · ' + arq.getMimeType();
        }
      }
      Logger.log('2. Pasta do projeto, arquivo "' + CF_LOGO_ARQUIVO[chave] + '.*": ' +
                 (achou || '(não encontrado)'));
    } catch (e) {
      Logger.log('2. Pasta do projeto: erro — ' + e);
    }

    // 3. ID no código
    const id = CF_LOGO_DRIVE[chave];
    try {
      const f = DriveApp.getFileById(id);
      const tipo = f.getMimeType();
      Logger.log('3. ID no código (' + id + '): ' + f.getName() + ' · ' + tipo +
                 ' · ' + f.getSize() + ' bytes');
      if (tipo.indexOf('image/') !== 0) {
        Logger.log('   PROBLEMA: não é imagem. insertImage precisa de PNG ou JPG —');
        Logger.log('             Slides, Docs e PDF não servem.');
      }
    } catch (e) {
      Logger.log('3. ID no código (' + id + '): INACESSÍVEL — ' + e);
      Logger.log('   Em geral é o arquivo não existir, ou a conta que roda o');
      Logger.log('   script não ter acesso a ele.');
    }

    // 4. URL pública
    try {
      const r = UrlFetchApp.fetch('https://lh3.googleusercontent.com/d/' + id,
                                  { muteHttpExceptions: true });
      Logger.log('4. URL pública: HTTP ' + r.getResponseCode() +
                 (r.getResponseCode() === 200 ? ' — funcionaria' : ' — não é público'));
    } catch (e) {
      Logger.log('4. URL pública: falhou — ' + e);
    }

    // Veredito
    const achada = cfLogoBlob_(chave);
    Logger.log('');
    Logger.log('   ➜ ' + (achada ? 'OK, vem de: ' + achada.origem
                                 : 'NENHUMA FONTE FUNCIONOU — o documento sai com o nome em texto.'));
    Logger.log('');
  });

  Logger.log('Para resolver, o caminho mais curto:');
  Logger.log('  Suba a imagem (PNG ou JPG) na pasta do projeto com o nome');
  Logger.log('  "logo-capital-realty.png" ou "logo-demercado.png". Não precisa');
  Logger.log('  de ID, nem de editar código, nem de republicar.');
  Logger.log('');
  Logger.log('  Pasta: https://drive.google.com/drive/folders/' + CF_PASTA_ID);
  Logger.log('');
  Logger.log('  Alternativa: cole o ID ou a URL do arquivo na aba Config, na');
  Logger.log('  chave LOGO_CAPITAL_REALTY ou LOGO_DEMERCADO.');
}

/** Compatibilidade retroativa para chamadas diretas de logo Demercado */
function cfInserirLogoDemercado_(aba, col, lin, larguraCol, alturaLin) {
  return cfInserirLogoEmpresa_(aba, col, lin, larguraCol, alturaLin, true);
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
                           largura, COL_ROTULO, COL_VALOR, pendencias) {
  let homologado = false;
  let escolhido = null;

  if (eq.status === 'homologada' && eq.vencedora) {
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
  titulo[COL_ROTULO - 1] = eq.status === 'cancelada' ? 'COTAÇÃO CANCELADA'
    : (homologado ? 'PROPOSTA HOMOLOGADA' : 'INDICAÇÃO DE SUPRIMENTOS — AGUARDANDO APROVAÇÃO');
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
    (homologado ? '' : ' · indicação por menor valor, aguardando aprovação formal'),
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

  if (pendencias && pendencias.length) {
    pendencias.forEach(function (pend) {
      escreve('Ressalva / Pendência:', pend.descricao || pend.tipo, '', false, false);
    });
  }

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
