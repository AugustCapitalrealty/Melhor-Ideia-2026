/**
 * Capital Fornecedores — manutenção da planilha
 *
 * Rotinas que se rodam à mão, quando algo precisa ser consertado na base.
 * Nada aqui é chamado pelo app: são operações raras e destrutivas demais
 * para ficarem a um clique de distância no fluxo normal.
 */

// ─────────────────────────────────────────────────────────────
//  Linhas fantasma de checkbox
//
//  cfFormatarAba_ aplica validação de checkbox sobre getMaxRows() inteiro.
//  O Sheets passa a devolver FALSE em cada linha em branco, e essas linhas
//  contam no getLastRow(). O efeito colateral caro é que cfInserir_ gravava
//  em getLastRow() + 1 — foi assim que os dados reais foram parar na linha
//  1001, com mil linhas vazias por cima.
//
//  A leitura e a escrita já ignoram as fantasmas (cfLinhaTemDado_ e
//  cfUltimaLinhaReal_, em Dados.gs). Esta rotina é a faxina: traz os dados
//  de volta para o topo, para quem abre a planilha enxergar o que existe.
// ─────────────────────────────────────────────────────────────

/**
 * Mostra o que a limpeza faria. Não escreve nada.
 * Rode esta primeiro, sempre.
 */
function simularLimpezaFantasma() {
  return cfRelatarLimpeza_(cfLimpezaFantasma_(false), 'SIMULAÇÃO');
}

/**
 * Faz a limpeza de verdade.
 *
 * Reescreve cada aba com apenas as linhas que têm registro: grava os reais
 * no topo e só então limpa a sobra. clearContent preserva formatação, notas
 * e validação das colunas — o mesmo que cfApagarPor_ faz.
 */
function limparLinhasFantasma() {
  return cfComTrava_(function () {
    const r = cfLimpezaFantasma_(true);
    cfLog_('limpeza_fantasma', 'planilha', '', JSON.stringify({
      abasAfetadas: r.abas.length,
      linhasRemovidas: r.totalFantasmas
    }));
    return cfRelatarLimpeza_(r, 'APLICADO');
  }, 300);
}

function cfLimpezaFantasma_(aplicar) {
  const ss = cfPlanilha_();
  const abas = [];
  let totalFantasmas = 0;

  CF_SCHEMA.forEach(function (def) {
    const aba = ss.getSheetByName(def.nome);
    if (!aba) return;

    const ultima = aba.getLastRow();
    if (ultima < 2) return;

    const cab = cfCabecalho_(def.nome);
    const faixa = aba.getRange(2, 1, ultima - 1, cab.length);
    const dados = faixa.getValues();

    const reais = dados.filter(function (linha) { return cfLinhaTemDado_(linha); });
    const fantasmas = dados.length - reais.length;
    if (!fantasmas) return;

    abas.push({ aba: def.nome, reais: reais.length, fantasmas: fantasmas });
    totalFantasmas += fantasmas;

    if (aplicar) {
      // Escreve primeiro, apaga depois — nunca o contrário.
      //
      // A ordem inversa custou 11 propostas: a aba foi limpa, o setValues
      // seguinte bateu na validação da coluna ORIGEM e a exceção abortou
      // tudo, deixando a aba vazia. Escrevendo antes, uma falha aqui não
      // destrói nada: os dados originais continuam onde estavam.
      if (reais.length) {
        aba.getRange(2, 1, reais.length, cab.length).setValues(reais);
      }
      const sobra = dados.length - reais.length;
      if (sobra > 0) {
        aba.getRange(2 + reais.length, 1, sobra, cab.length).clearContent();
      }
    }
  });

  return { abas: abas, totalFantasmas: totalFantasmas, aplicado: aplicar };
}

function cfRelatarLimpeza_(r, rotulo) {
  Logger.log('── Limpeza de linhas fantasma (' + rotulo + ') ──');

  if (!r.abas.length) {
    Logger.log('Nada a fazer: nenhuma aba tem linha fantasma.');
    return r;
  }

  r.abas.forEach(function (a) {
    Logger.log('  ' + a.aba + ': ' + a.fantasmas + ' fantasma' +
               (a.fantasmas === 1 ? '' : 's') + ' → sobram ' + a.reais +
               ' registro' + (a.reais === 1 ? '' : 's'));
  });

  Logger.log('');
  Logger.log('Total: ' + r.totalFantasmas + ' linhas em ' + r.abas.length + ' abas.');
  if (!r.aplicado) Logger.log('Nada foi alterado. Rode limparLinhasFantasma() para aplicar.');

  return r;
}

