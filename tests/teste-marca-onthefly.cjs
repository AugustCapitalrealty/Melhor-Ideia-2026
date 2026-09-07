/**
 * A marca digitada na cotação precisa realmente ser gravada.
 *
 * O defeito que este teste guarda era do tipo mais perigoso: a função
 * chamava cfLerPor_ e cfAtualizar_, que não existem em lugar nenhum do
 * projeto, contra a tabela `Catalogo`, que nunca recebeu uma linha. Um
 * try/catch interno engolia o ReferenceError e ela devolvia
 * { ok: true } assim mesmo.
 *
 * Ou seja: a tela confirmava ao comprador uma gravação que nunca
 * aconteceu, e a marca sumia na cotação seguinte sem jamais ter dado
 * erro. Sucesso relatado sobre trabalho não feito é pior que uma falha
 * ruidosa — ninguém vai procurar o que não reclamou.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando a gravação da marca digitada na cotação...');

const root = path.resolve(__dirname, '..');

function montar(inicial) {
  const guardado = { CF_CATALOGO_CONFIG: inicial ? JSON.stringify(inicial) : null };

  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console, JSON: JSON });
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return {
        getProperty: function (k) { return guardado[k] || null; },
        setProperty: function (k, v) { guardado[k] = v; }
      };
    }
  };
  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'comprador@capitalrealty.com.br'; } }; } };
  ctx.Utilities = { formatDate: function () { return '07/09/2026'; }, getUuid: function () { return 'u'; } };
  ctx.UrlFetchApp = { fetch: function () { return { getResponseCode: function () { return 404; } }; } };
  ctx.CacheService = { getScriptCache: function () { return { get: function () { return null; }, put: function () {} }; } };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Consulta.gs', 'Equalizacao.gs', 'Avaliacao.gs',
   'Fornecedores.gs', 'Exportar.gs', 'Codigo.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  ctx.cfLerTudo_ = function () { return []; };
  ctx.cfUsuario_ = function () { return 'comprador@capitalrealty.com.br'; };

  return { ctx: ctx, lido: function () { return JSON.parse(guardado.CF_CATALOGO_CONFIG || '{}'); } };
}

// ── 1. A marca é gravada onde o catálogo de fato mora
{
  const a = montar(null);
  const r = a.ctx.apiSincronizarMarcaOnTheFly('', 'Melitta');

  assert.equal(r.ok, true, 'a gravação precisa dar certo');
  const cfg = a.lido();
  assert.ok(Array.isArray(cfg.marcas), 'o catálogo precisa ter a lista de marcas');
  assert.ok(cfg.marcas.some(function (m) { return (m.nome || m) === 'Melitta'; }),
    'a marca digitada precisa ESTAR gravada, e não só ser confirmada na tela');
  assert.equal(r.novaNoCatalogo, true, 'marca inédita precisa ser reportada como nova');
}

// ── 2. A mesma marca escrita de outro jeito não vira uma segunda marca
//
//     Caixa e acento, e só isso. "Melita" com um T é erro de digitação,
//     não variação — e casar por semelhança fundiria marcas que são
//     mesmo diferentes, que é um estrago pior que a duplicata.
{
  const a = montar({ grupos: [], itens: [], marcas: [{ nome: 'Melitta' }], pendentes: [] });

  const r = a.ctx.apiSincronizarMarcaOnTheFly('', '  MELITTA ');
  assert.equal(r.ok, true);
  assert.equal(a.lido().marcas.length, 1,
    'caixa diferente não pode criar uma segunda marca — duas entradas para a mesma ' +
    'marca quebram a conferência de conformidade no documento');
  assert.equal(r.novaNoCatalogo, false, 'marca já conhecida não é nova');

  const b = montar({ grupos: [], itens: [], marcas: [{ nome: 'Cabocló' }], pendentes: [] });
  b.ctx.apiSincronizarMarcaOnTheFly('', 'Caboclo');
  assert.equal(b.lido().marcas.length, 1, 'acento diferente também é a mesma marca');

  // E o que é mesmo diferente continua diferente.
  const c = montar({ grupos: [], itens: [], marcas: [{ nome: 'Melitta' }], pendentes: [] });
  c.ctx.apiSincronizarMarcaOnTheFly('', 'Pilão');
  assert.equal(c.lido().marcas.length, 2,
    'marcas diferentes precisam continuar separadas — juntar duas marcas reais ' +
    'é pior que ter uma duplicata');
}

// ── 3. Vindo de um item conhecido, a marca fica vinculada a ele
{
  const a = montar({ grupos: [], itens: [{ id: 'IT1', nome: 'Filtro de café 103' }],
                     marcas: [], pendentes: [] });
  a.ctx.apiSincronizarMarcaOnTheFly('IT1', 'Melitta');

  const cfg = a.lido();
  const item = cfg.itens.filter(function (i) { return i.id === 'IT1'; })[0];
  assert.ok(item.marcas && item.marcas.indexOf('Melitta') >= 0,
    'a marca precisa ficar vinculada ao item de onde foi digitada');
}

// ── 4. Marca vazia é recusada, e recusa é dita
{
  const a = montar(null);
  ['', '   ', null, undefined].forEach(function (vazio) {
    const r = a.ctx.apiSincronizarMarcaOnTheFly('IT1', vazio);
    assert.equal(r.ok, false, 'marca vazia não pode ser aceita');
    assert.ok(/vazi/i.test(r.erro), 'a recusa precisa dizer o motivo');
  });
}

// ── 5. A função não pode depender de nada que não exista
{
  // A CHAMADA, não a menção: o comentário que explica o defeito cita as
  // duas pelo nome de propósito, e não pode disparar o alarme.
  const src = fs.readFileSync(path.join(root, 'app', 'Codigo.gs'), 'utf8');
  ['cfLerPor_(', 'cfAtualizar_('].forEach(function (fantasma) {
    assert.ok(src.indexOf(fantasma) < 0,
      'Codigo.gs voltou a chamar ' + fantasma + ' que não existe no projeto — ' +
      'e o try/catch em volta transformaria isso em sucesso silencioso');
  });

  // A rede de verdade: nenhuma função chamada aqui pode faltar. Se
  // faltar, a chamada estoura em ReferenceError dentro do try e volta
  // como sucesso — que é exatamente o defeito que este teste guarda.
  const todosGs = fs.readdirSync(path.join(root, 'app'))
    .filter(function (f) { return /\.gs$/.test(f); })
    .map(function (f) { return fs.readFileSync(path.join(root, 'app', f), 'utf8'); })
    .join('\n');

  const corpo = src.slice(src.indexOf('function apiSincronizarMarcaOnTheFly'));
  const chamadas = (corpo.slice(0, corpo.indexOf('\n}')).match(/\bcf[A-Za-z0-9_]*_\(/g) || [])
    .map(function (c) { return c.slice(0, -1); });

  chamadas.forEach(function (fn) {
    assert.ok(new RegExp('function\\s+' + fn + '\\s*\\(').test(todosGs),
      'apiSincronizarMarcaOnTheFly chama ' + fn + '(), que não existe em nenhum .gs');
  });
}

console.log('OK: a marca digitada é gravada de verdade, sem duplicar e sem sucesso falso.');
