/**
 * Capital Fornecedores — criação e migração da base
 *
 * setupBaseDeDados() é seguro rodar em produção, quantas vezes quiser:
 *   idempotente  — rodar 10x é igual a rodar 1x
 *   aditivo      — coluna nova entra NO FIM, nunca no meio
 *   não-destrutivo — coluna que sumiu do schema é avisada, não apagada
 */

/** Planilha criada pelo Guilherme dentro da pasta compartilhada. */
const CF_PLANILHA_PADRAO = '1PLuAqtKz2dscfSfAekfEGTAZTAzT8m0R0FfaJ9PmSnc';

// ─────────────────────────────────────────────────────────────
//  Entrada principal
// ─────────────────────────────────────────────────────────────

/**
 * Cria ou atualiza todas as abas da base.
 * Rode pelo menu Executar. O relatório sai no Log (Ctrl+Enter).
 */
function setupBaseDeDados() {
  return cfComTrava_(function () {
    const ss = cfPlanilha_();
    const relatorio = { planilha: ss.getName(), url: ss.getUrl(), abas: [], avisos: [] };

    CF_SCHEMA.forEach(function (def) {
      relatorio.abas.push(cfGarantirAba_(ss, def, relatorio.avisos));
    });

    cfRemoverAbaPadrao_(ss, relatorio.avisos);

    PropertiesService.getScriptProperties().setProperties({
      [CF_PROP.planilhaId]: ss.getId(),
      [CF_PROP.schemaVersao]: String(CF_SCHEMA_VERSAO),
      [CF_PROP.pastaId]: CF_PASTA_ID
    });

    cfImprimirRelatorio_(relatorio);
    return relatorio;
  }, 120);
}

// ─────────────────────────────────────────────────────────────
//  Resolução da planilha
// ─────────────────────────────────────────────────────────────

/**
 * Descobre em qual planilha trabalhar, nesta ordem:
 *   1. a que o script está vinculado (script dentro da planilha)
 *   2. a gravada em Script Properties
 *   3. CF_PLANILHA_PADRAO
 *   4. cria uma nova na pasta compartilhada
 */
function cfPlanilha_() {
  const vinculada = SpreadsheetApp.getActiveSpreadsheet();
  if (vinculada) return vinculada;

  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(CF_PROP.planilhaId) || CF_PLANILHA_PADRAO;

  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (erro) {
      Logger.log('CF: não abri a planilha ' + id + ' (' + erro + '). Vou criar outra.');
    }
  }

  const nova = SpreadsheetApp.create(CF_NOME_PLANILHA);
  try {
    DriveApp.getFileById(nova.getId()).moveTo(DriveApp.getFolderById(CF_PASTA_ID));
  } catch (erro) {
    // Falhar aqui não invalida a base — ela só fica na raiz do Drive.
    Logger.log('CF: não movi a planilha para a pasta (' + erro + ').');
  }
  props.setProperty(CF_PROP.planilhaId, nova.getId());
  Logger.log('CF: planilha criada — ' + nova.getUrl());
  return nova;
}

// ─────────────────────────────────────────────────────────────
//  Uma aba
// ─────────────────────────────────────────────────────────────

function cfGarantirAba_(ss, def, avisos) {
  const esperado = def.colunas.map(function (c) { return c.campo; });
  let aba = ss.getSheetByName(def.nome);

  if (!aba) {
    aba = ss.insertSheet(def.nome);
    // Uma aba nova pode ter menos colunas que o schema (Equalizacoes usa 27).
    const capacidade = aba.getMaxColumns();
    if (capacidade < esperado.length) {
      aba.insertColumnsAfter(capacidade, esperado.length - capacidade);
    }
    aba.getRange(1, 1, 1, esperado.length).setValues([esperado]);
    cfFormatarAba_(aba, def);
    return { aba: def.nome, acao: 'criada', colunas: esperado.length };
  }

  // A aba existe: comparar cabeçalho sem tocar em dado.
  const largura = Math.max(aba.getLastColumn(), 1);
  const atual = aba.getRange(1, 1, 1, largura).getValues()[0]
    .map(function (v) { return String(v || '').trim(); })
    .filter(function (v) { return v !== ''; });

  const faltando = esperado.filter(function (c) { return atual.indexOf(c) < 0; });
  const sobrando = atual.filter(function (c) { return esperado.indexOf(c) < 0; });

  if (sobrando.length) {
    avisos.push('Aba "' + def.nome + '": coluna(s) fora do schema — ' + sobrando.join(', ') +
                '. NÃO foram removidas. Confira antes de mexer.');
  }

  const ordemDivergente = !faltando.length && !sobrando.length &&
    esperado.some(function (c, i) { return atual[i] !== c; });
  if (ordemDivergente) {
    avisos.push('Aba "' + def.nome + '": as colunas estão em ordem diferente do schema. ' +
                'Não reordenei — reordenar deslocaria dado.');
  }

  if (!faltando.length) {
    return { aba: def.nome, acao: 'sem mudança', colunas: atual.length };
  }

  // Acrescenta no fim. Nunca no meio: inserir no meio desloca dado gravado.
  const inicio = atual.length + 1;
  if (aba.getMaxColumns() < inicio + faltando.length - 1) {
    aba.insertColumnsAfter(aba.getMaxColumns(), inicio + faltando.length - 1 - aba.getMaxColumns());
  }
  aba.getRange(1, inicio, 1, faltando.length).setValues([faltando]);
  cfFormatarAba_(aba, def);

  return { aba: def.nome, acao: 'colunas acrescentadas', novas: faltando };
}