// ─────────────────────────────────────────────────────────────
//  Validação de enum nas abas já existentes
//
//  cfFormatarAba_ só roda quando a aba é criada ou ganha coluna, então
//  mudar Schema.gs não alcança a base instalada. Esta rotina reaplica
//  apenas as validações de enum, agora com setAllowInvalid(true).
//
//  De propósito não mexe nas colunas booleanas: reaplicar a validação de
//  checkbox recriaria as linhas fantasma nas abas que já foram limpas.
// ─────────────────────────────────────────────────────────────

function reaplicarValidacoesEnum() {
  return cfComTrava_(function () {
    const ss = cfPlanilha_();
    let colunas = 0;
    let abas = 0;

    CF_SCHEMA.forEach(function (def) {
      const aba = ss.getSheetByName(def.nome);
      if (!aba) return;

      const linhas = Math.max(aba.getMaxRows() - 1, 1);
      let mexeu = false;

      def.colunas.forEach(function (col, i) {
        if (col.tipo.split(':')[0] !== 'enum') return;

        const valores = CF_ENUM[col.tipo.slice(5)];
        if (!valores || !valores.length) return;

        aba.getRange(2, i + 1, linhas, 1).setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(valores, true)
            .setAllowInvalid(true)
            .setHelpText('Valores aceitos: ' + valores.join(' · '))
            .build()
        );

        Logger.log('  ' + def.nome + '.' + col.campo);
        colunas++;
        mexeu = true;
      });

      if (mexeu) abas++;
    });

    Logger.log('');
    Logger.log(colunas + ' colunas enum liberadas em ' + abas + ' abas.');
    cfLog_('reaplicar_validacao_enum', 'planilha', '', JSON.stringify({ colunas: colunas, abas: abas }));

    return { colunas: colunas, abas: abas };
  }, 300);
}

// ─────────────────────────────────────────────────────────────
//  Diagnóstico: parser x gravado
//
//  Datas em 1913 apareceram na aba Propostas. O serial 4765 do Sheets dá
//  16/01/1913, e 4765,55 é o VALOR TOTAL do proponente 1 — ou seja, um
//  valor monetário chegou num campo de data. Falta saber se isso nasce no
//  parser ou na gravação. Esta rotina lê os dois lados e mostra lado a lado.
//
//  Não escreve nada: analisarEqualizacao apenas relata.
// ─────────────────────────────────────────────────────────────

const CF_DIAG_ARQUIVO = '1iOz9t7xjk19UxCkEP7t-v1yzCOk6HMTR4Qfp9mfCNF4';

function diagnosticarDatasDaProposta() {
  const campos = ['numeroProposta', 'dataProposta', 'prazoExecucao', 'validade',
                  'dataPrevInicio', 'dataPrevTermino', 'propostaInicial',
                  'propostaR01', 'propostaR02', 'reducaoTotal'];

  Logger.log('═══ 1. O QUE O PARSER EXTRAI ═══');
  const r = analisarEqualizacao(CF_DIAG_ARQUIVO);
  Logger.log('Arquivo: ' + r.arquivo);

  r.equalizacoes.forEach(function (eq, ie) {
    Logger.log('');
    Logger.log('-- equalizacao ' + (ie + 1) + ' (' + (eq.aba || '?') + ') --');
    (eq.proponentes || []).forEach(function (p) {
      Logger.log('  proponente ' + p.ordem + ' — ' + (p.razaoSocial || '(sem razao)'));
      campos.forEach(function (c) {
        if (p[c] === null || p[c] === undefined) return;
        Logger.log('     ' + c.padEnd(18) + ' = ' + cfDiagValor_(p[c]));
      });
    });
  });

  Logger.log('');
  Logger.log('═══ 2. O QUE ESTA GRAVADO EM Propostas ═══');
  const cab = cfCabecalho_('Propostas');
  cfLerTudo_('Propostas').slice(0, 3).forEach(function (o) {
    Logger.log('');
    Logger.log('-- ' + o.ID + ' (linha ' + o._linha + ') --');
    cab.forEach(function (campo) {
      if (o[campo] === '' || o[campo] === null) return;
      Logger.log('     ' + campo.padEnd(26) + ' = ' + cfDiagValor_(o[campo]));
    });
  });

  return { arquivo: r.arquivo, equalizacoes: r.equalizacoes.length };
}

