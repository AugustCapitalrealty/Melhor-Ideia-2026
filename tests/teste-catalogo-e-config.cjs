/**
 * Teste de Validação: Catálogo Corporativo, Grupos Padronizados EAP, Autocomplete de Itens,
 * Marcas On-the-Fly e Painel de Configurações & Governança (Capital Realty)
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const vm = require('node:vm');

console.log('Validando Catálogo, Grupos Padronizados, Autocomplete, Marcas On-The-Fly e Configurações...');

const root = path.resolve(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

// 1. Verificações no HTML e CSS
console.log('1. Verificando marcação, botões e estilos em Interface.html...');
assert.ok(htmlSrc.includes('id="btnNovoGrupo"'), 'Interface.html deve conter #btnNovoGrupo');
assert.ok(htmlSrc.includes('abrirMenuNovoGrupo(event, this)'), 'Interface.html deve chamar abrirMenuNovoGrupo');
assert.ok(htmlSrc.includes('id="v-config"'), 'Interface.html deve conter seção #v-config');
assert.ok(htmlSrc.includes('id="ab-config"'), 'Interface.html deve conter botão da aba #ab-config');
assert.ok(htmlSrc.includes('id="cfPopoverGrupos"'), 'Interface.html deve conter container #cfPopoverGrupos');
assert.ok(htmlSrc.includes('id="cfPopoverItemAutocomplete"'), 'Interface.html deve conter container #cfPopoverItemAutocomplete');
assert.ok(htmlSrc.includes('id="cfDropdownMarcas"'), 'Interface.html deve conter container #cfDropdownMarcas');
assert.ok(htmlSrc.includes('.grupo-padrao-badge'), 'Interface.html deve conter estilo .grupo-padrao-badge');
assert.ok(htmlSrc.includes('.autocomplete-item-popover'), 'Interface.html deve conter estilo .autocomplete-item-popover');
assert.ok(htmlSrc.includes('.dropdown-marcas-menu'), 'Interface.html deve conter estilo .dropdown-marcas-menu');
assert.ok(htmlSrc.includes('.config-painel'), 'Interface.html deve conter estilo .config-painel');
console.log('✓ Marcação e estilos de Catálogo e Configurações verificados.');

// 2. Extrair script e rodar em ambiente VM
console.log('2. Configurando ambiente VM isolado para testes funcionais...');
const iScript = htmlSrc.indexOf('<script>');
const fScript = htmlSrc.lastIndexOf('</script>');
const scriptContent = htmlSrc.slice(iScript + 8, fScript);

const makeElement = (props = {}) => Object.assign({
  value: '',
  innerHTML: '',
  textContent: '',
  options: [],
  style: {},
  hidden: false,
  classList: {
    _classes: new Set(),
    add(c) { this._classes.add(c); },
    remove(c) { this._classes.delete(c); },
    toggle(c, force) {
      if (force === undefined) {
        if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
      } else if (force) {
        this._classes.add(c);
      } else {
        this._classes.delete(c);
      }
    },
    contains(c) { return this._classes.has(c); }
  },
  addEventListener: () => {},
  appendChild: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  scrollIntoView: () => {},
  getBoundingClientRect: () => ({ bottom: 100, left: 100, top: 80, right: 300, width: 200, height: 20 }),
  setAttribute: () => {},
  focus: () => {},
  select: () => {}
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
  chkTodosPreset: makeElement({ checked: false }),
  previewContador: makeElement(),
  previewArvore: makeElement(),
  grade: makeElement(),
  totais: makeElement(),
  btnNovoGrupo: makeElement(),
  cfPopoverGrupos: makeElement(),
  cfPopoverItemAutocomplete: makeElement(),
  cfDropdownMarcas: makeElement(),
  'painel-cfg-grupos': makeElement(),
  'painel-cfg-itens': makeElement(),
  'painel-cfg-marcas': makeElement(),
  'painel-cfg-homologacao': makeElement(),
  'btn-cfg-grupos': makeElement(),
  'btn-cfg-itens': makeElement(),
  'btn-cfg-marcas': makeElement(),
  'btn-cfg-homologacao': makeElement(),
  'cfg-count-grupos': makeElement(),
  'cfg-count-itens': makeElement(),
  'cfg-count-marcas': makeElement(),
  'cfg-count-pendentes': makeElement(),
  tabelaGruposPadraoContainer: makeElement(),
  tabelaItensCatalogoContainer: makeElement(),
  tabelaMarcasGlobalContainer: makeElement(),
  tabelaHomologacaoContainer: makeElement(),
  filtroItensConfig: makeElement(),
  'v-consulta': makeElement({ hidden: false }),
  'v-mapa': makeElement({ hidden: true }),
  'v-fornecedores': makeElement({ hidden: true }),
  'v-config': makeElement({ hidden: true }),
  'v-nova': makeElement({ hidden: true }),
  'ab-consulta': makeElement(),
  'ab-mapa': makeElement(),
  'ab-fornecedores': makeElement(),
  'ab-config': makeElement(),
  'ab-nova': makeElement(),
  tituloTela: makeElement(),
  subTela: makeElement()
};

const store = {};
const sandbox = {
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  window: {
    scrollY: 0,
    scrollX: 0,
    innerWidth: 1200,
    innerHeight: 800,
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => elements[id] || (elements[id] = makeElement({ id })),
    querySelector: (sel) => {
      if (sel === 'input[name="baseValores"]:checked') return { value: 'unitario' };
      if (sel.includes('modoInsercaoPreset')) return { checked: false };
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === '#grade tbody tr') {
        return (sandbox.itens || []).map(() => makeElement({
          querySelector: (s) => makeElement()
        }));
      }
      return [];
    },
    addEventListener: () => {}
  },
  localStorage: {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  },
  google: {
    script: {
      run: new Proxy({}, {
        get: () => () => new Proxy({}, {
          get: () => () => {}
        })
      })
    }
  },
  prompt: (msg, def) => def || '',
  confirm: () => true,
  alert: () => {},
  pagina: 'nova',
  eq: '',
  editar: '',
  urlBase: 'https://script.google.com/test'
};

vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

// 3. Validação dos Acervos Semente Oficiais
console.log('3. Validando dados semente de Grupos, Itens e Marcas...');
assert.ok(Array.isArray(sandbox.CF_GRUPOS_PADRAO) && sandbox.CF_GRUPOS_PADRAO.length >= 8, 'Deve haver ao menos 8 grupos oficiais');
assert.ok(sandbox.CF_GRUPOS_PADRAO.some(g => g.nome === 'Mão de Obra Operacional'), 'Mão de Obra Operacional deve constar nos grupos');
assert.ok(sandbox.CF_GRUPOS_PADRAO.some(g => g.nome === 'Material de Consumo e Limpeza'), 'Material de Consumo e Limpeza deve constar nos grupos');
assert.ok(sandbox.CF_GRUPOS_PADRAO.some(g => g.nome === 'Terraplenagem, Pavimentação & Drenagem'), 'Terraplenagem deve constar nos grupos');

assert.ok(Array.isArray(sandbox.CF_CATALOGO_ITENS) && sandbox.CF_CATALOGO_ITENS.length >= 20, 'Deve haver catálogo de itens robusto');
const cafe = sandbox.CF_CATALOGO_ITENS.find(it => it.id === 'cat-cafe');
assert.ok(cafe, 'Café Torrado e Moído deve estar no catálogo');
assert.strictEqual(cafe.unidade, 'pct', 'Unidade recomendada do café deve ser pct');
assert.ok(cafe.marcas.includes('Melitta'), 'Café deve conter Melitta nas marcas');
assert.ok(cafe.marcas.includes('Três Corações'), 'Café deve conter Três Corações');
assert.ok(cafe.marcas.includes('Pilão'), 'Café deve conter Pilão');

assert.ok(Array.isArray(sandbox.CF_MARCAS_ACERVO) && sandbox.CF_MARCAS_ACERVO.length >= 20, 'Deve haver acervo global de marcas');
console.log('✓ Dados semente de Catálogo e Marcas validados.');

// 4. Testando Inserção e Gestão de Grupos Padronizados com Nome Fixo
console.log('4. Testando inserção de Grupo Padronizado e comportamento de nome fixo...');
sandbox.itens = [];
sandbox.proponentes = [{ nome: 'FORNECEDOR A' }, { nome: 'FORNECEDOR B' }];

// Inserir grupo padronizado
sandbox.inserirGrupoPadrao('Mão de Obra Operacional', 'Engenharia & Obras', 'grp-mao-obra');
assert.strictEqual(sandbox.itens.length, 1, 'Deve ter 1 item inserido');
assert.strictEqual(sandbox.itens[0].tipo, 'grupo', 'Tipo deve ser grupo');
assert.strictEqual(sandbox.itens[0].descricao, 'Mão de Obra Operacional');
assert.strictEqual(sandbox.itens[0].ehFixo, true, 'Grupo padronizado deve ter ehFixo = true');

// Verificar se desenharGrade renderiza badge PADRONIZADO
sandbox.desenharGrade();
assert.ok(elements.grade.innerHTML.includes('🔒 PADRONIZADO'), 'Grade deve exibir badge 🔒 PADRONIZADO');
assert.ok(elements.grade.innerHTML.includes('Mão de Obra Operacional'), 'Grade deve exibir nome do grupo padronizado');
assert.ok(elements.grade.innerHTML.includes('abrirMenuGruposLinha'), 'Grade deve ter botão para alterar grupo');

// Desbloquear para nome livre
sandbox.desbloquearGrupoLinha(0);
assert.strictEqual(sandbox.itens[0].ehFixo, false, 'Grupo desbloqueado deve ter ehFixo = false');
sandbox.desenharGrade();
assert.ok(elements.grade.innerHTML.includes('📝 AVULSO'), 'Grupo desbloqueado deve exibir badge 📝 AVULSO');
assert.ok(elements.grade.innerHTML.includes('padronizar ▾'), 'Grupo avulso deve permitir padronizar');

// Re-padronizar com outro grupo
sandbox.aplicarGrupoPadraoLinha(0, 'Material de Consumo e Limpeza', 'grp-consumo', 'Material de Consumo');
assert.strictEqual(sandbox.itens[0].descricao, 'Material de Consumo e Limpeza');
assert.strictEqual(sandbox.itens[0].ehFixo, true, 'Grupo re-padronizado deve ser fixo');
console.log('✓ Grupos Padronizados e controle de nomes fixos/avulsos validados.');

// 5. Testando Autocomplete Inteligente de Itens
console.log('5. Testando autocomplete inteligente de itens...');
sandbox.addItem('item');
const idxItem = 1;
assert.strictEqual(sandbox.itens.length, 2);

// Simular digitação de "caf" no campo de descrição
const mockInput = makeElement({ value: 'caf' });
sandbox.onInputDescItem(mockInput, idxItem);
assert.ok(elements.cfPopoverItemAutocomplete.style.display !== 'none', 'Popover de autocomplete deve abrir');
assert.ok(elements.cfPopoverItemAutocomplete.innerHTML.includes('Café Torrado e Moído 500g'), 'Deve sugerir café');
assert.ok(elements.cfPopoverItemAutocomplete.innerHTML.includes('Melitta'), 'Deve exibir marcas do café');

// Selecionar o item sugerido
sandbox.selecionarItemDoCatalogo(idxItem, 'cat-cafe');
assert.strictEqual(sandbox.itens[idxItem].descricao, 'Café Torrado e Moído 500g', 'Descrição deve ser preenchida');
assert.strictEqual(sandbox.itens[idxItem].unidade, 'pct', 'Unidade recomendada deve ser preenchida');
assert.strictEqual(sandbox.itens[idxItem].catalogoId, 'cat-cafe', 'ID de catálogo deve ser registrado');
console.log('✓ Autocomplete de itens com autopreenchimento de unidade e marcas validado.');

// 6. Testando Dropdown de Marcas e Marca Não Cadastrada On-the-Fly
console.log('6. Testando marcas por item e cadastro dinâmico on-the-fly...');
sandbox.alternarModoMarcas(true);

// Obter marcas conhecidas para o item de café
const marcasCafe = sandbox.obterMarcasParaItem(sandbox.itens[idxItem].descricao, sandbox.itens[idxItem].catalogoId);
assert.ok(marcasCafe.includes('Melitta'), 'Melitta deve constar');
assert.ok(marcasCafe.includes('Três Corações'), 'Três Corações deve constar');

// Selecionar marca oficial do catálogo para o Proponente 0
sandbox.selecionarMarcaCotada(idxItem, 0, 'Melitta');
assert.strictEqual(sandbox.itens[idxItem].marcas[0], 'Melitta', 'Proponente 0 deve ter Melitta');

// Cadastrar nova marca "Café do Ponto" On-the-Fly para o Proponente 1
const totalPendentesAntes = sandbox.CF_MARCAS_PENDENTES.length;
sandbox.salvarNovaMarcaOnTheFly(idxItem, 1, 'Café do Ponto');

assert.strictEqual(sandbox.itens[idxItem].marcas[1], 'Café do Ponto', 'Proponente 1 deve ter a nova marca');
// Validar que foi adicionada à lista do item no catálogo
const catCafeAtualizado = sandbox.CF_CATALOGO_ITENS.find(it => it.id === 'cat-cafe');
assert.ok(catCafeAtualizado.marcas.includes('Café do Ponto'), 'Café do Ponto deve ser incorporado ao catálogo do item');
// Validar que foi para a fila de homologação na tela de configurações
assert.strictEqual(sandbox.CF_MARCAS_PENDENTES.length, totalPendentesAntes + 1, 'Fila de homologação deve receber o novo registro');
const pendente = sandbox.CF_MARCAS_PENDENTES[sandbox.CF_MARCAS_PENDENTES.length - 1];
assert.strictEqual(pendente.nome, 'Café do Ponto');
assert.strictEqual(pendente.tipo, 'marca');
console.log('✓ Dropdown de marcas e cadastro on-the-fly com sincronização no catálogo validados.');

// 7. Testando Tela de Configurações e Fluxos de Governança
console.log('7. Testando Tela de Configurações, contadores e homologação/mesclagem...');
sandbox.aba('config');
assert.strictEqual(elements['v-config'].hidden, false, 'Aba v-config deve estar visível');
assert.strictEqual(Number(elements['cfg-count-grupos'].textContent), sandbox.CF_GRUPOS_PADRAO.length);
assert.strictEqual(Number(elements['cfg-count-itens'].textContent), sandbox.CF_CATALOGO_ITENS.length);
assert.strictEqual(Number(elements['cfg-count-pendentes'].textContent), sandbox.CF_MARCAS_PENDENTES.length);

// Testar alternância entre as abas internas de Configurações
sandbox.trocarAbaConfig('itens');
assert.strictEqual(elements['painel-cfg-itens'].style.display, 'block');
assert.strictEqual(elements['painel-cfg-grupos'].style.display, 'none');

sandbox.trocarAbaConfig('homologacao');
assert.strictEqual(elements['painel-cfg-homologacao'].style.display, 'block');
assert.ok(elements.tabelaHomologacaoContainer.innerHTML.includes('Café do Ponto'), 'Tabela de homologação deve listar Café do Ponto');

// Testar Homologação da marca
const pendId = pendente.id;
sandbox.homologarMarcaConfig(pendId);
assert.strictEqual(sandbox.CF_MARCAS_PENDENTES.length, totalPendentesAntes, 'Item homologado deve sair da fila');
assert.ok(sandbox.CF_MARCAS_ACERVO.some(m => m.nome === 'Café do Ponto'), 'Marca homologada deve constar no acervo permanente');

// Testar Mesclagem de Marca com Grafia Incorreta
sandbox.salvarNovaMarcaOnTheFly(idxItem, 0, 'Mellita'); // Grafia incorreta com 2 Ls
const pendErrada = sandbox.CF_MARCAS_PENDENTES[sandbox.CF_MARCAS_PENDENTES.length - 1];
assert.strictEqual(pendErrada.nome, 'Mellita');

sandbox.prompt = () => 'Melitta'; // Administrador mescla para a oficial "Melitta"
sandbox.mesclarMarcaConfig(pendErrada.id);

assert.ok(!catCafeAtualizado.marcas.includes('Mellita'), 'Marca grafada errada não deve permanecer no item');
assert.ok(catCafeAtualizado.marcas.includes('Melitta'), 'Marca oficial deve ser mantida');
console.log('✓ Governança de Configurações (Aprovação e Mesclagem de marcas) validada com sucesso.');

console.log('\n===============================================================');
console.log('🎉 SUCESSO: Todos os testes de Catálogo, Grupos Padronizados,');
console.log('   Autocomplete, Marcas On-the-Fly e Configurações passaram 100%!');
console.log('===============================================================\n');
