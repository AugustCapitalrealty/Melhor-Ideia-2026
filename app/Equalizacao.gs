/**
 * Capital Fornecedores — o mapa de equalização
 *
 * A tela que substitui a planilha EQU_*.xlsx. Aqui só leitura: monta o
 * comparativo a partir do que já está gravado. A criação de equalização
 * pela tela é outra etapa.
 *
 * O mapa é uma matriz — a árvore da EAP nas linhas, os proponentes nas
 * colunas, os preços na grade. A comparação por linha só acontece entre
 * itens: grupo agrega, e somar grupo com filho conta duas vezes.
 */

/** Lista as equalizações para o seletor da tela. */
function cfListarEqualizacoes_() {
  const propostas = cfLerTudo_('Propostas');

  return cfLerTudo_('Equalizacoes').map(function (eq) {
    const minhas = propostas.filter(function (p) {
      return String(p.ID_EQUALIZACAO) === String(eq.ID);
    });
    return {
      id: eq.ID,
      empreendimento: eq.ID_EMPREENDIMENTO || '—',
      projeto: eq.PROJETO || '',
      area: eq.AREA || '',
      data: cfDataTexto_(eq.DATA_EQUALIZACAO),
      status: eq.STATUS || '',
      proponentes: minhas.length
    };
  }).sort(function (a, b) {
    return String(b.data).localeCompare(String(a.data));
  });
}

/**
 * O mapa de uma equalização.
 *
 * Preço vazio e preço zero são coisas diferentes: "não cotou" não pode
 * ganhar de quem cotou. Por isso o menor valor da linha só considera
 * STATUS_PRECO cotado.
 */
function cfMapaEqualizacao_(idEq) {
  const eq = cfLerTudo_('Equalizacoes').filter(function (e) {
    return String(e.ID) === String(idEq);
  })[0];
  if (!eq) throw new Error('Equalização "' + idEq + '" não encontrada.');

  const fornecedores = {};
  cfLerTudo_('Fornecedores').forEach(function (f) {
    fornecedores[cfSoDigitos_(f.CNPJ)] = f.RAZAO_SOCIAL || f.NOME_FANTASIA || '';
  });

  const proponentes = cfLerTudo_('Propostas')
    .filter(function (p) { return String(p.ID_EQUALIZACAO) === String(idEq); })
    .sort(function (a, b) { return (cfNumero_(a.ORDEM) || 0) - (cfNumero_(b.ORDEM) || 0); })
    .map(function (p) {
      const cnpj = cfSoDigitos_(p.CNPJ);
      return {
        id: p.ID,
        ordem: cfNumero_(p.ORDEM) || 0,
        cnpj: cnpj,
        // O nome do cadastro ganha do informado, mas o informado sobrevive
        // quando o CNPJ veio inválido — foi o caso "Golden Phone / Carryer".
        nome: fornecedores[cnpj] || p.RAZAO_SOCIAL_INFORMADA || '(sem identificação)',
        rodada: p.RODADA || '',
        total: cfNumero_(p.VALOR_TOTAL_DECLARADO),
        calculado: cfNumero_(p.VALOR_TOTAL_CALCULADO),
        vencedora: p.VENCEDORA === true
      };
    });

  // ── preços indexados por nó da EAP
  const porNo = {};
  cfLerTudo_('Precos').forEach(function (pr) {
    if (String(pr.ID_EQUALIZACAO) !== String(idEq)) return;
    (porNo[pr.ID_EAP] = porNo[pr.ID_EAP] || {})[pr.ID_PROPOSTA] = {
      valor: cfNumero_(pr.PRECO_UNITARIO),
      total: cfNumero_(pr.VALOR_TOTAL),
      status: pr.STATUS_PRECO || ''
    };
  });

  // ── árvore achatada, mantendo a hierarquia no campo nivel
  const nos = cfLerTudo_('EAP').filter(function (n) {
    return String(n.ID_EQUALIZACAO) === String(idEq);
  });

  const filhos = {};
  nos.forEach(function (n) {
    (filhos[n.ID_PAI || ''] = filhos[n.ID_PAI || ''] || []).push(n);
  });
  Object.keys(filhos).forEach(function (k) {
    filhos[k].sort(function (a, b) { return (cfNumero_(a.ORDEM) || 0) - (cfNumero_(b.ORDEM) || 0); });
  });

  const linhas = [];
  (function descer(idPai, nivel) {
    (filhos[idPai] || []).forEach(function (n) {
      const precos = porNo[n.ID] || {};

      // Menor da linha: só entre quem cotou de fato.
      let menor = null;
      proponentes.forEach(function (p) {
        const c = precos[p.id];
        if (!c || c.status !== 'cotado' || c.valor === null) return;
        if (menor === null || c.valor < precos[menor].valor) menor = p.id;
      });

      linhas.push({
        id: n.ID,
        nivel: nivel,
        tipo: n.TIPO || 'item',
        codigo: n.CODIGO_ORIGINAL || '',
        descricao: n.DESCRICAO || '',
        quantidade: cfNumero_(n.QUANTIDADE_REFERENCIA),
        unidade: n.UNIDADE_REFERENCIA || '',
        precos: precos,
        menor: menor
      });

      descer(n.ID, nivel + 1);
    });
  })('', 0);

  return {
    equalizacao: {
      id: eq.ID,
      empresa: eq.CNPJ_EMPRESA || '',
      empreendimento: eq.ID_EMPREENDIMENTO || '—',
      projeto: eq.PROJETO || '',
      area: eq.AREA || '',
      data: cfDataTexto_(eq.DATA_EQUALIZACAO),
      status: eq.STATUS || '',
      premissas: eq.PREMISSAS || '',
      detalhamento: eq.DETALHAMENTO_APROVACAO || '',
      parecer: eq.PARECER_FAVORAVEL || '',
      vencedora: eq.ID_PROPOSTA_VENCEDORA || ''
    },
    proponentes: proponentes,
    linhas: linhas,
    pendencias: cfPendenciasDaEqualizacao_(idEq)
  };
}