/** Mostra o tipo junto do valor — é o tipo que denuncia data virando número. */
function cfDiagValor_(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10) + '   [Date]';
  return String(v) + '   [' + typeof v + ']';
}

// ─────────────────────────────────────────────────────────────
//  Reaplicar formatação nas abas já instaladas
//
//  cfFormatarAba_ só roda na criação da aba ou quando ela ganha coluna.
//  Uma aba que responde "sem mudança" ao setupBaseDeDados nunca recebe a
//  correção de formato — foi o caso de Propostas, cujos formatos estavam
//  deslocados uma coluna desde a migração.
//
//  ATENÇÃO: reaplica também a validação de checkbox sobre a aba inteira,
//  o que traz de volta as linhas fantasma. Rode limparLinhasFantasma()
//  depois. Leitura e escrita são imunes a elas, então nada quebra no meio.
// ─────────────────────────────────────────────────────────────

function reaplicarFormatacao() {
  return cfComTrava_(function () {
    const ss = cfPlanilha_();
    const feitas = [];

    CF_SCHEMA.forEach(function (def) {
      const aba = ss.getSheetByName(def.nome);
      if (!aba) return;
      cfFormatarAba_(aba, def);
      feitas.push(def.nome);
    });

    Logger.log('── Formatação reaplicada ──');
    Logger.log(feitas.length + ' abas: ' + feitas.join(', '));
    Logger.log('');
    Logger.log('As linhas fantasma de checkbox voltaram.');
    Logger.log('Rode limparLinhasFantasma() para tirá-las.');

    cfLog_('reaplicar_formatacao', 'planilha', '', JSON.stringify({ abas: feitas.length }));
    return { abas: feitas };
  }, 300);
}

// ─────────────────────────────────────────────────────────────
//  Booleano fora de lugar
//
//  Aplicar validação de checkbox sobre célula vazia faz o Sheets GRAVAR
//  false nela — não é só aparência. Enquanto os formatos estiveram
//  deslocados, colunas que não são booleanas receberam checkbox e ficaram
//  com false gravado. Tirar a validação não desfaz isso: o valor fica.
//
//  Só mexe em coluna cujo tipo declarado NÃO é booleano. Nessas, um
//  true/false não é dado legítimo — nenhuma escrita do app produz isso.
// ─────────────────────────────────────────────────────────────

function simularLimpezaBooleanos() {
  return cfRelatarBooleanos_(cfLimpezaBooleanos_(false), 'SIMULAÇÃO');
}

function limparBooleanosForaDeLugar() {
  return cfComTrava_(function () {
    const r = cfLimpezaBooleanos_(true);
    cfLog_('limpeza_booleanos', 'planilha', '', JSON.stringify({ celulas: r.total }));
    return cfRelatarBooleanos_(r, 'APLICADO');
  }, 300);
}

function cfLimpezaBooleanos_(aplicar) {
  const ss = cfPlanilha_();
  const achados = [];
  let total = 0;

  CF_SCHEMA.forEach(function (def) {
    const aba = ss.getSheetByName(def.nome);
    if (!aba) return;

    const ultima = aba.getLastRow();
    if (ultima < 2) return;

    const cab = cfCabecalho_(def.nome);
    const tipoDe = {};
    def.colunas.forEach(function (col) { tipoDe[col.campo] = col.tipo.split(':')[0]; });

    cab.forEach(function (campo, i) {
      if (tipoDe[campo] === 'booleano') return;      // aí o false é legítimo
      if (!tipoDe[campo]) return;                    // coluna fora do schema

      const faixa = aba.getRange(2, i + 1, ultima - 1, 1);
      const valores = faixa.getValues();
      const n = valores.filter(function (l) { return typeof l[0] === 'boolean'; }).length;
      if (!n) return;

      achados.push({ aba: def.nome, campo: campo, celulas: n });
      total += n;

      if (aplicar) {
        faixa.setValues(valores.map(function (l) {
          return [typeof l[0] === 'boolean' ? '' : l[0]];
        }));
      }
    });
  });

  return { achados: achados, total: total, aplicado: aplicar };
}

