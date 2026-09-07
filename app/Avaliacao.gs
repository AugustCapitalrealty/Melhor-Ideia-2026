/**
 * A nota do fornecedor depois do serviço — o IQF.
 *
 * A equalização sabe quem foi mais barato. Ela não sabe quem entregou no
 * prazo, quem mandou a nota fiscal certa e quem sumiu quando deu
 * problema. Sem isso, "menor preço" é a única memória que a empresa tem,
 * e o fornecedor que atrasou duas obras volta a ganhar a terceira.
 *
 * Três decisões que valem ser ditas:
 *
 *  1. O IQF é CALCULADO na leitura, nunca gravado em Fornecedores. Uma
 *     média guardada envelhece calada: chega avaliação nova e o número
 *     na tela continua o antigo até alguém lembrar de recalcular.
 *
 *  2. A NOTA de cada avaliação, essa sim, é gravada. É a média dos cinco
 *     critérios COMO ELES ERAM no dia. Se amanhã entrar um sexto
 *     critério, o passado não pode se reescrever sozinho.
 *
 *  3. Nota com uma avaliação só não vira "4,8". Vira "4,8 · preliminar",
 *     porque uma opinião não é um índice — e um número preciso demais
 *     para o dado que tem por trás é pior que nenhum número: ele é
 *     usado para decidir.
 */

/** Os cinco critérios, na ordem em que o formulário pergunta. */
const CF_CRITERIOS_AVALIACAO = [
  { campo: 'PRAZO', chave: 'prazo', rotulo: 'Prazo',
    ajuda: 'Entregou na data combinada?' },
  { campo: 'QUALIDADE', chave: 'qualidade', rotulo: 'Qualidade',
    ajuda: 'O que entregou atendeu tecnicamente?' },
  { campo: 'CONFORMIDADE', chave: 'conformidade', rotulo: 'Conformidade',
    ajuda: 'Era o escopo e a marca contratados?' },
  { campo: 'ATENDIMENTO', chave: 'atendimento', rotulo: 'Atendimento',
    ajuda: 'Respondeu e resolveu quando deu problema?' },
  { campo: 'DOCUMENTACAO', chave: 'documentacao', rotulo: 'Documentação',
    ajuda: 'NF, certidões e prazos administrativos em dia?' }
];

/**
 * A partir de quantas avaliações a nota deixa de ser preliminar.
 *
 * Três é baixo de propósito. O rigor estatístico pediria mais, mas um
 * piloto de seis semanas não produz mais — e um índice que nunca sai do
 * "preliminar" é um índice que ninguém usa. O rótulo carrega a ressalva;
 * o número aparece desde a primeira.
 */
const CF_IQF_MINIMO_FIRME = 3;

/** As notas vão de 1 a 5. Fora disso é erro de quem chamou, não dado. */
function cfNotaValida_(v) {
  const n = Number(v);
  return isFinite(n) && n >= 1 && n <= 5 && Math.floor(n) === n;
}

/**
 * Grava uma avaliação.
 *
 * O avaliador NÃO vem do formulário: vem do login. Campo de texto para
 * "quem avaliou" num formulário que decide contratação futura é um
 * convite a preencher o nome de outra pessoa.
 */
function cfSalvarAvaliacao_(d) {
  if (!d) throw new Error('Nada recebido.');

  const cnpj = cfSoDigitos_(d.cnpj || '');
  if (!cnpj) throw new Error('Sem CNPJ não dá para saber quem está sendo avaliado.');

  const notas = {};
  CF_CRITERIOS_AVALIACAO.forEach(function (c) {
    const v = d[c.chave];
    if (!cfNotaValida_(v)) {
      throw new Error('A nota de "' + c.rotulo + '" precisa ser um número de 1 a 5.');
    }
    notas[c.campo] = Number(v);
  });

  const soma = CF_CRITERIOS_AVALIACAO.reduce(function (s, c) { return s + notas[c.campo]; }, 0);
  const media = Math.round((soma / CF_CRITERIOS_AVALIACAO.length) * 100) / 100;

  // "Contrataria de novo" não tem padrão.
  //
  // Antes, qualquer coisa que não fosse `true` virava `false` — então
  // quem não respondeu ficava gravado como quem disse NÃO. É a pergunta
  // que mais pesa na próxima compra, e silêncio não é reprovação.
  const recontrataria = (d.recontrataria === true || d.recontrataria === 'sim') ? true
    : (d.recontrataria === false || d.recontrataria === 'nao' || d.recontrataria === 'não') ? false
    : null;
  if (recontrataria === null) {
    throw new Error('Falta responder se contrataria este fornecedor de novo.');
  }

  const papel = CF_ENUM.papelAvaliador.indexOf(d.papel) >= 0 ? d.papel : 'outro';
  const agora = new Date();
  const id = cfNovoId_('AVA');

  const linha = {
    ID: id,
    CNPJ: cnpj,
    ID_EQUALIZACAO: d.idEqualizacao || '',
    ID_EMPREENDIMENTO: d.empreendimento || '',
    NUMERO_OC: d.numeroOc || '',
    DATA_AVALIACAO: agora,
    AVALIADOR: cfUsuario_(),
    PAPEL_AVALIADOR: papel,
    NOTA: media,
    RECONTRATARIA: recontrataria,
    COMENTARIO: String(d.comentario || '').trim(),
    CRIADO_EM: agora
  };
  CF_CRITERIOS_AVALIACAO.forEach(function (c) { linha[c.campo] = notas[c.campo]; });

  cfInserir_('Avaliacoes', [linha]);
  cfLog_('avaliou', 'Avaliacoes', id, 'CNPJ ' + cnpj + ' · nota ' + media);

  return { id: id, nota: media };
}

