// Diagnóstico local da avaliação de comprador/aprovador de 06/09/2026.
// Executa o código real com persistência e DOM simulados; não acessa Google/Drive.
// Asserções documentam problemas observados, NÃO critérios de comportamento correto.
// Não integrar ao npm test: após corrigir um achado, esta reprodução deve mudar.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app/Interface.html'), 'utf8');
const resultados = [];

function ambiente() {
  const db = {};
  const ctx = vm.createContext({ Logger: { log() {} } });
  for (const f of ['Util.gs', 'Config.gs', 'Equalizacao.gs', 'Exportar.gs']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  }
  let id = 0;
  ctx.cfNovoId_ = prefix => prefix + '-' + (++id);
  ctx.cfUsuario_ = () => 'comprador.ficticio@capitalrealty.com.br';
  ctx.cfComTrava_ = fn => fn();
  ctx.cfLerTudo_ = tabela => (db[tabela] || []).map((r, i) => ({ ...r, _linha: i + 2 }));
  ctx.cfInserir_ = (tabela, linhas) => {
    (db[tabela] ||= []).push(...linhas.map(r => ({ ...r })));
    return linhas.length;
  };
  ctx.cfApagarPor_ = (tabela, campo, valor) => {
    db[tabela] = (db[tabela] || []).filter(r => String(r[campo]) !== String(valor));
  };
  ctx.cfAtualizarLinha_ = (tabela, linha, campos) => Object.assign(db[tabela][linha - 2], campos);
  ctx.cfLog_ = () => {};
  ctx.cfCadastrarProponentes_ = () => {};
  ctx.cfRegistrarTempo_ = () => {};
  ctx.cfDataTexto_ = d => d instanceof Date ? d.toISOString().slice(0, 10) : String(d || '');
  ctx.cfCnpjFormatado_ = v => String(v || '');
  return { ctx, db };
}

function fornecedor(nome, cnpj = '') { return { nome, cnpj }; }
function item(precos, quantidade = 1, descricao = 'Item fictício') {
  return { tipo: 'item', nivel: 0, descricao, quantidade, unidade: 'un', precos };
}
function entrada(proponentes, itens) {
  return { empreendimento: 'MEGA CENTRO LOGÍSTICO CURITIBA', projeto: '::TESTE:: avaliação local',
    baseValores: 'unitario', proponentes, itens };
}
function observar(id, titulo, fn) {
  const evidencia = fn();
  resultados.push({ id, titulo, evidencia });
}
function carregarFuncao(ctx, nome) {
  const inicio = html.indexOf('function ' + nome + '(');
  assert.ok(inicio >= 0, nome + ' não encontrada');
  const fim = html.indexOf('\n}', inicio);
  assert.ok(fim > inicio, 'Fechamento de ' + nome + ' não encontrado');
  vm.runInContext(html.slice(inicio, fim + 2), ctx);
}
function resumo(ctx, mapa) {
  const grade = [];
  const vazia = () => Array(9).fill('');
  const linha = r => grade.push(r);
  ctx.cfBlocoScorecard_(mapa.equalizacao, mapa.proponentes, linha, vazia, grade, [], [],
    { titulo: [], cabecalho: [], destaque: [] }, 9, 2, 3);
  return grade;
}

observar('C01', 'Coluna sem fornecedor preserva o vínculo dos preços', () => {
  const { ctx, db } = ambiente();
  ctx.cfCriarEqualizacao_(entrada([fornecedor('Alfa'), fornecedor(''), fornecedor('Gama')],
    [item([100, 900, 300])]));
  const gama = db.Propostas.find(p => p.RAZAO_SOCIAL_INFORMADA === 'Gama');
  assert.equal(gama.VALOR_TOTAL_CALCULADO, 300);
  return { digitadoGama: 300, gravadoGama: gama.VALOR_TOTAL_CALCULADO };
});