function cfRelatarBooleanos_(r, rotulo) {
  Logger.log('── Booleano fora de lugar (' + rotulo + ') ──');

  if (!r.achados.length) {
    Logger.log('Nada a fazer: nenhum true/false em coluna não booleana.');
    return r;
  }

  r.achados.forEach(function (a) {
    Logger.log('  ' + a.aba + '.' + a.campo + ': ' + a.celulas + ' célula(s)');
  });

  Logger.log('');
  Logger.log('Total: ' + r.total + ' célula(s).');
  if (!r.aplicado) Logger.log('Nada foi alterado. Rode limparBooleanosForaDeLugar() para aplicar.');

  return r;
}

// ─────────────────────────────────────────────────────────────
//  Dados de teste
//
//  O botão "Gerar exemplo" da tela carimba CF_MARCA_TESTE no PROJETO. Só
//  isso permite apagar depois exatamente o que foi inventado, sem tocar em
//  nada real — dado fictício misturado ao histórico envenena a consulta de
//  preço, que é a razão de existir do sistema.
// ─────────────────────────────────────────────────────────────

function simularLimpezaDeTeste() {
  return cfRelatarTeste_(cfLimpezaDeTeste_(false), 'SIMULAÇÃO');
}

function limparDadosDeTeste() {
  return cfComTrava_(function () {
    const r = cfLimpezaDeTeste_(true);
    cfLog_('limpar_dados_teste', 'planilha', '', JSON.stringify({
      equalizacoes: r.equalizacoes.length, linhas: r.linhas
    }));
    return cfRelatarTeste_(r, 'APLICADO');
  }, 120);
}

function cfLimpezaDeTeste_(aplicar) {
  const alvo = cfLerTudo_('Equalizacoes').filter(function (e) {
    return String(e.PROJETO || '').indexOf(CF_MARCA_TESTE) >= 0;
  });

  const ids = {};
  alvo.forEach(function (e) { ids[e.ID] = true; });

  // Conta antes de apagar, para o relatório dizer o que sumiu.
  const contar = function (aba) {
    return cfLerTudo_(aba).filter(function (l) { return ids[l.ID_EQUALIZACAO]; }).length;
  };
  const detalhe = {
    Precos: contar('Precos'), EAP: contar('EAP'),
    Propostas: contar('Propostas'), Equalizacoes: alvo.length
  };
  let linhas = 0;
  Object.keys(detalhe).forEach(function (k) { linhas += detalhe[k]; });

  if (aplicar) {
    // Filhos antes do pai: se parar no meio, sobra a equalização — que se
    // acha e se apaga de novo. Na ordem inversa sobrariam preços órfãos,
    // que ninguém encontra.
    Object.keys(ids).forEach(function (id) {
      cfApagarPor_('Precos', 'ID_EQUALIZACAO', id);
      cfApagarPor_('EAP', 'ID_EQUALIZACAO', id);
      cfApagarPor_('Propostas', 'ID_EQUALIZACAO', id);
      cfApagarPor_('Equalizacoes', 'ID', id);
    });
  }

  return { equalizacoes: alvo, detalhe: detalhe, linhas: linhas, aplicado: aplicar };
}

function cfRelatarTeste_(r, rotulo) {
  Logger.log('── Dados de teste (' + rotulo + ') ──');

  if (!r.equalizacoes.length) {
    Logger.log('Nenhuma equalização marcada com ' + CF_MARCA_TESTE + '.');
    return r;
  }

  r.equalizacoes.forEach(function (e) {
    Logger.log('  ' + e.ID + '  ' + (e.PROJETO || ''));
  });
  Logger.log('');
  Object.keys(r.detalhe).forEach(function (k) {
    Logger.log('  ' + k + ': ' + r.detalhe[k]);
  });
  Logger.log('  total: ' + r.linhas + ' linhas');
  if (!r.aplicado) Logger.log('Nada foi alterado. Rode limparDadosDeTeste() para apagar.');

  return r;
}

// ─────────────────────────────────────────────────────────────
//  Divergências de dados apontadas na conciliação do acervo
//
//  Três achados de prioridade alta em dados/relatorio-conciliacao.json.
//  Enquanto o sistema só exibia esses números na tela, eram incômodos.
//  A Fase 1 põe o Valor Homologado no topo do PDF que vai à Diretoria —
//  e aí um total inflado em 12x deixa de ser incômodo e vira documento
//  assinado com número errado. Por isso vêm antes da funcionalidade.
//
//  Rode: diagnosticarDivergenciasAltas   (neste arquivo, Manutencao.gs)
// ─────────────────────────────────────────────────────────────

