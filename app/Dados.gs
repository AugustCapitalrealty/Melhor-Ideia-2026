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
    return cab.some(function (campo) { return o[campo] !== '' && o[campo] !== null; });
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

  aba.getRange(aba.getLastRow() + 1, 1, matriz.length, cab.length).setValues(matriz);
  return matriz.length;
}

/** Apaga as linhas em que `campo` bate com `valor`. De baixo para cima. */
function cfApagarPor_(nome, campo, valor) {
  const aba = cfAba_(nome);
  const linhas = aba.getLastRow() - 1;
  if (linhas < 1) return 0;

  const cab = cfCabecalho_(nome);
  const col = cab.indexOf(campo);
  if (col < 0) return 0;

  const valores = aba.getRange(2, col + 1, linhas, 1).getValues();
  const alvos = [];
  for (let i = valores.length - 1; i >= 0; i--) {
    if (String(valores[i][0]) === String(valor)) alvos.push(i + 2);
  }
  alvos.forEach(function (l) { aba.deleteRow(l); });
  return alvos.length;
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
