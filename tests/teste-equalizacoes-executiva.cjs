/**
 * Teste Automatizado: Redesign Executivo da Tela de Equalizações
 * 1. Desacoplamento da ficha (abertura direta sem poluição inline)
 * 2. Cockpit de 4 KPIs no Hub de Equalizações
 * 3. Segmented Pill Tabs para os Megas
 * 4. Tabela Executiva e Cards Glass com badges de status
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando Redesign Executivo da Tela de Equalizações...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

// 1. Verificar que o container #mapa está desacoplado (display:none) na visão do hub
assert.ok(html.includes('<div id="mapa" style="display:none"></div>'),
  'O container #mapa deve estar desacoplado com display:none na listagem principal');

// 2. Verificar o Cockpit de KPIs
assert.ok(html.includes('id="eqKpiGrid"'), 'Deve conter o container #eqKpiGrid');
assert.ok(html.includes('id="kpiTotalEq"'), 'Deve conter o KPI kpiTotalEq');
assert.ok(html.includes('id="kpiVolumeHomologado"'), 'Deve conter o KPI kpiVolumeHomologado');
assert.ok(html.includes('id="kpiSavingMedio"'), 'Deve conter o KPI kpiSavingMedio');
assert.ok(html.includes('id="kpiEmAberto"'), 'Deve conter o KPI kpiEmAberto');

// 3. Verificar Segmented Tabs dos Megas para Equalizações
assert.ok(html.includes('id="filtroMegasEq"'), 'Deve conter a barra de Megas #filtroMegasEq');
assert.ok(html.includes('id="tab-eq-mega-todos"'), 'Deve conter a tab tab-eq-mega-todos');
assert.ok(html.includes('id="tab-eq-mega-curitiba"'), 'Deve conter a tab tab-eq-mega-curitiba');
assert.ok(html.includes('id="tab-eq-mega-esteio"'), 'Deve conter a tab tab-eq-mega-esteio');
assert.ok(html.includes('id="tab-eq-mega-itajai"'), 'Deve conter a tab tab-eq-mega-itajai');

// 4. Executar e testar a lógica JavaScript
const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const scriptContent = html.slice(iScript + 8, fScript);

const elements = {};
const makeElement = (id) => ({
  id: id,
  value: '',
  textContent: '',
  innerHTML: '',
  classList: {
    add: () => {},
    remove: () => {},
    toggle: () => {}
  },
  addEventListener: () => {},
  options: []
});

const makeProxy = () => new Proxy({}, {
  get: () => () => makeProxy()
});

const context = {
  document: {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = makeElement(id);
      return elements[id];
    },
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} } }
  },
  window: { addEventListener: () => {} },
  google: { script: { run: makeProxy() } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  console: console,
  Date: Date,
  location: { search: '', href: 'https://script.google.com/test' }
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

// Testar calcularKpisEqualizacoes
const listaExemplo = [
  { id: 'EQ-1', status: 'homologada', menor: 100000, savingAbsoluto: 15000, empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA' },
  { id: 'EQ-2', status: 'homologada', menor: 50000, savingAbsoluto: 5000, empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO' },
  { id: 'EQ-3', status: 'em_cotacao', menor: 30000, empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ' },
  { id: 'EQ-4', status: 'em_aprovacao', menor: 20000, empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA' }
];

context.calcularKpisEqualizacoes(listaExemplo);
assert.strictEqual(elements['kpiTotalEq'].textContent, 4, 'Total de equalizações deve ser 4');
assert.ok(elements['kpiVolumeHomologado'].textContent.includes('150.000,00'), 'Volume homologado deve ser R$ 150.000,00');
assert.strictEqual(elements['kpiEmAberto'].textContent, 2, 'Processos em aberto devem ser 2 (em cotação + em aprovação)');
assert.ok(elements['kpiSavingMedio'].textContent.includes('20.000,00'), 'Saving capturado deve ser R$ 20.000,00');

// Testar renderização da tabela e cartões
const tabelaHtml = context.tabelaEq(listaExemplo);
assert.ok(tabelaHtml.includes('abrirFichaDireta'), 'A tabela executiva deve chamar abrirFichaDireta');
assert.ok(!tabelaHtml.includes('abrirMapa'), 'A tabela executiva NÃO deve chamar abrirMapa inline');
assert.ok(tabelaHtml.includes('badge-status homologada'), 'A tabela executiva deve ter badge semântico de homologada');
assert.ok(tabelaHtml.includes('Abrir ficha ↗'), 'A tabela executiva deve ter botão Abrir ficha ↗');

const cartaoHtml = context.cartaoEq(listaExemplo[0]);
assert.ok(cartaoHtml.includes('abrirFichaDireta'), 'O cartão executivo deve chamar abrirFichaDireta');
assert.ok(!cartaoHtml.includes('abrirMapa'), 'O cartão executivo NÃO deve chamar abrirMapa inline');
assert.ok(cartaoHtml.includes('Abrir ficha ↗'), 'O cartão executivo deve ter botão Abrir ficha ↗');

console.log('✓ Todos os testes do Redesign Executivo de Equalizações passaram com 100% de sucesso!');

