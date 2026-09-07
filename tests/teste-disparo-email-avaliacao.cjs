/**
 * Validação do Disparo Ativo de E-mail para Avaliação Pós-Serviço / IQF.
 *
 * Testa:
 * 1. cfDispararNotificacaoAvaliacao_ (Avaliacao.gs):
 *    - Leitura do destinatário de EMAIL_AVALIACOES na aba Config
 *    - Fallback para Session.getActiveUser().getEmail()
 *    - Suporte a emailManual prioritário
 *    - Geração do link direto deep-link (?page=avaliacao&eq=...&cnpj=...)
 *    - Composição do e-mail HTML (fornecedor vencedor, valor homologado, IQF)
 *    - Disparo através do MailApp.sendEmail()
 * 2. Resiliência:
 *    - Retorno seguro quando não há destinatário configurado
 *    - Tratamento de exceção se MailApp falhar
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando Disparo de E-mail de Avaliação (IQF)...');

const root = path.resolve(__dirname, '..');

function montarAmbienteEmail(tabelasIniciais, usuarioLogado) {
  const base = Object.assign({
    Config: []
  }, tabelasIniciais || {});

  const emailsEnviados = [];

  const ctx = vm.createContext({
    console: console,
    Logger: { log: function () {} },
    JSON: JSON,
    encodeURIComponent: encodeURIComponent
  });

  ctx.MailApp = {
    sendEmail: function (params) {
      emailsEnviados.push(params);
    }
  };

  ctx.Session = {
    getActiveUser: function () {
      return {
        getEmail: function () {
          return usuarioLogado !== undefined ? usuarioLogado : 'comprador@capitalrealty.com.br';
        }
      };
    }
  };

  const arquivos = [
    'Util.gs',
    'Config.gs',
    'Avaliacao.gs'
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

  ctx.cfUrlPublicada_ = function () {
    return 'https://script.google.com/macros/s/AKfycbz_TESTE_URL/exec';
  };

  return { ctx: ctx, base: base, emailsEnviados: emailsEnviados };
}

// ── Cenário 1: Envio usando EMAIL_AVALIACOES da aba Config com deep-link
(function testarEnvioComConfig() {
  const amb = montarAmbienteEmail({
    Config: [
      { CHAVE: 'EMAIL_AVALIACOES', VALOR: 'gestor.facilities@capitalrealty.com.br' }
    ]
  });

  const eq = {
    ID: 'EQ-001',
    PROJETO: 'Reforma do Telhado Mega Esteio',
    ID_EMPREENDIMENTO: 'Mega Esteio',
    CNPJ_EMPRESA: '03015145000154',
    VALOR_FINAL: 85400.00
  };

  const escolhida = {
    ID: 'PROP-1',
    CNPJ: '04123456000199',
    RAZAO_SOCIAL_INFORMADA: 'Estruturas Metálicas do Sul Ltda',
    VALOR_TOTAL_DECLARADO: 85400.00
  };

  const res = amb.ctx.cfDispararNotificacaoAvaliacao_('EQ-001', escolhida, eq);
  assert.ok(res.ok, 'Disparo deve ser bem-sucedido');
  assert.strictEqual(res.destinatario, 'gestor.facilities@capitalrealty.com.br');
  assert.strictEqual(amb.emailsEnviados.length, 1, 'Deve ter enviado exatamente 1 e-mail');

  const enviado = amb.emailsEnviados[0];
  assert.strictEqual(enviado.to, 'gestor.facilities@capitalrealty.com.br');
  assert.ok(enviado.subject.indexOf('Estruturas Metálicas do Sul') >= 0, 'Assunto deve conter o fornecedor');
  assert.ok(enviado.subject.indexOf('Reforma do Telhado') >= 0, 'Assunto deve conter o projeto');

  // Validação do deep-link e conteúdo HTML
  assert.ok(enviado.htmlBody.indexOf('page=avaliacao&amp;eq=EQ-001&amp;cnpj=04123456000199') >= 0 || enviado.htmlBody.indexOf('page=avaliacao&eq=EQ-001&cnpj=04123456000199') >= 0, 'Deve conter link direto para avaliação');
  assert.ok(enviado.htmlBody.indexOf('R$ 85.400,00') >= 0, 'Deve exibir valor formatado');
  assert.ok(enviado.htmlBody.indexOf('IQF') >= 0, 'Deve mencionar o IQF');

  console.log('✓ 1. cfDispararNotificacaoAvaliacao_ envia e-mail executivo com deep-link usando Config');
})();

// ── Cenário 2: Fallback para o usuário logado no Session
(function testarEnvioFallbackSession() {
  const amb = montarAmbienteEmail({ Config: [] }, 'comprador.responsavel@capitalrealty.com.br');

  const eq = { ID: 'EQ-002', PROJETO: 'Compra de EPIs', ID_EMPREENDIMENTO: 'Mega Curitiba' };
  const escolhida = { ID: 'PROP-2', CNPJ: '11222333000144', RAZAO_SOCIAL_INFORMADA: 'EPI Sul' };

  const res = amb.ctx.cfDispararNotificacaoAvaliacao_('EQ-002', escolhida, eq);
  assert.ok(res.ok);
  assert.strictEqual(res.destinatario, 'comprador.responsavel@capitalrealty.com.br');
  assert.strictEqual(amb.emailsEnviados[0].to, 'comprador.responsavel@capitalrealty.com.br');

  console.log('✓ 2. Fallback funcional para e-mail da sessão quando Config não possui e-mail cadastrado');
})();

// ── Cenário 3: E-mail manual tem precedência máxima
(function testarEnvioManualPrioritario() {
  const amb = montarAmbienteEmail({
    Config: [{ CHAVE: 'EMAIL_AVALIACOES', VALOR: 'geral@capitalrealty.com.br' }]
  });

  const eq = { ID: 'EQ-003', PROJETO: 'CFTV Docas' };
  const escolhida = { ID: 'PROP-3', CNPJ: '22333444000155' };

  const res = amb.ctx.cfDispararNotificacaoAvaliacao_('EQ-003', escolhida, eq, 'diretor.operacoes@capitalrealty.com.br');
  assert.ok(res.ok);
  assert.strictEqual(res.destinatario, 'diretor.operacoes@capitalrealty.com.br');
  assert.strictEqual(amb.emailsEnviados[0].to, 'diretor.operacoes@capitalrealty.com.br');

  console.log('✓ 3. Parâmetro emailManual tem prioridade sobre configurações salvas');
})();

// ── Cenário 4: Retorno seguro quando não há e-mail
(function testarSemDestinatario() {
  const amb = montarAmbienteEmail({ Config: [] }, ''); // sem email no session

  const eq = { ID: 'EQ-004', PROJETO: 'Item sem email' };
  const escolhida = { ID: 'PROP-4', CNPJ: '33444555000166' };

  const res = amb.ctx.cfDispararNotificacaoAvaliacao_('EQ-004', escolhida, eq);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.motivo, 'sem_destinatario');
  assert.strictEqual(amb.emailsEnviados.length, 0, 'Não deve tentar enviar se não houver destinatário');

  console.log('✓ 4. Tratamento elegante de ausência de destinatário (sem lançar erro)');
})();

// ── Cenário 5: Tratamento de exceção de envio do MailApp
(function testarErroEnvio() {
  const amb = montarAmbienteEmail({ Config: [] });
  amb.ctx.MailApp.sendEmail = function () {
    throw new Error('Limite diário de envio de e-mails do Google atingido');
  };

  const eq = { ID: 'EQ-005', PROJETO: 'Item com erro MailApp' };
  const escolhida = { ID: 'PROP-5', CNPJ: '44555666000177' };

  const res = amb.ctx.cfDispararNotificacaoAvaliacao_('EQ-005', escolhida, eq);
  assert.strictEqual(res.ok, false);
  assert.ok(res.erro.indexOf('Limite diário') >= 0);

  console.log('✓ 5. Erro do MailApp capturado com segurança sem abortar fluxo principal');
})();

console.log('🎉 Todos os testes de Disparo de E-mail de Avaliação passaram com 100% de sucesso!\n');
