/**
 * Validação da importação vinda da plataforma de compras (schema v8).
 *
 * O que este teste protege, em ordem de quanto dói se quebrar:
 *
 * 1. O zero à esquerda do CNPJ. O Drive e o Excel leem 08210454000107
 *    como número e devolvem 8210454000107. São 32% dos CNPJs do
 *    histórico: sem o reparo, um terço das compras fica órfã.
 * 2. DISPUTAVEL derivado da natureza. Sem ele o ranking de fornecedor
 *    devolve a distribuidora de energia no topo.
 * 3. Relevância contada SÓ sobre o disputável.
 * 4. Idempotência por PROTOCOLO: reimportar não duplica.
 * 5. A data não anda um dia. ISO virando Date por UTC volta para o dia
 *    anterior no fuso de São Paulo.
 * 6. Contato preenchido não é sobrescrito por dado cadastral.
 * 7. Planilha Google e CSV entram pelo mesmo caminho.
 *
 * Carrega Cnpj.gs porque cfCnpjRestaurado_ usa cfCnpjValido_: em produção
 * todos os .gs dividem o mesmo escopo, mas aqui cada teste lista o que
 * carrega, e esquecer a dependência quebra a suíte inteira.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando a importação da plataforma de compras...');

const root = path.resolve(__dirname, '..');

/** Dublê de Utilities.parseCsv: aspas e quebra de linha dentro do campo. */
function parseCsvSimples(texto, sep) {
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else aspas = false; }
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ''; }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

/**
 * @param arquivos  { id: {csv: '...'} }  ou  { id: {planilha: [[...],[...]]} }
 */
function montarAmbiente(tabelas, arquivos) {
  const base = Object.assign({
    Fornecedores: [], Contratacoes: [], Naturezas: [], Log: []
  }, tabelas || {});

  const inseridos = {};
  const atualizados = [];

  const ctx = vm.createContext({
    console: console, JSON: JSON, Math: Math, String: String, Number: Number,
    Date: Date, Object: Object, Array: Array, RegExp: RegExp,
    isNaN: isNaN, parseInt: parseInt, parseFloat: parseFloat
  });
  ctx.Logger = { log: function () {} };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'x@y.z'; } }; } };
  ctx.Utilities = {
    parseCsv: function (texto, sep) { return parseCsvSimples(texto, sep || ','); },
    getUuid: function () { return 'uuid'; },
    formatDate: function () { return ''; }
  };
  ctx.CacheService = { getScriptCache: function () { return { get: function () { return null; }, put: function () {} }; } };

  const TIPO_PLANILHA = 'application/vnd.google-apps.spreadsheet';
  ctx.DriveApp = {
    getFileById: function (id) {
      const a = arquivos[id];
      if (!a) throw new Error('sem arquivo ' + id);
      return {
        getMimeType: function () { return a.planilha ? TIPO_PLANILHA : 'text/csv'; },
        getBlob: function () {
          return { getDataAsString: function () { return a.csv; } };
        }
      };
    }
  };
  ctx.SpreadsheetApp = {
    getActiveSpreadsheet: function () { return null; },
    openById: function (id) {
      const a = arquivos[id];
      if (!a || !a.planilha) throw new Error('nao e planilha: ' + id);
      return { getSheets: function () {
        return [{ getDataRange: function () {
          return { getValues: function () { return a.planilha; } };
        } }];
      } };
    }
  };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'ImportPlataforma.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  // Os dublês entram DEPOIS de carregar os .gs: declaração de função
  // sobrescreve propriedade do contexto, e na ordem inversa o dublê some.
  ctx.cfLerTudo_ = function (nome) {
    return (base[nome] || []).map(function (l, i) { return Object.assign({ _linha: i + 2 }, l); });
  };
  ctx.cfInserir_ = function (nome, objetos) {
    inseridos[nome] = (inseridos[nome] || []).concat(objetos);
    base[nome] = (base[nome] || []).concat(objetos);
    return objetos.length;
  };
  ctx.cfAtualizarLinha_ = function (nome, linha, campos) {
    atualizados.push({ tabela: nome, linha: linha, campos: campos });
    const alvo = (base[nome] || [])[linha - 2];
    if (alvo) Object.assign(alvo, campos);
  };
  ctx.cfIndexarPor_ = function (nome, campo) {
    const idx = {};
    ctx.cfLerTudo_(nome).forEach(function (o) {
      const k = String(o[campo] || '').trim();
      if (k) idx[k] = o;
    });
    return idx;
  };
  ctx.cfLog_ = function () {};

  return { ctx: ctx, base: base, inseridos: inseridos, atualizados: atualizados };
}

