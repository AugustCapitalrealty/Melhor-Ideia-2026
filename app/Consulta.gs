/**
 * Capital Fornecedores — consulta ao histórico de preço
 *
 * É aqui que a base para de ser depósito e vira resposta.
 *
 * Sheets não faz JOIN, então a estratégia é uma leitura por aba e o
 * cruzamento em memória. Enquanto a base for de milhares de linhas isso
 * é mais rápido que qualquer alternativa dentro do Apps Script.
 */

const CF_VERSAO_CONSULTA = '2026-09-05.3 faixa-por-item';

// ─────────────────────────────────────────────────────────────
//  Carga
// ─────────────────────────────────────────────────────────────

/**
 * Monta a visão de preços já cruzada com item, proposta e fornecedor.
 * Só entra o que é comparável: preço efetivamente cotado.
 */
function cfCarregarPrecos_() {
  const eapPorId = {};
  cfLerTudo_('EAP').forEach(function (n) { eapPorId[String(n.ID)] = n; });

  const propPorId = {};
  cfLerTudo_('Propostas').forEach(function (p) { propPorId[String(p.ID)] = p; });

  const fornPorCnpj = {};
  cfLerTudo_('Fornecedores').forEach(function (f) { fornPorCnpj[String(f.CNPJ)] = f; });

  const eqPorId = {};
  cfLerTudo_('Equalizacoes').forEach(function (e) { eqPorId[String(e.ID)] = e; });

  return cfLerTudo_('Precos').map(function (p) {
    const no = eapPorId[String(p.ID_EAP)] || {};
    const prop = propPorId[String(p.ID_PROPOSTA)] || {};
    const forn = fornPorCnpj[String(p.CNPJ)] || {};
    const eq = eqPorId[String(p.ID_EQUALIZACAO)] || {};

    return {
      descricao: String(no.DESCRICAO || ''),
      chave: cfNormalizar_(no.DESCRICAO),
      codigo: String(no.CODIGO_ORIGINAL || ''),
      idProposta: String(p.ID_PROPOSTA || ''),
      fonte: String(p.ID_FONTE || prop.ID_FONTE || ''),
      revisao: String(prop.REVISAO_DOCUMENTO || ''),
      idImportacao: String(p.ID_IMPORTACAO || ''),
      cnpjEmpresa: String(prop.CNPJ_EMPRESA || eq.CNPJ_EMPRESA || ''),
      valor: typeof p.PRECO_UNITARIO === 'number' ? p.PRECO_UNITARIO : cfNumero_(p.PRECO_UNITARIO),
      status: String(p.STATUS_PRECO || ''),
      unidade: String(p.UNIDADE || ''),
      quantidade: p.QUANTIDADE === '' ? null : p.QUANTIDADE,
      cnpj: String(p.CNPJ || ''),
      // Cadastro primeiro; se o CNPJ foi recusado, vale o nome do documento.
      fornecedor: String(forn.RAZAO_SOCIAL || prop.RAZAO_SOCIAL_INFORMADA ||
                         cfFormatarCnpj_(p.CNPJ) || 'fornecedor não identificado'),
      semCadastro: !forn.RAZAO_SOCIAL,
      empreendimento: String(p.ID_EMPREENDIMENTO || ''),
      uf: String(p.UF || ''),
      data: p.DATA instanceof Date ? p.DATA : cfData_(p.DATA),
      origem: String(p.ORIGEM || ''),
      idEqualizacao: String(p.ID_EQUALIZACAO || ''),
      projeto: String(eq.PROJETO || ''),
      area: String(eq.AREA || ''),
      vencedora: prop.VENCEDORA === true
    };
  }).filter(function (r) {
    return r.status === 'cotado' && r.valor !== null;
  });
}

// ─────────────────────────────────────────────────────────────
//  Consulta
// ─────────────────────────────────────────────────────────────

/**
 * Procura um item no histórico e mostra o que já se pagou por ele.
 * @param {string} termo  "mão de obra", "antena", "sensor"…
 */
function consultarPreco(termo) {
  if (!termo || !String(termo).trim()) {
    throw new Error('Diga o que procurar. Ex.: consultarPreco("mão de obra")\n' +
                    'Pelo menu, use consultarMaoDeObra() ou crie o seu atalho.');
  }

  const alvo = cfNormalizar_(termo);
  const palavras = alvo.split(' ').filter(function (p) { return p.length > 2; });

  const achados = cfCarregarPrecos_().filter(function (r) {
    if (!r.chave) return false;
    if (r.chave.indexOf(alvo) >= 0) return true;
    return palavras.length > 0 && palavras.every(function (p) { return r.chave.indexOf(p) >= 0; });
  });

  const resultado = cfAgruparPorItem_(achados, termo);
  cfImprimirConsulta_(resultado);
  return resultado;
}

