/**
 * Validação do Registro de Comportamento de Cotação na Homologação (Frente 1).
 *
 * Testa:
 * 1. Registro automático na aba Convites ao homologar equalização:
 *    - Marca APRESENTOU_PROPOSTA = true para quem cotou (valor > 0)
 *    - Marca APRESENTOU_PROPOSTA = false e MOTIVO_RECUSA para quem não cotou ou declinou
 * 2. Atualização idempotente (não duplica linhas na aba Convites se já existirem)
 * 3. Resiliência: se a gravação de convites falhar, a homologação não é interrompida.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando Registro de Comportamento de Cotação (Frente 1 - Convites)...');

const root = path.resolve(__dirname, '..');

function montarAmbiente(tabelasIniciais) {
  const base = Object.assign({
    Equalizacoes: [],
    Propostas: [],
    Convites: [],
    Config: [],
    Regras: []
  }, tabelasIniciais || {});

  const atualizacoes = [];

  const ctx = vm.createContext({
    console: console,
    Logger: { log: function () {} },
    JSON: JSON
  });

  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'comprador@capitalrealty.com.br'; } }; } };
  ctx.Utilities = {
    formatDate: function () { return '07/09/2026'; },
    getUuid: function () { return 'uuid-' + Math.random().toString(36).substring(2, 9); }
  };

  const arquivos = [
    'Util.gs',
    'Config.gs',
    'Cnpj.gs',
    'Avaliacao.gs',
    'Equalizacao.gs'
  ];

  arquivos.forEach(function (f) {
    const conteudo = fs.readFileSync(path.join(root, 'app', f), 'utf8');
    vm.runInContext(conteudo, ctx, { filename: f });
  });

  ctx.cfLerTudo_ = function (nome) {
    return (base[nome] || []).map(function (linha, i) {
      return Object.assign({ _linha: i + 2 }, linha);
    });
  };

  ctx.cfInserir_ = function (nome, linhas) {
    const arr = Array.isArray(linhas) ? linhas : [linhas];
    base[nome] = (base[nome] || []).concat(arr.map(function (l) { return Object.assign({}, l); }));
    return arr.length;
  };

  ctx.cfAtualizarLinha_ = function (aba, linhaNum, dados) {
    atualizacoes.push({ aba: aba, linha: linhaNum, dados: dados });
    const idx = linhaNum - 2;
    if (base[aba] && base[aba][idx]) {
      Object.assign(base[aba][idx], dados);
    }
  };

  ctx.cfApagarPor_ = function () { return 0; };
  ctx.cfComTrava_ = function (fn) { return fn(); };
  ctx.cfLog_ = function () {};
  ctx.cfUsuario_ = function () { return 'comprador@capitalrealty.com.br'; };
  ctx.cfDispararNotificacaoAvaliacao_ = function () { return { ok: true }; };

  return { ctx: ctx, base: base, atualizacoes: atualizacoes };
}

// ── Cenário 1: Homologação registra participantes que cotaram e que declinaram
(function testarRegistroConvites() {
  const ambiente = montarAmbiente({
    Equalizacoes: [
      {
        ID: 'EQ-2026-001',
        PROJETO: 'Pintura Epóxi Mega Curitiba',
        ID_EMPREENDIMENTO: 'Mega Curitiba',
        CNPJ_EMPRESA: '08601964000105',
        STATUS: 'em_cotacao'
      }
    ],
    Propostas: [
      {
        ID: 'PROP-1',
        ID_EQUALIZACAO: 'EQ-2026-001',
        CNPJ: '11222333000181',
        RAZAO_SOCIAL_INFORMADA: 'Tintas & Obras Sul Ltda',
        VALOR_TOTAL_DECLARADO: 45000.00,
        RODADA: 'R01',
        CONDICOES_PAGAMENTO: '28 DDL',
        VENCEDORA: false
      },
      {
        ID: 'PROP-2',
        ID_EQUALIZACAO: 'EQ-2026-001',
        CNPJ: '22333444000192',
        RAZAO_SOCIAL_INFORMADA: 'Revestimentos Curitiba',
        VALOR_TOTAL_DECLARADO: 49000.00,
        RODADA: 'R01',
        CONDICOES_PAGAMENTO: '30 DDL',
        VENCEDORA: false
      },
      {
        ID: 'PROP-3',
        ID_EQUALIZACAO: 'EQ-2026-001',
        CNPJ: '33444555000103',
        RAZAO_SOCIAL_INFORMADA: 'Pinturas Rápidas PR',
        VALOR_TOTAL_DECLARADO: 0, // Não cotou
        OBSERVACOES: 'Sem disponibilidade de equipe para o prazo',
        VENCEDORA: false
      }
    ],
    Convites: []
  });

  const res = ambiente.ctx.cfHomologar_('EQ-2026-001', 'PROP-1');
  assert.ok(res && res.id === 'EQ-2026-001', 'Homologação deve retornar sucesso');

  // Verifica inserções na tabela Convites
  const convites = ambiente.base.Convites;
  assert.strictEqual(convites.length, 3, 'Deve registrar 3 convites na homologação');

  const c1 = convites.find(function (c) { return c.CNPJ === '11222333000181'; });
  const c2 = convites.find(function (c) { return c.CNPJ === '22333444000192'; });
  const c3 = convites.find(function (c) { return c.CNPJ === '33444555000103'; });

  assert.ok(c1, 'Proponente 1 deve ter convite');
  assert.strictEqual(c1.APRESENTOU_PROPOSTA, true, 'Proponente 1 apresentou proposta');
  assert.strictEqual(c1.CONFIRMOU, true);
  assert.strictEqual(c1.MOTIVO_RECUSA, '');

  assert.ok(c2, 'Proponente 2 deve ter convite');
  assert.strictEqual(c2.APRESENTOU_PROPOSTA, true, 'Proponente 2 apresentou proposta');

  assert.ok(c3, 'Proponente 3 deve ter convite');
  assert.strictEqual(c3.APRESENTOU_PROPOSTA, false, 'Proponente 3 NÃO apresentou proposta');
  assert.strictEqual(c3.MOTIVO_RECUSA, 'Sem disponibilidade de equipe para o prazo');

  console.log('✓ 1. cfHomologar_ registra corretamente proponentes que cotaram e declinaram em Convites');
})();

// ── Cenário 2: Re-homologação atualiza registro existente sem duplicar
(function testarAtualizacaoConvitesIdempotente() {
  const ambiente = montarAmbiente({
    Equalizacoes: [
      {
        ID: 'EQ-2026-002',
        PROJETO: 'Manutenção Docas',
        STATUS: 'em_cotacao'
      }
    ],
    Propostas: [
      {
        ID: 'PROP-A',
        ID_EQUALIZACAO: 'EQ-2026-002',
        CNPJ: '11111222000133',
        VALOR_TOTAL_DECLARADO: 12000.00
      }
    ],
    Convites: [
      {
        _linha: 2,
        ID: 'CONV-001',
        ID_EQUALIZACAO: 'EQ-2026-002',
        CNPJ: '11111222000133',
        CONFIRMOU: true,
        APRESENTOU_PROPOSTA: false,
        MOTIVO_RECUSA: 'Pendente'
      }
    ]
  });

  ambiente.ctx.cfHomologar_('EQ-2026-002', 'PROP-A');

  // Não deve criar nova linha, e sim atualizar a linha existente
  assert.strictEqual(ambiente.base.Convites.length, 1, 'Não deve duplicar convite existente');
  const convAtualizado = ambiente.base.Convites[0];
  assert.strictEqual(convAtualizado.APRESENTOU_PROPOSTA, true, 'Deve ter atualizado para APRESENTOU_PROPOSTA = true');
  assert.strictEqual(convAtualizado.MOTIVO_RECUSA, '');

  console.log('✓ 2. Re-homologação atualiza registro de convite pré-existente sem duplicar');
})();

// ── Cenário 3: Resiliência contra erro na aba Convites
(function testarResilienciaErroConvites() {
  const ambiente = montarAmbiente({
    Equalizacoes: [
      {
        ID: 'EQ-2026-003',
        PROJETO: 'Aquisição de Bombas',
        STATUS: 'em_cotacao'
      }
    ],
    Propostas: [
      {
        ID: 'PROP-B',
        ID_EQUALIZACAO: 'EQ-2026-003',
        CNPJ: '99888777000166',
        VALOR_TOTAL_DECLARADO: 5000.00
      }
    ]
  });

  // Simula erro exclusivamente na leitura da aba Convites
  const lerOriginal = ambiente.ctx.cfLerTudo_;
  ambiente.ctx.cfLerTudo_ = function (nome) {
    if (nome === 'Convites') {
      throw new Error('Falha simulada de acesso à aba Convites');
    }
    return lerOriginal(nome);
  };

  // Homologação não pode estourar erro mesmo se Convites falhar
  let ret;
  assert.doesNotThrow(function () {
    ret = ambiente.ctx.cfHomologar_('EQ-2026-003', 'PROP-B');
  }, 'Erro em Convites não deve quebrar a homologação');

  assert.ok(ret && ret.id === 'EQ-2026-003');
  console.log('✓ 3. Resiliência garantida: falha em Convites é tratada com try/catch e log');
})();

console.log('🎉 Todos os testes de Comportamento de Cotação (Frente 1) passaram com 100% de sucesso!\n');