// 08210454000107 (ACQUA ROCHA) começa com zero — é o caso do reparo.
const CSV_FORN =
  'CNPJ;RAZAO_SOCIAL;NOME_FANTASIA;CIDADE;UF;SITUACAO_CNPJ;CNAE_PRINCIPAL;CNAES_SECUNDARIOS;NATUREZA_JURIDICA;PORTE;IS_MEI;CAPITAL_SOCIAL;DATA_INICIO_ATIVIDADE;DATA_SITUACAO_CADASTRAL;CONTATO_TEL;CONTATO_EMAIL;ATUALIZADO_EM\n' +
  '08210454000107;ACQUA ROCHA LTDA;ACQUA ROCHA;ITAJAI;SC;ATIVA;3600601 — Captação;"3600602 — Distribuição; 4930201 — Transporte";Sociedade Empresária Limitada;MICRO EMPRESA;FALSE;6000.00;2006-08-03;2006-08-03;4733481417;;2026-08-14\n' +
  '77173623000190;MATINSETO LTDA;;CURITIBA;PR;BAIXADA;8888888 — não informada;;Sociedade Empresária Limitada;DEMAIS;FALSE;;1976-07-19;2008-12-31;;;2026-03-16\n' +
  '123;EMPRESA DE CNPJ QUEBRADO;;;;;;;;;;;;;;;\n';

const CSV_CONTR =
  'CNPJ;DATA;EMPREENDIMENTO;NATUREZA_ORCAMENTARIA;PROTOCOLO;VALOR\n' +
  '08210454000107;2026-08-14;Mega Itajaí;Material de Consumo;2026000819;4800.00\n' +
  '04368898000106;2026-09-03;Mega Curitiba;Energia Elétrica;2026000887;396986.13\n' +
  '08210454000107;2026-01-06;Mega Canoas;Manutenção de Imóveis;2026000001;1000.00\n';

let passos = 0;
function ok(msg) { passos++; console.log('  ✓ ' + msg); }

// ── 1. naturezas ──
{
  const a = montarAmbiente({}, {});
  const r = a.ctx.cfSemearNaturezas_(true);
  assert.strictEqual(r.inseridas, 16, 'devem entrar as 16 naturezas');
  assert.strictEqual(r.disputaveis, 10, 'dez naturezas são disputáveis');
  assert.strictEqual(a.base.Naturezas.filter(function (n) { return n.ID === 'energia_eletrica'; })[0].DISPUTAVEL, false,
    'energia elétrica NÃO é disputável');
  assert.strictEqual(a.base.Naturezas.filter(function (n) { return n.ID === 'manutencao_imoveis'; })[0].DISPUTAVEL, true,
    'manutenção de imóveis é disputável');
  assert.strictEqual(a.ctx.cfSemearNaturezas_(true).inseridas, 0, 'semear duas vezes não duplica');
  ok('as 16 naturezas entram, com energia e água fora do que se disputa');
}

// ── 2. o reparo do CNPJ ──
{
  const a = montarAmbiente({}, {});
  const f = a.ctx.cfCnpjRestaurado_;
  assert.strictEqual(f('8210454000107'), '08210454000107',
    'CNPJ que perdeu o zero é recomposto — é 32% do histórico');
  assert.strictEqual(f(8210454000107), '08210454000107', 'número também, que é como a planilha devolve');
  assert.strictEqual(f('08210454000107'), '08210454000107', 'quem já tem 14 dígitos passa igual');
  assert.strictEqual(f('123'), '',
    'lixo não vira CNPJ: completar 123 com zeros dá dígito verificador errado');
  assert.strictEqual(f('8210454000108'), '',
    'um dígito trocado não é reparado — o verificador é o que autoriza o conserto');
  assert.strictEqual(f(''), '', 'vazio continua vazio');
  ok('o zero à esquerda volta, e só quando o dígito verificador prova que é ele');
}

