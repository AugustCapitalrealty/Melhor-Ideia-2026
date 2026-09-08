/**
 * A tela do saving — onde o indicador deixa de morar em planilha.
 *
 * O que este teste protege é a honestidade do que a tela mostra:
 *
 *  1. Sem compra com saving, o bloco NÃO some: ele explica por que não
 *     há número e o que fazer para haver. Bloco em branco não ensina
 *     nada a quem abriu esperando ver desempenho do time.
 *  2. O denominador aparece junto do total. "R$ 12 mil em 2 de 40
 *     compras" e "R$ 12 mil em 2 de 2" são resultados muito diferentes,
 *     e mostrar só o total transforma indicador em vitrine.
 *  3. Mês aproximado sai marcado. Compras anteriores ao registro da data
 *     de homologação entram pelo mês da cotação — e isso é aproximação,
 *     não precisão.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando a tela do panorama de saving...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const script = html.slice(iScript + 8, fScript);

function montar() {
  const elementos = {};
  const novo = function (id) {
    return {
      id: id, innerHTML: '', value: '', hidden: false, textContent: '', style: {},
      options: [], classList: { add: function () {}, remove: function () {}, toggle: function () {} },
      addEventListener: function () {}, appendChild: function () {},
      setAttribute: function () {}, getAttribute: function () { return null; },
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
    console: console, Date: Date, location: { search: '' }, confirm: function () { return true; }
  };
  vm.createContext(ctx);
  vm.runInContext(script, ctx);
  return { ctx: ctx, el: elementos };
}

// ── 1. As três peças existem e estão ligadas
{
  const a = montar();
  assert.strictEqual(typeof a.ctx.carregarPanoramaSaving, 'function',
    'faltou a função que busca o panorama no servidor');
  assert.strictEqual(typeof a.ctx.desenharPanoramaSaving, 'function',
    'faltou a função que desenha o panorama');
  assert.ok(html.indexOf('id="blocoSaving"') >= 0,
    'faltou o bloco no HTML — a função desenharia no vazio');
  // Contar, não testar presença: `function carregarPanoramaSaving() {`
  // também casa com o nome seguido de parênteses. Este teste passava com
  // a chamada removida — a mutação pegou o teste, não o código.
  const usos = script.split('carregarPanoramaSaving()').length - 1;
  assert.ok(usos >= 2,
    'a função existe mas ninguém a chama (' + usos + ' ocorrência): o bloco ' +
    'nunca apareceria na tela');
}

// ── 2. Sem saving, o bloco EXPLICA em vez de sumir
{
  const a = montar();
  a.ctx.desenharPanoramaSaving({
    total: 0, totalContratado: 0, percentual: null,
    compras: 0, homologadas: 3, semRegistro: 3, dataAproximada: 0,
    porMes: [], porMega: [], porCategoria: [], porPessoa: []
  });

  const el = a.el.blocoSaving;
  assert.strictEqual(el.hidden, false,
    'sem saving o bloco não pode sumir: quem abriu esperando ver desempenho ' +
    'do time precisa saber por que não há número');
  assert.ok(/3 compras homologadas/.test(el.innerHTML),
    'o estado vazio precisa dizer quantas compras existem');
  assert.ok(/proposta inicial/.test(el.innerHTML),
    'e precisa dizer o que falta para haver número — a razão é acionável');
  assert.ok(!/R\$ 0,00/.test(el.innerHTML),
    'zero não pode ser exibido como se fosse resultado apurado');
}

// ── 3. Com saving, o denominador vem junto do total
{
  const a = montar();
  a.ctx.desenharPanoramaSaving({
    total: 35000, totalContratado: 315000, percentual: 10,
    compras: 3, homologadas: 12, semRegistro: 9, dataAproximada: 0,
    porMes: [
      { chave: '2026-05', saving: 15000, compras: 2, percentual: 12 },
      { chave: '2026-06', saving: 20000, compras: 1, percentual: 9 }
    ],
    porMega: [{ chave: 'MEGA CENTRO LOGÍSTICO CURITIBA', saving: 30000, compras: 2, percentual: 11 }],
    porCategoria: [{ chave: 'Material de Consumo', saving: 35000, compras: 3, percentual: 10 }],
    porPessoa: [{ chave: 'ana@capitalrealty.com.br', saving: 35000, compras: 3, percentual: 10 }]
  });

  const h = a.el.blocoSaving.innerHTML;

  assert.ok(/35\.000,00/.test(h), 'o total precisa aparecer: ' + h.slice(0, 200));
  assert.ok(/3<\/b> de <b>12/.test(h),
    'o denominador precisa vir junto do total — 3 de 12 é uma história muito ' +
    'diferente de 3 de 3');
  assert.ok(/9<\/b> sem rodada registrada/.test(h),
    'quantas homologadas não renderam saving é informação acionável, não ruído');

  // A série sai em ordem e com rótulo legível.
  assert.ok(h.indexOf('mai/26') < h.indexOf('jun/26'),
    'a série mensal precisa sair em ordem cronológica');

  // As três quebras.
  assert.ok(/Por Mega/.test(h) && /Por categoria/.test(h) && /Por quem negociou/.test(h),
    'faltou uma das quebras que dão a leitura de gestão');
  assert.ok(/ana<\/span>/.test(h),
    'o e-mail sai só com o login: a coluna é estreita e o domínio é sempre o mesmo');
  assert.ok(/Curitiba/.test(h) && !/MEGA CENTRO LOGÍSTICO CURITIBA<\/span>/.test(h),
    'o nome do Mega sai simplificado na quebra, senão estoura a coluna');
}

// ── 4. Mês aproximado sai marcado
{
  const a = montar();
  a.ctx.desenharPanoramaSaving({
    total: 10000, totalContratado: 90000, percentual: 10,
    compras: 1, homologadas: 1, semRegistro: 0, dataAproximada: 1,
    porMes: [{ chave: '2026-03', saving: 10000, compras: 1, percentual: 10 }],
    porMega: [], porCategoria: [], porPessoa: []
  });

  assert.ok(/m[êe]s aproximado/i.test(a.el.blocoSaving.innerHTML),
    'compra sem data de homologação entra pelo mês da cotação — e isso precisa ' +
    'sair marcado, para ninguém apresentar aproximação como precisão');
}

console.log('OK: o panorama mostra a série, o denominador e a ressalva — e explica quando não há dado.');