/**
 * Qual Mega é este texto, seja como for que tenham escrito.
 * "Mega Curitiba", "MEGA CENTRO LOGÍSTICO CURITIBA" e "curitiba" são o
 * mesmo lugar; a chave exata de CF_EMPRESA_DO_MEGA não perdoa variação.
 */
function cfMegaCanonico_(texto) {
  const t = cfNormalizar_(String(texto || ''));
  if (!t) return '';
  if (t.indexOf('curitiba') >= 0) return 'MEGA CENTRO LOGÍSTICO CURITIBA';
  if (t.indexOf('esteio') >= 0)   return 'MEGA CENTRO LOGÍSTICO ESTEIO';
  if (t.indexOf('itajai') >= 0)   return 'MEGA CENTRO LOGÍSTICO ITAJAÍ';
  return '';
}

/** Relatório de leitura. Não escreve nada. */
function diagnosticarDivergenciasAltas() {
  const eqs = cfLerTudo_('Equalizacoes');
  const props = cfLerTudo_('Propostas');
  const eap = cfLerTudo_('EAP');

  Logger.log('═══ Divergências de prioridade alta ═══');
  Logger.log('Equalizações na base: ' + eqs.length + ' · Propostas: ' + props.length);
  Logger.log('');

  // ── 1. Equalização sem CNPJ da empresa contratante
  Logger.log('── 1. Empresa contratante ausente ──');
  let semEmpresa = 0;
  eqs.forEach(function (e) {
    const atual = cfSoDigitos_(e.CNPJ_EMPRESA);
    const mega = cfMegaCanonico_(e.ID_EMPREENDIMENTO);
    const devido = mega ? cfEmpresaDoMega_(mega) : { cnpj: '', nome: '' };
    if (atual === devido.cnpj) return;
    semEmpresa++;
    Logger.log('  ' + e.ID + ' · ' + (e.ID_EMPREENDIMENTO || '(sem Mega)') +
               ' · ' + (e.PROJETO || '') +
               '\n      tem: ' + (atual || '(vazio)') +
               '\n      devia ser: ' + (devido.cnpj || '(Mega não reconhecido — corrija o empreendimento primeiro)') +
               (devido.nome ? ' — ' + devido.nome : ''));
  });
  Logger.log(semEmpresa === 0 ? '  Nada a corrigir.'
    : '  ' + semEmpresa + ' equalização(ões). Rode corrigirEmpresaDasEqualizacoes() para aplicar.');
  Logger.log('');

  // ── 2. Total declarado muito acima do calculado
  //
  //  Mensalidade lida como anual dá razão 12. Não corrijo automaticamente:
  //  só o documento original diz qual dos dois números é o certo.
  Logger.log('── 2. Total declarado x calculado ──');
  let suspeitas = 0;
  props.forEach(function (p) {
    const dec = cfNumero_(p.VALOR_TOTAL_DECLARADO);
    const calc = cfNumero_(p.VALOR_TOTAL_CALCULADO);
    if (!dec || !calc || calc <= 0) return;
    const razao = dec / calc;
    if (razao < 1.02 && razao > 0.98) return;
    suspeitas++;
    const pista = (razao > 11.5 && razao < 12.5) ? '  ← 12x: mensal lido como anual'
                : (razao > 0.079 && razao < 0.088) ? '  ← 1/12: anual lido como mensal' : '';
    Logger.log('  ' + p.ID + ' · eq ' + (p.ID_EQUALIZACAO || '(avulso)') +
               ' · ' + (p.RAZAO_SOCIAL_INFORMADA || p.CNPJ) +
               '\n      declarado: ' + dec.toFixed(2) +
               ' · itens somam: ' + calc.toFixed(2) +
               ' · razão: ' + razao.toFixed(2) + pista);
  });
  Logger.log(suspeitas === 0 ? '  Nada divergente.'
    : '  ' + suspeitas + ' proposta(s). Confira no documento original qual número vale.');
  Logger.log('');

  // ── 3. Possível duplicação
  Logger.log('── 3. Possível duplicação ──');
  let dups = 0;

  // Mesmo CNPJ duas vezes na mesma equalização: são duas rodadas ou é
  // a mesma proposta lançada duas vezes?
  const porEq = {};
  props.forEach(function (p) {
    if (!p.ID_EQUALIZACAO) return;
    const k = p.ID_EQUALIZACAO + '§' + cfSoDigitos_(p.CNPJ);
    (porEq[k] = porEq[k] || []).push(p);
  });
  Object.keys(porEq).forEach(function (k) {
    const lista = porEq[k];
    if (lista.length < 2) return;
    dups++;
    Logger.log('  eq ' + lista[0].ID_EQUALIZACAO + ' · CNPJ ' + lista[0].CNPJ +
               ' aparece ' + lista.length + 'x: ' +
               lista.map(function (p) {
                 return p.ID + ' (rodada ' + (p.RODADA || '?') + ', total ' +
                        (cfNumero_(p.VALOR_TOTAL_CALCULADO) || 0).toFixed(2) + ')';
               }).join(', '));
  });

  // Mesma descrição repetida na mesma equalização.
  const porDesc = {};
  eap.forEach(function (n) {
    if (!n.ID_EQUALIZACAO || n.TIPO === 'grupo') return;
    const d = cfNormalizar_(n.DESCRICAO);
    if (!d) return;
    const k = n.ID_EQUALIZACAO + '§' + d;
    (porDesc[k] = porDesc[k] || []).push(n);
  });
  Object.keys(porDesc).forEach(function (k) {
    const lista = porDesc[k];
    if (lista.length < 2) return;
    dups++;
    Logger.log('  eq ' + lista[0].ID_EQUALIZACAO + ' · "' + lista[0].DESCRICAO +
               '" aparece ' + lista.length + 'x (' +
               lista.map(function (n) { return n.ID; }).join(', ') + ')');
  });

  Logger.log(dups === 0 ? '  Nada duplicado.'
    : '  ' + dups + ' caso(s). Confira no documento original antes de apagar — ' +
      'item repetido pode ser legítimo (duas marcas, dois turnos).');

  return { semEmpresa: semEmpresa, totaisSuspeitos: suspeitas, duplicacoes: dups };
}

