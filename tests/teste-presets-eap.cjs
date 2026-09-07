/**
 * Teste de Validação: Predefinições de Grupos e Subgrupos (EAP Presets Engine)
 * - Valida catálogo oficial Capital Realty (5 pacotes)
 * - Valida integridade da interface (modal, botões, preview)
 * - Valida seleção modular ("selecionar conforme" / checklist de itens)
 * - Valida injeção na grade (anexar vs substituir, recálculo de EAP, marcas e proponentes)
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const vm = require('node:vm');

console.log('Validando Predefinições de Grupos e Subgrupos (EAP Presets Engine)...');

const root = path.resolve(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

// 1. Verificações no HTML e CSS
console.log('1. Verificando marcação e estilos em Interface.html...');
assert.ok(htmlSrc.includes('class="bt bt-preset"'), 'Interface.html deve conter botão .bt-preset');
assert.ok(htmlSrc.includes('abrirModalPresets()'), 'Interface.html deve chamar abrirModalPresets()');
assert.ok(htmlSrc.includes('id="modalPresetsJanela"'), 'Interface.html deve conter modal #modalPresetsJanela');
assert.ok(htmlSrc.includes('id="modalPresetsFundo"'), 'Interface.html deve conter fundo #modalPresetsFundo');
assert.ok(htmlSrc.includes('id="previewArvore"'), 'Interface.html deve conter container #previewArvore');
assert.ok(htmlSrc.includes('id="chkTodosPreset"'), 'Interface.html deve conter checkbox #chkTodosPreset');
assert.ok(htmlSrc.includes('id="btConfirmarPreset"'), 'Interface.html deve conter botão #btConfirmarPreset');
assert.ok(htmlSrc.includes('.modal-presets-janela'), 'Interface.html deve conter estilos para a janela modal');
assert.ok(htmlSrc.includes('.item-preview-linha'), 'Interface.html deve conter estilos para linhas do preview');
console.log('✓ Marcação e estilos em Interface.html verificados.');

// 2. Extrair script e rodar em ambiente VM
console.log('2. Executando testes funcionais de EAP Presets no sandbox JS...');
const iScript = htmlSrc.indexOf('<script>');
const fScript = htmlSrc.lastIndexOf('</script>');
const scriptContent = htmlSrc.slice(iScript + 8, fScript);

const makeMock = () => new Proxy({}, {
  get: () => () => makeMock()
});

const makeElement = (props = {}) => Object.assign({
  value: '',
  innerHTML: '',
  textContent: '',
  options: [],
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  addEventListener: () => {},
  appendChild: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  scrollIntoView: () => {}
}, props);

const elements = {
  chkModoMarcas: makeElement({ checked: false }),
  nCategoria: makeElement({ value: '', options: [] }),
  nEmp: makeElement({ value: '', options: [] }),
  nProjeto: makeElement(),
  nArea: makeElement({ value: '', options: [] }),
  nGrupoCC: makeElement(),
  nData: makeElement(),
  nDetalhamento: makeElement(),
  nPremissas: makeElement(),
  nNotasCr: makeElement(),
  salvoMsg: makeElement(),
  modalPresetsFundo: makeElement({ hidden: true }),
  modalPresetsJanela: makeElement({ hidden: true }),
  presetsFiltrosCat: makeElement(),
  presetsListaCards: makeElement(),
  previewCabecalho: makeElement(),
  previewArvore: makeElement(),
  previewContador: makeElement(),
  chkTodosPreset: makeElement({ checked: false, indeterminate: false }),
  btConfirmarPreset: makeElement({ disabled: false }),
  grade: makeElement()
};

const context = {
  confirm: () => true,
  document: {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = makeElement();
      return elements[id];
    },
    createElement: () => makeElement(),
    addEventListener: () => {},
    querySelector: (sel) => {
      if (sel.includes('value="substituir"')) return { checked: false, value: 'substituir' };
      if (sel.includes('value="anexar"')) return { checked: true, value: 'anexar' };
      if (sel.includes('baseValores')) return { checked: true, value: 'unitario' };
      return null;
    },
    querySelectorAll: () => [],
    body: { style: { overflow: '' }, classList: { add: () => {} } }
  },
  window: { addEventListener: () => {}, confirm: () => true },
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

// 3. Validar integridade do catálogo CF_PRESETS_EAP
console.log('3. Validando catálogo oficial de presets...');
assert.ok(Array.isArray(context.CF_PRESETS_EAP), 'CF_PRESETS_EAP deve ser um array');
assert.strictEqual(context.CF_PRESETS_EAP.length, 5, 'Deve conter exatamente 5 pacotes padrão da Capital Realty');

const idsEsperados = ['mao_de_obra', 'terraplenagem_drenagem', 'material_consumo_recorrente', 'eletrica_iluminacao', 'docas_niveladoras'];
idsEsperados.forEach(id => {
  const p = context.CF_PRESETS_EAP.find(item => item.id === id);
  assert.ok(p, `Pacote ${id} deve existir no catálogo`);
  assert.ok(p.nome, `Pacote ${id} deve ter nome`);
  assert.ok(p.categoria, `Pacote ${id} deve ter categoria`);
  assert.ok(Array.isArray(p.itens) && p.itens.length > 0, `Pacote ${id} deve conter itens`);

  // O primeiro nó deve ser um grupo (nível 0)
  assert.strictEqual(p.itens[0].tipo, 'grupo', `Primeiro item do pacote ${id} deve ser do tipo grupo`);
  assert.strictEqual(p.itens[0].nivel, 0, `Primeiro item do pacote ${id} deve ser nível 0`);

  // Itens devem ter unidades canônicas
  p.itens.forEach((it, idx) => {
    if (it.tipo !== 'grupo') {
      assert.ok(it.unidade, `Item ${idx} de ${id} deve ter unidade definida`);
      assert.ok(context.UNIDADES.includes(it.unidade) || ['fardo', 'pct', 'cx', 'm²', 'm³', 'm', 'diária', 'mês', 'verba', 'l', 'un', 'par'].includes(it.unidade),
        `Unidade ${it.unidade} de ${id} deve ser reconhecida`);
    }
  });
});
console.log('✓ Catálogo de presets verificado com 5 pacotes válidos e bem estruturados.');

// 4. Testar fluxo de abertura, seleção e fechamento do modal
console.log('4. Testando abertura e seleção no modal...');
context.abrirModalPresets();
assert.strictEqual(elements.modalPresetsFundo.hidden, false, 'Modal fundo deve estar visível');
assert.strictEqual(elements.modalPresetsJanela.hidden, false, 'Modal janela deve estar visível');

context.selecionarPresetModal('mao_de_obra');
assert.strictEqual(context.presetAtivoId, 'mao_de_obra', 'Preset ativo deve ser mao_de_obra');

const presetMO = context.CF_PRESETS_EAP.find(p => p.id === 'mao_de_obra');
assert.strictEqual(Object.keys(context.presetSelecaoAtual).length, presetMO.itens.length,
  'Todos os itens devem iniciar marcados por padrão');

// Testar desmarcar item individual
context.toggleCheckItemPreset(1, false); // Desmarca item de terraplenagem
assert.strictEqual(context.presetSelecaoAtual[1], false, 'Item 1 deve estar desmarcado');

// Testar cascata de grupo: desmarcar grupo 0 desmarca todos os filhos
context.toggleCheckItemPreset(0, false);
assert.strictEqual(context.presetSelecaoAtual[0], false, 'Grupo 0 deve estar desmarcado');
assert.strictEqual(context.presetSelecaoAtual[2], false, 'Filho 2 deve ter sido desmarcado por cascata');

// Testar marcar todos
context.toggleCheckTodosPreset(true);
assert.strictEqual(context.presetSelecaoAtual[0], true, 'Grupo 0 deve estar marcado');
assert.strictEqual(context.presetSelecaoAtual[1], true, 'Item 1 deve estar marcado');
assert.strictEqual(context.presetSelecaoAtual[2], true, 'Item 2 deve estar marcado');

// 5. Testar inserção modular na grade
console.log('5. Testando inserção modular na grade...');
context.proponentes = [
  { nome: 'Empreiteira Alpha', cnpj: '11111111000111' },
  { nome: 'Construtora Beta', cnpj: '22222222000122' }
];

// Grade com 1 grupo e 1 item existente
context.itens = [
  { tipo: 'grupo', nivel: 0, descricao: 'SERVIÇOS INICIAIS', unidade: 'un', quantidade: '', precos: ['', ''], marcas: ['', ''] },
  { tipo: 'item', nivel: 1, descricao: 'Instalação de tapumes', unidade: 'm', quantidade: '50', precos: ['10,00', '12,00'], marcas: ['', ''] }
];

// Desmarca alguns itens para testar "selecionar conforme"
context.selecionarPresetModal('mao_de_obra');
context.toggleCheckItemPreset(1, false); // Não quer terraplenagem
context.toggleCheckItemPreset(5, false); // Não quer mobilização

const totalEsperado = 2 + (presetMO.itens.length - 2); // 2 existentes + 8 selecionados do preset
context.inserirPresetNaGrade();

assert.strictEqual(context.itens.length, totalEsperado, `A grade deve conter ${totalEsperado} itens após inserção modular`);
assert.strictEqual(context.itens[0].descricao, 'SERVIÇOS INICIAIS', 'Primeiro item original deve ser preservado');
assert.strictEqual(context.itens[1].descricao, 'Instalação de tapumes', 'Segundo item original deve ser preservado');
assert.strictEqual(context.itens[2].descricao, 'MÃO DE OBRA & PRELIMINARES', 'Grupo do preset deve ter sido anexado como 3º item');

// Verificar que terraplenagem (desmarcada) NÃO entrou
const temTerraplenagem = context.itens.some(it => it.descricao.includes('Terraplenagem'));
assert.strictEqual(temTerraplenagem, false, 'Item de terraplenagem desmarcado NÃO deve entrar na grade');

// Verificar que o recalcularCodigos numerou a EAP perfeitamente
context.recalcularCodigos();
assert.strictEqual(context.itens[0].codigo, '1.0', 'Primeiro grupo deve ser 1.0');
assert.strictEqual(context.itens[1].codigo, '1.1', 'Subitem do primeiro grupo deve ser 1.1');
assert.strictEqual(context.itens[2].codigo, '2.0', 'Segundo grupo deve ser 2.0');
assert.strictEqual(context.itens[3].codigo, '2.1', 'Subitem do segundo grupo deve ser 2.1');

// Verificar dimensionamento de precos e marcas para os 2 proponentes
context.itens.forEach((it, idx) => {
  assert.strictEqual(it.precos.length, 2, `Item ${idx} deve ter array de preços para 2 proponentes`);
  assert.strictEqual(it.marcas.length, 2, `Item ${idx} deve ter array de marcas para 2 proponentes`);
});

// 6. Testar autoativação de marcas com preset de Material de Consumo
console.log('6. Testando autoativação de marcas ao inserir preset de consumo...');
context.modoMarcasAtivo = false;
context.selecionarPresetModal('material_consumo_recorrente');
context.toggleCheckTodosPreset(true);
context.inserirPresetNaGrade();

assert.strictEqual(context.modoMarcasAtivo, true, 'Ao inserir preset com marcas de referência, modo de marcas deve ser autoativado');

console.log('✓ Todos os testes de Predefinições de Grupos e Subgrupos (EAP Presets Engine) passaram com 100% de sucesso!');