// ── 3. fornecedores, pelo CSV ──
{
  const a = montarAmbiente({ Fornecedores: [] }, { forn: { csv: CSV_FORN } });
  const r = a.ctx.cfImportarFornecedores_('forn', true);
  assert.strictEqual(r.novos, 2, 'dois CNPJ válidos entram');
  assert.strictEqual(r.recusados, 1, 'o CNPJ de 3 dígitos é recusado');
  assert.strictEqual(r.situacaoIrregular, 1, 'a MATINSETO está BAIXADA');

  const acqua = a.base.Fornecedores.filter(function (f) { return f.CNPJ === '08210454000107'; })[0];
  assert.ok(acqua, 'o CNPJ foi gravado com os 14 dígitos');
  assert.strictEqual(acqua.PORTE, 'MICRO EMPRESA', 'porte veio da Receita');
  assert.strictEqual(acqua.IS_MEI, false, 'TRUE/FALSE do Postgres vira booleano');
  assert.strictEqual(acqua.CAPITAL_SOCIAL, 6000, 'capital social vira número');
  assert.ok(acqua.CNAES_SECUNDARIOS.indexOf('4930201') >= 0,
    'o campo com ponto-e-vírgula dentro de aspas não foi partido em duas colunas');
  assert.strictEqual(acqua.ORIGEM, 'import_plataforma', 'a origem fica marcada');
  ok('fornecedor entra com o retrato da Receita, e CNPJ inválido é recusado');

  assert.strictEqual(acqua.DATA_INICIO_ATIVIDADE.getFullYear(), 2006, 'ano da abertura');
  assert.strictEqual(acqua.DATA_INICIO_ATIVIDADE.getMonth(), 7, 'mês da abertura (agosto = 7)');
  assert.strictEqual(acqua.DATA_INICIO_ATIVIDADE.getDate(), 3,
    'dia 3: se virar 2, a data foi lida como UTC e voltou um dia no fuso local');
  ok('a data não anda um dia ao virar Date');

  const r2 = a.ctx.cfImportarFornecedores_('forn', true);
  assert.strictEqual(r2.novos, 0, 'reimportar não cria de novo');
  assert.strictEqual(r2.atualizados, 0, 'reimportar não reescreve célula igual');
  ok('reimportar o mesmo arquivo não duplica nem reescreve');
}

// ── 4. fornecedores, pela Planilha Google com o zero já comido ──
{
  // É assim que o Drive entrega depois de converter: número no CNPJ, Date
  // na data, booleano no booleano — e o zero à esquerda perdido.
  const PLANILHA = [
    ['CNPJ', 'RAZAO_SOCIAL', 'CIDADE', 'UF', 'SITUACAO_CNPJ', 'PORTE', 'IS_MEI', 'CAPITAL_SOCIAL', 'DATA_INICIO_ATIVIDADE'],
    [8210454000107, 'ACQUA ROCHA LTDA', 'ITAJAI', 'SC', 'ATIVA', 'MICRO EMPRESA', false, 6000, new Date(2006, 7, 3)]
  ];
  const a = montarAmbiente({ Fornecedores: [] }, { planilha: { planilha: PLANILHA } });
  const r = a.ctx.cfImportarFornecedores_('planilha', true);

  assert.strictEqual(r.novos, 1, 'a planilha é lida como o CSV');
  assert.strictEqual(r.cnpjReparados, 1, 'e o relatório conta quantos CNPJ precisaram de conserto');
  const f = a.base.Fornecedores[0];
  assert.strictEqual(f.CNPJ, '08210454000107',
    'o zero comido pelo Drive volta — sem isso a compra não casa com o fornecedor');
  assert.strictEqual(f.IS_MEI, false, 'booleano nativo da planilha é entendido');
  assert.strictEqual(f.DATA_INICIO_ATIVIDADE.getDate(), 3, 'Date nativo passa direto, sem reconverter');
  ok('planilha convertida pelo Drive entra igual ao CSV, com o CNPJ consertado');
}

// ── 5. o contato de quem cotou não é sobrescrito ──
{
  const a = montarAmbiente({
    Fornecedores: [{
      CNPJ: '08210454000107', RAZAO_SOCIAL: 'ACQUA ROCHA LTDA',
      CONTATO_NOME: 'Marcos, vendedor', CONTATO_TEL: '47999990000',
      CONTATO_EMAIL: 'marcos@acquarocha.com.br'
    }]
  }, { forn: { csv: CSV_FORN } });
  a.ctx.cfImportarFornecedores_('forn', true);
  const f = a.base.Fornecedores[0];
  assert.strictEqual(f.CONTATO_TEL, '47999990000',
    'o telefone de quem cotou vale mais que o cadastral e não pode ser sobrescrito');
  assert.strictEqual(f.CONTATO_EMAIL, 'marcos@acquarocha.com.br', 'idem o e-mail');
  ok('o contato digitado por quem cotou sobrevive à importação');
}

