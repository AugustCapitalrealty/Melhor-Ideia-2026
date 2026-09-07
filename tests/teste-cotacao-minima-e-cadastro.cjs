/**
 * Cotação mínima e cadastro de Megas/empresas.
 *
 * Dois buracos que este teste fecha, e o motivo de cada um:
 *
 *  1. Homologar R$ 80 mil com UMA proposta passava sem nenhum registro.
 *     É a primeira pergunta de qualquer comitê de governança e o sistema
 *     não tinha resposta. A faixa de cotações mínimas mora na aba
 *     `Regras` — que existia no schema desde a v1 e ninguém lia.
 *
 *  2. Os três Megas e as duas contratantes estavam cravados no programa.
 *     Abrir o quarto Mega exigia publicar código, o que contradiz o
 *     argumento de escala do projeto. Agora saem do cadastro, com as
 *     constantes valendo como semente e como rede.
 *
 * O que o teste NÃO deixa passar:
 *
 *  • Tabela `Regras` vazia virar exigência silenciosa. Sem regra
 *    cadastrada a homologação tem que continuar como estava — endurecer
 *    uma base legada pelas costas de quem a opera seria pior que o
 *    buraco.
 *  • O fallback do cadastro sumir. Base não semeada não pode abrir a tela
 *    sem Mega nenhum.
 *  • Curitiba deixar de ser Demercado, ou Esteio/Itajaí deixarem de ser
 *    Capital Realty. É regra de negócio, não detalhe de implementação.
 *  • A semeadura sobrescrever ou duplicar o que a operação cadastrou.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando a cotação mínima e o cadastro de Megas e empresas...');

const root = path.resolve(__dirname, '..');
const DEMERCADO = '08601964000105';
const CAPITAL = '03015145000154';

/**
 * Monta um contexto com os arquivos de produção e as abas que o teste
 * quiser. `tabelas` é a base: o que não estiver ali é aba vazia.
 */
function montar(tabelas, opcoes) {
  const cfg = opcoes || {};
  const ctx = vm.createContext({ Logger: { log: function () {} }, console: console, JSON: JSON });

  ctx.SpreadsheetApp = { getActiveSpreadsheet: function () { return null; } };
  ctx.PropertiesService = {
    getScriptProperties: function () {
      return { getProperty: function () { return null; }, setProperty: function () {} };
    }
  };
  ctx.Session = { getActiveUser: function () { return { getEmail: function () { return 'quem.logou@capitalrealty.com.br'; } }; } };
  ctx.Utilities = { formatDate: function () { return '20260907'; }, getUuid: function () { return 'aaaa-bbbb'; } };

  ['Util.gs', 'Config.gs', 'Cnpj.gs', 'Avaliacao.gs', 'Equalizacao.gs', 'Manutencao.gs'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', f), 'utf8'), ctx, { filename: f });
  });

  // `const` de topo não vira propriedade do contexto no node:vm — é
  // preciso exportar à mão o que o teste quer inspecionar.
  vm.runInContext(
    'globalThis.__REGRAS_PADRAO = CF_REGRAS_COTACAO_PADRAO;' +
    'globalThis.__MEGAS_CONST = CF_EMPREENDIMENTOS;',
    ctx, { filename: 'export-consts.js' }
  );

  const base = tabelas || {};
  const atualizado = [];

  // Dublês DEPOIS do load: declaração de função sobrescreve propriedade
  // do contexto, e estes arquivos declaram várias.
  ctx.cfLerTudo_ = function (nome) {
    if (cfg.abasAusentes && cfg.abasAusentes.indexOf(nome) >= 0) {
      throw new Error('Aba "' + nome + '" não existe. Rode setupBaseDeDados().');
    }
    return (base[nome] || []).map(function (l, i) {
      return Object.assign({ _linha: i + 2 }, l);
    });
  };
  ctx.cfInserir_ = function (nome, linhas) {
    base[nome] = (base[nome] || []).concat(linhas.map(function (l) { return Object.assign({}, l); }));
    return linhas.length;
  };
  ctx.cfAtualizarLinha_ = function (aba, linha, campos) { atualizado.push({ aba: aba, linha: linha, campos: campos }); };
  ctx.cfApagarPor_ = function () { return 0; };
  ctx.cfComTrava_ = function (fn) { return fn(); };
  ctx.cfLog_ = function () {};
  ctx.cfUsuario_ = function () { return 'quem.logou@capitalrealty.com.br'; };
  ctx.cfNovoId_ = function (p) { return p + '-1'; };
  ctx.cfPlanilha_ = function () { throw new Error('teste não fala com a planilha'); };
  ctx.setupBaseDeDados = function () { return { avisos: [] }; };

  ctx.cfLimparCacheCadastro_();
  return { ctx: ctx, base: base, atualizado: atualizado };
}

