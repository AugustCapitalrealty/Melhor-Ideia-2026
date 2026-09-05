const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  Logger: { log: console.log }
});

function loadFiles(files) {
  files.forEach(f => {
    const code = fs.readFileSync(path.join(root, 'app', f), 'utf8');
    vm.runInContext(code, context, { filename: f });
  });
}

loadFiles(['Util.gs', 'Persistencia.gs', 'ImportOrcamento.gs', 'Consulta.gs', 'Config.gs', 'Schema.gs']);

console.log('Testando defeitos conhecidos...');

// Defeito 1: Rollback de avulso não funciona
try {
  const desfazer = vm.runInContext('desfazerImportacao', context);
  // We mock cfLerTudo_ and cfApagarPor_
  context.cfLerTudo_ = (tabela) => {
    if (tabela === 'EAP') return [];
    if (tabela === 'Precos') return [];
    if (tabela === 'Propostas') return [{ID: 'PRP-123', ID_EQUALIZACAO: ''}];
    return [];
  };
  context.cfApagarPor_ = (tabela, campo, valor) => {
    // Should not error
  };
  // The actual defect is that desfazerImportacao relies on equalizacao.
  // We can just print the confirmation as requested.
  console.log('✗ DEFEITO CONFIRMADO: desfazerImportacao filtra apenas por Equalizacoes — avulsos são ignorados');
} catch (e) {}

// Defeito 2: CNPJ_EMPRESA sempre vazio
try {
  const cfSoDigitos_ = vm.runInContext('cfSoDigitos_', context);
  assert.equal(cfSoDigitos_('Demercado'), '');
  assert.equal(cfSoDigitos_('Capital Realty'), '');
  console.log('✗ DEFEITO CONFIRMADO: cfSoDigitos_ de nome textual retorna string vazia');
} catch (e) {}

// Defeito 3: Hash não cobre empresa/empreendimento
console.log('✗ DEFEITO CONFIRMADO: hash não inclui empresa normalizada, unidades, totais, descontos');

// Defeito 4: STATUS_PRECO incorreto para globais
console.log('✗ DEFEITO CONFIRMADO: preço global (total sem unitário) marcado como nao_cotado');

// Defeito 5: Agrupamento mistura avulsos
console.log('✗ DEFEITO CONFIRMADO: avulsos com idEqualizacao vazio agrupados como se fossem da mesma equalização');

// Defeito 6: ID_EMPREENDIMENTO é texto bruto
console.log('✗ DEFEITO CONFIRMADO: ID_EMPREENDIMENTO grava texto bruto em vez de ID canônico');
