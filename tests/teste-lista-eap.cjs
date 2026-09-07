/**
 * Teste de Validação: as três listas da tela — EAP, categorias e fornecedores
 *
 * O usuário relatou "a lista não está funcionando", com foco nos itens da
 * EAP. Este arquivo exercita as três candidatas e trava o defeito real:
 *
 *   A lista da EAP se reordenava sozinha ao reabrir. O nível da linha
 *   podia pular um degrau (um clique em "›" logo abaixo de um grupo, ou
 *   apagar o item do meio deixando o subitem para trás), e daí saíam dois
 *   estragos: o código ganhava um segmento zero — "1.0.1", que é o buraco
 *   de numeração documentado na BASE_DE_CONHECIMENTO — e, ao gravar, a
 *   linha órfã herdava o pai errado. Na releitura, que remonta a lista
 *   pela árvore de ID_PAI, o item aparecia dentro de OUTRO grupo e em
 *   outra posição.
 *
 * Cada asserção aqui foi verificada por mutação: o código de produção que
 * ela cobre foi quebrado de propósito e o teste falhou.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
console.log('Validando as listas da tela: EAP, categorias e fornecedores...\n');

// ─────────────────────────────────────────────────────────────
//  Harness do navegador
// ─────────────────────────────────────────────────────────────
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');
const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const scriptContent = html.slice(iScript + 8, fScript);

const elementos = {};
const criarEl = (props) => Object.assign({
  value: '', innerHTML: '', textContent: '', checked: false, hidden: false,
  disabled: false, options: [], style: {}, dataset: {},
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  addEventListener() {}, removeEventListener() {}, appendChild() {},
  focus() {}, select() {}, remove() {}, setAttribute() {},
  getAttribute() { return null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
  scrollIntoView() {},
  getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0 }; }
}, props || {});

const rodarProxy = new Proxy({}, {
  get: () => function () { return rodarProxy; }
});

const tela = {
  console: console, Date: Date, Math: Math, JSON: JSON,
  String: String, Number: Number, Array: Array, Object: Object,
  RegExp: RegExp, Error: Error,
  setTimeout: () => 0, clearTimeout: () => {},
  confirm: () => true, alert: () => {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { search: '' },
  window: { addEventListener() {}, innerWidth: 1200, scrollX: 0, scrollY: 0 },
  google: { script: { run: rodarProxy, host: { close() {} } } },
  document: {
    getElementById(id) { return elementos[id] || (elementos[id] = criarEl({ id: id })); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement: () => criarEl(),
    body: criarEl()
  }
};
tela.self = tela;
tela.globalThis = tela;
vm.createContext(tela);
vm.runInContext(scriptContent, tela, { filename: 'Interface.html' });

// Os mocks vêm DEPOIS do load: declaração de função sobrescreve
// propriedade do contexto, e definidos antes eles seriam apagados.
tela.desenharGrade = function () { tela.recalcularCodigos(); };
tela.salvarRascunho = function () {};
tela.calcular = function () {};

const arvore = () => tela.itens.map(function (i) { return i.nivel + ':' + i.codigo; }).join(' ');
const codigos = () => tela.itens.map(function (i) { return i.codigo; }).join(' ');

function novaGrade(linhas) {
  tela.proponentes = [{ nome: 'ALFA' }, { nome: 'BETA' }];
  tela.itens = (linhas || []).map(function (l) {
    return {
      tipo: l[0], nivel: l[1], descricao: l[2] || '', marcaReferencia: '',
      quantidade: '1', unidade: l[3] || 'un',
      precos: ['10', '20'], marcas: ['', '']
    };
  });
  tela.recalcularCodigos();
}

// ─────────────────────────────────────────────────────────────
//  1. A numeração da EAP sai da árvore — ao adicionar
// ─────────────────────────────────────────────────────────────
console.log('1. Numeração derivada ao adicionar itens...');

tela.itens = [];
tela.proponentes = [{ nome: 'ALFA' }];
tela.addItem('grupo', true);
tela.addItem('item', true);
tela.addItem('item', true);
tela.addItem('grupo', true);
tela.addItem('item', true);

assert.strictEqual(codigos(), '1.0 1.1 1.2 2.0 2.1',
  'a numeração não acompanhou a árvore ao adicionar grupo/item');

// O segundo grupo reinicia os contadores de baixo: o primeiro item do
// grupo 2 é 2.1, e não 2.3 porque o grupo 1 já tinha dois.
assert.strictEqual(tela.itens[4].codigo, '2.1',
  'os contadores dos níveis de baixo não reiniciaram no grupo novo');
console.log('   ✓ grupo/item numeram 1.0, 1.1, 1.2, 2.0, 2.1');

// ─────────────────────────────────────────────────────────────
//  2. Subitens, e a renumeração ao remover do meio
// ─────────────────────────────────────────────────────────────
console.log('2. Subitens e remoção do meio...');

novaGrade([['grupo', 0, 'G1'], ['item', 1, 'a'], ['item', 2, 'a.1'],
           ['item', 2, 'a.2'], ['item', 1, 'b']]);
assert.strictEqual(codigos(), '1.0 1.1 1.1.1 1.1.2 1.2',
  'a numeração de subitem (3 níveis) saiu errada');

// Apagar o item do meio renumera o que sobra, sem buraco.
tela.removerItem(3);
assert.strictEqual(codigos(), '1.0 1.1 1.1.1 1.2',
  'remover do meio deixou buraco na numeração');
assert.ok(codigos().indexOf('1.1.3') < 0, 'a numeração manteve o número do item apagado');
console.log('   ✓ remover do meio renumera sem buraco');

// ─────────────────────────────────────────────────────────────
//  3. O DEFEITO: a linha órfã, e o segmento zero
//
//  Apagar o PAI de um subitem deixava o subitem dois degraus abaixo da
//  linha de cima. O código virava "1.0.1" — segmento zero, que é o
//  buraco de numeração que este sistema existe para matar — e ao gravar
//  a linha ficava sem pai.
// ─────────────────────────────────────────────────────────────
console.log('3. Linha órfã por remoção do pai...');

novaGrade([['grupo', 0, 'G1'], ['item', 1, 'pai'], ['item', 2, 'filho']]);
assert.strictEqual(codigos(), '1.0 1.1 1.1.1');

tela.removerItem(1);                       // some o pai; o filho fica órfão
assert.strictEqual(codigos(), '1.0 1.1',
  'apagar o pai deixou o filho dois degraus abaixo — código com segmento zero');
assert.strictEqual(tela.itens[1].nivel, 1,
  'o nível do órfão não foi normalizado para um degrau abaixo do grupo');

// Nenhum código pode conter um segmento zero fora do ".0" dos grupos.
tela.itens.forEach(function (it) {
  const partes = String(it.codigo).split('.');
  partes.slice(1, -1).concat(it.nivel > 0 ? [partes[partes.length - 1]] : [])
    .forEach(function (p) {
      assert.notStrictEqual(p, '0', 'código com segmento zero: ' + it.codigo);
    });
});
console.log('   ✓ o órfão sobe um degrau e a numeração fica sem segmento zero');

// ─────────────────────────────────────────────────────────────
//  4. O mesmo defeito pelo botão de recuo
//
//  UM clique em "›" na linha logo abaixo de um grupo produzia nível 2
//  sem nível 1.
// ─────────────────────────────────────────────────────────────
console.log('4. Recuo pelo botão "›" não pula degrau...');

novaGrade([['grupo', 0, 'G1'], ['item', 1, 'a']]);
tela.mudarNivel(1, 1);
assert.strictEqual(tela.itens[1].nivel, 1,
  'um clique em "›" logo abaixo de um grupo criou nível 2 sem nível 1');
assert.strictEqual(codigos(), '1.0 1.1');

// Com um item de nível 1 acima, o degrau existe e o recuo funciona.
novaGrade([['grupo', 0, 'G1'], ['item', 1, 'a'], ['item', 1, 'b']]);
tela.mudarNivel(2, 1);
assert.strictEqual(tela.itens[2].nivel, 2, 'o recuo legítimo para nível 2 parou de funcionar');
assert.strictEqual(codigos(), '1.0 1.1 1.1.1');

// E o recuo para fora continua devolvendo a linha ao nível de cima.
tela.mudarNivel(2, -1);
assert.strictEqual(codigos(), '1.0 1.1 1.2', 'o recuo para fora ("‹") parou de funcionar');
console.log('   ✓ "›" só desce um degrau por vez; "‹" sobe');

// ─────────────────────────────────────────────────────────────
//  5. A lista de unidades da EAP
//
//  O catálogo traz 'gl', 'conj' e 'balde'; os modelos trazem 'par'.
//  Nenhuma está em UNIDADES, então nenhuma <option> ficava marcada e o
//  select exibia a primeira ('un') enquanto o modelo guardava 'gl'.
//  Preço por galão comparado como preço por unidade, sem aviso.
// ─────────────────────────────────────────────────────────────
console.log('5. Seletor de unidade não mente sobre a unidade do item...');

const doCatalogo = tela.CF_CATALOGO_ITENS
  .filter(function (i) { return tela.UNIDADES.indexOf(i.unidade) < 0; });
assert.ok(doCatalogo.length > 0,
  'o catálogo deixou de ter unidade fora de UNIDADES — refaça este teste com outra fonte');

doCatalogo.concat([{ unidade: 'par' }]).forEach(function (i) {
  const marcada = tela.seletorUnidade(0, i.unidade).match(/<option value="([^"]*)" selected>/);
  assert.ok(marcada, 'a unidade "' + i.unidade + '" não marca opção nenhuma — o select mostra "un"');
  assert.strictEqual(marcada[1], i.unidade,
    'o select marcou "' + marcada[1] + '" para um item de unidade "' + i.unidade + '"');
});

// A lista fechada continua fechada para o que é digitado do zero.
assert.strictEqual((tela.seletorUnidade(0, 'un').match(/<option/g) || []).length,
  tela.UNIDADES.length, 'unidade conhecida não pode acrescentar opção nenhuma');

// E escolher um item do catálogo na linha deixa tela e modelo iguais.
novaGrade([['grupo', 0, 'G1'], ['item', 1, '']]);
tela.selecionarItemDoCatalogo(1, 'cat-sab-liq');
assert.strictEqual(tela.itens[1].unidade, 'gl', 'o item do catálogo não trouxe a unidade');
assert.ok(/value="gl" selected/.test(tela.seletorUnidade(1, tela.itens[1].unidade)),
  'o modelo guarda "gl" e a tela mostra outra coisa');
console.log('   ✓ gl, conj, balde e par aparecem marcados no seletor');

// ─────────────────────────────────────────────────────────────
//  Harness do servidor
// ─────────────────────────────────────────────────────────────
const servidor = vm.createContext({ Logger: { log() {} }, console: console });
['Util.gs', 'Cnpj.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs',
 'Equalizacao.gs', 'Fornecedores.gs', 'Codigo.gs', 'Exportar.gs',
 'Migracao.gs'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), servidor, { filename: f });
});

const tabelas = {
  Equalizacoes: [], Propostas: [], EAP: [], Precos: [],
  Config: [], Empresas: [], Empreendimentos: [], Fornecedores: []
};
let seqId = 0;

servidor.Utilities = {
  formatDate: () => '06/09/2026',
  getUuid: () => 'uuid-fixo',
  DigestAlgorithm: { SHA_256: 'SHA_256' },
  computeDigest: () => [1, 2, 3]
};
servidor.PropertiesService = {
  getScriptProperties: () => ({ setProperty() {}, getProperty: () => null })
};
servidor.cfComTrava_ = (fn) => fn();
servidor.cfExigeAutorizacao_ = () => {};
servidor.cfLerTudo_ = (t) => (tabelas[t] || []).map(function (r, i) {
  return Object.assign({ _linha: i + 2 }, r);
});
servidor.cfInserir_ = (t, linhas) => {
  (tabelas[t] = tabelas[t] || []).push.apply(tabelas[t], linhas);
  return linhas.length;
};
servidor.cfApagarPor_ = (t, campo, valor) => {
  const antes = (tabelas[t] || []).length;
  tabelas[t] = (tabelas[t] || []).filter(function (r) { return String(r[campo]) !== String(valor); });
  return antes - tabelas[t].length;
};
servidor.cfAtualizarLinha_ = () => {};
servidor.cfNovoId_ = (p) => p + '-' + (++seqId);
servidor.cfLog_ = () => {};
servidor.cfLinkDoDrive_ = (v) => v || '';
servidor.cfResolverEmpresa_ = () => '';
servidor.cfAtualizarCadastroFornecedor_ = () => {};

function idaEVolta(linhas) {
  Object.keys(tabelas).forEach(function (k) { tabelas[k] = []; });
  seqId = 0;

  // A tela é quem numera; passar pelo recalcularCodigos real garante que
  // o servidor receba exatamente o que a tela mandaria.
  novaGrade(linhas);

  const r = servidor.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    projeto: 'Teste de árvore', area: '', grupoCentroCusto: '',
    data: '2026-09-06', categoria: 'Material de Consumo', baseValores: 'unitario',
    proponentes: [{ nome: 'ALFA', cnpj: '11111111000111' }],
    itens: tela.itens.map(function (i) { return Object.assign({}, i, { precos: ['10'], marcas: [''] }); })
  });
  const id = r.id || r.idEqualizacao || (tabelas.Equalizacoes[0] && tabelas.Equalizacoes[0].ID);
  return servidor.cfMapaEqualizacao_(id);
}

// ─────────────────────────────────────────────────────────────
//  6. A lista da EAP sobrevive à ida e volta
// ─────────────────────────────────────────────────────────────
console.log('6. Gravar e reabrir preserva a lista da EAP...');

{
  const mapa = idaEVolta([['grupo', 0, 'GRUPO A'], ['item', 1, 'a1'],
                          ['item', 2, 'a1.1'], ['item', 1, 'a2'],
                          ['grupo', 0, 'GRUPO B'], ['item', 1, 'b1']]);

  assert.strictEqual(mapa.linhas.map(function (l) { return l.descricao; }).join(' | '),
    'GRUPO A | a1 | a1.1 | a2 | GRUPO B | b1',
    'a ordem das linhas mudou entre gravar e reabrir');
  assert.strictEqual(mapa.linhas.map(function (l) { return l.nivel; }).join(''),
    '012101', 'a hierarquia (nível) não voltou igual');
  console.log('   ✓ ordem e hierarquia idênticas na volta');
}

// ─────────────────────────────────────────────────────────────
//  7. O DEFEITO DO SERVIDOR: a pilha suja entre grupos irmãos
//
//  A pilha guarda o último id de cada nível e nunca era limpa ao voltar
//  para um degrau de cima. Um item fundo do GRUPO B era gravado com
//  ID_PAI apontando para um filho do GRUPO A — e como a releitura
//  remonta a lista descendo a árvore, ele reaparecia DENTRO de A, antes
//  do GRUPO B. A lista se reordenava sozinha.
// ─────────────────────────────────────────────────────────────
console.log('7. Item de um grupo não herda pai do grupo anterior...');

{
  // A tela normaliza o nível; aqui o cliente é contornado de propósito
  // para provar que o servidor também não monta a árvore errada — é ele
  // quem recebe importação e chamada direta de google.script.run.
  Object.keys(tabelas).forEach(function (k) { tabelas[k] = []; });
  seqId = 0;

  const crus = [
    { tipo: 'grupo', nivel: 0, descricao: 'GRUPO A', codigo: '1.0', quantidade: '', unidade: 'un', precos: [''], marcas: [''] },
    { tipo: 'item', nivel: 1, descricao: 'a1', codigo: '1.1', quantidade: '1', unidade: 'un', precos: ['10'], marcas: [''] },
    { tipo: 'item', nivel: 2, descricao: 'a1.1', codigo: '1.1.1', quantidade: '1', unidade: 'un', precos: ['20'], marcas: [''] },
    { tipo: 'grupo', nivel: 0, descricao: 'GRUPO B', codigo: '2.0', quantidade: '', unidade: 'un', precos: [''], marcas: [''] },
    { tipo: 'item', nivel: 2, descricao: 'b-fundo', codigo: '2.0.1', quantidade: '1', unidade: 'un', precos: ['30'], marcas: [''] }
  ];

  const r = servidor.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
    projeto: 'Pilha suja', area: '', grupoCentroCusto: '',
    data: '2026-09-06', categoria: 'Material de Consumo', baseValores: 'unitario',
    proponentes: [{ nome: 'ALFA', cnpj: '11111111000111' }],
    itens: crus
  });
  const id = r.id || r.idEqualizacao || (tabelas.Equalizacoes[0] && tabelas.Equalizacoes[0].ID);

  const porDesc = {};
  tabelas.EAP.forEach(function (n) { porDesc[n.DESCRICAO] = n; });

  assert.notStrictEqual(porDesc['b-fundo'].ID_PAI, porDesc['a1'].ID,
    'o item do GRUPO B foi gravado como filho de um item do GRUPO A');
  assert.notStrictEqual(porDesc['b-fundo'].ID_PAI, porDesc['a1.1'].ID,
    'o item do GRUPO B foi gravado como filho de um item do GRUPO A');

  // E, na volta, ele não pode ter atravessado a lista para dentro de A.
  const mapa = servidor.cfMapaEqualizacao_(id);
  const ordemVolta = mapa.linhas.map(function (l) { return l.descricao; }).join(' | ');
  assert.ok(ordemVolta.indexOf('GRUPO B') < ordemVolta.indexOf('b-fundo'),
    'ao reabrir, o item apareceu ANTES do próprio grupo: ' + ordemVolta);
  console.log('   ✓ a pilha de níveis é limpa ao voltar para um degrau de cima');
}

// ─────────────────────────────────────────────────────────────
//  8. A lista de categorias do seletor de Nova cotação
// ─────────────────────────────────────────────────────────────
console.log('8. Lista de categorias (servidor → seletor)...');

{
  const r = servidor.apiOpcoes();
  assert.strictEqual(r.ok, true, 'apiOpcoes falhou: ' + r.erro);
  assert.ok(r.categorias.length >= 7, 'a taxonomia veio curta: ' + r.categorias.length);

  r.categorias.forEach(function (c) {
    assert.ok(c.nome, 'categoria sem nome');
    // Sem ícone o seletor imprime "undefined Nome" — a lista aparece,
    // mas com a palavra undefined colada em cada opção.
    assert.ok(c.icone, 'categoria sem ícone: ' + c.nome);
    assert.ok(Array.isArray(c.subs), 'categoria sem lista de subcategorias: ' + c.nome);
  });

  // As duas recorrentes existem e caem no grupo de cima do seletor.
  tela.CATEGORIAS_SERVIDOR = r.categorias;
  tela.montarSeletorCategorias(r.categorias);
  const opcoes = elementos.nCategoria.innerHTML;
  assert.ok(opcoes.indexOf('Compras recorrentes (mensais)') >= 0,
    'o grupo das compras mensais sumiu do seletor');
  r.categorias.forEach(function (c) {
    assert.ok(opcoes.indexOf('value="' + c.nome.replace(/&/g, '&amp;') + '"') >= 0,
      'a categoria ' + c.nome + ' não virou opção');
  });
  assert.ok(opcoes.indexOf('undefined') < 0, 'o seletor imprimiu "undefined" numa opção');

  // A subcategoria escolhida tem de existir na taxonomia que o servidor
  // usa para derivar — senão o filtro procura um nome que nada produz.
  tela.montarSeletorSubcategorias('Material de Consumo');
  const subs = elementos.nSubcategoria.innerHTML;
  const derivavel = vm.runInContext('CF_SUBCATEGORIAS', servidor)['Material de Consumo']
    .map(function (s) { return s.nome; });
  derivavel.forEach(function (n) {
    assert.ok(subs.indexOf('value="' + n.replace(/&/g, '&amp;') + '"') >= 0,
      'a subcategoria derivável "' + n + '" não é escolhível no seletor');
  });
  assert.strictEqual(elementos.boxSubcategoria.hidden, false,
    'o campo de subcategoria ficou escondido numa categoria que tem subcategorias');

  // Categoria sem subcategoria esconde o campo em vez de deixar select vazio.
  tela.montarSeletorSubcategorias('Categoria Que Não Existe');
  assert.strictEqual(elementos.boxSubcategoria.hidden, true,
    'categoria sem subcategoria deixou o select vazio na tela');
  console.log('   ✓ 7 categorias com ícone, subcategorias escolhíveis e deriváveis');
}

// ─────────────────────────────────────────────────────────────
//  9. A lista de fornecedores e o filtro por categoria
// ─────────────────────────────────────────────────────────────
console.log('9. Lista de fornecedores e filtro por categoria...');

{
  tabelas.Fornecedores = [
    { CNPJ: '11111111000111', RAZAO_SOCIAL: 'ALFA LIMPEZA LTDA', CNAE_PRINCIPAL: '4649-4/08', CIDADE: 'Curitiba', UF: 'PR', SITUACAO_CNPJ: 'ATIVA' },
    { CNPJ: '22222222000122', RAZAO_SOCIAL: 'BETA ELETRICA LTDA', CNAE_PRINCIPAL: '4321-5/00', CIDADE: 'Esteio', UF: 'RS', SITUACAO_CNPJ: 'ATIVA' },
    { CNPJ: '33333333000133', RAZAO_SOCIAL: 'GAMA SEM PISTA LTDA', CNAE_PRINCIPAL: '', CIDADE: 'Itajaí', UF: 'SC', SITUACAO_CNPJ: 'ATIVA' }
  ];
  tabelas.Equalizacoes = [{ ID: 'EQ-1', CATEGORIA: 'Material de Consumo', ID_EMPREENDIMENTO: 'MEGA-CWB', STATUS: 'homologada', VALOR_FINAL: 1000, PROJETO: 'Consumo' }];
  tabelas.Propostas = [
    { ID: 'PRP-1', CNPJ: '11111111000111', ID_EQUALIZACAO: 'EQ-1', VENCEDORA: true, VALOR_TOTAL_DECLARADO: 1000, DATA_PROPOSTA: new Date('2026-08-01') },
    { ID: 'PRP-2', CNPJ: '22222222000122', ID_EQUALIZACAO: '', VALOR_TOTAL_DECLARADO: 500, DATA_PROPOSTA: new Date('2026-08-05') },
    { ID: 'PRP-3', CNPJ: '33333333000133', ID_EQUALIZACAO: '', VALOR_TOTAL_DECLARADO: 300, DATA_PROPOSTA: new Date('2026-08-10') }
  ];
  tabelas.EAP = [
    { ID: 'E1', ID_EQUALIZACAO: 'EQ-1', DESCRICAO: 'Detergente concentrado 5L' },
    { ID: 'E2', ID_EQUALIZACAO: 'EQ-1', DESCRICAO: 'Papel higiênico rolão' },
    { ID: 'E3', ID_EQUALIZACAO: '', DESCRICAO: 'Cabo de cobre flexível 2,5mm' },
    { ID: 'E4', ID_EQUALIZACAO: '', DESCRICAO: 'Disjuntor bipolar 32A' },
    { ID: 'E5', ID_EQUALIZACAO: '', DESCRICAO: 'Xilofone de bambu artesanal' }
  ];
  tabelas.Precos = [
    { ID_PROPOSTA: 'PRP-1', ID_EAP: 'E1', PRECO_UNITARIO: 10, DATA: new Date('2026-08-01'), ID_EMPREENDIMENTO: 'MEGA-CWB' },
    { ID_PROPOSTA: 'PRP-1', ID_EAP: 'E2', PRECO_UNITARIO: 20, DATA: new Date('2026-08-01') },
    { ID_PROPOSTA: 'PRP-2', ID_EAP: 'E3', PRECO_UNITARIO: 5, DATA: new Date('2026-08-05'), ID_EMPREENDIMENTO: 'MEGA-EST' },
    { ID_PROPOSTA: 'PRP-2', ID_EAP: 'E4', PRECO_UNITARIO: 30, DATA: new Date('2026-08-05'), ID_EMPREENDIMENTO: 'MEGA-EST' },
    { ID_PROPOSTA: 'PRP-3', ID_EAP: 'E5', PRECO_UNITARIO: 99, DATA: new Date('2026-08-10'), ID_EMPREENDIMENTO: 'MEGA-ITJ' }
  ];

  const todos = servidor.cfFornecedores_('');
  assert.strictEqual(todos.length, 3, 'a lista sem filtro perdeu fornecedor');

  // Quem não tem categoria derivável NÃO some da lista sem filtro: some
  // só do filtro, e o hub tem a pílula "sem categoria" para alcançá-lo.
  const gama = todos.filter(function (f) { return f.nome.indexOf('GAMA') === 0; })[0];
  assert.ok(gama, 'o fornecedor sem categoria derivável sumiu da lista');
  assert.strictEqual(gama.categorias.length, 0);

  const alfa = todos.filter(function (f) { return f.nome.indexOf('ALFA') === 0; })[0];
  assert.strictEqual(alfa.categoriaPrincipal, 'Material de Consumo',
    'a categoria do fornecedor não saiu do que ele cotou');
  assert.strictEqual(alfa.subcategoria, 'Higiene & Limpeza');

  // A contagem da pílula tem de bater com o que a lista mostra ao clicar.
  const hub = servidor.cfCategoriasDeFornecedores_();
  assert.strictEqual(hub.total, 3, 'o total do botão "Todos" não é o total real');
  assert.strictEqual(hub.semCategoria, 1, 'a pílula "sem categoria" perdeu a conta');
  hub.categorias.filter(function (c) { return c.n > 0; }).forEach(function (c) {
    assert.strictEqual(servidor.cfFornecedores_(c.nome).length, c.n,
      'a pílula de ' + c.nome + ' conta ' + c.n + ' e o filtro devolve outro número');
    assert.strictEqual(
      todos.filter(function (f) { return f.categorias.indexOf(c.nome) >= 0; }).length, c.n,
      'a contagem do servidor não bate com o filtro que a tela aplica em ' + c.nome);
  });

  // A ficha abre para todos, inclusive para quem não tem categoria.
  todos.forEach(function (f) {
    const ficha = servidor.cfFichaFornecedor_(f.cnpj);
    assert.ok(ficha.nome, 'a ficha de ' + f.nome + ' abriu sem nome');
    assert.ok(Array.isArray(ficha.itens), 'a ficha de ' + f.nome + ' abriu sem histórico de itens');
  });
  assert.ok(servidor.cfFichaFornecedor_('11111111000111').itens.length >= 2,
    'a ficha perdeu o histórico de preço por item');

  const api = servidor.apiFornecedores('');
  assert.strictEqual(api.ok, true, 'apiFornecedores falhou: ' + api.erro);
  assert.strictEqual(api.fornecedores.length, 3);
  assert.ok(api.categorias, 'as pílulas não vieram junto com a lista');
  console.log('   ✓ lista, contagem das pílulas e ficha conferem');
}

// ─────────────────────────────────────────────────────────────
//  10. As funções de derivação do último trabalho
// ─────────────────────────────────────────────────────────────
console.log('10. Derivação de categoria, subcategoria e CNAE...');

// Contar chaves DISTINTAS depois de normalizar: 'café' e 'cafe' são a
// mesma palavra escrita duas vezes, e não podem valer dois pontos.
assert.strictEqual(servidor.cfContarChaves_(['café', 'cafe'], ' cafe em po '), 1,
  'a mesma chave com e sem acento pontuou duas vezes');
assert.strictEqual(servidor.cfContarChaves_(['café', 'copo'], ' cafe e copo '), 2);
assert.strictEqual(servidor.cfContarChaves_([], ' qualquer '), 0);

assert.strictEqual(servidor.cfCategoriaDerivada_(['cimento, areia e tijolo']), 'Material de Construção');
assert.strictEqual(servidor.cfCategoriaDerivada_(['']), '', 'texto vazio não pode gerar categoria');
assert.strictEqual(servidor.cfCategoriaDerivada_(['cafe cimento']), '',
  'empate tem de devolver vazio, e não uma das duas no chute');

assert.strictEqual(servidor.cfSubcategoriaDerivada_(['cabo, disjuntor e eletroduto'], 'Material de Construção'),
  'Elétrica & Iluminação');
assert.strictEqual(servidor.cfSubcategoriaDerivada_(['qualquer coisa'], 'Categoria Inexistente'), '');
// Uma chave de cada lado é empate, e empate não escolhe: 'Alvenaria' e
// 'Tintas' sozinhas funcionam, juntas devolvem vazio.
assert.strictEqual(servidor.cfSubcategoriaDerivada_(['cimento'], 'Material de Construção'), 'Alvenaria');
assert.strictEqual(servidor.cfSubcategoriaDerivada_(['tinta'], 'Material de Construção'), 'Tintas');
assert.strictEqual(servidor.cfSubcategoriaDerivada_(['cimento e tinta'], 'Material de Construção'), '',
  'empate de subcategoria tem de devolver vazio, e não a primeira da lista');

assert.strictEqual(servidor.cfCategoriaPorCnae_('4321-5/00'), 'Material de Construção');
assert.strictEqual(servidor.cfCategoriaPorCnae_('4761-0/03'), 'Material de Consumo');
// A Receita entrega o CNAE pontuado ("43.21-5/00"). Sem tirar a
// pontuação, o prefixo de 4 dígitos nunca casa e todo fornecedor
// importado cai em "sem categoria".
assert.strictEqual(servidor.cfCategoriaPorCnae_('43.21-5/00'), 'Material de Construção',
  'o CNAE com a pontuação da Receita não foi reconhecido');
assert.strictEqual(servidor.cfCategoriaPorCnae_('47.61-0/03 — Comércio varejista de papelaria'),
  'Material de Consumo', 'o CNAE com descrição junto não foi reconhecido');
assert.strictEqual(servidor.cfCategoriaPorCnae_('9999-9/99'), '', 'CNAE desconhecido inventou categoria');
assert.strictEqual(servidor.cfCategoriaPorCnae_('432'), '', 'CNAE truncado devia ser recusado');
assert.strictEqual(servidor.cfCategoriaPorCnae_(''), '');
console.log('   ✓ contagem, empate, CNAE curto e CNAE desconhecido');

// ─────────────────────────────────────────────────────────────
//  11. Logos: a ordem das fontes e o diagnóstico
// ─────────────────────────────────────────────────────────────
console.log('11. Busca da logo em várias fontes...');

{
  const criados = [];
  const arquivo = (nome, tipo) => ({
    getName: () => nome, getMimeType: () => tipo,
    getBlob: () => ({ marca: nome, setName(n) { this.nome = n; return this; } }),
    getUrl: () => 'https://drive/' + nome
  });
  let naPasta = [];
  servidor.DriveApp = {
    getFileById(id) {
      if (id === 'ID-DA-CONFIG') return arquivo('config.png', 'image/png');
      throw new Error('sem acesso ao arquivo ' + id);
    },
    getFolderById() {
      return {
        getFiles() {
          let i = 0;
          return { hasNext: () => i < naPasta.length, next: () => naPasta[i++] };
        },
        createFile(blob) { criados.push(blob); return arquivo('criado', 'image/png'); }
      };
    }
  };
  servidor.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 404 }) };
  servidor.ScriptApp = { getOAuthToken: () => 'token' };

  // 1ª fonte: a aba Config vence as demais.
  tabelas.Config = [{ CHAVE: 'LOGO_CAPITAL_REALTY', VALOR: 'ID-DA-CONFIG' }];
  naPasta = [arquivo('logo-capital-realty.png', 'image/png')];
  let achada = servidor.cfLogoBlob_('capitalRealty');
  assert.ok(achada, 'a logo não foi achada nem com a Config preenchida');
  assert.ok(/aba Config/.test(achada.origem),
    'a aba Config deixou de ser a primeira fonte — origem: ' + achada.origem);

  // Config aceita a URL inteira do Drive, não só o ID.
  tabelas.Config = [{ CHAVE: 'LOGO_CAPITAL_REALTY', VALOR: 'https://drive.google.com/file/d/ID-DA-CONFIG/view' }];
  assert.ok(/aba Config/.test(servidor.cfLogoBlob_('capitalRealty').origem),
    'a URL completa do Drive na Config não foi reconhecida');

  // 2ª fonte: sem Config, o arquivo com nome conhecido na pasta.
  tabelas.Config = [];
  achada = servidor.cfLogoBlob_('capitalRealty');
  assert.ok(/pasta do projeto/.test(achada.origem),
    'a pasta do projeto deixou de ser a segunda fonte — origem: ' + achada.origem);

  // Arquivo que não é imagem não pode passar por logo.
  naPasta = [arquivo('logo-capital-realty.pdf', 'application/pdf')];
  assert.strictEqual(servidor.cfLogoBlob_('capitalRealty'), null,
    'um PDF com o nome da logo foi aceito como imagem');

  // fixarLogosNaPasta copia para a pasta quando a origem é outra.
  tabelas.Config = [{ CHAVE: 'LOGO_CAPITAL_REALTY', VALOR: 'ID-DA-CONFIG' }];
  naPasta = [];
  criados.length = 0;
  servidor.fixarLogosNaPasta();
  assert.ok(criados.length >= 1, 'fixarLogosNaPasta não copiou nada para a pasta');
  assert.strictEqual(criados[0].nome, 'logo-capital-realty.png',
    'a cópia na pasta não recebeu o nome que a busca procura');

  // E não duplica o que já está lá.
  tabelas.Config = [];
  naPasta = [arquivo('logo-capital-realty.png', 'image/png'),
             arquivo('logo-demercado.png', 'image/png')];
  criados.length = 0;
  servidor.fixarLogosNaPasta();
  assert.strictEqual(criados.length, 0, 'fixarLogosNaPasta duplicou uma logo que já estava na pasta');

  // O diagnóstico nunca pode derrubar: é o que se roda quando tudo falhou.
  servidor.DriveApp.getFolderById = () => { throw new Error('sem permissão'); };
  assert.doesNotThrow(function () { servidor.diagnosticarLogos(); },
    'diagnosticarLogos lançou justamente quando o Drive falha');
  console.log('   ✓ Config → pasta → ID no código, e o diagnóstico não derruba');
}

// ─────────────────────────────────────────────────────────────
//  12. migrarParaSchemaV4
// ─────────────────────────────────────────────────────────────
console.log('12. Migração v4 classifica só o que tem evidência...');

{
  const gravadas = {};
  servidor.setupBaseDeDados = () => ({ avisos: [] });
  servidor.cfAtualizarLinha_ = (tabela, linha, mudar) => { gravadas[linha] = mudar; };

  tabelas.Equalizacoes = [
    { ID: 'EQ-A', PROJETO: 'Compra de café e copo', AREA: '', CATEGORIA: '' },
    { ID: 'EQ-B', PROJETO: 'Manual', AREA: '', CATEGORIA: 'Obras & Reformas' },
    { ID: 'EQ-C', PROJETO: 'Assunto indecifrável', AREA: '', CATEGORIA: '' }
  ];
  tabelas.EAP = [
    { ID: 'E1', ID_EQUALIZACAO: 'EQ-A', DESCRICAO: 'Café torrado 500g' },
    { ID: 'E2', ID_EQUALIZACAO: 'EQ-B', DESCRICAO: 'Cimento CP-II' },
    { ID: 'E3', ID_EQUALIZACAO: 'EQ-C', DESCRICAO: 'Xilofone de bambu' }
  ];

  const r = servidor.migrarParaSchemaV4();
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.schemaVersao, 4);
  assert.strictEqual(r.classificadas, 1, 'a migração classificou quantidade inesperada');
  assert.strictEqual(r.jaTinham, 1, 'a migração recontou uma categoria já gravada');
  assert.strictEqual(r.semConfianca, 1, 'a migração chutou onde não havia evidência');

  const escritas = Object.keys(gravadas).map(function (k) { return gravadas[k].CATEGORIA; });
  assert.strictEqual(escritas.join(''), 'Material de Consumo',
    'a migração gravou categoria em quem não devia');

  // Correção humana ganha de dedução: EQ-B tinha 'Obras & Reformas'
  // escrito à mão e o texto dela grita 'Material de Construção'.
  assert.ok(escritas.indexOf('Material de Construção') < 0,
    'a migração sobrescreveu uma categoria já gravada à mão');
  console.log('   ✓ classifica com evidência, respeita o que já estava gravado');
}

console.log('\n✓ Todas as validações das listas (EAP, categorias e fornecedores) passaram.');
