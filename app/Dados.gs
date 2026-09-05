/**
 * Capital Fornecedores — acesso genérico às abas
 *
 * Ninguém fala com SpreadsheetApp direto fora daqui. Duas razões:
 * a leitura precisa ser em lote (célula a célula é lenta demais) e toda
 * escrita precisa passar por trava.
 */

const CF_CACHE_CABECALHO = {};

function cfAba_(nome) {
  const aba = cfPlanilha_().getSheetByName(nome);
  if (!aba) throw new Error('Aba "' + nome + '" não existe. Rode setupBaseDeDados().');
  return aba;
}

/** Cabeçalho da aba, em cache por execução. */
function cfCabecalho_(nome) {
  if (CF_CACHE_CABECALHO[nome]) return CF_CACHE_CABECALHO[nome];
  const aba = cfAba_(nome);
  const largura = Math.max(aba.getLastColumn(), 1);
  const linha = aba.getRange(1, 1, 1, largura).getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  while (linha.length && !linha[linha.length - 1]) linha.pop();
  CF_CACHE_CABECALHO[nome] = linha;
  return linha;
}

/**
 * Uma linha é registro de verdade?
 *
 * `false` conta como vazio de propósito. A validação de checkbox que
 * cfFormatarAba_ aplica na aba inteira faz o Sheets devolver FALSE em toda
 * linha em branco — sem isto, uma aba recém-criada vira ~1000 registros
 * fantasma. Registro real sempre tem ID ou chave preenchida.
 */
function cfLinhaTemDado_(valores) {
  return valores.some(function (v) {
    return v !== '' && v !== null && v !== false;
  });
}

/**
 * Última linha ocupada por registro de verdade.
 *
 * Não dá para usar getLastRow() aqui: com as linhas fantasma de checkbox
 * ele devolve ~1000 numa aba vazia, e a inserção passaria a gravar embaixo
 * delas — que é como os dados atuais foram parar na linha 1001.
 */
function cfUltimaLinhaReal_(nome) {
  const aba = cfAba_(nome);
  const ultima = aba.getLastRow();
  if (ultima < 2) return 1;

  const cab = cfCabecalho_(nome);
  const dados = aba.getRange(2, 1, ultima - 1, cab.length).getValues();
  for (let i = dados.length - 1; i >= 0; i--) {
    if (cfLinhaTemDado_(dados[i])) return i + 2;
  }
  return 1;
}

/** Lê a aba inteira como array de objetos. Uma chamada, não N. */
function cfLerTudo_(nome) {
  const aba = cfAba_(nome);
  const linhas = aba.getLastRow() - 1;
  if (linhas < 1) return [];

  const cab = cfCabecalho_(nome);
  const valores = aba.getRange(2, 1, linhas, cab.length).getValues();

  return valores.map(function (linha, i) {
    const obj = { _linha: i + 2 };
    cab.forEach(function (campo, c) { obj[campo] = linha[c]; });
    return obj;
  }).filter(function (o) {
    return cfLinhaTemDado_(cab.map(function (campo) { return o[campo]; }));
  });
}

/**
 * Acrescenta linhas em lote.
 * Campos que não existem no cabeçalho são ignorados em silêncio — assim
 * um objeto rico pode ser jogado em várias abas sem filtrar antes.
 */
function cfInserir_(nome, objetos) {
  if (!objetos || !objetos.length) return 0;
  const aba = cfAba_(nome);
  const cab = cfCabecalho_(nome);

  const matriz = objetos.map(function (obj) {
    return cab.map(function (campo) {
      const v = obj[campo];
      return (v === undefined || v === null) ? '' : v;
    });
  });

  // cfUltimaLinhaReal_ em vez de getLastRow(): numa aba com linhas fantasma
  // de checkbox, getLastRow() devolve ~1000 e a gravação cairia embaixo delas.
  aba.getRange(cfUltimaLinhaReal_(nome) + 1, 1, matriz.length, cab.length).setValues(matriz);
  return matriz.length;
}

/**
 * Apaga as linhas em que `campo` bate com `valor`.
 *
 * Lê tudo, filtra em memória e reescreve — três operações, independente do
 * tamanho. A versão anterior chamava deleteRow numa laço e levava meio
 * segundo por linha: desfazer 102 linhas custou 56 segundos, e o Apps Script
 * corta a execução em 6 minutos. Com algumas dezenas de arquivos importados
 * o desfazer simplesmente não terminaria.
 *
 * clearContent preserva formatação e validação de lista das colunas.
 */
function cfApagarPor_(nome, campo, valor) {
  const aba = cfAba_(nome);
  const linhas = aba.getLastRow() - 1;
  if (linhas < 1) return 0;

  const cab = cfCabecalho_(nome);
  const col = cab.indexOf(campo);
  if (col < 0) return 0;

  const faixa = aba.getRange(2, 1, linhas, cab.length);
  const dados = faixa.getValues();
  const manter = dados.filter(function (l) { return String(l[col]) !== String(valor); });

  const removidos = dados.length - manter.length;
  if (!removidos) return 0;

  faixa.clearContent();
  if (manter.length) aba.getRange(2, 1, manter.length, cab.length).setValues(manter);
  return removidos;
}

/** Índice campo → objeto, para upsert sem varrer a aba N vezes. */
function cfIndexarPor_(nome, campo) {
  const idx = {};
  cfLerTudo_(nome).forEach(function (o) {
    const k = String(o[campo] || '').trim();
    if (k) idx[k] = o;
  });
  return idx;
}

/** Atualiza uma linha existente pelos campos passados. */
function cfAtualizarLinha_(nome, numeroLinha, campos) {
  const aba = cfAba_(nome);
  const cab = cfCabecalho_(nome);
  Object.keys(campos).forEach(function (campo) {
    const c = cab.indexOf(campo);
    if (c >= 0) aba.getRange(numeroLinha, c + 1).setValue(campos[campo]);
  });
}
