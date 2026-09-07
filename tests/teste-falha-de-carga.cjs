/**
 * Quando o servidor não responde, a tela precisa dizer — e destravar.
 *
 * O defeito que este teste guarda: cada aba marca "já carreguei" ANTES
 * de a resposta chegar. Isso evita disparar a mesma chamada duas vezes,
 * mas transformava qualquer falha em permanente — a aba ficava vazia, e
 * nem sair dela e voltar trazia os dados, só recarregar a página
 * inteira. Como nenhum dos carregadores dizia nada, o resultado visível
 * era uma lista vazia sem explicação: quem olha conclui que não há
 * dados, não que houve erro.
 *
 * Ficou pior quando as categorias saíram do HTML e passaram a vir do
 * servidor: antes, uma falha na chamada deixava o seletor com a lista
 * escrita à mão; agora deixa "carregando categorias…" para sempre.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o que a tela faz quando uma carga falha...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const script = html.slice(iScript + 8, fScript);

// ── DOM de mentira, mas com estado: o que interessa aqui é justamente o
//    que sobra escrito no elemento depois da falha.
function novoElemento(id) {
  return {
    id: id,
    innerHTML: '',
    value: '',
    hidden: false,
    disabled: false,
    textContent: '',
    dataset: {},
    style: {},
    options: [],
    children: [],
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    addEventListener: function () {},
    removeEventListener: function () {},
    appendChild: function () {},
    removeChild: function () {},
    insertBefore: function () {},
    setAttribute: function () {},
    getAttribute: function () { return null; },
    remove: function () {},
    focus: function () {},
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
    scrollIntoView: function () {}
  };
}

/**
 * O `google.script.run` de mentira.
 *
 * Cada chamada de api olha `respostas[nome]` e decide se chama o
 * handler de sucesso ou o de falha — é assim que o teste consegue
 * encenar "o servidor caiu" sem servidor nenhum.
 */
function criarRun(respostas, registro) {
  let ok = null;
  let falha = null;

  const base = {
    withSuccessHandler: function (f) { ok = f; return proxy; },
    withFailureHandler: function (f) { falha = f; return proxy; }
  };

  // Qualquer outro nome é uma chamada de api: a tela tem dezenas delas e
  // algumas disparam já na carga do script.
  const proxy = new Proxy(base, {
    get: function (alvo, prop) {
      if (prop in alvo) return alvo[prop];
      if (typeof prop !== 'string') return undefined;
      return function () {
        const meuOk = ok;
        const minhaFalha = falha;
        registro[prop] = { temFalha: typeof minhaFalha === 'function' };
        ok = null; falha = null;                     // handlers valem por chamada
        const r = respostas[prop];
        if (!r) return;
        if (r.tipo === 'falha') {
          if (minhaFalha) minhaFalha(r.valor);       // sem handler, some calado
        } else if (meuOk) {
          meuOk(r.valor);
        }
      };
    }
  });

  return proxy;
}

function montarContexto(respostas) {
  const elementos = {};
  const registro = {};

  const contexto = {
    document: {
      getElementById: function (id) {
        if (!elementos[id]) elementos[id] = novoElemento(id);
        return elementos[id];
      },
      addEventListener: function () {},
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      createElement: function (t) { return novoElemento(t); },
      body: { classList: { add: function () {}, remove: function () {} }, appendChild: function () {} }
    },
    window: { addEventListener: function () {}, matchMedia: function () { return { matches: false, addEventListener: function () {} }; } },
    google: { script: { run: criarRun(respostas, registro), host: { close: function () {} } } },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    sessionStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    setTimeout: function () {}, clearTimeout: function () {},
    setInterval: function () {}, clearInterval: function () {},
    console: console, Date: Date, location: { search: '' },
    confirm: function () { return true; }, alert: function () {},
    navigator: { clipboard: { writeText: function () {} } }
  };

  vm.createContext(contexto);
  vm.runInContext(script, contexto);
  return { ctx: contexto, el: elementos, registro: registro };
}

/**
 * Chama o carregador como a tela chama.
 *
 * A trava é ligada por mostrarAba() ANTES da chamada — e é justamente
 * isso que faz a falha virar permanente. Sem ligá-la aqui, o teste
 * afirmaria que a trava está desligada quando ela nunca esteve ligada,
 * e passaria mesmo com o defeito de volta. (Foi o que aconteceu: duas
 * mutações sobreviveram até esta linha existir.)
 */
function carregarComoATelaChama(a, nomeDaFuncao, trava) {
  a.ctx[trava] = true;
  try { a.ctx[nomeDaFuncao](); } catch (e) { /* o resto da rotina não é o alvo */ }
}

