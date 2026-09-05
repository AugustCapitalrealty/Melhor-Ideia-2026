/** Consolida os Dados*.gs sem chamar importadores ou serviços do Google. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const sources = [
  ['DadosCanaveral.gs', 'CF_ORC_CANAVERAL', 'Material de consumo'],
  ['DadosBasePapeis.gs', 'CF_COT_BASEPAPEIS', 'Material de consumo'],
  ['DadosSVargas.gs', 'CF_ORC_SVARGAS'],
  ['DadosLitoral.gs', 'CF_ORC_LITORAL'],
  ['DadosFabesul.gs', 'CF_ORC_FABESUL'],
  ['DadosContabilista.gs', 'CF_ORC_CONTABILISTA'],
  ['DadosADS.gs', 'CF_ORC_ADS']
];
const companies = {
  '03015145000154': 'Capital Realty',
  '08601964000105': 'Demercado'
};
const locations = {
  'MEGA CENTRO LOGÍSTICO CURITIBA': 'PR',
  'MEGA CENTRO LOGÍSTICO ITAJAÍ': 'SC',
  'MEGA CENTRO LOGÍSTICO ESTEIO': 'RS'
};
const context = vm.createContext({});
const records = [];
const documents = [];
const seen = new Set();

function number(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  return Number(value.replace(/\./g, '').replace(',', '.'));
}
function dateISO(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  assert.ok(match, 'Data sem dia/mês/ano: ' + value);
  return match[3] + '-' + match[2] + '-' + match[1];
}

for (const [filename, constant, category] of sources) {
  vm.runInContext(fs.readFileSync(path.join(root, 'app', filename), 'utf8'), context, { filename });
  const quotes = vm.runInContext(constant, context);
  for (const quote of quotes) {
    assert.ok(quote.arquivo.id, filename + ': arquivo sem identidade');
    assert.ok(!seen.has(quote.arquivo.id), 'Documento repetido: ' + quote.arquivo.id);
    seen.add(quote.arquivo.id);
    const company = companies[String(quote.cnpjEmpresa || '').replace(/\D/g, '')];
    assert.ok(company, quote.arquivo.nome + ': empresa pendente');
    const uf = locations[quote.empreendimento];
    assert.ok(uf, quote.arquivo.nome + ': empreendimento pendente');
    if (quote.ufEmpreendimento) assert.equal(quote.ufEmpreendimento, uf);
    assert.ok(quote.fornecedor.cnpj, quote.arquivo.nome + ': fornecedor sem CNPJ');
    const when = dateISO(quote.data);
    const total = Math.round(number(quote.valorTotalDeclarado) * 100);
    const sum = quote.itens.reduce((value, item) => value + Math.round(number(item.valorTotal) * 100), 0);
    assert.equal(sum, total, quote.arquivo.nome + ': total divergente');

    const entry = {
      arquivo_id: quote.arquivo.id,
      arquivo_nome: quote.arquivo.nome,
      fonte_url: 'https://drive.google.com/file/d/' + quote.arquivo.id + '/view',
      arquivo_codigo: 'app/' + filename,
      numero: quote.numero ?? '',
      data: when,
      empresa: company,
      cnpj_empresa: quote.cnpjEmpresa,
      empreendimento: quote.empreendimento,
      uf_empreendimento: uf,
      fornecedor: quote.fornecedor.nomeFantasia || quote.fornecedor.razaoSocial,
      razao_social_fornecedor: quote.fornecedor.razaoSocial,
      cnpj_fornecedor: quote.fornecedor.cnpj,
      categoria_documento: quote.categoria || category,
      tipo_documento: 'orcamento',
      itens: quote.itens.length,
      total_declarado: total / 100,
      total_somado: sum / 100,
      evidencias: quote.evidencias || { origem: 'Contexto da extração já versionada em app/' + filename },
      pendencias: quote.pendenciasExtracao || []
    };
    if (quote.arquivoComplementar) entry.arquivo_complementar = quote.arquivoComplementar;
    documents.push(entry);
    quote.itens.forEach((item, index) => {
      const quantity = number(item.quantidade);
      const unitPrice = number(item.precoUnitario);
      const lineTotal = number(item.valorTotal);
      const difference = quantity === null || unitPrice === null ? null
        : Math.round((lineTotal - quantity * unitPrice) * 100) / 100;
      assert.ok(Number.isFinite(lineTotal));
      if (quantity !== null) assert.ok(Number.isFinite(quantity));
      if (unitPrice !== null) assert.ok(Number.isFinite(unitPrice));
      records.push({
        registro_id: quote.arquivo.id + ':' + (index + 1),
        data: when,
        empresa: company,
        cnpj_empresa: quote.cnpjEmpresa,
        empreendimento: quote.empreendimento,
        uf_empreendimento: uf,
        categoria_documento: entry.categoria_documento,
        fornecedor: entry.fornecedor,
        razao_social_fornecedor: entry.razao_social_fornecedor,
        cnpj_fornecedor: quote.fornecedor.cnpj,
        numero_orcamento: quote.numero ?? '',
        item_documento: index + 1,
        codigo_fornecedor: item.codigoFornecedor ?? '',
        descricao: item.descricao,
        unidade_documento: item.unidade ?? '',
        quantidade: quantity,
        preco_unitario_cotado: unitPrice,
        valor_total_linha: lineTotal,
        desconto_pct_documento: number(item.descontoPct),
        diferenca_total_menos_qtd_unitario: difference,
        natureza_preco: unitPrice === null ? 'global_sem_unitario' : 'unitario_cotado',
        unidade_pendente: unitPrice !== null && !item.unidade,
        tipo_documento: 'orcamento',
        pagina: item.pagina ?? null,
        arquivo_id: quote.arquivo.id,
        arquivo_nome: quote.arquivo.nome,
        fonte_url: entry.fonte_url,
        arquivo_codigo: entry.arquivo_codigo
      });
    });
  }
}

records.sort((a, b) => a.empreendimento.localeCompare(b.empreendimento, 'pt-BR')
  || a.data.localeCompare(b.data) || a.fornecedor.localeCompare(b.fornecedor, 'pt-BR')
  || a.arquivo_id.localeCompare(b.arquivo_id) || a.item_documento - b.item_documento);
const summary = Object.keys(locations).map(mega => ({
  empreendimento: mega,
  uf: locations[mega],
  documentos: documents.filter(d => d.empreendimento === mega).length,
  linhas: records.filter(r => r.empreendimento === mega).length,
  precos_unitarios: records.filter(r => r.empreendimento === mega && r.natureza_preco === 'unitario_cotado').length,
  componentes_globais: records.filter(r => r.empreendimento === mega && r.natureza_preco === 'global_sem_unitario').length
}));

function csv(rows) {
  const columns = Object.keys(rows[0]);
  const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  return '\uFEFF' + [columns.map(cell).join(';'), ...rows.map(row => columns.map(col => {
    const value = row[col];
    return cell(typeof value === 'number' ? String(value).replace('.', ',') : value);
  }).join(';'))].join('\r\n') + '\r\n';
}
const output = path.join(root, 'dados');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'historico_orcamentos.csv'), csv(records));
fs.writeFileSync(path.join(output, 'historico_orcamentos.json'), JSON.stringify({
  versao: 1,
  origem: 'Extrações versionadas; consolidação local, sem importação na base Google.',
  aviso: 'Preços cotados não comprovam contratação nem pagamento. Comparações exigem unidade, embalagem, escopo e contexto compatíveis.',
  resumo: summary,
  documentos: documents,
  registros: records
}, null, 2) + '\n');
console.log(JSON.stringify({ documentos: documents.length, linhas: records.length,
  fornecedores: new Set(documents.map(d => d.cnpj_fornecedor)).size,
  precos_unitarios: records.filter(r => r.natureza_preco === 'unitario_cotado').length,
  unidades_pendentes: records.filter(r => r.unidade_pendente).length,
  diferencas_arredondamento: records.filter(r => r.diferenca_total_menos_qtd_unitario).length,
  resumo: summary }, null, 2));