/** Agrupa por descrição e por equalização, para a leitura fazer sentido. */
function cfAgruparPorItem_(achados, termo) {
  const porItem = {};
  achados.forEach(function (r) {
    const k = r.chave + '§' + (r.idEqualizacao || r.idProposta || r.cnpj + '@' + (r.data ? r.data.getTime() : ''));
    if (!porItem[k]) {
      porItem[k] = {
        descricao: r.descricao, codigo: r.codigo, data: r.data,
        empreendimento: r.empreendimento, projeto: r.projeto, area: r.area,
        precos: []
      };
    }
    porItem[k].precos.push(r);
  });

  const grupos = Object.keys(porItem).map(function (k) { return porItem[k]; })
    .sort(function (a, b) {
      const da = a.data ? a.data.getTime() : 0, db = b.data ? b.data.getTime() : 0;
      return db - da;                                  // mais recente primeiro
    });

  // Faixa por item. Juntar itens diferentes numa faixa só produz número
  // sem sentido: "monitoramento" traz um equipamento de R$ 3.096 e uma
  // mensalidade de R$ 69, e a variação entre os dois não significa nada.
  grupos.forEach(function (g) {
    const comparaveis = g.precos.filter(function(p) { return p.status === 'cotado' && p.valor !== null; });
    if (comparaveis.length === 0) {
      g.minimo = null;
      g.maximo = null;
      g.variacao = null;
      return;
    }
    const v = comparaveis.map(function (p) { return p.valor; });
    g.minimo = Math.min.apply(null, v);
    g.maximo = Math.max.apply(null, v);
    g.variacao = g.minimo > 0 ? ((g.maximo - g.minimo) / g.minimo) * 100 : null;
  });

  // Série: o MESMO item em equalizações diferentes, com mesma unidade de medida.
  // Comparar preço por unidade com preço por caixa sem conversão envenena o histórico (C11).
  const porChave = {};
  grupos.forEach(function (g) {
    const un = (g.precos[0] && g.precos[0].unidade) ? String(g.precos[0].unidade).trim().toLowerCase() : '';
    const k = cfChaveItem_(g.descricao) + (un ? ' § ' + un : '');
    (porChave[k] = porChave[k] || []).push(g);
  });
  const series = Object.keys(porChave)
    .filter(function (k) { return porChave[k].length > 1; })
    .map(function (k) {
      // As grafias distintas ficam visíveis: agrupar em silêncio esconde
      // uma decisão que pode estar errada.
      const vistas = {};
      porChave[k].forEach(function (g) { vistas[g.descricao] = true; });
      return {
        descricao: porChave[k][0].descricao,
        variantes: Object.keys(vistas),
        ocorrencias: porChave[k]
      };
    });

  return { termo: termo, pontos: achados.length, grupos: grupos, series: series };
}

// ─────────────────────────────────────────────────────────────
//  Panorama
// ─────────────────────────────────────────────────────────────

/** O que a base sabe hoje. Bom para abrir uma conversa. */
function panoramaDaBase() {
  const precos = cfCarregarPrecos_();
  const eq = cfLerTudo_('Equalizacoes');
  const forn = cfLerTudo_('Fornecedores');
  const pend = cfLerTudo_('Pendencias').filter(function (p) { return p.RESOLVIDA !== true; });

  const porEmpreendimento = {}, porAno = {};
  let menor = null, maior = null;
  precos.forEach(function (r) {
    porEmpreendimento[r.empreendimento || '—'] = (porEmpreendimento[r.empreendimento || '—'] || 0) + 1;
    const ano = r.data ? r.data.getFullYear() : '—';
    porAno[ano] = (porAno[ano] || 0) + 1;
    if (menor === null || r.valor < menor) menor = r.valor;
    if (maior === null || r.valor > maior) maior = r.valor;
  });

  // Itens que aparecem em mais de uma equalização: é onde há série de preço.
  const porChave = {};
  precos.forEach(function (r) {
    (porChave[r.chave] = porChave[r.chave] || { descricao: r.descricao, equalizacoes: {}, valores: [] });
    porChave[r.chave].equalizacoes[r.idEqualizacao] = true;
    porChave[r.chave].valores.push(r.valor);
  });
  const comSerie = Object.keys(porChave)
    .map(function (k) { return porChave[k]; })
    .filter(function (i) { return Object.keys(i.equalizacoes).length > 1; })
    .sort(function (a, b) { return b.valores.length - a.valores.length; });

  Logger.log('── panorama da base ──  (consulta ' + CF_VERSAO_CONSULTA + ')');
  Logger.log('Equalizações:  ' + eq.length);
  Logger.log('Fornecedores:  ' + forn.length);
  Logger.log('Pontos de preço: ' + precos.length +
             (precos.length ? '   de R$ ' + cfMoeda_(menor) + ' a R$ ' + cfMoeda_(maior) : ''));
  Logger.log('Pendências abertas: ' + pend.length);
  Logger.log('');
  Logger.log('Por empreendimento:');
  Object.keys(porEmpreendimento).forEach(function (k) {
    Logger.log('   ' + k + ': ' + porEmpreendimento[k]);
  });
  Logger.log('Por ano:');
  Object.keys(porAno).sort().forEach(function (k) { Logger.log('   ' + k + ': ' + porAno[k]); });

  Logger.log('');
  if (comSerie.length) {
    Logger.log('Itens que já aparecem em mais de uma equalização — aqui nasce a série:');
    comSerie.slice(0, 10).forEach(function (i) {
      const min = Math.min.apply(null, i.valores), max = Math.max.apply(null, i.valores);
      Logger.log('   ' + i.descricao + '  —  ' + i.valores.length + ' pontos, R$ ' +
                 cfMoeda_(min) + ' a R$ ' + cfMoeda_(max));
    });
  } else {
    Logger.log('Nenhum item repetido entre equalizações ainda.');
    Logger.log('É esperado com poucos arquivos: a série aparece conforme o acervo entra.');
  }
  return { equalizacoes: eq.length, precos: precos.length, itensComSerie: comSerie.length };
}