/**
 * Pendências da importação que gerou esta equalização.
 * Aparecem no mapa porque mudam como o comparativo deve ser lido: uma
 * cesta incompleta faz o total mais barato parecer o melhor.
 */
function cfPendenciasDaEqualizacao_(idEq) {
  const idsImportacao = {};
  cfLerTudo_('Equalizacoes').forEach(function (e) {
    if (String(e.ID) === String(idEq) && e.ID_IMPORTACAO) idsImportacao[e.ID_IMPORTACAO] = true;
  });
  if (!Object.keys(idsImportacao).length) return [];

  return cfLerTudo_('Pendencias')
    .filter(function (p) { return idsImportacao[p.ID_IMPORTACAO] && p.RESOLVIDA !== true; })
    .map(function (p) { return { tipo: p.TIPO, descricao: p.DESCRICAO }; });
}

// ─────────────────────────────────────────────────────────────
//  Criar equalização pela tela
//
//  Primeiro caminho de escrita vindo do navegador. Tudo numa transação só:
//  ou entra equalização, proponentes, árvore e preços, ou não entra nada.
//  Gravar pela metade aqui é pior que falhar — sobra uma equalização órfã
//  que ninguém sabe se está completa.
// ─────────────────────────────────────────────────────────────

/** Os Megas. Lista fechada de propósito: empreendimento nunca se deduz. */
const CF_EMPREENDIMENTOS = [
  'MEGA CENTRO LOGÍSTICO CURITIBA',
  'MEGA CENTRO LOGÍSTICO ESTEIO',
  'MEGA CENTRO LOGÍSTICO ITAJAÍ'
];

/**
 * As duas contratantes do grupo, com CNPJ.
 *
 * O CNPJ não é decorativo: a etiqueta "Capital Realty"/"Demercado" na
 * consulta é derivada dele. Com os dois em branco, como estavam, tudo
 * criado pela tela saía sem empresa nenhuma.
 */
const CF_EMPRESAS = [
  { cnpj: '08601964000105', nome: 'DEMERCADO INVESTIMENTOS S.A.' },
  { cnpj: '03015145000154', nome: 'CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA' }
];

/**
 * Qual empresa contrata em cada Mega. Curitiba é Demercado; Esteio e
 * Itajaí são Capital Realty.
 *
 * É determinístico, então não se pergunta: escolher a contratante à mão
 * é um campo que só existe para ser preenchido errado. O servidor deriva
 * daqui e ignora o que a tela mandar.
 */
