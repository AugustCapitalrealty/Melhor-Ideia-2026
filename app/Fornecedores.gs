/**
 * Capital Fornecedores — o ecossistema de fornecedores
 *
 * A pergunta que esta tela responde é a inversa da equalização: em vez de
 * "quem cotou este item", ela responde "o que este fornecedor já cotou, a
 * que preço, e onde".
 *
 * Duas coisas que o acervo permite e a planilha nunca permitiu: achar
 * quem atende uma categoria antes de convidar, e ver o preço que um
 * fornecedor praticou ao longo do tempo em vez de só o da cotação atual.
 *
 * Uma coisa que ele AINDA não permite, e que está marcada como tal em
 * todo lugar: taxa de vitória. Ela precisa de disputas com vencedor
 * apurado, e o acervo é quase todo de orçamentos avulsos. O número é
 * calculado, mas nunca aparece sozinho — vem sempre com o denominador,
 * e abaixo de cinco disputas não vira percentual. "Venceu 67%" com n=3
 * é uma frase que só sobrevive enquanto ninguém pergunta "de quantas?".
 */

/**
 * Todos os fornecedores que já apresentaram proposta, com o que dá para
 * dizer sobre cada um.
 *
 * @param {string} categoria  filtra por macro-categoria; vazio traz todos
 */
function cfFornecedores_(categoria) {
  const cadastro = {};
  cfLerTudo_('Fornecedores').forEach(function (f) {
    const c = cfSoDigitos_(f.CNPJ);
    if (c) cadastro[c] = f;
  });

  const equalizacoes = {};
  cfLerTudo_('Equalizacoes').forEach(function (e) { equalizacoes[e.ID] = e; });

  const propostas = cfLerTudo_('Propostas');

  // Descrições da EAP, para saber o que cada fornecedor cotou.
  const noEap = {};
  cfLerTudo_('EAP').forEach(function (n) { noEap[n.ID] = n; });

  const precosPorProposta = {};
  cfLerTudo_('Precos').forEach(function (p) {
    (precosPorProposta[p.ID_PROPOSTA] = precosPorProposta[p.ID_PROPOSTA] || []).push(p);
  });

  const porCnpj = {};

  propostas.forEach(function (p) {
    const cnpj = cfSoDigitos_(p.CNPJ);
    if (!cnpj) return;

    const eq = p.ID_EQUALIZACAO ? equalizacoes[p.ID_EQUALIZACAO] : null;

    const f = porCnpj[cnpj] || (porCnpj[cnpj] = {
      cnpj: cnpj,
      nome: '',
      // Disputa e orçamento avulso são coisas diferentes e nunca se somam:
      // uma tem concorrente, a outra não. Misturá-las inflaria a
      // participação de quem só mandou orçamento solto.
      disputas: 0,
      vitorias: 0,
      avulsos: 0,
      volumeHomologado: 0,
      megas: {},
      categorias: {},
      itens: {},
      ultima: null
    });

    const cad = cadastro[cnpj];
    if (!f.nome) {
      f.nome = (cad && (cad.RAZAO_SOCIAL || cad.NOME_FANTASIA)) ||
               p.RAZAO_SOCIAL_INFORMADA || '(sem identificação)';
    }

    if (eq) {
      f.disputas++;
      if (p.VENCEDORA === true) {
        f.vitorias++;
        const vf = cfNumero_(eq.VALOR_FINAL);
        const vp = cfNumero_(p.VALOR_TOTAL_DECLARADO);
        const vc = cfNumero_(p.VALOR_TOTAL_CALCULADO);
        // VALOR_FINAL é o homologado; sem ele, o que a proposta declarava.
        const valor = vf !== null ? vf : (vp !== null ? vp : vc);
        if (valor !== null) f.volumeHomologado += valor;
      }
      if (eq.ID_EMPREENDIMENTO) f.megas[eq.ID_EMPREENDIMENTO] = true;
      if (eq.CATEGORIA) f.categorias[eq.CATEGORIA] = (f.categorias[eq.CATEGORIA] || 0) + 1;
    } else {
      f.avulsos++;
    }

    const data = p.DATA_PROPOSTA instanceof Date ? p.DATA_PROPOSTA : null;
    if (data && (!f.ultima || data > f.ultima)) f.ultima = data;

    (precosPorProposta[p.ID] || []).forEach(function (pr) {
      const no = noEap[pr.ID_EAP];
      const desc = no && no.DESCRICAO;
      if (!desc) return;
      const chave = cfChaveItem_ ? cfChaveItem_(desc) : cfNormalizar_(desc);
      const it = f.itens[chave] || (f.itens[chave] = { descricao: desc, n: 0, menor: null });
      it.n++;
      const v = cfNumero_(pr.PRECO_UNITARIO);
      if (v !== null && (it.menor === null || v < it.menor)) it.menor = v;
      if (!eq && pr.ID_EMPREENDIMENTO) f.megas[pr.ID_EMPREENDIMENTO] = true;
    });
  });

  const alvo = cfNormalizar_(categoria || '');

  return Object.keys(porCnpj).map(function (cnpj) {
    const f = porCnpj[cnpj];
    const cad = cadastro[cnpj] || {};
    const cats = Object.keys(f.categorias).sort(function (a, b) {
      return f.categorias[b] - f.categorias[a];
    });

    return {
      cnpj: cnpj,
      cnpjFormatado: cfCnpjFormatado_(cnpj),
      nome: f.nome,
      nomeFantasia: cad.NOME_FANTASIA || '',
      cidade: cad.CIDADE || '',
      uf: cad.UF || '',
      situacao: cad.SITUACAO_CNPJ || '',
      contato: cad.CONTATO_NOME || '',
      telefone: cad.CONTATO_TEL || '',
      email: cad.CONTATO_EMAIL || '',
      disputas: f.disputas,
      vitorias: f.vitorias,
      avulsos: f.avulsos,
      // Percentual só com amostra que o sustente. Abaixo disso a tela
      // mostra a fração crua, que é honesta e igualmente informativa.
      taxaVitoria: f.disputas >= 5 ? (f.vitorias / f.disputas) : null,
      amostraCurta: f.disputas < 5,
      volumeHomologado: f.volumeHomologado || null,
      megas: Object.keys(f.megas),
      categorias: cats,
      categoriaPrincipal: cats[0] || '',
      itensDistintos: Object.keys(f.itens).length,
      ultimaProposta: f.ultima ? cfDataTexto_(f.ultima) : null,
      ordenacao: f.ultima ? f.ultima.getTime() : 0
    };
  }).filter(function (f) {
    if (!alvo) return true;
    return f.categorias.some(function (c) { return cfNormalizar_(c) === alvo; });
  }).sort(function (a, b) {
    // Mais recentes primeiro: quem cotou este mês é quem se convida agora.
    return (b.ordenacao || 0) - (a.ordenacao || 0);
  });
}

