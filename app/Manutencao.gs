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