/** Uma equalização de uma proposta só, do tamanho que se quiser. */
function comPropostas(valores) {
  return {
    Equalizacoes: [{ ID: 'EQ1', STATUS: 'em_cotacao', CNPJ_EMPRESA: DEMERCADO }],
    Propostas: valores.map(function (v, i) {
      return {
        ID: 'P' + (i + 1), ID_EQUALIZACAO: 'EQ1',
        CNPJ: '1122233300018' + i,
        VALOR_TOTAL_DECLARADO: v,
        VENCEDORA: false
      };
    })
  };
}

// ─────────────────────────────────────────────────────────────
//  1. Sem regra cadastrada, nada muda
//
//  A regra é da tabela. Base não semeada tem que homologar como sempre
//  homologou — inclusive R$ 80 mil com uma proposta só. Ligar a exigência
//  por padrão travaria bases legadas inteiras no dia da publicação.
// ─────────────────────────────────────────────────────────────
{
  const a = montar(comPropostas([80000]));
  const r = a.ctx.cfHomologar_('EQ1', 'P1', '');
  assert.equal(r.valor, 80000, 'sem regra na tabela a homologação tem que passar como antes');
}

// ─────────────────────────────────────────────────────────────
//  2. Com a semente, R$ 80 mil com uma proposta só é barrado
// ─────────────────────────────────────────────────────────────
{
  const dados = comPropostas([80000]);
  const a = montar(dados);
  dados.Regras = a.ctx.__REGRAS_PADRAO;
  a.ctx.cfLimparCacheCadastro_();

  assert.throws(
    function () { a.ctx.cfHomologar_('EQ1', 'P1', ''); },
    /cotaç/i,
    'homologou R$ 80 mil com uma cotação só, sem justificativa nenhuma'
  );

  // A mensagem tem que dizer quantas há e quantas a faixa pede — "não
  // permitido" sozinho não diz a quem lê o que fazer a respeito.
  let msg = '';
  try { a.ctx.cfHomologar_('EQ1', 'P1', ''); } catch (e) { msg = e.message; }
  assert.ok(/1 cotaç/.test(msg), 'a recusa não diz quantas cotações existem: ' + msg);
  assert.ok(/exige 3/.test(msg), 'a recusa não diz quantas a faixa exige: ' + msg);

  // Justificativa escrita libera, igual à proposta mais cara e à cesta
  // parcial. Mesmo mecanismo, não um novo.
  const r = a.ctx.cfHomologar_('EQ1', 'P1', 'Fornecedor único homologado pela engenharia; os outros dois não atendem a praça.');
  assert.equal(r.valor, 80000, 'com justificativa a homologação tem que passar');
}

// ─────────────────────────────────────────────────────────────
//  3. As faixas da semente cobrem a reta inteira, sem buraco e sem
//     sobreposição
//
//  Buraco na faixa é regra que some justamente no valor que ninguém
//  testou. Sobreposição é duas respostas para a mesma pergunta.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({ Regras: null });
  a.base.Regras = a.ctx.__REGRAS_PADRAO;
  a.ctx.cfLimparCacheCadastro_();

  const esperado = [
    [0, 1], [1, 1], [999.99, 1],
    [1000, 3], [5000, 3], [9999.99, 3],
    [10000, 3], [80000, 3], [1000000000, 3]
  ];
  esperado.forEach(function (par) {
    const regra = a.ctx.cfRegraCotacao_(par[0], DEMERCADO);
    assert.ok(regra, 'nenhuma faixa cobre o valor ' + par[0]);
    assert.equal(regra.minimo, par[1], 'faixa errada para o valor ' + par[0]);
  });

  // R$ 1.000 é a fronteira: fecha embaixo, abre em cima. Tem que cair na
  // faixa de cima, e em uma só.
  assert.equal(a.ctx.cfRegraCotacao_(1000, '').id, 'REG-COT-002',
    'o valor exatamente na fronteira caiu na faixa errada');
}

