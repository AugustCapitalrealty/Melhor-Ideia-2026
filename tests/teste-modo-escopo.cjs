/**
 * Modo escopo — a entrega de 15/10/2026 vende a montagem do escopo.
 *
 * Preço, equalização e base de fornecedores vão ser integrados com o
 * Fluig/RM e saem da tela até lá (decisão do Guilherme, 11/10/2026).
 * O que este teste protege:
 *
 *  1. Ligado por padrão: sem propriedade nenhuma, o app abre nos Escopos
 *     e todo link antigo (equalização, ficha, avaliação, nova cotação)
 *     cai nos Escopos também.
 *  2. É reversível: MODO_ESCOPO = 'nao' devolve o comportamento antigo,
 *     sem nova implantação.
 *  3. Na tela, as abas de preço, equalização e fornecedores e o botão
 *     "+ Nova cotação" somem, e chamar aba('consulta') por qualquer
 *     caminho não mostra a consulta. Configurações continua acessível.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o modo escopo...');

const root = path.resolve(__dirname, '..');

// ── Servidor: doGet decide a página
function servidor(propriedade, quebrar) {
  const codigo = fs.readFileSync(path.join(root, 'app', 'Codigo.gs'), 'utf8');
  const ultimo = {};
  const saida = {
    setTitle: function () { return saida; },
    addMetaTag: function () { return saida; },
    setXFrameOptionsMode: function () { return saida; }
  };
  const ctx = {
    HtmlService: {
      createTemplateFromFile: function () {
        ultimo.t = { evaluate: function () { return saida; } };
        return ultimo.t;
      },
      XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }
    },
    PropertiesService: {
      getScriptProperties: function () {
        if (quebrar) throw new Error('sem acesso às propriedades');
        return { getProperty: function (k) { return k === 'MODO_ESCOPO' ? propriedade : null; } };
      }
    },
    ScriptApp: { getService: function () { return { getUrl: function () { return 'https://exemplo/exec'; } }; } },
    console: console
  };
  vm.createContext(ctx);
  vm.runInContext(codigo, ctx);
  return function (parametros) {
    ctx.doGet({ parameter: parametros || {} });
    return ultimo.t;
  };
}

{
  const abrir = servidor(null);
  const t = abrir();
  assert.strictEqual(t.pagina, 'escopos', 'sem propriedade, o modo escopo vale e o app abre nos Escopos');
  assert.strictEqual(t.modoEscopo, 'sim', 'a tela precisa saber que está no modo escopo');
  [
    { page: 'consulta' }, { page: 'mapa', eq: 'EQU-1' }, { eq: 'EQU-1' }, { editar: 'EQU-1' },
    { page: 'nova' }, { page: 'ficha', eq: 'EQU-1' }, { page: 'avaliacao', cnpj: '1' }, { page: 'fornecedores' }
  ].forEach(function (p) {
    assert.strictEqual(abrir(p).pagina, 'escopos',
      'link antigo ' + JSON.stringify(p) + ' mostraria preço ou fornecedor no modo escopo');
  });
  assert.strictEqual(abrir({ page: 'escopos' }).pagina, 'escopos');
}

{
  const t = servidor(null, true)();
  assert.strictEqual(t.pagina, 'escopos', 'se as propriedades falharem, o modo escopo continua ligado');
}

{
  const abrir = servidor('NAO ');
  assert.strictEqual(abrir().pagina, 'consulta', "MODO_ESCOPO = 'nao' devolve a abertura na Consulta de preço");
  assert.strictEqual(abrir().modoEscopo, '');
  assert.strictEqual(abrir({ page: 'mapa', eq: 'EQU-1' }).pagina, 'mapa', "com 'nao', o link da equalização volta a funcionar");
  assert.strictEqual(abrir({ page: 'ficha', eq: 'EQU-1' }).pagina, 'ficha');
}

// ── Tela: abas escondidas e aba() travada
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

function tela(modo) {
  const elementos = {};
  const novo = function (id) {
    return {
      id: id, innerHTML: '', value: '', hidden: false, textContent: '', style: {}, atributos: {},
      options: [], classList: { add: function () {}, remove: function () {}, toggle: function () {} },
      addEventListener: function () {}, appendChild: function () {},
      setAttribute: function (k, v) { this.atributos[k] = String(v); },
      getAttribute: function (k) { return this.atributos[k] || null; },
      querySelector: function () { return null; }, querySelectorAll: function () { return []; },
      focus: function () {}, remove: function () {}
    };
  };
  const ctx = {
    document: {
      getElementById: function (id) {
        if (!elementos[id]) elementos[id] = novo(id);
        return elementos[id];
      },
      addEventListener: function () {}, querySelector: function () { return null; },
      querySelectorAll: function () { return []; }, createElement: novo,
      body: { classList: { add: function () {}, remove: function () {} } }
    },
    window: { addEventListener: function () {} },
    google: { script: { run: new Proxy({}, { get: function () { return function () { return this; }; } }) } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    setTimeout: function () {}, clearTimeout: function () {},
    console: console, Date: Date, location: { search: '' }, confirm: function () { return true; },
    esCarregarUI: function () { ctx.escoposCarregados = (ctx.escoposCarregados || 0) + 1; }
  };
  const fonte = script
    .replace("'<?= modoEscopo ?>'", modo ? "'sim'" : "''")
    .replace("'<?= pagina ?>'", modo ? "'escopos'" : "'consulta'");
  assert.notStrictEqual(fonte, script, 'a tela não lê mais o modo escopo vindo do servidor');
  vm.createContext(ctx);
  vm.runInContext(fonte, ctx);
  return { ctx: ctx, el: elementos };
}

{
  const a = tela(true);
  ['ab-consulta', 'ab-mapa', 'ab-fornecedores', 'ab-nova'].forEach(function (id) {
    assert.strictEqual(a.el[id] && a.el[id].hidden, true, id + ' continua visível no modo escopo');
  });
  ['ab-escopos', 'ab-config'].forEach(function (id) {
    assert.ok(!a.el[id] || a.el[id].hidden !== true, id + ' não pode sumir no modo escopo');
  });
  assert.strictEqual(a.el['v-escopos'].hidden, false, 'o app precisa abrir nos Escopos');
  assert.strictEqual(a.el['v-consulta'].hidden, true, 'a Consulta de preço aparece por baixo dos Escopos');
  assert.ok(a.ctx.escoposCarregados >= 1, 'abrir nos Escopos sem carregar a lista deixaria a tela vazia');

  // Qualquer caminho que ainda chame as abas escondidas (salvar, ficha,
  // avaliação) termina nos Escopos.
  ['consulta', 'mapa', 'fornecedores', 'nova'].forEach(function (nome) {
    a.ctx.aba(nome);
    assert.strictEqual(a.el['v-' + nome].hidden, true, "aba('" + nome + "') mostrou a tela no modo escopo");
    assert.strictEqual(a.el['v-escopos'].hidden, false);
  });
  assert.ok(/Escopos/.test(a.el.tituloTela.textContent), 'o título precisa acompanhar a tela mostrada');

  assert.ok(/MODO_ESCOPO \? '' : ' · dados importados do acervo de equalizações'/.test(script),
    'o rodapé fala do acervo de equalizações no modo escopo');

  a.ctx.inicializarTelaConfig = function () {};
  a.ctx.aba('config');
  assert.strictEqual(a.el['v-config'].hidden, false, 'Configurações (grupos, itens, marcas) segue acessível');
}

{
  const a = tela(false);
  assert.ok(!a.el['ab-consulta'] || a.el['ab-consulta'].hidden !== true, 'sem o modo, a aba de preço volta');
  a.ctx.aba('consulta');
  assert.strictEqual(a.el['v-consulta'].hidden, false, "sem o modo, aba('consulta') volta a funcionar");
}

// Os botões da barra têm display:flex; quem garante que o hidden vence é
// a guarda global [hidden], protegida por teste-css-integro.cjs.

console.log('Modo escopo: OK');
