/**
 * O IQF — a nota do fornecedor depois do serviço.
 *
 * A equalização sabe quem foi mais barato. Ela não sabe quem entregou no
 * prazo nem quem sumiu quando deu problema. Sem essa memória, "menor
 * preço" é a única coisa que a empresa lembra, e quem atrasou duas obras
 * ganha a terceira.
 *
 * O que este teste protege, em ordem de gravidade:
 *
 *  1. O avaliador vem do LOGIN, nunca do formulário. Campo de texto para
 *     "quem avaliou" num registro que decide contratação futura é convite
 *     a assinar em nome de outra pessoa.
 *  2. A NOTA de cada avaliação é gravada. Se um sexto critério entrar
 *     amanhã, o passado não pode se reescrever sozinho.
 *  3. O IQF é calculado na leitura. Média guardada em Fornecedores
 *     envelheceria calada.
 *  4. Nota com uma avaliação só sai marcada como preliminar.
 *  5. A fila de pendentes não repete quem já foi avaliado — senão ela
 *     nunca esvazia e as pessoas param de olhar.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando o IQF e a avaliação pós-serviço...');

const root = path.resolve(__dirname, '..');

function montar(dados) {
  const gravado = [];
  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console, JSON: JSON });

  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return { getProperty: function () { return null; }, setProperty: function () {} };
    }
  };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'quem.logou@capitalrealty.com.br'; } }; } };
  ctx.Utilities = { formatDate: function () { return '07/09/2026'; }, getUuid: function () { return 'uuid'; } };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Avaliacao.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  // Dublês DEPOIS do load: declaração de função sobrescreve propriedade
  // do contexto, e estes arquivos declaram várias.
  ctx.cfLerTudo_ = function (nome) { return dados[nome] || []; };
  ctx.cfInserir_ = function (nome, linhas) {
    linhas.forEach(function (l) { gravado.push({ aba: nome, linha: l }); });
    return linhas.length;
  };
  ctx.cfLog_ = function () {};
  ctx.cfUsuario_ = function () { return 'quem.logou@capitalrealty.com.br'; };
  ctx.cfNovoId_ = function (p) { return p + '-1'; };
  ctx.cfDataTexto_ = function (d) {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
  };

  return { ctx: ctx, gravado: gravado };
}

const notasBoas = { prazo: 5, qualidade: 4, conformidade: 4, atendimento: 5, documentacao: 2 };

// ── 1. A média é gravada, e é a média mesmo
{
  const a = montar({});
  const r = a.ctx.cfSalvarAvaliacao_(Object.assign({
    cnpj: '11.222.333/0001-81', idEqualizacao: 'EQ1', papel: 'gestor_mega',
    recontrataria: true, comentario: 'entregou, mas a NF atrasou'
  }, notasBoas));

  // (5 + 4 + 4 + 5 + 2) / 5 = 4
  assert.equal(r.nota, 4, 'a nota da avaliação é a média dos cinco critérios, e saiu ' + r.nota);

  assert.equal(a.gravado.length, 1, 'a avaliação precisa ser gravada');
  const l = a.gravado[0].linha;
  assert.equal(a.gravado[0].aba, 'Avaliacoes');
  assert.equal(l.NOTA, 4, 'a nota tem que ir GRAVADA: critério novo amanhã não pode reescrever o passado');
  assert.equal(l.CNPJ, '11222333000181', 'o CNPJ é gravado só com dígitos');
  assert.equal(l.PRAZO, 5);
  assert.equal(l.DOCUMENTACAO, 2);
  assert.equal(l.RECONTRATARIA, true);
  assert.equal(l.PAPEL_AVALIADOR, 'gestor_mega');
}

// ── 2. O avaliador vem do login, e não do que mandaram
{
  const a = montar({});
  a.ctx.cfSalvarAvaliacao_(Object.assign({
    cnpj: '11222333000181',
    AVALIADOR: 'outra.pessoa@exemplo.com',
    avaliador: 'outra.pessoa@exemplo.com'
  }, notasBoas));

  assert.equal(a.gravado[0].linha.AVALIADOR, 'quem.logou@capitalrealty.com.br',
    'o avaliador precisa vir do login — quem manda a chamada não escolhe em nome de quem assina');
}

// ── 3. Papel desconhecido não entra como se fosse válido
{
  const a = montar({});
  a.ctx.cfSalvarAvaliacao_(Object.assign({ cnpj: '11222333000181', papel: 'diretor_supremo' }, notasBoas));
  assert.equal(a.gravado[0].linha.PAPEL_AVALIADOR, 'outro',
    'papel fora do enum precisa cair em "outro", não entrar cru na planilha');
}

// ── 4. Nota fora da escala é recusada
{
  const a = montar({});
  [0, 6, 3.5, '', null, 'ótimo'].forEach(function (ruim) {
    assert.throws(
      function () { a.ctx.cfSalvarAvaliacao_(Object.assign({}, notasBoas, { cnpj: '11222333000181', prazo: ruim })); },
      /1 a 5/,
      'nota "' + ruim + '" tinha que ser recusada'
    );
  });
  assert.throws(function () { a.ctx.cfSalvarAvaliacao_(notasBoas); }, /CNPJ/,
    'avaliação sem CNPJ não sabe quem está avaliando');
  assert.equal(a.gravado.length, 0, 'nada pode ter sido gravado nas tentativas recusadas');
}

// ── 5. O IQF é a média das avaliações, com a contagem junto
{
  const ava = function (cnpj, nota, recontrataria, data) {
    return { ID: 'A', CNPJ: cnpj, NOTA: nota, RECONTRATARIA: recontrataria,
             DATA_AVALIACAO: data, PRAZO: nota, QUALIDADE: nota,
             CONFORMIDADE: nota, ATENDIMENTO: nota, DOCUMENTACAO: nota };
  };
  const a = montar({
    Avaliacoes: [
      ava('11222333000181', 5, true, '2026-08-01'),
      ava('11222333000181', 3, false, '2026-09-01'),
      ava('11222333000181', 4, true, '2026-07-01'),
      ava('99888777000166', 2, false, '2026-09-05')
    ]
  });

  const iqfs = a.ctx.cfIqfPorCnpj_();

  assert.equal(iqfs['11222333000181'].nota, 4, 'a média de 5, 3 e 4 é 4');
  assert.equal(iqfs['11222333000181'].avaliacoes, 3, 'a contagem tem que vir junto da nota');
  assert.equal(iqfs['11222333000181'].preliminar, false, 'três avaliações já não é preliminar');
  assert.equal(iqfs['11222333000181'].recontratariam, 2, 'dois dos três recontratariam');
  assert.equal(iqfs['11222333000181'].ultima, '2026-09-01', 'a última avaliação é a mais recente, não a última lida');

  assert.equal(iqfs['99888777000166'].preliminar, true,
    'uma avaliação só não vira índice — precisa sair marcada como preliminar');
  assert.equal(iqfs['99888777000166'].nota, 2, 'preliminar continua mostrando o número');
}

// ── 6. Fornecedor sem avaliação não vira nota zero
{
  const a = montar({ Avaliacoes: [] });
  const iqfs = a.ctx.cfIqfPorCnpj_();
  assert.equal(Object.keys(iqfs).length, 0, 'sem avaliação não existe entrada');
  assert.equal(iqfs['11222333000181'], undefined,
    '"sem nota" e "nota zero" são coisas diferentes, e a tela precisa distinguir');
}

// ── 7. A fila de pendentes: homologadas sem avaliação, e só elas
{
  const a = montar({
    Equalizacoes: [
      { ID: 'EQ1', STATUS: 'homologada', CNPJ_VENCEDOR: '11222333000181',
        ID_EMPREENDIMENTO: 'MEGA CURITIBA', PROJETO: 'Reposição', DATA_EQUALIZACAO: '2026-08-01' },
      { ID: 'EQ2', STATUS: 'homologada', CNPJ_VENCEDOR: '99888777000166',
        ID_EMPREENDIMENTO: 'MEGA ESTEIO', PROJETO: 'Obra', DATA_EQUALIZACAO: '2026-07-01' },
      { ID: 'EQ3', STATUS: 'em_cotacao', CNPJ_VENCEDOR: '', PROJETO: 'Em aberto' },
      { ID: 'EQ4', STATUS: 'homologada', CNPJ_VENCEDOR: '', PROJETO: 'Homologada sem vencedor gravado' }
    ],
    Avaliacoes: [{ ID: 'A1', CNPJ: '11222333000181', ID_EQUALIZACAO: 'EQ1', NOTA: 4 }],
    Fornecedores: [{ CNPJ: '99888777000166', RAZAO_SOCIAL: 'Beta Serviços' }]
  });

  const fila = a.ctx.cfAvaliacoesPendentes_();

  assert.equal(fila.length, 1, 'só a EQ2 está homologada, com vencedor e sem avaliação');
  assert.equal(fila[0].idEqualizacao, 'EQ2');
  assert.equal(fila[0].fornecedor, 'Beta Serviços', 'a fila precisa dizer o nome, não só o CNPJ');

  // A equalização já avaliada não pode voltar para a fila: uma fila que
  // nunca esvazia é uma fila que ninguém olha.
  assert.ok(!fila.some(function (p) { return p.idEqualizacao === 'EQ1'; }),
    'a EQ1 já foi avaliada e voltou para a fila');
}

console.log('OK: avaliador do login, nota gravada, IQF calculado com contagem e fila que esvazia.');
