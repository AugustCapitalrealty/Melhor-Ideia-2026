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

// 1. O seletor de categoria existe e é montado a partir do servidor.
//
//    Antes, este teste afirmava que as opções estavam ESCRITAS no HTML.
//    Elas estavam — e divergiam da taxonomia do Equalizacao.gs, que é
//    quem manda. Uma opção só no HTML ("Outra…") virava categoria que
//    nenhum filtro encontrava; uma categoria só no servidor não podia
//    ser escolhida. O teste agora exige a fonte única.
assert.ok(html.includes('id="nCategoria"'), 'Interface.html deve conter <select id="nCategoria">');
assert.ok(html.includes('function montarSeletorCategorias('),
  'a tela precisa montar as categorias a partir da taxonomia do servidor');
assert.ok(!/<option value="Material de Consumo"/.test(html),
  'as categorias voltaram a ser escritas à mão no HTML, duplicando a taxonomia');

const codigoGs = fs.readFileSync(path.join(root, 'app', 'Codigo.gs'), 'utf8');
assert.ok(/categorias:\s*CF_CATEGORIAS\.map/.test(codigoGs),
  'apiOpcoes precisa entregar a taxonomia para a tela montar o seletor');

const eqGs = fs.readFileSync(path.join(root, 'app', 'Equalizacao.gs'), 'utf8');
['Material de Consumo', 'Material de Construção'].forEach(function (c) {
  assert.ok(eqGs.includes("nome: '" + c + "'"),
    'a categoria ' + c + ' sumiu da taxonomia do servidor');
});

// A subcategoria passou a ser escolhível, não só deduzida.
assert.ok(html.includes('id="nSubcategoria"'), 'faltou o seletor de subcategoria');
assert.ok(html.includes('function montarSeletorSubcategorias('),
  'faltou a montagem das subcategorias da categoria escolhida');

// 2. Verificar que centroCusto foi removido dos proponentes no HTML
assert.ok(!html.includes("campoProp(i, 'centroCusto'"), 'detalhesProposta não deve solicitar centroCusto por proponente');

// 3. A logo da Capital Realty
//
//    O ID continua no código como último recurso, mas não é mais a
//    única fonte: ele falhava e a logo sumia sem explicação. Agora há
//    Config, pasta do projeto e API do Drive antes dele.
const idLogoCR = '1XqFtIobiEq7VC2H41sKnFNUuOluw_J4V';
assert.ok(html.includes(idLogoCR), 'Interface.html deve incorporar o ID da logo da Capital Realty');
assert.ok(exportar.includes(idLogoCR), 'Exportar.gs deve manter o ID da logo como último recurso');
assert.ok(exportar.includes('cfInserirLogoEmpresa_'), 'Exportar.gs deve conter cfInserirLogoEmpresa_');
assert.ok(exportar.includes('function cfLogoBlob_'), 'faltou a busca da logo em várias fontes');
assert.ok(exportar.includes('function diagnosticarLogos'), 'faltou o diagnóstico das logos');

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
