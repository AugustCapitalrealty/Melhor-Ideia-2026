/**
 * Validação da Ficha do Fornecedor Executiva e Matching Resiliente de Preços Históricos.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando Ficha do Fornecedor Executiva & Matching Resiliente de Preços...');

const root = path.resolve(__dirname, '..');

function criarContexto() {
  const sandbox = {
    console: console,
    Logger: { log: function () {} },
    Utilities: {
      formatDate: function () { return '01/09/2026'; }
    }
  };

  const arquivos = [
    'app/Util.gs',
    'app/Config.gs',
    'app/Schema.gs',
    'app/Persistencia.gs',
    'app/Equalizacao.gs',
    'app/Consulta.gs',
    'app/Avaliacao.gs',
    'app/Fornecedores.gs',
    'app/Codigo.gs'
  ];

  arquivos.forEach(function (f) {
    const conteudo = fs.readFileSync(path.join(root, f), 'utf8');
    vm.runInNewContext(conteudo, sandbox, { filename: f });
  });

  return sandbox;
}

// ── Cenário 1: Matching semântico resiliente em cfBuscarReferenciaPrecoItem_
(function testarMatchingResiliente() {
  const ctx = criarContexto();

  const precosMock = [
    {
      descricao: 'PAPEL TOALHA INTERFOLHADO BRANCO 2D',
      chave: 'papel toalha interfolhado branco 2d',
      valor: 45.00,
      unidade: 'fardo',
      data: new Date(2026, 7, 10),
      fornecedor: 'Base Papéis',
      empreendimento: 'Mega Esteio',
      idEqualizacao: 'EQ-ANTIGA',
      vencedora: true,
      status: 'cotado'
    },
    {
      descricao: 'Café Torrado e Moído Tradicional 500g',
      chave: 'cafe torrado e moido tradicional 500g',
      valor: 22.50,
      unidade: 'pct',
      data: new Date(2026, 7, 15),
      fornecedor: 'Café Sul',
      empreendimento: 'Mega Curitiba',
      idEqualizacao: 'EQ-ATUAL',
      vencedora: false,
      status: 'cotado'
    }
  ];

  // A: Busca com descrição diferente mas semântica equivalente
  const ref1 = ctx.cfBuscarReferenciaPrecoItem_(
    'Papel toalha interfolhado 100% celulose 2 dobras',
    'fardo',
    null,
    precosMock
  );
  assert.ok(ref1, 'Deve encontrar referência mesmo com palavras adicionais');
  assert.strictEqual(ref1.ultimoPreco, 45.00, 'Último preço deve ser 45.00');
  assert.strictEqual(ref1.fornecedorUltimo, 'Base Papéis');

  // B: Ignora a própria equalização (idEqIgnorar)
  const ref2 = ctx.cfBuscarReferenciaPrecoItem_(
    'Café Torrado e Moído 500g',
    'pct',
    'EQ-ATUAL',
    precosMock
  );
  assert.strictEqual(ref2, null, 'Deve ignorar a própria equalização sendo cotada e retornar null');

  console.log('✓ 1. cfBuscarReferenciaPrecoItem_ matching semântico e idEqIgnorar validados com sucesso');
})();

// ── Cenário 2: Ficha do Fornecedor com Frente 1 (Convites) e Ticket Médio
(function testarFichaFornecedor() {
  const ctx = criarContexto();

  const mockDb = {
    Fornecedores: [
      { CNPJ: '07986449000110', RAZAO_SOCIAL: 'BASE PAPEIS LTDA', SITUACAO_CNPJ: 'Ativa', CIDADE: 'Porto Alegre', UF: 'RS', CONTATO_TEL: '5133718100' }
    ],
    Equalizacoes: [
      { ID: 'EQ1', PROJETO: 'Consumo Mensal', STATUS: 'homologada', DATA_EQUALIZACAO: '01/08/2026', ID_EMPREENDIMENTO: 'MEGA-ESTEIO', CATEGORIA: 'Material de Consumo' },
      { ID: 'EQ2', PROJETO: 'Consumo Bimestral', STATUS: 'homologada', DATA_EQUALIZACAO: '15/08/2026', ID_EMPREENDIMENTO: 'MEGA-ESTEIO', CATEGORIA: 'Material de Consumo' }
    ],
    Propostas: [
      { ID: 'P1', CNPJ: '07986449000110', ID_EQUALIZACAO: 'EQ1', VALOR_TOTAL_DECLARADO: 10000, VENCEDORA: true },
      { ID: 'P2', CNPJ: '07986449000110', ID_EQUALIZACAO: 'EQ2', VALOR_TOTAL_DECLARADO: 20000, VENCEDORA: true }
    ],
    EAP: [],
    Precos: [],
    Convites: [
      { CNPJ: '07986449000110', ID_EQUALIZACAO: 'EQ1', APRESENTOU_PROPOSTA: true },
      { CNPJ: '07986449000110', ID_EQUALIZACAO: 'EQ2', APRESENTOU_PROPOSTA: true },
      { CNPJ: '07986449000110', ID_EQUALIZACAO: 'EQ3', APRESENTOU_PROPOSTA: false }
    ],
    Avaliacoes: [
      {
        CNPJ: '07986449000110',
        VERSAO_CRITERIOS: 2,
        NOTA: 90,
        DATA_AVALIACAO: '10/08/2026',
        QUALIDADE: 90,
        PRAZO: 90,
        SEGURANCA: 90,
        ATENDIMENTO: 90,
        LIMPEZA: 90,
        RECONTRATARIA: true,
        COMENTARIO: 'Excelente fornecedor de insumos'
      }
    ]
  };

  ctx.cfLerTudo_ = function (aba) {
    return mockDb[aba] || [];
  };

  const ficha = ctx.cfFichaFornecedor_('07.986.449/0001-10');

  assert.strictEqual(ficha.vitorias, 2, 'Deve registrar 2 vitórias');
  assert.strictEqual(ficha.volumeHomologado, 30000, 'Volume homologado deve ser 30.000');
  assert.strictEqual(ficha.ticketMedio, 15000, 'Ticket médio deve ser 15.000 (30.000 / 2)');
  assert.strictEqual(ficha.convitesTotal, 3, 'Total de 3 convites');
  assert.strictEqual(ficha.convitesRespondidos, 2, '2 convites respondidos');
  assert.ok(Math.abs(ficha.taxaRespostaConvites - (2/3)) < 0.001, 'Taxa de resposta de aproximadamente 66,7%');
  assert.ok(ficha.iqf, 'Deve retornar resumo de IQF');
  assert.strictEqual(ficha.iqf.classe, 'A', 'Nota 90 deve pertencer à Classe A');

  console.log('✓ 2. cfFichaFornecedor_ calcula Ticket Médio, Convites Frente 1 e IQF Classe A');
})();

// ── Cenário 3: Interface.html - Verificação de sintaxe e funções da gaveta
(function testarInterfaceHtml() {
  const htmlSrc = fs.readFileSync(path.join(root, 'app/Interface.html'), 'utf8');

  assert.ok(htmlSrc.includes('function desenharFichaFornecedor('), 'desenharFichaFornecedor deve existir');
  assert.ok(htmlSrc.includes('function trocarAbaFicha('), 'trocarAbaFicha deve existir');
  assert.ok(htmlSrc.includes('function filtrarItensFicha('), 'filtrarItensFicha deve existir');
  assert.ok(htmlSrc.includes('function copiarDadosFornecedor('), 'copiarDadosFornecedor deve existir');
  assert.ok(htmlSrc.includes('iqf-hero-card'), 'CSS do hero card de IQF deve estar presente');
  assert.ok(htmlSrc.includes('criterio-bar-fill'), 'CSS das barras de critérios deve estar presente');
  assert.ok(htmlSrc.includes('WhatsApp Direto'), 'Botão de WhatsApp rápido deve existir na toolbar');

  console.log('✓ 3. Interface.html possui componentes visuais e funções da nova Ficha Executiva');
})();

console.log('\n===============================================================');
console.log('🎉 SUCESSO: Todos os testes da Ficha do Fornecedor e Matching passaram 100%!');
console.log('===============================================================\n');