const CF_EMPRESA_DO_MEGA = {
  'MEGA CENTRO LOGÍSTICO CURITIBA': '08601964000105',
  'MEGA CENTRO LOGÍSTICO ESTEIO':   '03015145000154',
  'MEGA CENTRO LOGÍSTICO ITAJAÍ':   '03015145000154'
};

function cfEmpresaDoMega_(empreendimento) {
  const cnpj = CF_EMPRESA_DO_MEGA[empreendimento];
  if (!cnpj) return { cnpj: '', nome: '' };
  const empresa = CF_EMPRESAS.filter(function (e) { return e.cnpj === cnpj; })[0];
  return { cnpj: cnpj, nome: empresa ? empresa.nome : '' };
}

function cfCriarEqualizacao_(d) {
  if (!d) throw new Error('Nada recebido.');
  if (!d.empreendimento) throw new Error('Escolha o empreendimento.');
  if (CF_EMPREENDIMENTOS.indexOf(d.empreendimento) < 0) {
    throw new Error('Empreendimento "' + d.empreendimento + '" não é um dos Megas.');
  }

  const proponentes = (d.proponentes || []).filter(function (p) {
    return (p.nome && String(p.nome).trim()) || cfSoDigitos_(p.cnpj);
  });
  if (!proponentes.length) throw new Error('Inclua ao menos um proponente.');

  const itens = (d.itens || []).filter(function (i) {
    return i.descricao && String(i.descricao).trim();
  });
  if (!itens.length) throw new Error('Inclua ao menos um item.');

  const idEq = cfNovoId_('EQU');
  const agora = new Date();
  const usuario = cfUsuario_();

  // ── proponentes
  const idsProposta = proponentes.map(function () { return cfNovoId_('PRP'); });
  const totais = proponentes.map(function () { return 0; });

  // ── árvore: o nível vira ID_PAI. Pilha guarda o último id de cada nível.
  const pilha = {};
  const linhasEap = [];
  const linhasPreco = [];

  itens.forEach(function (item, ordem) {
    const nivel = Number(item.nivel) || 0;
    const idNo = cfNovoId_('EAP');
    pilha[nivel] = idNo;

    linhasEap.push({
      ID: idNo,
      ID_EQUALIZACAO: idEq,
      ID_PAI: nivel > 0 ? (pilha[nivel - 1] || '') : '',
      ORDEM: ordem + 1,
      TIPO: item.tipo === 'grupo' ? 'grupo' : 'item',
      DESCRICAO: String(item.descricao).trim(),
      QUANTIDADE_REFERENCIA: cfNumero_(item.quantidade),
      UNIDADE_REFERENCIA: item.unidade || '',
      CODIGO_ORIGINAL: item.codigo || ''
    });

    // Grupo agrega; preço só existe em item. Gravar preço no grupo faz o
    // total contar duas vezes na hora de somar.
    if (item.tipo === 'grupo') return;

    proponentes.forEach(function (p, i) {
      const valor = cfNumero_((item.precos || [])[i]);
      const cotou = valor !== null && valor !== undefined && String((item.precos || [])[i]).trim() !== '';
      const qtd = cfNumero_(item.quantidade);
      const total = cotou ? valor * (qtd === null ? 1 : qtd) : null;
      if (cotou) totais[i] += total;

      linhasPreco.push({
        ID: cfNovoId_('PRC'),
        ID_EAP: idNo,
        ID_PROPOSTA: idsProposta[i],
        ID_EQUALIZACAO: idEq,
        QUANTIDADE: qtd,
        UNIDADE: item.unidade || '',
        PRECO_UNITARIO: cotou ? valor : '',
        VALOR_TOTAL: cotou ? total : '',
        STATUS_PRECO: cotou ? 'cotado' : 'nao_cotado',
        CNPJ: cfSoDigitos_(p.cnpj),
        ID_EMPREENDIMENTO: d.empreendimento,
        DATA: agora,
        ORIGEM: 'app'
      });
    });
  });

  return cfComTrava_(function () {
    cfInserir_('Equalizacoes', [{
      ID: idEq,
      // Derivada do Mega, não do que a tela mandou: a relação é fixa e o
      // cliente não tem por que opinar sobre ela.
      CNPJ_EMPRESA: cfEmpresaDoMega_(d.empreendimento).cnpj,
      ID_EMPREENDIMENTO: d.empreendimento,
      PROJETO: d.projeto || '',
      AREA: d.area || '',
      DATA_EQUALIZACAO: cfData_(d.data) || agora,
      STATUS: 'em_cotacao',
      PREMISSAS: d.premissas || '',
      DETALHAMENTO_APROVACAO: d.detalhamento || '',
      NOTAS_CR: d.notasCr || '',
      ORIGEM: 'app',
      CRIADO_POR: usuario,
      CRIADO_EM: agora,
      ATUALIZADO_EM: agora
    }]);

    cfInserir_('Propostas', proponentes.map(function (p, i) {
      // A rodada é a última preenchida no histórico de negociação.
      const rodada = cfNumero_(p.r02) !== null ? 'R02'
                   : (cfNumero_(p.r01) !== null ? 'R01' : 'inicial');
      const inicial = cfNumero_(p.propostaInicial);
      const declarado = cfNumero_(p.r02) !== null ? cfNumero_(p.r02)
                      : (cfNumero_(p.r01) !== null ? cfNumero_(p.r01) : inicial);

      return {
        ID: idsProposta[i],
        ID_EQUALIZACAO: idEq,
        CNPJ: cfSoDigitos_(p.cnpj),
        RAZAO_SOCIAL_INFORMADA: String(p.nome || '').trim(),
        ORDEM: i + 1,
        RODADA: rodada,
        NUMERO_PROPOSTA: p.numero || '',
        REVISAO_FORNECEDOR: p.revisao || '',
        DATA_PROPOSTA: cfData_(p.data) || '',
        VALIDADE_ATE: cfData_(p.validadeAte) || '',
        CONDICOES_PAGAMENTO: p.condicoes || '',
        LEAD_TIME_DIAS: cfNumero_(p.leadTime),
        PRAZO_EXECUCAO_DIAS: cfNumero_(p.prazoExecucao),
        FATURAMENTO_DIRETO: p.faturamentoDireto === true,
        VALOR_FATURAMENTO_DIRETO: cfNumero_(p.valorFaturamentoDireto),
        DATA_PREV_INICIO: cfData_(p.dataPrevInicio) || '',
        DATA_PREV_TERMINO: cfData_(p.dataPrevTermino) || '',
        VALOR_TOTAL_DECLARADO: declarado === null ? '' : declarado,
        VALOR_TOTAL_CALCULADO: totais[i],
        OBSERVACAO: p.centroCusto || '',
        VALOR_PROPOSTA_INICIAL: inicial === null ? '' : inicial,
        // Derivada, nunca digitada: na planilha EQU a fórmula de redução
        // copiava o total quando a inicial estava vazia e reportava 100%
        // de economia. Aqui, sem inicial não há redução.
        REDUCAO_NEGOCIADA: (inicial !== null && declarado !== null && inicial > declarado)
          ? inicial - declarado : '',
        ORIGEM: 'app'
      };
    }));

    cfInserir_('EAP', linhasEap);
    if (linhasPreco.length) cfInserir_('Precos', linhasPreco);

    // Fornecedor novo entra no cadastro: sem isso o mapa mostra "(sem
    // identificação)" e a próxima cotação redigita tudo de novo.
    cfCadastrarProponentes_(proponentes);

    cfLog_('criar_equalizacao', 'equalizacao', idEq, JSON.stringify({
      proponentes: proponentes.length, nos: linhasEap.length, precos: linhasPreco.length
    }));

    return {
      id: idEq,
      proponentes: proponentes.length,
      nos: linhasEap.length,
      precos: linhasPreco.length
    };
  }, 120);
}