observar('C02', 'Substituir fornecedor na mesma posição não herda a decisão', () => {
  const { ctx, db } = ambiente();
  const d = entrada([fornecedor('Alfa', '11111111000111'), fornecedor('Beta', '22222222000122')],
    [item([100, 200])]);
  const criada = ctx.cfCriarEqualizacao_(d);
  const idAnterior = db.Propostas[0].ID;
  ctx.cfHomologar_(criada.id, idAnterior, 'Escolha da Alfa');
  d.id = criada.id;
  d.proponentes[0] = fornecedor('Gama', '33333333000133');
  ctx.cfCriarEqualizacao_(d);
  const eq = db.Equalizacoes[0];
  assert.equal(eq.CNPJ_VENCEDOR, '');
  assert.equal(eq.PARECER_FAVORAVEL, '');
  assert.equal(eq.ID_PROPOSTA_VENCEDORA, '');
  assert.equal(eq.STATUS, 'em_cotacao');
  return { status: eq.STATUS, cnpjNaDecisao: eq.CNPJ_VENCEDOR, parecer: eq.PARECER_FAVORAVEL };
});

observar('C03', 'Cesta incompleta exige justificativa de adjudicação parcial', () => {
  const { ctx, db } = ambiente();
  const criada = ctx.cfCriarEqualizacao_(entrada([fornecedor('Parcial'), fornecedor('Completa')],
    [item([100, 120], 1, 'Material'), item(['', 80], 1, 'Instalação')]));
  const mapa = ctx.cfMapaEqualizacao_(criada.id);
  assert.throws(() => ctx.cfHomologar_(criada.id, db.Propostas[0].ID, ''), /cobertura parcial/i);
  const decisao = ctx.cfHomologar_(criada.id, db.Propostas[0].ID, 'Justificativa para compra parcial');
  assert.equal(decisao.valor, 100);
  return { coberturaParcial: '1/2 itens', valorParcial: 100,
    pendenciasNoMapa: mapa.pendencias.length, homologadaComJustificativa: db.Equalizacoes[0].STATUS === 'homologada' };
});

observar('C04', 'Proposta única sem preço não pode ser homologada', () => {
  const { ctx, db } = ambiente();
  const criada = ctx.cfCriarEqualizacao_(entrada([fornecedor('Sem retorno')], [item([''])]));
  assert.throws(() => ctx.cfHomologar_(criada.id, db.Propostas[0].ID, ''), /valor válido/i);
  return { status: db.Equalizacoes[0].STATUS, rejeitouHomologacaoSemValor: true };
});

observar('C05', 'Quantidade zero é tratada como zero', () => {
  const { ctx, db } = ambiente();
  ctx.cfCriarEqualizacao_(entrada([fornecedor('Alfa')], [item([100], 0)]));
  assert.equal(db.Precos[0].VALOR_TOTAL, 0);
  return { quantidadeGravada: db.Precos[0].QUANTIDADE, unitario: db.Precos[0].PRECO_UNITARIO,
    totalGravado: db.Precos[0].VALOR_TOTAL };
});

observar('C06', 'Preço negativo é rejeitado na homologação', () => {
  const { ctx, db } = ambiente();
  const criada = ctx.cfCriarEqualizacao_(entrada([fornecedor('Alfa')], [item([-100])]));
  assert.throws(() => ctx.cfHomologar_(criada.id, db.Propostas[0].ID, ''), /valor válido/i);
  return { rejeitouPrecoNegativo: true, status: db.Equalizacoes[0].STATUS };
});

observar('C07', 'Validade vencida exige justificativa na homologação', () => {
  const { ctx, db } = ambiente();
  const p = { ...fornecedor('Alfa'), validadeAte: '2000-01-01' };
  const criada = ctx.cfCriarEqualizacao_(entrada([p], [item([100])]));
  assert.throws(() => ctx.cfHomologar_(criada.id, db.Propostas[0].ID, ''), /validade vencida/i);
  const decisao = ctx.cfHomologar_(criada.id, db.Propostas[0].ID, 'Proposta revalidada por e-mail.');
  assert.equal(db.Equalizacoes[0].STATUS, 'homologada');
  return { validadeInformada: p.validadeAte, status: db.Equalizacoes[0].STATUS, parecer: db.Equalizacoes[0].PARECER_FAVORAVEL };
});