// ─────────────────────────────────────────────────────────────
//  4. Proposta sem preço não é cotação
//
//  Convidar cinco e receber um orçamento é uma cotação, não cinco. Contar
//  a linha vazia como cotação transformaria a regra em teatro.
// ─────────────────────────────────────────────────────────────
{
  const dados = comPropostas([80000, null, '']);
  const a = montar(dados);
  dados.Regras = a.ctx.__REGRAS_PADRAO;
  a.ctx.cfLimparCacheCadastro_();

  assert.throws(
    function () { a.ctx.cfHomologar_('EQ1', 'P1', ''); },
    /1 cotaç/,
    'contou proposta sem preço como cotação'
  );
}

// ─────────────────────────────────────────────────────────────
//  5. Três cotações de verdade passam sem justificativa
// ─────────────────────────────────────────────────────────────
{
  const dados = comPropostas([80000, 90000, 95000]);
  const a = montar(dados);
  dados.Regras = a.ctx.__REGRAS_PADRAO;
  a.ctx.cfLimparCacheCadastro_();

  const r = a.ctx.cfHomologar_('EQ1', 'P1', '');
  assert.equal(r.eraMenor, true, 'com três cotações e a mais barata escolhida, nada a justificar');
}

// ─────────────────────────────────────────────────────────────
//  6. Faixa de baixo valor não pede três
//
//  Se pedisse, a regra seria abandonada na primeira semana: ninguém cota
//  três vezes um pacote de café.
// ─────────────────────────────────────────────────────────────
{
  const dados = comPropostas([450]);
  const a = montar(dados);
  dados.Regras = a.ctx.__REGRAS_PADRAO;
  a.ctx.cfLimparCacheCadastro_();

  const r = a.ctx.cfHomologar_('EQ1', 'P1', '');
  assert.equal(r.valor, 450, 'compra de R$ 450 com uma cotação tem que passar');
}

// ─────────────────────────────────────────────────────────────
//  7. As colunas da aba mandam: ATIVA, PERMITE_EXCECAO e CNPJ_EMPRESA
//
//  É o ponto inteiro da regra estar em tabela. Se estas colunas não
//  fizerem nada, a tabela é decoração e o número continua no código.
// ─────────────────────────────────────────────────────────────
{
  // ATIVA desmarcada = regra desligada.
  const dadosOff = comPropostas([80000]);
  const aOff = montar(dadosOff);
  dadosOff.Regras = [{ ID: 'R1', CNPJ_EMPRESA: '', VALOR_DE: 0, VALOR_ATE: '',
                       COTACOES_MINIMAS: 3, PERMITE_EXCECAO: true, ATIVA: false }];
  aOff.ctx.cfLimparCacheCadastro_();
  assert.equal(aOff.ctx.cfRegraCotacao_(80000, DEMERCADO), null,
    'regra com ATIVA desmarcada continuou valendo');

  // PERMITE_EXCECAO desmarcada = bloqueio duro, com parecer ou sem.
  const dadosDuro = comPropostas([80000]);
  const aDuro = montar(dadosDuro);
  dadosDuro.Regras = [{ ID: 'R1', CNPJ_EMPRESA: '', VALOR_DE: 0, VALOR_ATE: '',
                        COTACOES_MINIMAS: 3, PERMITE_EXCECAO: false, ATIVA: true }];
  aDuro.ctx.cfLimparCacheCadastro_();
  assert.throws(
    function () { aDuro.ctx.cfHomologar_('EQ1', 'P1', 'Justificativa longa e bem escrita.'); },
    /não admite exceção/,
    'a faixa sem exceção aceitou parecer como se fosse exceção'
  );

  // Regra da empresa ganha da genérica.
  const dadosEmp = comPropostas([80000]);
  const aEmp = montar(dadosEmp);
  dadosEmp.Regras = [
    { ID: 'GERAL', CNPJ_EMPRESA: '', VALOR_DE: 0, VALOR_ATE: '',
      COTACOES_MINIMAS: 3, PERMITE_EXCECAO: true, ATIVA: true },
    { ID: 'SO-DEMERCADO', CNPJ_EMPRESA: DEMERCADO, VALOR_DE: 0, VALOR_ATE: '',
      COTACOES_MINIMAS: 1, PERMITE_EXCECAO: true, ATIVA: true }
  ];
  aEmp.ctx.cfLimparCacheCadastro_();
  assert.equal(aEmp.ctx.cfRegraCotacao_(80000, DEMERCADO).id, 'SO-DEMERCADO',
    'a regra escrita para a empresa perdeu para a genérica');
  assert.equal(aEmp.ctx.cfRegraCotacao_(80000, CAPITAL).id, 'GERAL',
    'a regra de outra empresa vazou para esta');
}

