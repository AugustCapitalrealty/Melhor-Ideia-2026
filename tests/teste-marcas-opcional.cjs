/**
 * Teste de Validação: Gestão Opcional de Marcas
 * - Suporte a Material de Consumo, Limpeza e Obras
 * - Marca de Referência na EAP e Marca Cotada em Preços
 * - 100% Opcional com Dual-Stack Smart Cell (sem duplicar colunas)
 * - Replicador de Marca de Referência com 1 clique
 * - Destaque executivo no mapa comparativo e notas na exportação
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const vm = require('node:vm');

console.log('Validando Gestão Opcional de Marcas (Consumo, Limpeza e Obras)...');

const root = path.resolve(__dirname, '..');
const configSrc = fs.readFileSync(path.join(root, 'app', 'Config.gs'), 'utf8');
const equalizacaoSrc = fs.readFileSync(path.join(root, 'app', 'Equalizacao.gs'), 'utf8');
const exportarSrc = fs.readFileSync(path.join(root, 'app', 'Exportar.gs'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

// 1. Schema em Config.gs
console.log('1. Verificando Schema em Config.gs...');
assert.ok(configSrc.includes("campo: 'MARCA_REFERENCIA'"), 'EAP deve conter campo MARCA_REFERENCIA');
assert.ok(configSrc.includes("campo: 'MARCA_COTADA'"), 'Precos deve conter campo MARCA_COTADA');

// Garantir que foram adicionados no FINAL das colunas para não deslocar colunas existentes
const blocoEap = configSrc.slice(configSrc.indexOf("nome: 'EAP'"), configSrc.indexOf("nome: 'Precos'"));
const colunasEap = blocoEap.match(/campo:\s*'([^']+)'/g);
assert.strictEqual(colunasEap[colunasEap.length - 1], "campo: 'MARCA_REFERENCIA'", 'MARCA_REFERENCIA deve ser o último campo da EAP');

const blocoPrecos = configSrc.slice(configSrc.indexOf("nome: 'Precos'"), configSrc.indexOf("nome: 'Notas'"));
const colunasPrecos = blocoPrecos.match(/campo:\s*'([^']+)'/g);
assert.strictEqual(colunasPrecos[colunasPrecos.length - 1], "campo: 'MARCA_COTADA'", 'MARCA_COTADA deve ser o último campo de Precos');
console.log('✓ Schema em Config.gs verificado com integridade de colunas.');

// 2. Lógica Backend em Equalizacao.gs
console.log('2. Verificando persistência e mapeamento em Equalizacao.gs...');
assert.ok(equalizacaoSrc.includes('MARCA_REFERENCIA: item.marcaReferencia ? String(item.marcaReferencia).trim() : \'\''),
  'cfCriarEqualizacao_ deve gravar MARCA_REFERENCIA');
assert.ok(equalizacaoSrc.includes('MARCA_COTADA: marcaCotada'),
  'cfCriarEqualizacao_ deve gravar MARCA_COTADA');
assert.ok(equalizacaoSrc.includes("marcaReferencia: n.MARCA_REFERENCIA || ''"),
  'cfMapaEqualizacao_ deve retornar marcaReferencia');
assert.ok(equalizacaoSrc.includes("marcaCotada: pr.MARCA_COTADA || ''"),
  'cfMapaEqualizacao_ deve retornar marcaCotada');
console.log('✓ Backend em Equalizacao.gs verificado.');

// 3. Exportação em Exportar.gs
console.log('3. Verificando anotações de marca em Exportar.gs...');
assert.ok(exportarSrc.includes("const refTxt = item.marcaReferencia ? ' [Ref: ' + item.marcaReferencia + ']' : '';"),
  'Exportar.gs deve incluir referência de marca na descrição');
assert.ok(exportarSrc.includes("faixas.notas.push({ l: num, c: colDe(i), nota: 'Marca cotada: ' + c.marcaCotada });"),
  'Exportar.gs deve criar notas de célula com a marca cotada');
assert.ok(exportarSrc.includes("aba.getRange(f.l, f.c).setNote(f.nota);"),
  'Exportar.gs deve aplicar notas com setNote no Sheets');
console.log('✓ Exportar.gs verificado.');

// 4. Interface Frontend em Interface.html
console.log('4. Verificando UI e Ergonomia em Interface.html...');
assert.ok(htmlSrc.includes('id="chkModoMarcas"'), 'Interface.html deve conter checkbox #chkModoMarcas');
assert.ok(htmlSrc.includes('alternarModoMarcas(this.checked)'), 'Interface.html deve chamar alternarModoMarcas');
assert.ok(htmlSrc.includes('function alternarModoMarcas(ativo)'), 'Interface.html deve definir alternarModoMarcas');
assert.ok(htmlSrc.includes('function replicarMarcaRef(i)'), 'Interface.html deve definir replicarMarcaRef');
assert.ok(htmlSrc.includes('tag-marca-alerta'), 'Interface.html deve conter estilo/tag para marca alternativa em menor preço');
assert.ok(htmlSrc.includes('class="input-marca-prop"'), 'Interface.html deve conter input-marca-prop em desenharGrade');
assert.ok(htmlSrc.includes('class="input-ref-marca"'), 'Interface.html deve conter input-ref-marca em desenharGrade');
assert.ok(htmlSrc.includes('function navegarMarca(ev, el)'), 'Interface.html deve conter navegação por teclado para marcas');

// 5. Testes funcionais no contexto JS do Interface.html
console.log('5. Executando testes funcionais de frontend...');
const iScript = htmlSrc.indexOf('<script>');
const fScript = htmlSrc.lastIndexOf('</script>');
const scriptContent = htmlSrc.slice(iScript + 8, fScript);

const makeMock = () => new Proxy({}, {
  get: () => () => makeMock()
});

const elements = {
  chkModoMarcas: { checked: false },
  nCategoria: { value: '', options: [], appendChild: () => {} },
  nEmp: { value: '', options: [], appendChild: () => {} },
  nProjeto: { value: '' },
  nArea: { value: '', options: [], appendChild: () => {} },
  nGrupoCC: { value: '' },
  nData: { value: '' },
  nDetalhamento: { value: '' },
  nPremissas: { value: '' },
  nNotasCr: { value: '' },
  salvoMsg: { innerHTML: '' },
  grade: {
    querySelector: () => null,
    querySelectorAll: () => []
  }
};

const context = {
  document: {
    getElementById: (id) => elements[id] || { value: '', addEventListener: () => {}, options: [], appendChild: () => {} },
    createElement: () => ({ value: '', textContent: '', appendChild: () => {} }),
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {} } }
  },
  window: { addEventListener: () => {} },
  google: {
    script: {
      run: makeMock()
    }
  },
  localStorage: {
    storage: {},
    getItem: function(k) { return this.storage[k] || null; },
    setItem: function(k, v) { this.storage[k] = v; },
    removeItem: function(k) { delete this.storage[k]; }
  },
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  console: console,
  Date: Date,
  location: { search: '' }
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

// Teste A: Modo de marcas inicia desativado (100% opcional)
assert.strictEqual(context.modoMarcasAtivo, false, 'Modo de marcas deve iniciar desligado');

// Teste B: Ativação por categoria (Material de Consumo)
context.selecionouCategoria('Material de Consumo');
assert.strictEqual(context.modoMarcasAtivo, true, 'Ao selecionar Material de Consumo, modo de marcas deve ser ativado');

// Teste C: Replicador de Marca de Referência
context.itens = [{
  tipo: 'item',
  nivel: 0,
  descricao: 'Papel Toalha Interfolhado',
  marcaReferencia: 'Santher',
  quantidade: '10',
  unidade: 'fardo',
  precos: ['50,00', '48,00'],
  marcas: ['', '']
}];
context.proponentes = [
  { nome: 'Fornecedor A', cnpj: '11111111000111' },
  { nome: 'Fornecedor B', cnpj: '22222222000122' }
];

context.replicarMarcaRef(0);
assert.strictEqual(context.itens[0].marcas[0], 'Santher', 'Fornecedor 0 deve herdar Santher');
assert.strictEqual(context.itens[0].marcas[1], 'Santher', 'Fornecedor 1 deve herdar Santher');

// Teste D: Adicionar proponente expande array de marcas
context.addProponente();
assert.strictEqual(context.proponentes.length, 3, 'Deve haver 3 proponentes');
assert.strictEqual(context.itens[0].marcas.length, 3, 'Array de marcas deve expandir para 3 posições');

// Teste E: Remover proponente reduz array de marcas
context.removerProponente(1);
assert.strictEqual(context.proponentes.length, 2, 'Deve haver 2 proponentes');
assert.strictEqual(context.itens[0].marcas.length, 2, 'Array de marcas deve reduzir para 2 posições');

// Teste F: estadoAtual grava modoMarcas e marcas
const estado = context.estadoAtual();
assert.strictEqual(estado.modoMarcas, true, 'estadoAtual deve conter modoMarcas: true');
assert.strictEqual(estado.itens[0].marcaReferencia, 'Santher', 'estadoAtual deve conter marcaReferencia');
assert.strictEqual(estado.itens[0].marcas[0], 'Santher', 'estadoAtual deve conter marcas cotadas');

// Teste G: restaurarRascunho restaura modoMarcas
context.modoMarcasAtivo = false;
context.localStorage.setItem('cf_rascunho_v1', JSON.stringify(estado));
context.restaurarRascunho();
assert.strictEqual(context.modoMarcasAtivo, true, 'restaurarRascunho deve restaurar modoMarcasAtivo como true');

console.log('✓ Todos os testes de Gestão Opcional de Marcas passaram com 100% de sucesso!');