// ── 6. contratações e o corte do disputável ──
{
  const a = montarAmbiente({
    Fornecedores: [{ CNPJ: '08210454000107', RAZAO_SOCIAL: 'ACQUA ROCHA LTDA' }]
  }, { contr: { csv: CSV_CONTR } });
  a.ctx.cfSemearNaturezas_(true);
  const r = a.ctx.cfImportarContratacoes_('contr', true);

  assert.strictEqual(r.novas, 3, 'as três compras entram');
  assert.strictEqual(r.disputaveis, 2, 'só duas são disputáveis');
  assert.strictEqual(r.naoDisputaveis, 1, 'a conta de energia não é disputável');
  assert.strictEqual(r.cnpjSemCadastro, 1, 'a COPEL não está no cadastro e isso é relatado');

  assert.strictEqual(a.base.Contratacoes.filter(function (c) { return c.PROTOCOLO === '2026000887'; })[0].DISPUTAVEL, false,
    'energia elétrica entra marcada como não disputável');
  assert.strictEqual(a.base.Contratacoes.filter(function (c) { return c.PROTOCOLO === '2026000001'; })[0].EMPREENDIMENTO, 'Mega Canoas',
    'empreendimento não cadastrado entra como texto, não é descartado');
  ok('a natureza define o disputável, e imóvel sem cadastro não perde histórico');

  const r2 = a.ctx.cfImportarContratacoes_('contr', true);
  assert.strictEqual(r2.novas, 0, 'reimportar não cria');
  assert.strictEqual(r2.jaImportadas, 3, 'as três são reconhecidas pelo protocolo');
  ok('o protocolo torna a importação idempotente');
}

// ── 7. a compra casa com o fornecedor mesmo vindo de planilha ──
{
  const PLANILHA = [
    ['CNPJ', 'DATA', 'EMPREENDIMENTO', 'NATUREZA_ORCAMENTARIA', 'PROTOCOLO', 'VALOR'],
    [8210454000107, new Date(2026, 7, 14), 'Mega Itajaí', 'Material de Consumo', 2026000819, 4800]
  ];
  const a = montarAmbiente({
    Fornecedores: [{ CNPJ: '08210454000107', RAZAO_SOCIAL: 'ACQUA ROCHA LTDA' }]
  }, { p: { planilha: PLANILHA } });
  a.ctx.cfSemearNaturezas_(true);
  const r = a.ctx.cfImportarContratacoes_('p', true);
  assert.strictEqual(r.cnpjSemCadastro, 0,
    'com o CNPJ consertado, a compra encontra o fornecedor em vez de ficar órfã');
  assert.strictEqual(r.cnpjReparados, 1, 'e o relatório diz que precisou consertar');
  ok('a compra vinda de planilha casa com o fornecedor, e não fica órfã');
}

// ── 8. relevância conta só o disputável ──
{
  const a = montarAmbiente({
    Fornecedores: [
      { CNPJ: '08210454000107', RAZAO_SOCIAL: 'ACQUA ROCHA LTDA' },
      { CNPJ: '04368898000106', RAZAO_SOCIAL: 'COPEL DISTRIBUICAO S.A.' },
      { CNPJ: '11222333000181', RAZAO_SOCIAL: 'NUNCA CONTRATADA LTDA' }
    ]
  }, { contr: { csv: CSV_CONTR } });
  a.ctx.cfSemearNaturezas_(true);
  a.ctx.cfImportarContratacoes_('contr', true);
  a.ctx.cfRecalcularRelevancia_(true);

  const acqua = a.base.Fornecedores[0], copel = a.base.Fornecedores[1], nunca = a.base.Fornecedores[2];
  assert.strictEqual(acqua.CONTRATACOES_HISTORICO, 2, 'a Acqua tem duas compras disputáveis');
  assert.strictEqual(acqua.VALOR_TOTAL_HISTORICO, 5800, 'soma 4800 + 1000');
  assert.strictEqual(copel.CONTRATACOES_HISTORICO, 0,
    'a COPEL tem uma compra de R$ 396 mil e conta ZERO: fatura de energia não é contratação disputada');
  assert.strictEqual(copel.VALOR_TOTAL_HISTORICO, 0, 'e o valor dela não entra no histórico');
  assert.strictEqual(nunca.CONTRATACOES_HISTORICO, 0,
    'quem nunca foi contratado recebe zero explícito, não vazio');
  assert.strictEqual(acqua.ULTIMA_CONTRATACAO.getMonth(), 7, 'a última é a de agosto, não a de janeiro');
  ok('a relevância conta só o que se disputa — a distribuidora de energia fica em zero');
}

console.log('\nOK: ' + passos + ' verificações. A importação lê CSV e planilha, recupera o zero à');
console.log('    esquerda do CNPJ, respeita o corte do disputável e é idempotente.');
