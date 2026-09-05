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