/** Uma avaliação da planilha vira o objeto que a tela entende. */
function cfAvaliacaoDaLinha_(a) {
  const criterios = {};
  CF_CRITERIOS_AVALIACAO.forEach(function (c) {
    criterios[c.chave] = cfNumero_(a[c.campo]);
  });
  return {
    id: a.ID,
    cnpj: cfSoDigitos_(a.CNPJ || ''),
    idEqualizacao: a.ID_EQUALIZACAO || '',
    empreendimento: a.ID_EMPREENDIMENTO || '',
    numeroOc: a.NUMERO_OC || '',
    data: cfDataTexto_(a.DATA_AVALIACAO),
    avaliador: a.AVALIADOR || '',
    papel: a.PAPEL_AVALIADOR || 'outro',
    nota: cfNumero_(a.NOTA),
    recontrataria: a.RECONTRATARIA === true || String(a.RECONTRATARIA).toLowerCase() === 'true',
    comentario: a.COMENTARIO || '',
    criterios: criterios
  };
}

/**
 * O IQF de cada fornecedor, numa leitura só.
 *
 * Uma função por CNPJ releria a aba inteira a cada chamada — com 40
 * fornecedores na lista, 40 leituras da mesma faixa.
 */
function cfIqfPorCnpj_() {
  const por = {};

  cfLerTudo_('Avaliacoes').forEach(function (a) {
    const cnpj = cfSoDigitos_(a.CNPJ || '');
    const nota = cfNumero_(a.NOTA);
    if (!cnpj || nota === null) return;

    if (!por[cnpj]) por[cnpj] = { soma: 0, n: 0, recontrataria: 0, ultima: null, criterios: {} };
    const g = por[cnpj];
    g.soma += nota;
    g.n++;
    if (a.RECONTRATARIA === true || String(a.RECONTRATARIA).toLowerCase() === 'true') {
      g.recontrataria++;
    }

    CF_CRITERIOS_AVALIACAO.forEach(function (c) {
      const v = cfNumero_(a[c.campo]);
      if (v === null) return;
      if (!g.criterios[c.chave]) g.criterios[c.chave] = { soma: 0, n: 0 };
      g.criterios[c.chave].soma += v;
      g.criterios[c.chave].n++;
    });

    const d = cfData_(a.DATA_AVALIACAO);
    if (d && (!g.ultima || d > g.ultima)) g.ultima = d;
  });

  const resultado = {};
  Object.keys(por).forEach(function (cnpj) {
    const g = por[cnpj];
    const criterios = {};
    Object.keys(g.criterios).forEach(function (k) {
      criterios[k] = Math.round((g.criterios[k].soma / g.criterios[k].n) * 100) / 100;
    });
    resultado[cnpj] = {
      nota: Math.round((g.soma / g.n) * 100) / 100,
      avaliacoes: g.n,
      preliminar: g.n < CF_IQF_MINIMO_FIRME,
      recontratariam: g.recontrataria,
      ultima: g.ultima ? cfDataTexto_(g.ultima) : '',
      criterios: criterios
    };
  });

  return resultado;
}

/** O IQF de um fornecedor só, com as avaliações que o formaram. */
function cfIqfDoFornecedor_(cnpj) {
  const chave = cfSoDigitos_(cnpj || '');
  if (!chave) return null;

  const avaliacoes = cfLerTudo_('Avaliacoes')
    .filter(function (a) { return cfSoDigitos_(a.CNPJ || '') === chave; })
    .map(cfAvaliacaoDaLinha_)
    .sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });

  const resumo = cfIqfPorCnpj_()[chave] || null;
  return { resumo: resumo, avaliacoes: avaliacoes };
}

/**
 * Compras homologadas que ainda não foram avaliadas.
 *
 * É a fila de trabalho da avaliação. Sem ela, avaliar depende de alguém
 * lembrar — e ninguém lembra: é justamente o que aconteceu com o fluxo
 * anterior, no Fluig, que tinha o formulário e não tinha a fila.
 */
function cfAvaliacoesPendentes_() {
  const jaAvaliadas = {};
  cfLerTudo_('Avaliacoes').forEach(function (a) {
    if (a.ID_EQUALIZACAO) jaAvaliadas[String(a.ID_EQUALIZACAO)] = true;
  });

  const nomePorCnpj = {};
  cfLerTudo_('Fornecedores').forEach(function (f) {
    nomePorCnpj[cfSoDigitos_(f.CNPJ || '')] = f.RAZAO_SOCIAL || f.NOME_FANTASIA || '';
  });

  return cfLerTudo_('Equalizacoes')
    .filter(function (e) {
      return String(e.STATUS || '') === 'homologada' &&
             e.CNPJ_VENCEDOR &&
             !jaAvaliadas[String(e.ID)];
    })
    .map(function (e) {
      const cnpj = cfSoDigitos_(e.CNPJ_VENCEDOR);
      return {
        idEqualizacao: e.ID,
        cnpj: cnpj,
        fornecedor: nomePorCnpj[cnpj] || cfCnpjFormatado_(cnpj),
        empreendimento: e.ID_EMPREENDIMENTO || '',
        projeto: e.PROJETO || '',
        numeroOc: e.NUMERO_OC || '',
        valor: cfNumero_(e.VALOR_FINAL),
        data: cfDataTexto_(e.DATA_EQUALIZACAO)
      };
    })
    .sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
}
