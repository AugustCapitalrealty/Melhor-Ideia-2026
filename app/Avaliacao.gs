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

/**
 * Os cinco critérios, com os pesos que o Comitê Avaliador recebeu.
 *
 * Estes cinco e estes pesos não são escolha nossa: são exatamente os que
 * foram enviados ao comitê na minuta de resposta, item 2. Uma versão
 * anterior deste arquivo trazia outros cinco, em média simples — tinha
 * trocado Segurança do Trabalho e Limpeza por Conformidade e
 * Documentação, e havia abandonado a ponderação. Um comitê que releia a
 * própria minuta ao lado do sistema veria os itens não baterem.
 *
 * Segurança do Trabalho pesa 20% de propósito: em condomínio logístico,
 * prestador que trabalha sem EPI é risco da CR, não do fornecedor. E
 * Limpeza entra porque é a reclamação que chega ao gestor do Mega no dia
 * seguinte, e é o tipo de coisa que nenhuma equalização captura.
 *
 * A ordem aqui é a ordem em que o formulário pergunta, e ela segue o
 * peso: quem responde rápido responde melhor o que vem primeiro.
 */
const CF_CRITERIOS_AVALIACAO = [
  { campo: 'QUALIDADE', chave: 'qualidade', rotulo: 'Qualidade técnica e acabamento', peso: 30,
    ajuda: 'A entrega atendeu ao escopo e ao padrão técnico do Mega?' },
  { campo: 'PRAZO', chave: 'prazo', rotulo: 'Pontualidade e cumprimento de SLA', peso: 25,
    ajuda: 'Cumpriu o cronograma e os prazos acordados?' },
  { campo: 'SEGURANCA', chave: 'seguranca', rotulo: 'Segurança do trabalho e SST', peso: 20,
    ajuda: 'Usou EPI, seguiu as normas e apresentou a documentação de segurança?' },
  { campo: 'ATENDIMENTO', chave: 'atendimento', rotulo: 'Atendimento, postura e comunicação', peso: 15,
    ajuda: 'Respondeu, se relacionou bem com a equipe e resolveu pendências?' },
  { campo: 'LIMPEZA', chave: 'limpeza', rotulo: 'Limpeza e organização', peso: 10,
    ajuda: 'Deixou a área limpa e organizada depois da execução?' }
];

/**
 * A versão do conjunto de critérios.
 *
 * A 1 foi a que existiu por poucas horas: cinco critérios em média
 * simples, na escala 1-5, com Conformidade e Documentação no lugar de
 * Segurança e Limpeza. Se houver avaliação gravada com ela, ela fica —
 * apagar seria pior. Ela só não entra na mesma média.
 */
const CF_VERSAO_CRITERIOS = 2;

/** Os pesos têm de somar 100 — se alguém mexer, isto avisa na hora. */
const CF_PESO_TOTAL_AVALIACAO = CF_CRITERIOS_AVALIACAO.reduce(
  function (s, c) { return s + c.peso; }, 0);

/**
 * As faixas do IQF, na escala 0 a 100.
 *
 * A minuta ao comitê descreve o IQF em classes A, B e C — e classe é
 * mais útil que número solto numa reunião de decisão: "Classe C" se
 * discute, "72,4" não.
 */
const CF_CLASSES_IQF = [
  { classe: 'A', minimo: 85, rotulo: 'Preferencial' },
  { classe: 'B', minimo: 70, rotulo: 'Aprovado' },
  { classe: 'C', minimo: 0,  rotulo: 'Sob restrição' }
];

/** A classe de uma nota de 0 a 100. */
function cfClasseIqf_(nota100) {
  if (nota100 === null || nota100 === undefined || !isFinite(nota100)) return null;
  for (let i = 0; i < CF_CLASSES_IQF.length; i++) {
    if (nota100 >= CF_CLASSES_IQF[i].minimo) return CF_CLASSES_IQF[i];
  }
  return CF_CLASSES_IQF[CF_CLASSES_IQF.length - 1];
}

/**
 * A nota ponderada de uma avaliação, de 0 a 100.
 *
 * Cada critério vem de 1 a 5 — é o que se responde rápido no celular.
 * A conversão para 0-100 é linear com 1 valendo zero: um serviço
 * "péssimo" em tudo tem de dar 0, não 20. Fosse `nota/5`, o pior
 * fornecedor possível sairia com 20 pontos e Classe C viraria o piso de
 * todo mundo, sem separar nada.
 */
function cfNota100_(notasPorCampo) {
  let soma = 0;
  CF_CRITERIOS_AVALIACAO.forEach(function (c) {
    const n = Number(notasPorCampo[c.campo]);
    soma += ((n - 1) / 4) * c.peso;
  });
  return Math.round((soma / CF_PESO_TOTAL_AVALIACAO) * 100 * 10) / 10;
}

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

  const media = cfNota100_(notas);

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
    // Qual conjunto de critérios esta pessoa respondeu.
    //
    // Sem isto, uma avaliação antiga na escala 1-5 entraria na mesma
    // média que uma nova de 0 a 100 — e o resultado não seria nem uma
    // coisa nem outra. Gravar a versão é o que permite trocar os
    // critérios sem corromper o histórico nem apagá-lo.
    VERSAO_CRITERIOS: CF_VERSAO_CRITERIOS,
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

    // Só a versão de critérios em vigor entra na média.
    //
    // Uma nota 3,0 da escala 1-5 e uma 82 da 0-100 não somam: o
    // resultado não seria nem uma coisa nem outra, e seria pior que não
    // ter nota — porque pareceria uma nota. As antigas ficam gravadas e
    // continuam consultáveis na ficha; só não entram neste cálculo.
    const versao = cfNumero_(a.VERSAO_CRITERIOS);
    if (versao !== CF_VERSAO_CRITERIOS) return;

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
    const nota = Math.round((g.soma / g.n) * 10) / 10;
    const classe = cfClasseIqf_(nota);
    resultado[cnpj] = {
      nota: nota,
      classe: classe ? classe.classe : '',
      classeRotulo: classe ? classe.rotulo : '',
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