// ─────────────────────────────────────────────────────────────
//  8. Cadastro vazio: as constantes continuam respondendo
//
//  Base ainda não semeada não pode abrir a tela sem Mega nenhum, e a
//  empresa contratante não pode sair em branco na exportação.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({});
  assert.deepEqual(a.ctx.cfEmpreendimentos_(), a.ctx.__MEGAS_CONST,
    'cadastro vazio deixou a tela sem Megas');
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CURITIBA').cnpj, DEMERCADO);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ESTEIO').cnpj, CAPITAL);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL);
  assert.ok(/DEMERCADO/.test(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CURITIBA').nome));
}

// ─────────────────────────────────────────────────────────────
//  9. Aba inexistente também cai na rede
//
//  Instalação anterior ao schema atual não tem a aba, e cfLerTudo_ lança.
//  Cadastro faltando não pode derrubar a homologação.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({}, { abasAusentes: ['Empreendimentos', 'Empresas', 'Regras'] });
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL,
    'aba ausente derrubou a derivação da empresa contratante');
  assert.equal(a.ctx.cfEmpreendimentos_().length, 3);
}

// ─────────────────────────────────────────────────────────────
//  10. O quarto Mega entra sem publicar código
//
//  É o argumento de escala do projeto (Obras, Demercado, 2027) inteiro.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({
    Empreendimentos: [
      { ID: 'MEGA CENTRO LOGÍSTICO CURITIBA', NOME: 'MEGA CENTRO LOGÍSTICO CURITIBA',
        APELIDOS: 'MEGA CURITIBA', CNPJ_EMPRESA: DEMERCADO, ATIVO: true },
      { ID: 'MEGA CENTRO LOGÍSTICO ESTEIO', NOME: 'MEGA CENTRO LOGÍSTICO ESTEIO',
        APELIDOS: '', CNPJ_EMPRESA: CAPITAL, ATIVO: true },
      { ID: 'MEGA CENTRO LOGÍSTICO ITAJAÍ', NOME: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
        APELIDOS: '', CNPJ_EMPRESA: CAPITAL, ATIVO: true },
      { ID: 'MEGA CENTRO LOGÍSTICO CANOAS', NOME: 'MEGA CENTRO LOGÍSTICO CANOAS',
        APELIDOS: 'MEGA CANOAS', CNPJ_EMPRESA: DEMERCADO, ATIVO: true },
      { ID: 'MEGA DESATIVADO', NOME: 'MEGA DESATIVADO', APELIDOS: '',
        CNPJ_EMPRESA: CAPITAL, ATIVO: false }
    ],
    Empresas: [
      { CNPJ: DEMERCADO, RAZAO_SOCIAL: 'DEMERCADO INVESTIMENTOS S.A.', ATIVA: true },
      { CNPJ: CAPITAL, RAZAO_SOCIAL: 'CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA', ATIVA: true }
    ]
  });

  const megas = a.ctx.cfEmpreendimentos_();
  assert.equal(megas.length, 4, 'o Mega novo não apareceu, ou o desativado apareceu: ' + megas.join(' · '));
  assert.ok(megas.indexOf('MEGA CENTRO LOGÍSTICO CANOAS') >= 0, 'o quarto Mega cadastrado não chegou à tela');
  assert.ok(megas.indexOf('MEGA DESATIVADO') < 0, 'Mega com ATIVO desmarcado apareceu na tela');

  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CANOAS').cnpj, DEMERCADO,
    'a contratante do Mega novo não veio do cadastro');

  // A regra de negócio não muda de dono ao mudar de fonte.
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CURITIBA').cnpj, DEMERCADO);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ESTEIO').cnpj, CAPITAL);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL);

  // E a equalização criada no Mega novo grava a contratante certa.
  a.ctx.cfCriarEqualizacao_({
    empreendimento: 'MEGA CENTRO LOGÍSTICO CANOAS',
    proponentes: [{ nome: 'Alfa', cnpj: '11222333000181' }],
    itens: [{ tipo: 'item', nivel: 0, descricao: 'Serviço', precos: ['100'] }]
  });
  const criada = (a.base.Equalizacoes || []).filter(function (e) {
    return e.ID_EMPREENDIMENTO === 'MEGA CENTRO LOGÍSTICO CANOAS';
  })[0];
  assert.ok(criada, 'a equalização no Mega novo foi recusada');
  assert.equal(criada.CNPJ_EMPRESA, DEMERCADO, 'a contratante do Mega novo não foi derivada');
}