/** Só mostra o que mudaria. */
function simularCorrecaoEmpresaDasEqualizacoes() {
  return cfCorrigirEmpresa_(false);
}

/**
 * Preenche CNPJ_EMPRESA a partir do Mega.
 *
 * Derivar é seguro porque a regra é fechada: Curitiba é Demercado, Esteio
 * e Itajaí são Capital Realty. Equalização cujo Mega não é reconhecido
 * fica intocada — chutar a contratante é pior que deixar vazio.
 */
function corrigirEmpresaDasEqualizacoes() {
  return cfCorrigirEmpresa_(true);
}

function cfCorrigirEmpresa_(aplicar) {
  const eqs = cfLerTudo_('Equalizacoes');
  const mudou = [], pulou = [];

  eqs.forEach(function (e) {
    const atual = cfSoDigitos_(e.CNPJ_EMPRESA);
    const mega = cfMegaCanonico_(e.ID_EMPREENDIMENTO);
    if (!mega) { pulou.push(e.ID + ' (Mega não reconhecido: "' + e.ID_EMPREENDIMENTO + '")'); return; }
    const devido = cfEmpresaDoMega_(mega);
    if (!devido.cnpj || atual === devido.cnpj) return;
    mudou.push({ id: e.ID, linha: e._linha, de: atual || '(vazio)', para: devido.cnpj, nome: devido.nome });
  });

  Logger.log(aplicar ? '═══ Corrigindo empresa contratante ═══' : '═══ Simulação (nada foi gravado) ═══');
  mudou.forEach(function (m) {
    Logger.log('  ' + m.id + ': ' + m.de + ' → ' + m.para + ' (' + m.nome + ')');
    if (aplicar) cfAtualizarLinha_('Equalizacoes', m.linha, { CNPJ_EMPRESA: m.para });
  });
  pulou.forEach(function (p) { Logger.log('  pulada: ' + p); });

  Logger.log(mudou.length === 0 ? '  Nada a corrigir.'
    : '  ' + mudou.length + (aplicar ? ' corrigida(s).' : ' seriam corrigidas. Rode corrigirEmpresaDasEqualizacoes() para aplicar.'));

  if (aplicar && mudou.length) {
    cfLog_('corrigir_empresa', 'equalizacoes', '', JSON.stringify(mudou.map(function (m) { return m.id; })));
  }
  return { corrigidas: mudou.length, puladas: pulou.length, aplicado: !!aplicar };
}