/**
 * A ficha completa de um fornecedor.
 *
 * Inclui o histórico de preço por item, que é a informação que a planilha
 * EQU nunca teve: cada arquivo era um retrato isolado, e comparar o preço
 * de abril com o de setembro exigia abrir dois arquivos e confiar na
 * memória de quem abriu.
 */
function cfFichaFornecedor_(cnpjBruto) {
  const cnpj = cfSoDigitos_(cnpjBruto);
  if (!cnpj) throw new Error('CNPJ não informado.');

  const cad = cfLerTudo_('Fornecedores').filter(function (f) {
    return cfSoDigitos_(f.CNPJ) === cnpj;
  })[0] || {};

  const equalizacoes = {};
  cfLerTudo_('Equalizacoes').forEach(function (e) { equalizacoes[e.ID] = e; });

  const minhas = cfLerTudo_('Propostas').filter(function (p) {
    return cfSoDigitos_(p.CNPJ) === cnpj;
  });
  const idsProposta = {};
  minhas.forEach(function (p) { idsProposta[p.ID] = p; });

  const noEap = {};
  cfLerTudo_('EAP').forEach(function (n) { noEap[n.ID] = n; });

  // ── disputas
  const disputas = minhas.filter(function (p) { return !!p.ID_EQUALIZACAO; })
    .map(function (p) {
      const eq = equalizacoes[p.ID_EQUALIZACAO] || {};
      const vp = cfNumero_(p.VALOR_TOTAL_DECLARADO);
      const vc = cfNumero_(p.VALOR_TOTAL_CALCULADO);
      return {
        idEqualizacao: p.ID_EQUALIZACAO,
        projeto: eq.PROJETO || '',
        empreendimento: eq.ID_EMPREENDIMENTO || '',
        categoria: eq.CATEGORIA || '',
        data: cfDataTexto_(p.DATA_PROPOSTA || eq.DATA_EQUALIZACAO),
        ordenacao: (p.DATA_PROPOSTA instanceof Date) ? p.DATA_PROPOSTA.getTime() : 0,
        valor: vp !== null ? vp : vc,
        venceu: p.VENCEDORA === true,
        // Homologada é a única situação em que "perdeu" quer dizer algo:
        // numa equalização em aberto ninguém perdeu ainda.
        decidida: String(eq.STATUS || '') === 'homologada',
        rodada: p.RODADA || ''
      };
    }).sort(function (a, b) { return b.ordenacao - a.ordenacao; });

  // ── histórico de preço por item
  const porItem = {};
  cfLerTudo_('Precos').forEach(function (pr) {
    if (!idsProposta[pr.ID_PROPOSTA]) return;
    const no = noEap[pr.ID_EAP];
    const desc = no && no.DESCRICAO;
    if (!desc) return;
    const v = cfNumero_(pr.PRECO_UNITARIO);
    if (v === null) return;

    const chave = cfChaveItem_ ? cfChaveItem_(desc) : cfNormalizar_(desc);
    const it = porItem[chave] || (porItem[chave] = { descricao: desc, pontos: [] });
    it.pontos.push({
      valor: v,
      unidade: pr.UNIDADE || no.UNIDADE_REFERENCIA || '',
      data: pr.DATA instanceof Date ? pr.DATA : null,
      empreendimento: pr.ID_EMPREENDIMENTO || ''
    });
  });

  const itens = Object.keys(porItem).map(function (k) {
    const it = porItem[k];
    // Em ordem de data: sem isso "primeiro" e "último" não significam nada.
    const pontos = it.pontos.slice().sort(function (a, b) {
      return (a.data ? a.data.getTime() : 0) - (b.data ? b.data.getTime() : 0);
    });
    const valores = pontos.map(function (p) { return p.valor; });
    const primeiro = valores[0], ultimo = valores[valores.length - 1];

    return {
      descricao: it.descricao,
      unidade: pontos[0].unidade || '',
      vezes: pontos.length,
      menor: Math.min.apply(null, valores),
      maior: Math.max.apply(null, valores),
      ultimo: ultimo,
      // Variação só existe com dois pontos. Com um, qualquer número aqui
      // seria invenção.
      variacao: pontos.length > 1 && primeiro > 0 ? (ultimo - primeiro) / primeiro : null,
      pontos: pontos.map(function (p) {
        return { valor: p.valor, data: p.data ? cfDataTexto_(p.data) : null,
                 empreendimento: p.empreendimento };
      })
    };
  }).sort(function (a, b) { return b.vezes - a.vezes; });

  const ganhas = disputas.filter(function (d) { return d.venceu; });
  const decididas = disputas.filter(function (d) { return d.decidida; });

  return {
    cnpj: cnpj,
    cnpjFormatado: cfCnpjFormatado_(cnpj),
    nome: cad.RAZAO_SOCIAL || (minhas[0] && minhas[0].RAZAO_SOCIAL_INFORMADA) || '(sem identificação)',
    nomeFantasia: cad.NOME_FANTASIA || '',
    cidade: cad.CIDADE || '',
    uf: cad.UF || '',
    situacao: cad.SITUACAO_CNPJ || '',
    cnae: cad.CNAE || '',
    contato: cad.CONTATO_NOME || '',
    telefone: cad.CONTATO_TEL || '',
    email: cad.CONTATO_EMAIL || '',
    codigoErp: cad.CODIGO_ERP || '',
    disputas: disputas.length,
    disputasDecididas: decididas.length,
    vitorias: ganhas.length,
    avulsos: minhas.filter(function (p) { return !p.ID_EQUALIZACAO; }).length,
    // O denominador honesto é o das disputas DECIDIDAS: uma equalização
    // em aberto não foi perdida, está em andamento.
    taxaVitoria: decididas.length >= 5 ? (ganhas.length / decididas.length) : null,
    amostraCurta: decididas.length < 5,
    volumeHomologado: ganhas.reduce(function (a, d) { return a + (d.valor || 0); }, 0) || null,
    historico: disputas,
    itens: itens
  };
}

/** As categorias com a contagem real de equalizações em cada uma. */
function cfCategoriasComContagem_() {
  const lista = cfListarEqualizacoes_();
  const conta = {};
  lista.forEach(function (e) {
    const k = e.categoria || '';
    conta[k] = (conta[k] || 0) + 1;
  });

  const cats = CF_CATEGORIAS.map(function (c) {
    return { nome: c.nome, icone: c.icone, subs: c.subs, n: conta[c.nome] || 0 };
  });

  return {
    total: lista.length,
    semCategoria: conta[''] || 0,
    categorias: cats
  };
}