/** Cadastra quem ainda não existe. Não sobrescreve dado já enriquecido. */
function cfCadastrarProponentes_(proponentes) {
  const existentes = {};
  cfLerTudo_('Fornecedores').forEach(function (f) { existentes[cfSoDigitos_(f.CNPJ)] = true; });

  const novos = [];
  proponentes.forEach(function (p) {
    const cnpj = cfSoDigitos_(p.cnpj);
    if (!cnpj || cnpj.length !== 14 || existentes[cnpj]) return;
    existentes[cnpj] = true;
    // Guarda o que a consulta trouxe: as colunas existem desde o schema v1
    // e nunca eram preenchidas. É isso que faz o cadastro se construir
    // sozinho — na próxima cotação o fornecedor já vem pronto, sem rede.
    novos.push({
      CNPJ: cnpj,
      RAZAO_SOCIAL: String(p.nome || '').trim(),
      NOME_FANTASIA: p.nomeFantasia || '',
      CIDADE: p.cidade || '',
      UF: p.uf || '',
      SITUACAO_CNPJ: p.situacao || '',
      CNAE_PRINCIPAL: p.cnae || '',
      CONTATO_TEL: p.telefone || '',
      CONTATO_EMAIL: p.email || '',
      ORIGEM: 'app',
      ATUALIZADO_EM: new Date()
    });
  });

  if (novos.length) cfInserir_('Fornecedores', novos);
  return novos.length;
}

