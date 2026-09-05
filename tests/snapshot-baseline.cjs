const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const sources = [
  ['DadosCanaveral.gs', 'CF_ORC_CANAVERAL', 'Material de consumo'],
  ['DadosBasePapeis.gs', 'CF_COT_BASEPAPEIS', 'Material de consumo'],
  ['DadosSVargas.gs', 'CF_ORC_SVARGAS', 'Material de construção'],
  ['DadosLitoral.gs', 'CF_ORC_LITORAL', 'Material de manutenção'],
  ['DadosFabesul.gs', 'CF_ORC_FABESUL', 'Material de escritório e consumo'],
  ['DadosContabilista.gs', 'CF_ORC_CONTABILISTA', 'Material de consumo'],
  ['DadosADS.gs', 'CF_ORC_ADS', 'Serviço de limpeza de piso']
];

const context = vm.createContext({});
const records = [];
const documents = [];

function number(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  return Number(value.replace(/\./g, '').replace(',', '.'));
}

for (const [filename, constant, category] of sources) {
  vm.runInContext(fs.readFileSync(path.join(root, 'app', filename), 'utf8'), context, { filename });
  const quotes = vm.runInContext(constant, context);
  for (const quote of quotes) {
    documents.push(quote);
    quote.itens.forEach((item) => {
      records.push(item);
    });
  }
}

const fornecedores = new Set(documents.map(d => d.fornecedor.cnpj));

const counts = {
  documentos: documents.length,
  itens: records.length,
  fornecedores: fornecedores.size
};

const baseline = {
  dataSnapshot: new Date().toISOString(),
  versaoSchema: 1,
  contagens: counts
};

fs.writeFileSync(path.join(__dirname, 'baseline.json'), JSON.stringify(baseline, null, 2));
console.log('Baseline gerado com sucesso:', baseline);