// ─────────────────────────────────────────────────────────────
//  1. A chamada das opções tem para onde a falha ir
// ─────────────────────────────────────────────────────────────
{
  const a = montarContexto({ apiOpcoes: { tipo: 'falha', valor: new Error('servidor indisponível') } });
  carregarComoATelaChama(a, 'carregarOpcoes', 'opcoesCarregadas');

  assert.ok(a.registro.apiOpcoes && a.registro.apiOpcoes.temFalha,
    'carregarOpcoes precisa registrar um withFailureHandler — sem ele a falha some e o seletor fica em "carregando categorias…" para sempre');

  assert.ok(/servidor indisponível/.test(a.el.avisoOpcoes.innerHTML),
    'a falha das opções precisa aparecer na tela, com o motivo');
  assert.strictEqual(a.el.avisoOpcoes.hidden, false, 'o aviso da falha não pode ficar escondido');
  assert.ok(/carregarOpcoes\(\)/.test(a.el.avisoOpcoes.innerHTML),
    'o aviso precisa oferecer refazer a chamada');
  assert.strictEqual(a.ctx.opcoesCarregadas, false,
    'a trava precisa cair na falha, senão reabrir a aba não tenta de novo');
}

// ─────────────────────────────────────────────────────────────
//  2. Erro tratado no servidor conta como falha, não como silêncio
// ─────────────────────────────────────────────────────────────
{
  const a = montarContexto({ apiOpcoes: { tipo: 'ok', valor: { ok: false, erro: 'CF_CATEGORIAS is not defined' } } });
  carregarComoATelaChama(a, 'carregarOpcoes', 'opcoesCarregadas');

  assert.ok(/CF_CATEGORIAS is not defined/.test(a.el.avisoOpcoes.innerHTML),
    'um { ok: false } do servidor precisa virar mensagem, não um return calado');
  assert.strictEqual(a.ctx.opcoesCarregadas, false, 'a trava também cai no erro tratado');
}

// ─────────────────────────────────────────────────────────────
//  3. Dando certo, o seletor sai do "carregando" e o aviso some
// ─────────────────────────────────────────────────────────────
{
  const a = montarContexto({
    apiOpcoes: {
      tipo: 'ok',
      valor: {
        ok: true,
        empreendimentos: [{ nome: 'Curitiba', empresa: 'Demercado' }],
        categorias: [
          { nome: 'Material de Consumo', icone: '☕', subs: ['Copa & Cozinha', 'Papelaria'] },
          { nome: 'Obras & Reformas', icone: '🏗️', subs: [] }
        ]
      }
    }
  });
  try { a.ctx.carregarOpcoes(); } catch (e) {}

  const sel = a.el.nCategoria.innerHTML;
  assert.ok(/Material de Consumo/.test(sel), 'a categoria do servidor precisa virar opção');
  assert.ok(/Obras &amp; Reformas|Obras & Reformas/.test(sel), 'todas as categorias, não só as recorrentes');
  assert.ok(/Compras recorrentes/.test(sel), 'as mensais ficam num grupo à parte');
  assert.ok(!/carregando categorias/.test(sel), 'o rótulo de carregamento precisa sair quando os dados chegam');
  assert.strictEqual(a.el.avisoOpcoes.hidden, true, 'dando certo, o aviso de falha fica escondido');

  // A subcategoria aparece só quando a categoria escolhida tem alguma.
  a.ctx.montarSeletorSubcategorias('Material de Consumo');
  assert.strictEqual(a.el.boxSubcategoria.hidden, false, 'categoria com subcategorias precisa mostrar o segundo seletor');
  assert.ok(/Copa &amp; Cozinha|Copa & Cozinha/.test(a.el.nSubcategoria.innerHTML), 'faltou a subcategoria no seletor');

  a.ctx.montarSeletorSubcategorias('Obras & Reformas');
  assert.strictEqual(a.el.boxSubcategoria.hidden, true, 'categoria sem subcategoria não pode deixar um seletor vazio ocupando espaço');
}

// ─────────────────────────────────────────────────────────────
//  4. As outras três cargas: mesma doença, mesma cura
// ─────────────────────────────────────────────────────────────
[
  { fn: 'carregarEqualizacoes', api: 'apiEqualizacoes', destino: 'listaEq', trava: 'equalizacoesCarregadas' },
  { fn: 'carregarFornecedores', api: 'apiFornecedores', destino: 'listaForn', trava: 'fornecedoresCarregados' },
  { fn: 'carregarCategorias', api: 'apiCategorias', destino: 'pillsEq', trava: 'categoriasCarregadas' }
].forEach(function (caso) {
  const respostas = {};
  respostas[caso.api] = { tipo: 'falha', valor: new Error('tempo esgotado') };
  const a = montarContexto(respostas);
  carregarComoATelaChama(a, caso.fn, caso.trava);

  assert.ok(a.registro[caso.api] && a.registro[caso.api].temFalha,
    caso.fn + ' precisa registrar um withFailureHandler');
  assert.ok(/tempo esgotado/.test(a.el[caso.destino].innerHTML),
    caso.fn + ' precisa dizer o motivo da falha em ' + caso.destino);
  assert.ok(new RegExp(caso.fn + '\\(\\)').test(a.el[caso.destino].innerHTML),
    caso.fn + ' precisa oferecer refazer a chamada');
  assert.strictEqual(a.ctx[caso.trava], false,
    caso.trava + ' precisa cair na falha, senão a aba nunca mais tenta');
});

console.log('OK: nenhuma das quatro cargas falha em silêncio, e nenhuma trava a segunda tentativa.');
