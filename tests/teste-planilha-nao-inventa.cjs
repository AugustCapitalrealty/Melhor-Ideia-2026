/**
 * A base não se reinventa sozinha.
 *
 * Havia um caminho em cfPlanilha_ que, ao não conseguir abrir a planilha
 * configurada, criava uma VAZIA e gravava o id dela em Script Properties.
 * Script Properties é compartilhada: bastava um usuário sem acesso abrir o
 * app para o sistema inteiro passar a apontar para a base vazia, para
 * todos, sem erro nenhum na tela. O histórico continuava existindo num
 * arquivo que ninguém mais lia.
 *
 * Este teste existe para que esse caminho não volte.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando que a base não é recriada quando já existe uma configurada...');

const root = path.resolve(__dirname, '..');

/**
 * @param opcoes.idConfigurado  id em Script Properties (ou null)
 * @param opcoes.abre          se o openById desse id funciona
 */
function montar(opcoes) {
  const props = { valores: {}, gravacoes: [] };
  if (opcoes.idConfigurado) props.valores.CF_PLANILHA_ID = opcoes.idConfigurado;

  const chamadas = { create: 0, openById: [], moveTo: 0 };

  const ctx = vm.createContext({
    console: console, JSON: JSON, String: String, Number: Number, Math: Math,
    Date: Date, Object: Object, Array: Array, RegExp: RegExp, Error: Error,
    isNaN: isNaN, parseInt: parseInt, parseFloat: parseFloat
  });
  ctx.Logger = { log: function () {} };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'x@y.z'; } }; } };
  ctx.Utilities = { getUuid: function () { return 'uuid'; }, formatDate: function () { return ''; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return {
        getProperty: function (k) { return props.valores[k] || null; },
        setProperty: function (k, v) { props.valores[k] = v; props.gravacoes.push({ k: k, v: v }); }
      };
    }
  };
  ctx.SpreadsheetApp = {
    getActiveSpreadsheet: function () { return null; },   // desvinculado, como pela API
    openById: function (id) {
      chamadas.openById.push(id);
      if (!opcoes.abre) throw new Error('NOT_FOUND');
      return { __id: id, getSheetByName: function () { return null; } };
    },
    create: function () {
      chamadas.create++;
      return { getId: function () { return 'ID-DA-BASE-NOVA'; }, getUrl: function () { return 'url'; } };
    }
  };
  ctx.DriveApp = {
    getFileById: function () { return { moveTo: function () { chamadas.moveTo++; } }; },
    getFolderById: function () { return {}; }
  };

  ['Util.gs', 'Config.gs', 'Schema.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  return { ctx: ctx, props: props, chamadas: chamadas };
}

let passos = 0;
function ok(m) { passos++; console.log('  ✓ ' + m); }

// ── 1. o caminho normal ──
{
  const a = montar({ idConfigurado: '1PLuAqtKz2ds', abre: true });
  const ss = a.ctx.cfPlanilha_();
  assert.strictEqual(ss.__id, '1PLuAqtKz2ds', 'abre a planilha configurada');
  assert.strictEqual(a.chamadas.create, 0, 'e não cria nada');
  ok('com ID configurado que abre, usa a base de sempre');
}

// ── 2. o caminho que custava caro ──
{
  const a = montar({ idConfigurado: '1PLuAqtKz2ds', abre: false });
  let lancou = false, mensagem = '';
  try { a.ctx.cfPlanilha_(); } catch (e) { lancou = true; mensagem = String(e.message || e); }

  assert.ok(lancou, 'ID configurado que não abre tem de FALHAR, não seguir adiante');
  assert.strictEqual(a.chamadas.create, 0,
    'e sobretudo NÃO pode criar outra base: era isso que apagava o histórico de vista');
  assert.strictEqual(a.props.gravacoes.length, 0,
    'nem regravar a Script Property, que é compartilhada por todos os usuários');
  assert.ok(mensagem.indexOf('1PLuAqtKz2ds') >= 0, 'a mensagem diz QUAL planilha não abriu');
  assert.ok(/acesso|Executar como|apagada/i.test(mensagem),
    'e diz o que verificar: acesso, arquivo apagado, modo da implantação');
  ok('sem acesso à base configurada, o sistema para e explica — não inventa outra');
}

// ── 3. sem Script Property, mas com a semente do código ──
{
  // CF_PLANILHA_PADRAO é `const` no topo de Schema.gs, e const não vira
  // propriedade do contexto do vm — por isso o valor é lido do fonte.
  const fonte = fs.readFileSync(path.join(root, 'app', 'Schema.gs'), 'utf8');
  const m = /const CF_PLANILHA_PADRAO = '([^']*)'/.exec(fonte);
  assert.ok(m, 'CF_PLANILHA_PADRAO precisa existir em Schema.gs');
  const semente = m[1];

  assert.ok(semente,
    'a semente está preenchida: existe SEMPRE um id configurado, e por isso a ' +
    'criação automática de base virou caminho inalcançável — que é o objetivo');

  // Sem property e com a semente apontando para uma base que não abre, o
  // comportamento tem de ser o mesmo: erro, nunca criação.
  const a = montar({ idConfigurado: null, abre: false });
  let lancou = false;
  try { a.ctx.cfPlanilha_(); } catch (e) { lancou = true; }
  assert.ok(lancou, 'com a semente do código, base que não abre também falha');
  assert.strictEqual(a.chamadas.create, 0,
    'e continua sem criar: a semente conta como id configurado');
  ok('a semente do código também protege — criar base virou caminho morto');
}

console.log('\nOK: ' + passos + ' verificações. A base configurada que não abre vira erro claro,');
console.log('    e nunca mais uma planilha vazia repontuando o sistema para todos.');