// ─────────────────────────────────────────────────────────────
//  Medição de tempo — o número que falta para sustentar o ganho
//
//  "Redução de 70% no tempo por equalização" era estimativa. Um comitê
//  que pergunte "em relação a quê?" derruba a afirmação inteira, e é o
//  critério que mais pesa. Estas funções transformam a estimativa em
//  dado, ou mostram que ela era otimista — as duas respostas servem, a
//  ausência de resposta não.
//
//  Rode: relatorioDeTempo   (neste arquivo, Manutencao.gs)
// ─────────────────────────────────────────────────────────────

/**
 * Cronometre 3 equalizações feitas NA PLANILHA e registre aqui.
 *
 * Sem esta linha de base não há com o que comparar: o tempo do app
 * sozinho não é ganho nenhum. E a janela para medir é irreversível —
 * depois que a operação migrar, ninguém mais faz uma equalização no
 * Excel só para cronometrar.
 *
 * Exemplo: registrarTempoNaPlanilha(47, '12 itens, 3 proponentes, material de consumo')
 */
function registrarTempoNaPlanilha(minutos, descricao) {
  const m = cfNumero_(minutos);
  if (m === null || m <= 0) {
    Logger.log('Informe os minutos. Ex.: registrarTempoNaPlanilha(47, "12 itens, 3 proponentes")');
    return;
  }
  cfLog_('tempo_planilha', 'baseline', '', JSON.stringify({
    segundos: Math.round(m * 60),
    descricao: String(descricao || '')
  }));
  Logger.log('Registrado: ' + m + ' minutos na planilha — ' + (descricao || 'sem descrição'));
  Logger.log('Rode relatorioDeTempo() para ver a comparação.');
}

/** Mediana. Com poucas medições ela é mais honesta que a média: uma
 *  equalização atípica desloca a média e não desloca a mediana. */