// ─────────────────────────────────────────────────────────────
//  11. Cadastro que não conhece o Mega ainda cai na constante
//
//  O fallback é por ausência de RESPOSTA, não por tabela vazia. Um
//  cadastro pela metade não pode apagar os Megas que ele não listou.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({
    Empreendimentos: [
      { ID: 'MEGA CENTRO LOGÍSTICO CURITIBA', NOME: 'MEGA CENTRO LOGÍSTICO CURITIBA',
        APELIDOS: '', CNPJ_EMPRESA: DEMERCADO, ATIVO: true }
    ]
  });
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL,
    'Mega fora do cadastro pela metade perdeu a contratante');

  // Coluna booleana em branco não desliga: a validação de checkbox deixa
  // a coluna inteira em FALSE e ninguém pode ver o Mega sumir por isso.
  const b = montar({
    Empreendimentos: [
      { ID: 'MEGA NOVO', NOME: 'MEGA NOVO', APELIDOS: '', CNPJ_EMPRESA: CAPITAL, ATIVO: '' }
    ]
  });
  assert.deepEqual(b.ctx.cfEmpreendimentos_(), ['MEGA NOVO'],
    'ATIVO em branco escondeu o Mega recém-digitado');
}

// ─────────────────────────────────────────────────────────────
//  12. Semeadura: preenche só o que está vazio, e não duplica
// ─────────────────────────────────────────────────────────────
{
  const a = montar({});
  const primeira = a.ctx.cfSemearCadastros_(true);

  assert.equal(a.base.Empresas.length, 2, 'as duas contratantes não foram semeadas');
  assert.equal(a.base.Empreendimentos.length, 3, 'os três Megas não foram semeados');
  assert.equal(a.base.Regras.length, 3, 'as três faixas de cotação não foram semeadas');
  assert.equal(primeira.inseridas, 8);

  // Idempotente: a segunda passada encontra as linhas da primeira.
  const segunda = a.ctx.cfSemearCadastros_(true);
  assert.equal(segunda.inseridas, 0, 'semear duas vezes duplicou o cadastro');
  assert.equal(a.base.Empreendimentos.length, 3);
  assert.equal(a.base.Regras.length, 3);

  // E o que foi semeado é o que o sistema passa a ler — sem publicar
  // código, sem reiniciar nada.
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO CURITIBA').cnpj, DEMERCADO);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ESTEIO').cnpj, CAPITAL);
  assert.equal(a.ctx.cfEmpresaDoMega_('MEGA CENTRO LOGÍSTICO ITAJAÍ').cnpj, CAPITAL);
  assert.equal(a.ctx.cfRegraCotacao_(80000, DEMERCADO).minimo, 3,
    'a faixa semeada não passou a valer na mesma execução (cache não foi limpo)');
}

// ─────────────────────────────────────────────────────────────
//  13. Semeadura nunca sobrescreve o que a operação cadastrou
//
//  Cadastro de quem opera vale mais que semente de quem programou —
//  inclusive, e principalmente, quando divergem.
// ─────────────────────────────────────────────────────────────
{
  const a = montar({
    Empreendimentos: [
      { ID: 'MEGA CENTRO LOGÍSTICO CURITIBA', NOME: 'MEGA CENTRO LOGÍSTICO CURITIBA',
        APELIDOS: 'ajustado à mão', CNPJ_EMPRESA: DEMERCADO, ATIVO: true }
    ],
    Regras: [
      { ID: 'R-DA-CASA', CNPJ_EMPRESA: '', VALOR_DE: 0, VALOR_ATE: '',
        COTACOES_MINIMAS: 2, PERMITE_EXCECAO: true, ATIVA: true }
    ]
  });

  const r = a.ctx.cfSemearCadastros_(true);
  assert.equal(a.base.Empreendimentos.length, 1, 'a semeadura acrescentou linhas a uma aba já cadastrada');
  assert.equal(a.base.Empreendimentos[0].APELIDOS, 'ajustado à mão', 'a semeadura sobrescreveu o cadastro da operação');
  assert.equal(a.base.Regras.length, 1, 'a semeadura acrescentou faixas às que já existiam');
  assert.equal(a.base.Regras[0].ID, 'R-DA-CASA');
  assert.equal(r.abas.filter(function (x) { return x.tabela === 'Empresas'; })[0].inseridas, 2,
    'a aba que estava vazia deveria ter sido semeada mesmo assim');

  // A simulação não escreve nada.
  const b = montar({});
  b.ctx.cfSemearCadastros_(false);
  assert.equal(b.base.Empresas, undefined, 'a simulação escreveu na planilha');
}

console.log('OK: cotação mínima lida da aba Regras, Megas e empresas em cadastro com as constantes de rede.');
