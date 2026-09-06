/**
 * Teste de Validação:
 * 1. Categoria da Compra (Material de Consumo, Material de Construção)
 * 2. Autogeração do Nome do Projeto (ex: Material de Consumo — Curitiba — Setembro/2026)
 * 3. Logotipo Oficial da Capital Realty (Drive ID 1XqFtIobiEq7VC2H41sKnFNUuOluw_J4V) na Interface e em Exportar.gs
 * 4. Não repetição de Centro de Custo nos proponentes
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando Categoria da Compra, Autonomeação de Projeto e Logo Capital Realty...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
const exportar = fs.readFileSync(path.join(root, 'app', 'Exportar.gs'), 'utf8');

// 1. Verificar select de categoria no HTML
assert.ok(html.includes('id="nCategoria"'), 'Interface.html deve conter <select id="nCategoria">');
assert.ok(html.includes('value="Material de Consumo"'), 'Interface.html deve conter a opção Material de Consumo');
assert.ok(html.includes('value="Material de Construção"'), 'Interface.html deve conter a opção Material de Construção');

// 2. Verificar que centroCusto foi removido dos proponentes no HTML
assert.ok(!html.includes("campoProp(i, 'centroCusto'"), 'detalhesProposta não deve solicitar centroCusto por proponente');

// 3. Verificar logotipo da Capital Realty
const idLogoCR = '1XqFtIobiEq7VC2H41sKnFNUuOluw_J4V';
assert.ok(html.includes(idLogoCR), 'Interface.html deve incorporar o ID da logo da Capital Realty');
assert.ok(exportar.includes(idLogoCR), 'Exportar.gs deve incorporar o ID da logo da Capital Realty');
assert.ok(exportar.includes('cfInserirLogoEmpresa_'), 'Exportar.gs deve conter cfInserirLogoEmpresa_');

// 4. Executar e validar as funções de autonaming do JavaScript da interface
const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const scriptContent = html.slice(iScript + 8, fScript);

const makeProxy = () => new Proxy({}, {
  get: () => () => makeProxy()
});

const context = {
  document: {
    getElementById: () => ({ value: '', addEventListener: () => {}, options: [] }),
    addEventListener: () => {},
    querySelector: () => null,
    body: { classList: { add: () => {} } }
  },
  window: { addEventListener: () => {} },
  google: {
    script: {
      run: makeProxy()
    }
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  console: console,
  Date: Date,
  location: { search: '' }
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

// Testar simplificarMega
assert.strictEqual(context.simplificarMega('MEGA CENTRO LOGÍSTICO CURITIBA'), 'Curitiba');
assert.strictEqual(context.simplificarMega('MEGA CENTRO LOGÍSTICO ESTEIO'), 'Esteio');
assert.strictEqual(context.simplificarMega('MEGA CENTRO LOGÍSTICO ITAJAÍ'), 'Itajaí');

// Testar gerarNomeProjetoSugerido
const nomeCuritiba = context.gerarNomeProjetoSugerido('Material de Consumo', 'MEGA CENTRO LOGÍSTICO CURITIBA', '2026-09-06');
assert.strictEqual(nomeCuritiba, 'Material de Consumo — Curitiba — Setembro/2026');

const nomeSemMega = context.gerarNomeProjetoSugerido('Material de Construção', '', '2026-09-06');
assert.strictEqual(nomeSemMega, 'Material de Construção — Setembro/2026');

const nomeItajai = context.gerarNomeProjetoSugerido('Material de Construção', 'MEGA CENTRO LOGÍSTICO ITAJAÍ', '2026-10-15');
assert.strictEqual(nomeItajai, 'Material de Construção — Itajaí — Outubro/2026');

console.log('✓ Todas as validações de Categoria, Autonomeação e Logo da Capital Realty passaram com sucesso!');