function cfMediana_(numeros) {
  if (!numeros.length) return null;
  const v = numeros.slice().sort(function (a, b) { return a - b; });
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

function cfMinutos_(segundos) {
  if (segundos === null || segundos === undefined) return '—';
  const m = Math.floor(segundos / 60), s = Math.round(segundos % 60);
  return m + 'min' + (s ? ' ' + s + 's' : '');
}

/**
 * O que foi medido até agora, e o que ainda falta para o número valer.
 */
function relatorioDeTempo() {
  const log = cfLerTudo_('Log');

  const parse = function (acao) {
    return log.filter(function (l) { return String(l.ACAO) === acao; })
      .map(function (l) {
        try { return Object.assign({ quando: l.DATA, alvo: l.ID_ALVO }, JSON.parse(l.DETALHE)); }
        catch (e) { return null; }
      })
      .filter(Boolean);
  };

  const noApp = parse('tempo_equalizacao').filter(function (r) { return !r.edicao; });
  const edicoes = parse('tempo_equalizacao').filter(function (r) { return r.edicao; });
  const naPlanilha = parse('tempo_planilha');

  Logger.log('═══ Tempo por equalização ═══');
  Logger.log('');

  Logger.log('── No app (criação) ──');
  if (!noApp.length) {
    Logger.log('  Nenhuma medição ainda. Cada equalização criada pela tela passa a registrar');
    Logger.log('  sozinha, do primeiro campo digitado até gravar.');
  } else {
    noApp.forEach(function (r) {
      Logger.log('  ' + cfDataHoraTexto_(r.quando) + ' · ' + r.alvo + ' · ' + cfMinutos_(r.segundos) +
                 '  (' + r.nos + ' itens, ' + r.proponentes + ' proponentes)');
    });
    const medApp = cfMediana_(noApp.map(function (r) { return r.segundos; }));
    Logger.log('  Mediana: ' + cfMinutos_(medApp) + ' em ' + noApp.length + ' medição(ões)');
  }
  Logger.log('');

  if (edicoes.length) {
    Logger.log('── No app (edição/renegociação) ──');
    Logger.log('  ' + edicoes.length + ' medição(ões) · mediana ' +
               cfMinutos_(cfMediana_(edicoes.map(function (r) { return r.segundos; }))));
    Logger.log('  Contadas à parte: editar não é o mesmo trabalho que criar do zero,');
    Logger.log('  e misturar as duas produziria uma média que não descreve nenhuma.');
    Logger.log('');
  }

  Logger.log('── Na planilha (linha de base) ──');
  if (!naPlanilha.length) {
    Logger.log('  NENHUMA. Sem isto não existe comparação, e o ganho continua sendo afirmação.');
    Logger.log('  Cronometre 3 equalizações no Excel e registre com:');
    Logger.log('    registrarTempoNaPlanilha(47, "12 itens, 3 proponentes")');
    Logger.log('  A janela é irreversível: depois da migração ninguém volta ao Excel para medir.');
  } else {
    naPlanilha.forEach(function (r) {
      Logger.log('  ' + cfDataHoraTexto_(r.quando) + ' · ' + cfMinutos_(r.segundos) +
                 (r.descricao ? '  (' + r.descricao + ')' : ''));
    });
    Logger.log('  Mediana: ' + cfMinutos_(cfMediana_(naPlanilha.map(function (r) { return r.segundos; }))) +
               ' em ' + naPlanilha.length + ' medição(ões)');
  }
  Logger.log('');

  const medApp = noApp.length ? cfMediana_(noApp.map(function (r) { return r.segundos; })) : null;
  const medPl = naPlanilha.length ? cfMediana_(naPlanilha.map(function (r) { return r.segundos; })) : null;

  Logger.log('── Comparação ──');
  if (medApp === null || medPl === null) {
    Logger.log('  Ainda não dá para comparar. Faltam: ' +
      [medPl === null ? 'medições na planilha' : null,
       medApp === null ? 'equalizações feitas no app' : null].filter(Boolean).join(' e ') + '.');
  } else {
    const reducao = (medPl - medApp) / medPl;
    Logger.log('  Planilha: ' + cfMinutos_(medPl) + ' · App: ' + cfMinutos_(medApp));
    Logger.log('  Redução: ' + (reducao * 100).toFixed(1).replace('.', ',') + '%');
    if (noApp.length < 5 || naPlanilha.length < 3) {
      Logger.log('');
      Logger.log('  ATENÇÃO: amostra pequena (' + naPlanilha.length + ' na planilha, ' +
                 noApp.length + ' no app). Este número serve para acompanhar,');
      Logger.log('  não para publicar. Um relatório que apresenta n=2 como resultado');
      Logger.log('  convida exatamente a pergunta que ele deveria responder.');
    }
  }

  return {
    app: noApp.length, edicoes: edicoes.length, planilha: naPlanilha.length,
    medianaApp: medApp, medianaPlanilha: medPl
  };
}

// ─────────────────────────────────────────────────────────────
//  Zerar base operacional para novos testes
//
//  Limpa as linhas de dados das abas operacionais (mantendo a linha 1 de cabeçalho),
//  preservando as abas de infraestrutura e cadastro mestre (Config, Empresas, Empreendimentos).
//  Em seguida executa setupBaseDeDados() para garantir a estrutura do Schema v4.
// ─────────────────────────────────────────────────────────────

/**
 * Zera as tabelas operacionais da base para reiniciar testes do zero.
 * Preserva Config, Empresas e Empreendimentos.
 * Execute importarTodosOsOrcamentos() em seguida para recarregar o acervo oficial.
 */
function zerarBaseOperacional() {
  return cfComTrava_(function () {
    const ss = cfPlanilha_();
    const tabelas = [
      'Precos', 'EAP', 'Propostas', 'Equalizacoes',
      'Importacoes', 'Fornecedores', 'Pendencias', 'Historico_Logs'
    ];
    let totalLimpas = 0;

    Logger.log('═══ Zerando Base Operacional ═══');
    tabelas.forEach(function (nome) {
      const aba = ss.getSheetByName(nome);
      if (!aba) return;
      const ultima = aba.getLastRow();
      if (ultima > 1) {
        const colunas = Math.max(aba.getLastColumn(), 1);
        aba.getRange(2, 1, ultima - 1, colunas).clearContent();
        totalLimpas++;
        Logger.log('  Aba "' + nome + '": ' + (ultima - 1) + ' linha(s) removida(s).');
      } else {
        Logger.log('  Aba "' + nome + '": já estava vazia.');
      }
    });

    Logger.log('\nExecutando setupBaseDeDados() para reformatar e validar Schema v4...');
    setupBaseDeDados();

    cfLog_('zerar_base_operacional', 'planilha', '', JSON.stringify({ abasLimpas: totalLimpas }));
    Logger.log('\n✓ Base operacional zerada com sucesso!');
    Logger.log('Próximo passo recomendado: execute importarTodosOsOrcamentos() para carregar os 21 orçamentos.');
    return { ok: true, abasLimpas: totalLimpas };
  }, 180);
}