// ─────────────────────────────────────────────────────────────
//  Formatação
// ─────────────────────────────────────────────────────────────

const CF_FORMATO = {
  moeda:   'R$ #,##0.00',
  numero:  '#,##0.####',
  inteiro: '0',
  data:    'dd/mm/yyyy',
  texto:   '@'
};

function cfFormatarAba_(aba, def) {
  const cabecalho = aba.getRange(1, 1, 1, def.colunas.length);
  cabecalho
    .setFontWeight('bold')
    .setBackground('#151E49')     // azul noturno do brandbook
    .setFontColor('#FFFFFF')
    .setVerticalAlignment('middle')
    .setWrap(true);
  aba.setFrozenRows(1);
  aba.setRowHeight(1, 34);

  const linhas = Math.max(aba.getMaxRows() - 1, 1);

  def.colunas.forEach(function (col, i) {
    const c = i + 1;
    if (col.largura) aba.setColumnWidth(c, col.largura);

    const faixa = aba.getRange(2, c, linhas, 1);
    const base = col.tipo.split(':')[0];

    if (CF_FORMATO[base]) faixa.setNumberFormat(CF_FORMATO[base]);

    if (base === 'booleano') {
      faixa.setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    } else if (base === 'enum') {
      const valores = CF_ENUM[col.tipo.slice(5)];
      if (valores && valores.length) {
        faixa.setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(valores, true)
            .setAllowInvalid(false)
            .setHelpText('Valores aceitos: ' + valores.join(' · '))
            .build()
        );
      }
    }

    if (col.nota) cabecalho.getCell(1, c).setNote(col.nota);
  });

  if (def.nota) aba.getRange(1, 1).setNote(def.nota + '\n\n' + (def.colunas[0].nota || ''));
}

/** Tira a "Página1" que o Sheets cria sozinho — só se estiver vazia. */
function cfRemoverAbaPadrao_(ss, avisos) {
  const nomes = CF_SCHEMA.map(function (d) { return d.nome; });
  ss.getSheets().forEach(function (aba) {
    if (nomes.indexOf(aba.getName()) >= 0) return;
    if (!/^(Sheet1|Página1|Pagina1|Folha1)$/i.test(aba.getName())) return;
    if (aba.getLastRow() > 0 || aba.getLastColumn() > 0) {
      avisos.push('Aba "' + aba.getName() + '" tem conteúdo — não removi.');
      return;
    }
    if (ss.getSheets().length > 1) ss.deleteSheet(aba);
  });
}

// ─────────────────────────────────────────────────────────────
//  Diagnóstico
// ─────────────────────────────────────────────────────────────

/**
 * Imprime o que está efetivamente valendo.
 * Existe por causa do clássico "colei, salvei, e não mudou nada".
 */
function verificarConfiguracao() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const ss = cfPlanilha_();

  Logger.log('── Capital Fornecedores ──');
  Logger.log('Planilha:        ' + ss.getName());
  Logger.log('URL:             ' + ss.getUrl());
  Logger.log('Schema no código:  v' + CF_SCHEMA_VERSAO);
  Logger.log('Schema instalado:  v' + (props[CF_PROP.schemaVersao] || 'nunca instalado'));
  Logger.log('Parser:          v' + CF_PARSER_VERSAO);
  Logger.log('Pasta:           ' + (props[CF_PROP.pastaId] || CF_PASTA_ID));
  Logger.log('Usuário:         ' + cfUsuario_());
  Logger.log('');

  const existentes = ss.getSheets().map(function (a) { return a.getName(); });
  CF_SCHEMA.forEach(function (def) {
    const aba = ss.getSheetByName(def.nome);
    const linhas = aba ? Math.max(aba.getLastRow() - 1, 0) : 0;
    Logger.log((aba ? '  ok  ' : '  --  ') + def.nome +
               (aba ? '  (' + linhas + ' linha' + (linhas === 1 ? '' : 's') + ')' : '  AUSENTE'));
  });

  const extras = existentes.filter(function (n) {
    return !CF_SCHEMA.some(function (d) { return d.nome === n; });
  });
  if (extras.length) Logger.log('\nAbas fora do schema: ' + extras.join(', '));

  return { planilha: ss.getUrl(), schemaInstalado: props[CF_PROP.schemaVersao] || null };
}

function cfImprimirRelatorio_(r) {
  Logger.log('── setupBaseDeDados ──');
  Logger.log(r.planilha + ' — ' + r.url + '\n');
  r.abas.forEach(function (a) {
    Logger.log('  ' + a.aba + ': ' + a.acao + (a.novas ? ' → ' + a.novas.join(', ') : ''));
  });
  if (r.avisos.length) {
    Logger.log('\nAvisos:');
    r.avisos.forEach(function (a) { Logger.log('  ! ' + a); });
  }
  Logger.log('\nSchema v' + CF_SCHEMA_VERSAO + ' instalado.');
}
