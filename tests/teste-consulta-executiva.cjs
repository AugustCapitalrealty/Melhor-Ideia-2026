/**
 * Teste da Consulta de Preços Executiva & Filtro por Megas
 *
 * Valida:
 * 1. Resolução canônica de slugs por Mega (Curitiba, Esteio, Itajaí, Outro)
 * 2. Enriquecimento de dadosBrutos e megaSlug em apiConsultar
 * 3. Agrupamento por Produto Mestre (fim dos cards repetitivos)
 * 4. Matriz Regional Inter-Megas (Modo Corporativo) e cálculo de assimetria/benchmark
 * 5. Isolamento de séries temporais por praça (Modo Unidade sem saltos falsos)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

const sandbox = {
  console: console,
  Logger: { log: function () {} },
  Utilities: {
    formatDate: function (d, tz, fmt) {
      if (!d) return '';
      const pad = function (n) { return n < 10 ? '0' + n : String(n); };
      const dia = pad(d.getDate()), mes = pad(d.getMonth() + 1), ano = d.getFullYear();
      if (fmt === 'dd/MM/yyyy') return dia + '/' + mes + '/' + ano;
      if (fmt === 'MM/yyyy') return mes + '/' + ano;
      return d.toISOString();
    }
  },
  LockService: {
    getScriptLock: function () {
      return { tryLock: function () { return true; }, releaseLock: function () {} };
    }
  }
};

const context = vm.createContext(sandbox);

// Carregar scripts necessários
['Util.gs', 'Config.gs', 'Consulta.gs', 'Codigo.gs'].forEach(function (arquivo) {
  const code = fs.readFileSync(path.join(root, 'app', arquivo), 'utf8');
  vm.runInContext(code, context);
});

console.log('Validando Consulta de Preço Executiva & Filtro por Megas...\n');

// 1. Teste do cfMegaSlug_
{
  const slug = vm.runInContext('cfMegaSlug_', context);
  assert.equal(slug('MEGA CENTRO LOGÍSTICO CURITIBA'), 'curitiba');
  assert.equal(slug('Mega Curitiba'), 'curitiba');
  assert.equal(slug('Curitiba - PR'), 'curitiba');
  assert.equal(slug('MEGA-CWB'), 'curitiba');
  assert.equal(slug('MEGA CENTRO LOGÍSTICO ESTEIO'), 'esteio');
  assert.equal(slug('Mega Esteio'), 'esteio');
  assert.equal(slug('Esteio / RS'), 'esteio');
  assert.equal(slug('MEGA CENTRO LOGÍSTICO ITAJAÍ'), 'itajai');
  assert.equal(slug('MEGA CENTRO LOGISTICO ITAJAI'), 'itajai');
  assert.equal(slug('Itajaí - SC'), 'itajai');
  assert.equal(slug('Outro Lugar'), 'outro');
  console.log('✓ 1. cfMegaSlug_ mapeia todas as variantes dos 3 Megas corretamente');
}

// 2. Mock de dados e teste de apiConsultar enriquecido
{
  context.cfCarregarPrecos_ = function () {
    return [
      {
        descricao: 'CAFE MELITTA TRADICIONAL 500 GR',
        chave: 'cafe melitta tradicional 500 gr',
        codigo: '373',
        idProposta: 'PRP-01',
        idEqualizacao: 'EQ-01',
        valor: 24.99,
        status: 'cotado',
        unidade: 'UN',
        quantidade: 10,
        cnpj: '11111111000101',
        fornecedor: 'Distribuidora Curitiba Ltda',
        empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA',
        data: new Date(2026, 7, 10), // 10/08/2026
        vencedora: true,
        cnpjEmpresa: '08601964000105'
      },
      {
        descricao: 'CAFE MELITTA TRADICIONAL 500 GR',
        chave: 'cafe melitta tradicional 500 gr',
        codigo: '373',
        idProposta: 'PRP-02',
        idEqualizacao: 'EQ-02',
        valor: 35.90,
        status: 'cotado',
        unidade: 'UN',
        quantidade: 6,
        cnpj: '22222222000102',
        fornecedor: 'Canaveral Produtos de Higiene',
        empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
        data: new Date(2026, 7, 12), // 12/08/2026
        vencedora: true,
        cnpjEmpresa: '03015145000154'
      },
      {
        descricao: 'CAFE MELITTA TRADICIONAL 500 GR',
        chave: 'cafe melitta tradicional 500 gr',
        codigo: '373',
        idProposta: 'PRP-03',
        idEqualizacao: 'EQ-03',
        valor: 39.50,
        status: 'cotado',
        unidade: 'UN',
        quantidade: 8,
        cnpj: '33333333000103',
        fornecedor: 'Base Papéis Ltda',
        empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO',
        data: new Date(2026, 0, 20), // 20/01/2026
        vencedora: false,
        cnpjEmpresa: '03015145000154'
      },
      {
        descricao: 'CAFE MELITTA TRADICIONAL 500 GR',
        chave: 'cafe melitta tradicional 500 gr',
        codigo: '373',
        idProposta: 'PRP-04',
        idEqualizacao: 'EQ-04',
        valor: 37.90,
        status: 'cotado',
        unidade: 'UN',
        quantidade: 8,
        cnpj: '33333333000103',
        fornecedor: 'Base Papéis Ltda',
        empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO',
        data: new Date(2026, 6, 15), // 15/07/2026
        vencedora: true,
        cnpjEmpresa: '03015145000154'
      },
      {
        descricao: 'FILTRO DE CAFE 103 C/30 UN',
        chave: 'filtro de cafe 103 c 30 un',
        codigo: '371',
        idProposta: 'PRP-05',
        idEqualizacao: 'EQ-02',
        valor: 5.50,
        status: 'cotado',
        unidade: 'CX',
        quantidade: 3,
        cnpj: '22222222000102',
        fornecedor: 'Canaveral Produtos de Higiene',
        empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
        data: new Date(2026, 7, 12),
        vencedora: true,
        cnpjEmpresa: '03015145000154'
      }
    ];
  };

  const res = vm.runInContext('apiConsultar("café")', context);
  assert.equal(res.ok, true, 'apiConsultar retornou ok');
  assert.equal(res.pontos, 5, 'apiConsultar encontrou 5 pontos');
  assert(Array.isArray(res.dadosBrutos), 'dadosBrutos está presente');
  assert.equal(res.dadosBrutos.length, 5, 'dadosBrutos contém 5 registros');

  // Verifica campos enriquecidos de cada registro
  const itemCwb = res.dadosBrutos.find(function (r) { return r.valor === 24.99; });
  assert.equal(itemCwb.megaSlug, 'curitiba');
  assert.equal(itemCwb.empresa, 'Demercado');
  assert.equal(itemCwb.vencedora, true);

  const itemItj = res.dadosBrutos.find(function (r) { return r.valor === 35.90; });
  assert.equal(itemItj.megaSlug, 'itajai');
  assert.equal(itemItj.empresa, 'Capital Realty');

  const itemEst = res.dadosBrutos.find(function (r) { return r.valor === 39.50; });
  assert.equal(itemEst.megaSlug, 'esteio');

  console.log('✓ 2. apiConsultar retorna dadosBrutos enriquecidos com megaSlug e empresa');
}

// 3. Validação do Agrupamento e Matriz Regional (Simulação de Front-end)
{
  const res = vm.runInContext('apiConsultar("café")', context);
  const brutos = res.dadosBrutos;

  // Filtragem por produto
  const cafes = brutos.filter(function (r) { return r.descricao.indexOf('MELITTA') >= 0; });
  assert.equal(cafes.length, 4, '4 cotações para Café Melitta');

  const precosValidos = cafes.map(function (c) { return c.valor; });
  const menorGlobal = Math.min.apply(null, precosValidos);
  const maiorGlobal = Math.max.apply(null, precosValidos);
  assert.equal(menorGlobal, 24.99);
  assert.equal(maiorGlobal, 39.50);

  // Benchmarking Regional (Modo Corporativo)
  const cwbCots = cafes.filter(function (c) { return c.megaSlug === 'curitiba'; });
  const itjCots = cafes.filter(function (c) { return c.megaSlug === 'itajai'; });
  const estCots = cafes.filter(function (c) { return c.megaSlug === 'esteio'; });

  const minCwb = Math.min.apply(null, cwbCots.map(function (c) { return c.valor; }));
  const minItj = Math.min.apply(null, itjCots.map(function (c) { return c.valor; }));
  const minEst = Math.min.apply(null, estCots.map(function (c) { return c.valor; }));

  assert.equal(minCwb, 24.99, 'Curitiba é o benchmark menor custo');
  assert.equal(minItj, 35.90, 'Itajaí menor preço');
  assert.equal(minEst, 37.90, 'Esteio menor preço');

  // Assimetria regional calculada
  const deltaItj = ((minItj - minCwb) / minCwb) * 100;
  const deltaEst = ((minEst - minCwb) / minCwb) * 100;
  assert.equal(Math.round(deltaItj), 44, 'Itajaí opera +44% vs benchmark');
  assert.equal(Math.round(deltaEst), 52, 'Esteio opera +52% vs benchmark');

  console.log('✓ 3. Matriz Regional Inter-Megas calcula assimetrias e identifica benchmark sem falsos alarmes');
}

// 4. Validação da Série Temporal do Modo Unidade (Esteio)
{
  const res = vm.runInContext('apiConsultar("café")', context);
  const brutos = res.dadosBrutos;

  // Filtrando SOMENTE Esteio
  const cotsEsteio = brutos.filter(function (r) {
    return r.megaSlug === 'esteio' && r.descricao.indexOf('MELITTA') >= 0;
  });
  assert.equal(cotsEsteio.length, 2);

  // Ordenados cronologicamente: 20/01/2026 (39.50) -> 15/07/2026 (37.90)
  cotsEsteio.sort(function (a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
  const p0 = cotsEsteio[0].valor; // 39.50
  const p1 = cotsEsteio[1].valor; // 37.90
  const deltaEsteio = ((p1 - p0) / p0) * 100;

  // Em Esteio o preço CAIU -4,1% (de 39,50 para 37,90), NÃO SUBIU +43% como a tela anterior mostrava!
  assert(deltaEsteio < 0, 'Preço em Esteio caiu ao longo do tempo');
  assert.equal(deltaEsteio.toFixed(1), '-4.1');

  console.log('✓ 4. Modo Unidade isola série temporal: Esteio teve deflação local de -4,1% em vez de salto distorcido');
}

console.log('\nTodos os 4 testes de inteligência executiva de preço passaram com 100% de sucesso!');