// ─────────────────────────────────────────────────────────────
//  Homologação — escolher a proposta vencedora
//
//  É o passo que fecha o ciclo. Sem ele o app compara e para justamente
//  onde a planilha era usada: registrar a decisão e o porquê dela.
//
//  A ordem de compra não entra aqui — ela é emitida depois da aprovação,
//  fora deste fluxo.
// ─────────────────────────────────────────────────────────────

function cfHomologar_(idEq, idProposta, parecer) {
  if (!idEq || !idProposta) throw new Error('Equalização e proposta são obrigatórias.');

  return cfComTrava_(function () {
    const eq = cfLerTudo_('Equalizacoes').filter(function (e) {
      return String(e.ID) === String(idEq);
    })[0];
    if (!eq) throw new Error('Equalização "' + idEq + '" não encontrada.');

    const propostas = cfLerTudo_('Propostas').filter(function (p) {
      return String(p.ID_EQUALIZACAO) === String(idEq);
    });
    const escolhida = propostas.filter(function (p) { return String(p.ID) === String(idProposta); })[0];
    if (!escolhida) throw new Error('Proposta "' + idProposta + '" não é desta equalização.');

    const valorDe = function (p) {
      const d = cfNumero_(p.VALOR_TOTAL_DECLARADO);
      return d !== null ? d : cfNumero_(p.VALOR_TOTAL_CALCULADO);
    };

    // Escolher a mais cara é decisão legítima — prazo, escopo, histórico do
    // fornecedor. Mas precisa estar escrita: é a defesa de quem comprou.
    const comValor = propostas.filter(function (p) { return valorDe(p) !== null; });
    const menor = comValor.reduce(function (a, p) {
      return (a === null || valorDe(p) < valorDe(a)) ? p : a;
    }, null);
    const eMaisBarata = !menor || String(menor.ID) === String(idProposta);

    if (!eMaisBarata && !String(parecer || '').trim()) {
      throw new Error('Esta não é a proposta de menor valor. Escreva a justificativa da escolha.');
    }

    propostas.forEach(function (p) {
      const venceu = String(p.ID) === String(idProposta);
      if (p.VENCEDORA !== venceu) cfAtualizarLinha_('Propostas', p._linha, { VENCEDORA: venceu });
    });

    cfAtualizarLinha_('Equalizacoes', eq._linha, {
      STATUS: 'homologada',
      CNPJ_VENCEDOR: cfSoDigitos_(escolhida.CNPJ),
      ID_PROPOSTA_VENCEDORA: escolhida.ID,
      VALOR_FINAL: valorDe(escolhida),
      PARECER_FAVORAVEL: String(parecer || '').trim(),
      ATUALIZADO_EM: new Date()
    });

    cfLog_('homologar', 'equalizacao', idEq, JSON.stringify({
      proposta: escolhida.ID,
      fornecedor: escolhida.RAZAO_SOCIAL_INFORMADA || cfSoDigitos_(escolhida.CNPJ),
      valor: valorDe(escolhida),
      eraMenor: eMaisBarata
    }));

    return {
      id: idEq,
      proposta: escolhida.ID,
      valor: valorDe(escolhida),
      eraMenor: eMaisBarata
    };
  }, 60);
}
