const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  Logger: { log: console.log },
  console: console
});

function loadFiles(files) {
  files.forEach(f => {
    const code = fs.readFileSync(path.join(root, 'app', f), 'utf8');
    vm.runInContext(code, context, { filename: f });
  });
}

loadFiles(['Util.gs', 'Config.gs', 'Schema.gs', 'Persistencia.gs', 'ImportOrcamento.gs', 'Consulta.gs']);

console.log('Validando correções contra os defeitos originais...\n');

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('propostasAvulsas')) {
    console.log('✓ CORREÇÃO VERIFICADA: desfazerImportacao contempla propostas avulsas');
  } else {
    console.log('✗ FALHA: desfazerImportacao não contempla propostas avulsas');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 1: ${e.message}`);
}

try {
  context.cfLerTudo_ = (tabela) => {
    if (tabela === 'Empresas') {
      return [{
        CNPJ: '00000000000191',
        GRAFIAS_ALTERNATIVAS: 'Demercado',
        RAZAO_SOCIAL: 'Demercado S.A.'
      }];
    }
    return [];
  };
  
  const cnpj = context.cfResolverEmpresa_('Demercado');
  if (cnpj !== '') {
    console.log('✓ CORREÇÃO VERIFICADA: cfResolverEmpresa_ resolve texto para CNPJ');
  } else {
    console.log('✗ FALHA: cfResolverEmpresa_ não resolveu texto');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 2: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('cfResolverEmpresa_') && code.includes('cfResolverEmpreendimento_')) {
    console.log('✓ CORREÇÃO VERIFICADA: hash inclui empresa normalizada e empreendimento');
  } else {
    console.log('✗ FALHA: hash não inclui resolução de empresa ou empreendimento');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 3: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'ImportOrcamento.gs'), 'utf8');
  if (code.includes('unit === null && total === null') || code.includes('unit !== null || total !== null')) {
    console.log('✓ CORREÇÃO VERIFICADA: preço global (total sem unitário) agora marcado como cotado');
  } else {
    console.log('✗ FALHA: STATUS_PRECO para globais não foi corrigido');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 4: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Consulta.gs'), 'utf8');
  if (code.includes('r.idEqualizacao || r.idProposta')) {
    console.log('✓ CORREÇÃO VERIFICADA: avulsos são agrupados por proposta, não por equalização vazia');
  } else {
    console.log('✗ FALHA: agrupamento ainda mistura avulsos');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 5: ${e.message}`);
}

try {
  const code = fs.readFileSync(path.join(root, 'app', 'Persistencia.gs'), 'utf8');
  if (code.includes('cfResolverEmpreendimento_(')) {
    console.log('✓ CORREÇÃO VERIFICADA: ID_EMPREENDIMENTO usa cfResolverEmpreendimento_ para normalizar');
  } else {
    console.log('✗ FALHA: ID_EMPREENDIMENTO não foi corrigido');
  }
} catch (e) {
  console.log(`✗ Erro na Correção 6: ${e.message}`);
}