// ─────────────────────────────────────────────────────────────
//  Saída
// ─────────────────────────────────────────────────────────────

function cfMoeda_(v) {
  if (v === null || v === undefined) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cfImprimirConsulta_(r) {
  const plural = r.grupos.length === 1 ? 'item' : 'itens';
  Logger.log('🔍 "' + r.termo + '" — ' + r.pontos + ' ponto(s) de preço em ' +
             r.grupos.length + ' ' + plural + '   (consulta ' + CF_VERSAO_CONSULTA + ')');
  if (!r.pontos) {
    Logger.log('\nNada encontrado. Tente um termo mais curto — a busca casa por palavra.');
    return;
  }
  Logger.log('');

  r.grupos.forEach(function (g) {
    const quando = g.data ? Utilities.formatDate(g.data, 'America/Sao_Paulo', 'dd/MM/yyyy') : 'sem data';
    Logger.log(g.codigo + ' ' + g.descricao);
    Logger.log('   ' + [g.empreendimento, g.area, quando].filter(String).join(' · '));
    g.precos.sort(function (a, b) { return a.valor - b.valor; }).forEach(function (p) {
      Logger.log('      ' + cfPad_(p.fornecedor, 34) + ' R$ ' + cfMoeda_(p.valor) +
                 (p.vencedora ? '   ✓ contratado' : '') +
                 (p.semCadastro ? '   (sem cadastro)' : ''));
    });
    if (g.precos.length > 1) {
      Logger.log('      → R$ ' + cfMoeda_(g.minimo) + ' a R$ ' + cfMoeda_(g.maximo) +
                 (g.variacao !== null ? '   ·   ' + g.variacao.toFixed(0) + '% entre o menor e o maior' : ''));
    }
    Logger.log('');
  });

  if (r.series.length) {
    Logger.log('── o mesmo item ao longo do tempo ──');
    r.series.forEach(function (s) {
      Logger.log(s.descricao + ':');
      s.ocorrencias.sort(function (a, b) {
        return (a.data ? a.data.getTime() : 0) - (b.data ? b.data.getTime() : 0);
      }).forEach(function (o) {
        const quando = o.data ? Utilities.formatDate(o.data, 'America/Sao_Paulo', 'MM/yyyy') : '—';
        Logger.log('   ' + quando + '  ' + o.empreendimento + '   menor R$ ' + cfMoeda_(o.minimo));
      });
      const primeiro = s.ocorrencias[0].minimo, ultimo = s.ocorrencias[s.ocorrencias.length - 1].minimo;
      if (primeiro > 0) {
        const d = ((ultimo - primeiro) / primeiro) * 100;
        Logger.log('   → ' + (d >= 0 ? 'subiu ' : 'caiu ') + Math.abs(d).toFixed(0) +
                   '% entre a primeira e a última cotação');
      }
      Logger.log('');
    });
  } else if (r.grupos.length > 1) {
    Logger.log('Estes são itens diferentes — não há faixa única que faça sentido entre eles.');
    Logger.log('A série de preço aparece quando o MESMO item voltar em outra equalização.');
  }
}

function cfPad_(texto, largura) {
  const t = String(texto || '');
  return t.length >= largura ? t.slice(0, largura - 1) + '…'
                             : t + new Array(largura - t.length + 1).join('.');
}

// ─────────────────────────────────────────────────────────────
//  Atalhos para o menu Executar
// ─────────────────────────────────────────────────────────────

function consultarMaoDeObra()  { return consultarPreco('mão de obra'); }
function consultarSensor()     { return consultarPreco('sensor'); }
function consultarAntena()     { return consultarPreco('antena'); }
function consultarMonitoramento() { return consultarPreco('monitoramento'); }
