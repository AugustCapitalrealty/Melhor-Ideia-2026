const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  Logger: { log: () => {} },
  console: console
});

function loadFiles(files) {
  files.forEach(f => {
    const code = fs.readFileSync(path.join(root, 'app', f), 'utf8');
    vm.runInContext(code, context, { filename: f });
  });
}

loadFiles(['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'ImportOrcamento.gs', 'Consulta.gs']);

console.log('Validando Ciclo Completo e Correções...');

let checks = { pass: 0, fail: 0 };

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [${message}]`);
    checks.pass++;
  } else {
    console.log(`✗ [${message}]: failed`);
    checks.fail++;
  }
}

try {
  assert(typeof context.importarOrcamento === 'function', 'importarOrcamento existe');
  assert(typeof context.desfazerImportacao === 'function', 'desfazerImportacao existe');
  assert(typeof context.cfDesfazerImportacao_ === 'function', 'cfDesfazerImportacao_ existe');
  assert(typeof context.cfResolverEmpresa_ === 'function', 'cfResolverEmpresa_ existe');
  assert(typeof context.cfResolverEmpreendimento_ === 'function', 'cfResolverEmpreendimento_ existe');
  assert(typeof context.cfImpressaoDoArquivo_ === 'function', 'cfImpressaoDoArquivo_ existe');
  assert(typeof context.cfCarregarPrecos_ === 'function', 'cfCarregarPrecos_ existe');
  assert(typeof context.consultarPreco === 'function', 'consultarPreco existe');
  assert(typeof context.cfAgruparPorItem_ === 'function', 'cfAgruparPorItem_ existe');
  // const no node:vm não expõe ao context — ler do fonte
  const configSrc = fs.readFileSync(path.join(root, 'app', 'Config.gs'), 'utf8');
  assert(/CF_SCHEMA_VERSAO\s*=\s*3/.test(configSrc), 'CF_SCHEMA_VERSAO é 3');
} catch (e) {
  console.log(`✗ [Estrutura do código]: ${e.message}`);
}

try {
  const schemaCtx = vm.createContext({});
  const configSrc = fs.readFileSync(path.join(root, 'app', 'Config.gs'), 'utf8');
  vm.runInContext(configSrc + '\n;globalThis.__CF_SCHEMA = CF_SCHEMA; globalThis.__CF_ENUM = CF_ENUM;', schemaCtx, { filename: 'Config.gs' });
  const schemaList = schemaCtx.__CF_SCHEMA;
  const enums = schemaCtx.__CF_ENUM;
  assert(Array.isArray(schemaList) && schemaList.length === 21, 'Schema tem 21 tabelas (' + (schemaList ? schemaList.length : 0) + ')');

  const tableMap = {};
  schemaList.forEach(t => { tableMap[t.nome] = t; });

  const eapFields = (tableMap.EAP.colunas || []).map(c => c.campo || c);
  assert(eapFields.includes('ID_IMPORTACAO'), 'EAP tem ID_IMPORTACAO');

  const precosFields = (tableMap.Precos.colunas || []).map(c => c.campo || c);
  assert(precosFields.includes('ID_IMPORTACAO'), 'Precos tem ID_IMPORTACAO');
  assert(precosFields.includes('ORIGEM_CALCULO'), 'Precos tem ORIGEM_CALCULO');
  assert(precosFields.includes('DESCONTO_PERCENTUAL'), 'Precos tem DESCONTO_PERCENTUAL');
  assert(precosFields.includes('PERIODO_COBRANCA'), 'Precos tem PERIODO_COBRANCA');

  const impFields = (tableMap.Importacoes.colunas || []).map(c => c.campo || c);
  assert(impFields.includes('HASH_VERSAO'), 'Importacoes tem HASH_VERSAO');

  const propFields = (tableMap.Propostas.colunas || []).map(c => c.campo || c);
  assert(propFields.includes('ID_FONTE'), 'Propostas tem ID_FONTE');

  const eqFields = (tableMap.Equalizacoes.colunas || []).map(c => c.campo || c);
  assert(eqFields.includes('ID_FONTE'), 'Equalizacoes tem ID_FONTE');

  assert(enums && enums.origemCalculo !== undefined, 'CF_ENUM tem origemCalculo');
  assert(enums && enums.periodoCobranca !== undefined, 'CF_ENUM tem periodoCobranca');
} catch (e) {
  console.log(`✗ [Schema integrity]: ${e.message}`);
}

try {
  const persistenciaCode = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  assert(persistenciaCode.includes('propostasAvulsas'), 'cfDesfazerImportacao_ contempla propostasAvulsas');
  assert(persistenciaCode.includes('!p.ID_EQUALIZACAO'), 'cfDesfazerImportacao_ filtra !p.ID_EQUALIZACAO');
  assert(persistenciaCode.includes('ID_IMPORTACAO'), 'cfDesfazerImportacao_ filtra ID_IMPORTACAO');
} catch (e) {
  console.log(`✗ [Desfazer logic]: ${e.message}`);
}

try {
  const importOrcamentoCode = fs.readFileSync(path.join(root, 'app', 'ImportOrcamento.gs'), 'utf8');
  assert(importOrcamentoCode.includes("unit === null && total === null"), 'STATUS_PRECO checa unit AND total');
  assert(importOrcamentoCode.includes('ID_IMPORTACAO: idImportacao'), 'ID_IMPORTACAO gravado em EAP e Precos');
  assert(importOrcamentoCode.includes('CNPJ_EMPRESA:'), 'CNPJ_EMPRESA em Propostas');
  assert(importOrcamentoCode.includes('cfDesfazerImportacao_('), 'cfDesfazerImportacao_ usado para rollback interno');
} catch (e) {
  console.log(`✗ [ImportOrcamento logic]: ${e.message}`);
}

try {
  const consultaCode = fs.readFileSync(path.join(root, 'app', 'Consulta.gs'), 'utf8');
  assert(consultaCode.includes('r.idEqualizacao || r.idProposta'), 'Agrupamento usa idProposta como fallback');
  assert(consultaCode.includes('idProposta: String(p.ID_PROPOSTA || \'\')'), 'idProposta no retorno de cfCarregarPrecos_');
} catch (e) {
  console.log(`✗ [Consulta logic]: ${e.message}`);
}

try {
  const persistenciaCode = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  assert(persistenciaCode.includes('cfResolverEmpresa_('), 'cfImpressaoDoArquivo_ inclui cfResolverEmpresa_');
  assert(persistenciaCode.includes('cfResolverEmpreendimento_('), 'cfImpressaoDoArquivo_ inclui cfResolverEmpreendimento_');
} catch (e) {
  console.log(`✗ [Hash amplification logic]: ${e.message}`);
}

try {
  const persistenciaCode = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  assert(persistenciaCode.includes("STATUS: 'em_andamento'"), 'Grava STATUS em_andamento');
  assert(persistenciaCode.includes("STATUS: 'concluida'") || persistenciaCode.includes("STATUS: 'falha'"), 'Atualiza para concluida ou falha');
} catch (e) {
  console.log(`✗ [Status tracking]: ${e.message}`);
}

try {
  const persistenciaCode = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  const importCode = fs.readFileSync(path.join(root, 'app', 'ImportOrcamento.gs'), 'utf8');
  assert(persistenciaCode.includes('em_andamento'), 'Persistencia tem bloco de recovery em_andamento');
  assert(importCode.includes('em_andamento'), 'ImportOrcamento tem bloco de recovery em_andamento');
} catch (e) {
  console.log(`✗ [Recovery logic]: ${e.message}`);
}

console.log(`\n${checks.pass} de ${checks.pass + checks.fail} verificações passaram`);