observar('C08', 'R02 define o valor vigente para a decisão e redução negociada', () => {
  const { ctx, db } = ambiente();
  const p = { ...fornecedor('Alfa'), totalDeclarado: 1000, propostaInicial: 1000, r01: 900, r02: 850 };
  carregarFuncao(ctx, 'num');
  carregarFuncao(ctx, 'textoReducao');
  ctx.moeda = v => String(v);
  const reducaoNaTela = ctx.textoReducao(p);
  assert.ok(reducaoNaTela.includes('150'));
  const criada = ctx.cfCriarEqualizacao_(entrada([p], [item([1000])]));
  const decisao = ctx.cfHomologar_(criada.id, db.Propostas[0].ID, '');
  assert.equal(db.Propostas[0].RODADA, 'R02');
  assert.equal(decisao.valor, 850);
  assert.equal(db.Propostas[0].REDUCAO_NEGOCIADA, 150);
  return { r02Digitada: 850, reducaoNaEdicao: 150, valorHomologado: decisao.valor,
    reducaoGravada: db.Propostas[0].REDUCAO_NEGOCIADA, rodadaGravada: db.Propostas[0].RODADA };
});

observar('C09', 'Notas Capital Realty são enviadas pelo botão Salvar', () => {
  const { ctx, db } = ambiente();
  const d = entrada([fornecedor('Alfa')], [item([100])]);
  let recebido;
  const campos = { nEmp: d.empreendimento, nProjeto: d.projeto, nArea: 'Facilities', nData: '2026-09-06',
    nGrupoCC: 'Teste', nDetalhamento: 'Material', nPremissas: 'Instalação inclusa',
    nNotasCr: 'Executar somente após liberação da operação.' };
  const elementos = Object.fromEntries(Object.entries(campos).map(([k, value]) => [k, { value }]));
  elementos.btSalvar = {};
  elementos.salvoMsg = {};
  ctx.document = { getElementById: id => elementos[id] };
  const run = { withSuccessHandler() { return run; }, withFailureHandler() { return run; },
    apiCriarEqualizacao(payload) { recebido = payload; } };
  ctx.google = { script: { run } };
  ctx.idEmEdicao = null;
  ctx.segundosDecorridos = () => 60;
  ctx.baseValores = () => 'unitario';
  ctx.proponentes = d.proponentes;
  ctx.itens = d.itens;
  carregarFuncao(ctx, 'salvarEqualizacao');
  ctx.salvarEqualizacao();
  assert.equal(recebido.notasCr, campos.nNotasCr);
  ctx.cfCriarEqualizacao_(recebido);
  assert.equal(db.Equalizacoes[0].NOTAS_CR, campos.nNotasCr);
  return { digitado: campos.nNotasCr, enviado: Object.hasOwn(recebido, 'notasCr'),
    gravado: db.Equalizacoes[0].NOTAS_CR };
});

observar('C10', 'Alterar valor mantém homologação e atualiza valor final', () => {
  const { ctx, db } = ambiente();
  const d = entrada([fornecedor('Alfa', '11111111000111')], [item([100])]);
  const criada = ctx.cfCriarEqualizacao_(d);
  ctx.cfHomologar_(criada.id, db.Propostas[0].ID, 'Valor de 100 analisado');
  d.id = criada.id;
  d.itens[0].precos[0] = 500;
  ctx.cfCriarEqualizacao_(d);
  assert.equal(db.Equalizacoes[0].VALOR_FINAL, 500);
  assert.equal(db.Equalizacoes[0].STATUS, 'homologada');
  return { valorAnterior: 100, valorAtual: 500, status: db.Equalizacoes[0].STATUS,
    parecerPreservado: db.Equalizacoes[0].PARECER_FAVORAVEL };
});

observar('C11', 'Histórico segrega unidade e caixa em séries separadas', () => {
  const { ctx } = ambiente();
  vm.runInContext(fs.readFileSync(path.join(root, 'app/Consulta.gs'), 'utf8'), ctx);
  const comum = { descricao: 'Item fictício', chave: 'item ficticio', status: 'cotado' };
  const r = ctx.cfAgruparPorItem_([
    { ...comum, idEqualizacao: 'E1', unidade: 'un', valor: 5, data: new Date('2026-08-01') },
    { ...comum, idEqualizacao: 'E2', unidade: 'cx', valor: 50, data: new Date('2026-09-01') }
  ], 'Item fictício');
  assert.equal(r.series.length, 0);
  return { series: r.series.length, basesSegregadas: true };
});

console.log(JSON.stringify({ metodo: 'Código local com armazenamento/DOM simulados; dados fictícios',
  total: resultados.length, resultados }, null, 2));
