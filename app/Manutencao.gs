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
 * Reescreve cada aba com apenas as linhas que têm registro, usando
 * clearContent + setValues — mesma técnica de cfApagarPor_, que preserva
 * formatação, notas e validação das colunas.
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
      faixa.clearContent();
      if (reais.length) {
        aba.getRange(2, 1, reais.length, cab.length).setValues(reais);
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
