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

  // Descrições por equalização, para deduzir categoria de quem ainda não
  // tem uma gravada. Uma leitura só: consultar a EAP dentro do laço faria
  // N leituras da aba inteira.
  const descricoes = {};
  cfLerTudo_('EAP').forEach(function (n) {
    if (!n.ID_EQUALIZACAO || !n.DESCRICAO) return;
    (descricoes[n.ID_EQUALIZACAO] = descricoes[n.ID_EQUALIZACAO] || []).push(n.DESCRICAO);
  });

  return cfLerTudo_('Equalizacoes').map(function (eq) {
    const minhas = propostas.filter(function (p) {
      return String(p.ID_EQUALIZACAO) === String(eq.ID);
    });
    // O menor total entre quem cotou: é o número que diz "quanto custa
    // esta compra" e o que permite achar a equalização pela ordem de
    // grandeza quando não se lembra do nome.
    let menor = null;
    minhas.forEach(function (p) {
      const v = cfNumero_(p.VALOR_TOTAL_DECLARADO);
      const c = v !== null ? v : cfNumero_(p.VALOR_TOTAL_CALCULADO);
      if (c === null) return;
      if (menor === null || c < menor) menor = c;
    });

    // Gravada ganha da deduzida: alguém já corrigiu à mão, e a dedução
    // não pode desfazer correção humana.
    const categoria = eq.CATEGORIA ||
      cfCategoriaDerivada_(cfTextosDaEqualizacao_(eq, descricoes[eq.ID]));
    const daCategoria = cfCategoria_(categoria);

    return {
      id: eq.ID,
      empreendimento: eq.ID_EMPREENDIMENTO || '—',
      projeto: eq.PROJETO || '',
      area: eq.AREA || '',
      categoria: categoria || '',
      subcategoria: eq.SUBCATEGORIA || '',
      icone: daCategoria ? daCategoria.icone : '',
      // Deduzida aparece com marca própria na tela: o comprador precisa
      // saber quando o sistema chutou.
      categoriaDeduzida: !eq.CATEGORIA && !!categoria,
      grupoCentroCusto: eq.GRUPO_CENTRO_CUSTO || '',
      data: cfDataTexto_(eq.DATA_EQUALIZACAO),
      ordenacao: eq.DATA_EQUALIZACAO instanceof Date ? eq.DATA_EQUALIZACAO.getTime() : 0,
      status: eq.STATUS || '',
      proponentes: minhas.length,
      menor: menor,
      // Para a busca livre não precisar de N comparações no cliente.
      busca: cfNormalizar_([eq.ID, eq.ID_EMPREENDIMENTO, eq.PROJETO, eq.AREA,
                            eq.GRUPO_CENTRO_CUSTO, eq.STATUS, categoria].filter(Boolean).join(' '))
    };
  }).sort(function (a, b) {
    // Por data de verdade. Comparar "dd/MM/yyyy" como texto punha 28/04
    // depois de 05/05, e a lista saía fora de ordem cronológica.
    return (b.ordenacao || 0) - (a.ordenacao || 0);
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
    fornecedores[cfSoDigitos_(f.CNPJ)] = f;
  });
  const nomeDe = function (cnpj) {
    const f = fornecedores[cnpj];
    return f ? (f.RAZAO_SOCIAL || f.NOME_FANTASIA || '') : '';
  };
  const doCadastro = function (cnpj, campo) {
    const f = fornecedores[cnpj];
    return f ? (f[campo] || '') : '';
  };

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
        nome: nomeDe(cnpj) || p.RAZAO_SOCIAL_INFORMADA || '(sem identificação)',
        contato: doCadastro(cnpj, 'CONTATO_NOME'),
        telefone: doCadastro(cnpj, 'CONTATO_TEL'),
        email: doCadastro(cnpj, 'CONTATO_EMAIL'),
        cidade: doCadastro(cnpj, 'CIDADE'),
        uf: doCadastro(cnpj, 'UF'),
        rodada: p.RODADA || '',
        total: cfNumero_(p.VALOR_TOTAL_DECLARADO),
        calculado: cfNumero_(p.VALOR_TOTAL_CALCULADO),
        vencedora: p.VENCEDORA === true,
        // O rodapé da EQU: sem isto o mapa mostra preço e esconde tudo que
        // decide uma compra — prazo, validade, condição de pagamento.
        numero: p.NUMERO_PROPOSTA || '',
        revisao: p.REVISAO_FORNECEDOR || '',
        data: cfDataTexto_(p.DATA_PROPOSTA),
        validadeAte: cfDataTexto_(p.VALIDADE_ATE),
        condicoes: p.CONDICOES_PAGAMENTO || '',
        leadTime: cfNumero_(p.LEAD_TIME_DIAS),
        prazoExecucao: cfNumero_(p.PRAZO_EXECUCAO_DIAS),
        dataPrevInicio: cfDataTexto_(p.DATA_PREV_INICIO),
        dataPrevTermino: cfDataTexto_(p.DATA_PREV_TERMINO),
        centroCusto: p.OBSERVACAO || '',
        faturamentoDireto: p.FATURAMENTO_DIRETO === true,
        valorFaturamentoDireto: cfNumero_(p.VALOR_FATURAMENTO_DIRETO),
        propostaInicial: cfNumero_(p.VALOR_PROPOSTA_INICIAL),
        reducao: cfNumero_(p.REDUCAO_NEGOCIADA),
        linkProposta: cfLinkDoDrive_(p.LINK_PROPOSTA)
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
      grupoCentroCusto: eq.GRUPO_CENTRO_CUSTO || '',
      categoria: eq.CATEGORIA || '',
      subcategoria: eq.SUBCATEGORIA || '',
      data: cfDataTexto_(eq.DATA_EQUALIZACAO),
      status: eq.STATUS || '',
      premissas: eq.PREMISSAS || '',
      notasCr: eq.NOTAS_CR || '',
      detalhamento: eq.DETALHAMENTO_APROVACAO || '',
      parecer: eq.PARECER_FAVORAVEL || '',
      vencedora: eq.ID_PROPOSTA_VENCEDORA || '',
      cnpjVencedor: eq.CNPJ_VENCEDOR || '',
      valorFinal: cfNumero_(eq.VALOR_FINAL),
      numeroOc: eq.NUMERO_OC || ''
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

  const ehEdicao = !!(d.id && String(d.id).trim());
  const idEq = ehEdicao ? String(d.id).trim() : cfNovoId_('EQU');
  const agora = new Date();
  const usuario = cfUsuario_();

  return cfComTrava_(function () {
    let anterior = null;
    let backupEqualizacoes = [];
    let backupPropostas = [];
    let backupEap = [];
    let backupPrecos = [];

    if (ehEdicao) {
      backupEqualizacoes = cfLerTudo_('Equalizacoes').filter(function (e) {
        return String(e.ID) === String(idEq);
      });
      anterior = backupEqualizacoes[0] || null;

      backupPropostas = cfLerTudo_('Propostas').filter(function (p) {
        return String(p.ID_EQUALIZACAO) === String(idEq);
      });

      backupEap = cfLerTudo_('EAP').filter(function (ea) {
        return String(ea.ID_EQUALIZACAO) === String(idEq);
      });

      backupPrecos = cfLerTudo_('Precos').filter(function (pr) {
        return String(pr.ID_EQUALIZACAO) === String(idEq);
      });
    }

    // ── proponentes: preserva os IDs de proposta existentes quando o CNPJ ou a ordem coincidir
    const propostasUsadas = {};
    const idsProposta = proponentes.map(function (p, i) {
      if (ehEdicao && backupPropostas.length) {
        const cnpjP = cfSoDigitos_(p.cnpj);
        let achada = cnpjP ? backupPropostas.filter(function (pa) {
          return !propostasUsadas[pa.ID] && cfSoDigitos_(pa.CNPJ) === cnpjP;
        })[0] : null;
        if (!achada) {
          achada = backupPropostas.filter(function (pa) {
            return !propostasUsadas[pa.ID] && (cfNumero_(pa.ORDEM) || 0) === (i + 1);
          })[0];
        }
        if (achada) {
          propostasUsadas[achada.ID] = true;
          return achada.ID;
        }
      }
      return cfNovoId_('PRP');
    });

    const totais = proponentes.map(function () { return 0; });
    // Quem não cotou NADA precisa ficar sem total, não com zero. Zero venceria
    // a comparação de menor valor e passaria a exigir justificativa de quem
    // escolhesse qualquer fornecedor de verdade. Acontece no primeiro convite
    // recusado.
    const cotouAlgo = proponentes.map(function () { return false; });

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
        const digitado = cfNumero_((item.precos || [])[i]);
        const cotou = digitado !== null && digitado !== undefined &&
                      String((item.precos || [])[i]).trim() !== '';
        const qtd = cfNumero_(item.quantidade);
        const q = (qtd === null || qtd === 0) ? 1 : qtd;

        // O formulário EQU só tem o total da linha; ter o unitário é a
        // melhoria. Quando o comprador transcreve um documento antigo ele
        // digita o total, e o unitário é derivado — ORIGEM_CALCULO guarda
        // qual dos dois foi informado, para o histórico não misturar preço
        // digitado com preço deduzido.
        const porTotal = d.baseValores === 'total';
        const unitario = cotou ? (porTotal ? digitado / q : digitado) : null;
        const total = cotou ? (porTotal ? digitado : digitado * q) : null;

        if (cotou) { totais[i] += total; cotouAlgo[i] = true; }

        linhasPreco.push({
          ID: cfNovoId_('PRC'),
          ID_EAP: idNo,
          ID_PROPOSTA: idsProposta[i],
          ID_EQUALIZACAO: idEq,
          QUANTIDADE: qtd,
          UNIDADE: item.unidade || '',
          PRECO_UNITARIO: cotou ? unitario : '',
          VALOR_TOTAL: cotou ? total : '',
          STATUS_PRECO: cotou ? 'cotado' : 'nao_cotado',
          ORIGEM_CALCULO: cotou ? (porTotal ? 'calculado' : 'informado') : 'ausente',
          CNPJ: cfSoDigitos_(p.cnpj),
          ID_EMPREENDIMENTO: d.empreendimento,
          DATA: agora,
          ORIGEM: 'app'
        });
      });
    });

    // Preserva dados de homologação e decisão anterior quando existirem,
    // garantindo que o vencedor aponte para uma proposta válida existente (sem órfãos).
    const statusFinal = anterior ? (anterior.STATUS || 'em_cotacao') : 'em_cotacao';
    let vencedorFinal = anterior ? (anterior.ID_PROPOSTA_VENCEDORA || '') : '';
    let cnpjVencedorFinal = anterior ? (anterior.CNPJ_VENCEDOR || '') : '';
    let valorFinal = anterior ? (anterior.VALOR_FINAL || '') : '';
    const parecerFinal = anterior ? (anterior.PARECER_FAVORAVEL || '') : '';
    const ocFinal = anterior ? (anterior.NUMERO_OC || '') : '';

    // Se o vencedor anterior não estiver diretamente pelo ID nos atuais,
    // localiza pelo CNPJ do vencedor
    if (vencedorFinal && idsProposta.indexOf(vencedorFinal) < 0 && cnpjVencedorFinal) {
      const idxPorCnpj = proponentes.findIndex(function (p) { return cfSoDigitos_(p.cnpj) === cnpjVencedorFinal; });
      if (idxPorCnpj >= 0) {
        vencedorFinal = idsProposta[idxPorCnpj];
      } else {
        vencedorFinal = '';
      }
    }

    // Se há vencedor identificado, atualiza o VALOR_FINAL com o novo valor negociado/declarado
    if (vencedorFinal) {
      const idxV = idsProposta.indexOf(vencedorFinal);
      if (idxV >= 0) {
        const pV = proponentes[idxV];
        const dec = cfNumero_(pV.totalDeclarado);
        const r02 = cfNumero_(pV.r02);
        const r01 = cfNumero_(pV.r01);
        const ini = cfNumero_(pV.propostaInicial);
        const vAtual = dec !== null ? dec : (r02 !== null ? r02 : (r01 !== null ? r01 : (ini !== null ? ini : (cotouAlgo[idxV] ? totais[idxV] : null))));
        if (vAtual !== null) valorFinal = vAtual;
      }
    }

    try {
      if (ehEdicao) {
        cfApagarPor_('Precos', 'ID_EQUALIZACAO', idEq);
        cfApagarPor_('EAP', 'ID_EQUALIZACAO', idEq);
        cfApagarPor_('Propostas', 'ID_EQUALIZACAO', idEq);
        cfApagarPor_('Equalizacoes', 'ID', idEq);
      }

      cfInserir_('Equalizacoes', [{
        ID: idEq,
        // Derivada do Mega, não do que a tela mandou: a relação é fixa e o
        // cliente não tem por que opinar sobre ela.
        CNPJ_EMPRESA: cfEmpresaDoMega_(d.empreendimento).cnpj,
        ID_EMPREENDIMENTO: d.empreendimento,
        PROJETO: d.projeto || '',
        AREA: d.area || '',
        GRUPO_CENTRO_CUSTO: d.grupoCentroCusto || '',
        CATEGORIA: d.categoria || cfCategoriaDerivada_(
          cfTextosDaEqualizacao_(d, (itens || []).map(function (i) { return i.descricao; }))),
        SUBCATEGORIA: d.subcategoria || '',
        DATA_EQUALIZACAO: cfData_(d.data) || agora,
        STATUS: statusFinal,
        PREMISSAS: d.premissas || '',
        DETALHAMENTO_APROVACAO: d.detalhamento || '',
        NOTAS_CR: d.notasCr || '',
        ORIGEM: anterior ? (anterior.ORIGEM || 'app') : 'app',
        PARECER_FAVORAVEL: parecerFinal,
        ID_PROPOSTA_VENCEDORA: vencedorFinal,
        NUMERO_OC: ocFinal,
        CNPJ_VENCEDOR: cnpjVencedorFinal,
        VALOR_FINAL: valorFinal,
        CRIADO_POR: anterior ? (anterior.CRIADO_POR || usuario) : usuario,
        CRIADO_EM: anterior ? (anterior.CRIADO_EM || agora) : agora,
        ATUALIZADO_EM: agora
      }]);

      cfInserir_('Propostas', proponentes.map(function (p, i) {
        // A rodada é a última preenchida no histórico de negociação.
        const rodada = cfNumero_(p.r02) !== null ? 'R02'
                     : (cfNumero_(p.r01) !== null ? 'R01' : 'inicial');
        const inicial = cfNumero_(p.propostaInicial);
        // O total que o fornecedor escreveu no documento manda. Ele e a soma
        // dos itens sao numeros independentes, e a divergencia entre os dois e
        // erro comum de proposta — a confusao so aparece se ambos existirem.
        const digitadoDeclarado = cfNumero_(p.totalDeclarado);
        const declarado = digitadoDeclarado !== null ? digitadoDeclarado
                        : (cfNumero_(p.r02) !== null ? cfNumero_(p.r02)
                        : (cfNumero_(p.r01) !== null ? cfNumero_(p.r01) : inicial));

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
          PRAZO_EXECUCAO_DIAS: (function () {
            let pr = cfNumero_(p.prazoExecucao);
            if (pr === null && p.dataPrevInicio && p.dataPrevTermino) {
              const d1 = new Date(p.dataPrevInicio + 'T00:00:00');
              const d2 = new Date(p.dataPrevTermino + 'T00:00:00');
              if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 >= d1) {
                pr = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
              }
            }
            return pr;
          })(),
          FATURAMENTO_DIRETO: p.faturamentoDireto === true,
          VALOR_FATURAMENTO_DIRETO: cfNumero_(p.valorFaturamentoDireto),
          DATA_PREV_INICIO: cfData_(p.dataPrevInicio) || '',
          DATA_PREV_TERMINO: cfData_(p.dataPrevTermino) || '',
          VALOR_TOTAL_DECLARADO: declarado === null ? '' : declarado,
          VALOR_TOTAL_CALCULADO: cotouAlgo[i] ? totais[i] : '',
          OBSERVACAO: p.centroCusto || '',
          VALOR_PROPOSTA_INICIAL: inicial === null ? '' : inicial,
          // Derivada, nunca digitada: na planilha EQU a fórmula de redução
          // copiava o total quando a inicial estava vazia e reportava 100%
          // de economia. Aqui, sem inicial não há redução.
          REDUCAO_NEGOCIADA: (inicial !== null && declarado !== null && inicial > declarado)
            ? inicial - declarado : '',
          // Normalizado na gravação, não na leitura: assim o que está na
          // planilha já é o link final, e quem abrir a aba direto vê o mesmo
          // que a tela vê.
          LINK_PROPOSTA: cfLinkDoDrive_(p.linkProposta),
          VENCEDORA: (!vencedorFinal ? false : idsProposta[i] === vencedorFinal),
          ORIGEM: 'app'
        };
      }));

      cfInserir_('EAP', linhasEap);
      if (linhasPreco.length) cfInserir_('Precos', linhasPreco);
    } catch (errGravar) {
      if (ehEdicao) {
        try {
          cfApagarPor_('Precos', 'ID_EQUALIZACAO', idEq);
          cfApagarPor_('EAP', 'ID_EQUALIZACAO', idEq);
          cfApagarPor_('Propostas', 'ID_EQUALIZACAO', idEq);
          cfApagarPor_('Equalizacoes', 'ID', idEq);
          if (backupEqualizacoes.length) cfInserir_('Equalizacoes', backupEqualizacoes);
          if (backupPropostas.length) cfInserir_('Propostas', backupPropostas);
          if (backupEap.length) cfInserir_('EAP', backupEap);
          if (backupPrecos.length) cfInserir_('Precos', backupPrecos);
        } catch (errRollback) {
          cfLog_('erro_rollback_edicao', 'Equalizacoes', idEq, String(errRollback.message || errRollback));
        }
      }
      throw errGravar;
    }

    // Fornecedor novo entra no cadastro: sem isso o mapa mostra "(sem
    // identificação)" e a próxima cotação redigita tudo de novo.
    cfCadastrarProponentes_(proponentes);

    cfRegistrarTempo_(idEq, d.segundosPreenchimento, proponentes.length, linhasEap.length, ehEdicao);

    cfLog_(ehEdicao ? 'editar_equalizacao' : 'criar_equalizacao', 'equalizacao', idEq, JSON.stringify({
      proponentes: proponentes.length, nos: linhasEap.length, precos: linhasPreco.length, editada: ehEdicao
    }));

    return {
      id: idEq,
      proponentes: proponentes.length,
      nos: linhasEap.length,
      precos: linhasPreco.length,
      editada: ehEdicao
    };
  }, 120);
}

/**
 * Cadastra quem ainda não existe e completa o contato de quem já existe.
 *
 * O contato digitado é o vendedor que cotou — a consulta pública devolve o e-mail
 * cadastral da empresa, que não serve para comprar. Por isso o que vem da
 * tela sobrescreve, mas só quando foi preenchido: campo vazio não apaga o
 * que já estava lá.
 */
function cfCadastrarProponentes_(proponentes) {
  const existentes = {};
  cfLerTudo_('Fornecedores').forEach(function (f) { existentes[cfSoDigitos_(f.CNPJ)] = f; });

  proponentes.forEach(function (p) {
    const cnpj = cfSoDigitos_(p.cnpj);
    const atual = existentes[cnpj];
    if (!atual) return;

    const mudar = {};
    if (p.contatoNome) mudar.CONTATO_NOME = p.contatoNome;
    if (p.telefone) mudar.CONTATO_TEL = p.telefone;
    if (p.email) mudar.CONTATO_EMAIL = p.email;
    if (Object.keys(mudar).length) {
      mudar.ATUALIZADO_EM = new Date();
      cfAtualizarLinha_('Fornecedores', atual._linha, mudar);
    }
  });

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
      CONTATO_NOME: p.contatoNome || '',
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


/**
 * Registra quanto tempo esta equalização levou para ser preenchida.
 *
 * O projeto se justifica por economizar o tempo de quem equaliza, e esse
 * tempo nunca foi medido — o que circulava era estimativa. Sem medida, a
 * afirmação de ganho não se sustenta diante de quem perguntar "em relação
 * a quê?".
 *
 * Três cuidados, porque um número ruim é pior que nenhum:
 *
 * 1. Os segundos vêm decorridos do navegador, não calculados entre
 *    relógios diferentes. Relógio de estação errado não contamina.
 * 2. Fora da faixa plausível, não grava. Uma aba esquecida aberta a noite
 *    toda produziria 40 mil segundos e envenenaria qualquer média.
 * 3. Grava o TAMANHO junto. "12 minutos" não quer dizer nada sozinho; 12
 *    minutos para 30 itens e 4 proponentes, sim — e é a única forma de
 *    comparar com o tempo da planilha para o mesmo trabalho.
 *
 * Nunca lança: perder a medição não pode derrubar a gravação.
 */
function cfRegistrarTempo_(idEq, segundos, quantosProponentes, quantosNos, ehEdicao) {
  try {
    const s = cfNumero_(segundos);
    if (s === null) return;                       // tela antiga, ou sem início marcado

    // Menos de 20 segundos é gerador de exemplo ou teste, não trabalho.
    // Mais de 4 horas é aba esquecida aberta.
    if (s < 20 || s > 14400) {
      Logger.log('Tempo fora da faixa plausível (' + s + 's) em ' + idEq + ': não registrado.');
      return;
    }

    cfLog_('tempo_equalizacao', 'equalizacao', idEq, JSON.stringify({
      segundos: s,
      proponentes: quantosProponentes,
      nos: quantosNos,
      edicao: !!ehEdicao
    }));
  } catch (erro) {
    Logger.log('CF: não consegui registrar o tempo — ' + erro);
  }
}

// ─────────────────────────────────────────────────────────────
//  Taxonomia de categorias
//
//  Sete macro-categorias, cada uma com as palavras que a identificam nos
//  documentos reais. As palavras não são enfeite: são o que permite
//  DERIVAR a categoria dos itens em vez de pedir que alguém classifique
//  cada equalização à mão.
//
//  Campo que depende de classificação manual nasce preenchido e morre
//  desatualizado — e as equalizações que já estão na base ficariam todas
//  em "sem categoria", o que faria a tela nascer inútil.
//
//  A derivação erra às vezes. Por isso é sugestão, não sentença: a tela
//  mostra o que ela deduziu e deixa trocar.
// ─────────────────────────────────────────────────────────────

const CF_CATEGORIAS = [
  { nome: 'Material de Consumo', icone: '☕',
    chaves: ['copo', 'café', 'cafe', 'açúcar', 'acucar', 'papel higi', 'papel toalha',
             'detergente', 'sabão', 'sabao', 'desinfetante', 'álcool', 'alcool',
             'luva', 'saco de lixo', 'guardanapo', 'toner', 'caneta', 'grampo',
             'sulfite', 'a4', 'copa', 'cozinha', 'higiene', 'limpeza', 'escritório',
             'escritorio', 'papelaria', 'descartável', 'descartavel'],
    subs: ['Copa & Cozinha', 'Higiene & Limpeza', 'Papelaria', 'Toners', 'EPIs Descartáveis'] },

  { nome: 'Material de Construção', icone: '🧱',
    chaves: ['cimento', 'areia', 'brita', 'tijolo', 'bloco', 'argamassa', 'tinta',
             'verniz', 'massa corrida', 'telha', 'calha', 'tubo', 'conexão', 'conexao',
             'registro', 'joelho', 'cabo', 'fio', 'disjuntor', 'lâmpada', 'lampada',
             'luminária', 'luminaria', 'eletroduto', 'alvenaria', 'hidráulic', 'hidraulic',
             'elétric', 'eletric', 'cobertura'],
    subs: ['Alvenaria', 'Elétrica & Iluminação', 'Hidráulica', 'Coberturas', 'Tintas'] },

  { nome: 'Obras & Reformas', icone: '🏗️',
    chaves: ['obra', 'reforma', 'piso industrial', 'junta', 'pavimenta', 'galpão',
             'galpao', 'mezanino', 'terraplen', 'concretagem', 'demoli', 'alvenaria estrutural',
             'impermeabiliza', 'pintura predial'],
    subs: ['Pisos Industriais & Juntas', 'Pavimentação', 'Galpões', 'Mezaninos', 'Terraplenagem'] },

  { nome: 'Serviços & Facilities', icone: '🧹',
    chaves: ['limpeza predial', 'conservação', 'conservacao', 'portaria', 'vigilância',
             'vigilancia', 'jardinagem', 'poda', 'praga', 'dedetiza', 'desratiza',
             'imuniza', 'resíduo', 'residuo', 'coleta', 'mão de obra', 'mao de obra',
             'terceiriza', 'facilities', 'zeladoria'],
    subs: ['Limpeza Predial', 'Portaria & Acesso', 'Jardinagem', 'Pragas', 'Gestão de Resíduos'] },

  { nome: 'Manutenção Predial & Engenharia', icone: '⚡',
    chaves: ['manutenção', 'manutencao', 'subestação', 'subestacao', 'gerador',
             'doca', 'niveladora', 'sprinkler', 'climatiza', 'ar condicionado',
             'ar-condicionado', 'chiller', 'bomba', 'casa de bombas', 'hidrante',
             'extintor', 'preventiv', 'corretiv', 'utilities'],
    subs: ['Subestações', 'Geradores', 'Docas & Niveladoras', 'Sprinklers', 'Climatização'] },

  { nome: 'Equipamentos & Locação', icone: '🚜',
    chaves: ['locação', 'locacao', 'aluguel', 'plataforma elevatória', 'plataforma elevatoria',
             'munck', 'empilhadeira', 'guindaste', 'andaime', 'container', 'contêiner'],
    subs: ['Plataformas Elevatórias', 'Geradores Móveis', 'Munck', 'Equipamentos de Carga'] },

  { nome: 'Tecnologia & Segurança', icone: '💻',
    chaves: ['cftv', 'câmera', 'camera', 'catraca', 'biometria', 'controle de acesso',
             'cabeamento', 'rede', 'wi-fi', 'wifi', 'nobreak', 'switch', 'servidor',
             'alarme', 'monitoramento'],
    subs: ['CFTV Perimetral', 'Catracas & Biometria', 'Cabeamento Estruturado'] }
];

/**
 * Quantas palavras-chave DISTINTAS aparecem no texto.
 *
 * Distintas depois de normalizar, e é aí que está o cuidado: as listas
 * trazem 'café' e 'cafe' — a mesma palavra com e sem acento — para quem
 * lê o código encontrar as duas grafias. Mas cfNormalizar_ tira o
 * acento, então as duas viram a mesma chave e um único "café em pó"
 * pontuava dois. Categoria com mais sinônimos escritos vencia por ter
 * mais sinônimos escritos, não por descrever melhor o documento.
 */
function cfContarChaves_(chaves, alvo) {
  const vistas = {};
  let n = 0;
  (chaves || []).forEach(function (k) {
    const chave = cfNormalizar_(k);
    if (!chave || vistas[chave]) return;
    vistas[chave] = true;
    if (alvo.indexOf(chave) >= 0) n++;
  });
  return n;
}

/** A categoria pelo nome, com ícone. Devolve null para nome desconhecido. */
function cfCategoria_(nome) {
  const n = cfNormalizar_(nome || '');
  if (!n) return null;
  return CF_CATEGORIAS.filter(function (c) { return cfNormalizar_(c.nome) === n; })[0] || null;
}

/**
 * Deduz a categoria a partir do que a equalização contém.
 *
 * Conta quantas palavras-chave de cada categoria aparecem nos textos, e
 * devolve a que mais aparece. Empate ou nenhuma aparição devolve ''.
 *
 * Devolver '' num empate é deliberado: escolher uma das duas seria
 * inventar uma classificação que o documento não sustenta, e ela
 * apareceria na tela com a mesma confiança das que estão certas.
 */
function cfCategoriaDerivada_(textos) {
  const alvo = ' ' + (textos || []).map(function (t) { return cfNormalizar_(t || ''); }).join(' ') + ' ';
  if (alvo.trim() === '') return '';

  const pontos = CF_CATEGORIAS.map(function (c) {
    return { nome: c.nome, n: cfContarChaves_(c.chaves, alvo) };
  }).filter(function (p) { return p.n > 0; })
    .sort(function (a, b) { return b.n - a.n; });

  if (!pontos.length) return '';
  if (pontos.length > 1 && pontos[0].n === pontos[1].n) return '';
  return pontos[0].nome;
}

/** Os textos de uma equalização que valem para deduzir a categoria. */
function cfTextosDaEqualizacao_(eq, descricoesDosItens) {
  return [eq.PROJETO || eq.projeto || '', eq.AREA || eq.area || '',
          eq.GRUPO_CENTRO_CUSTO || eq.grupoCentroCusto || '']
    .concat(descricoesDosItens || []);
}

// ─────────────────────────────────────────────────────────────
//  Subcategorias com palavras próprias
//
//  A macro-categoria responde "que tipo de compra é esta". A
//  subcategoria responde a pergunta que o comprador faz de verdade:
//  "quem me atende em elétrica?", "quem vende material de limpeza?".
//  Sete botões não respondem isso; o segundo nível responde.
// ─────────────────────────────────────────────────────────────

const CF_SUBCATEGORIAS = {
  'Material de Consumo': [
    { nome: 'Copa & Cozinha', chaves: ['copo', 'café', 'cafe', 'açúcar', 'acucar', 'adoçante',
        'chá', 'filtro de papel', 'guardanapo', 'talher', 'prato', 'copa', 'cozinha', 'garrafa'] },
    { nome: 'Higiene & Limpeza', chaves: ['papel higi', 'papel toalha', 'detergente', 'sabão',
        'sabao', 'sabonete', 'desinfetante', 'álcool', 'alcool', 'água sanitária', 'agua sanitaria',
        'cloro', 'saco de lixo', 'vassoura', 'rodo', 'pano de chão', 'pano de chao', 'esponja',
        'limpeza', 'higiene', 'multiuso', 'lustra', 'desengordurante'] },
    { nome: 'Papelaria', chaves: ['caneta', 'lápis', 'lapis', 'grampo', 'grampeador', 'clipe',
        'sulfite', 'a4', 'papel sulfite', 'pasta', 'envelope', 'etiqueta', 'papelaria', 'escritório', 'escritorio'] },
    { nome: 'Toners & Suprimentos de Impressão', chaves: ['toner', 'cartucho', 'tinta impressora', 'cilindro'] },
    { nome: 'EPIs Descartáveis', chaves: ['luva', 'máscara', 'mascara', 'touca', 'protetor auricular',
        'óculos de proteção', 'oculos de protecao', 'epi', 'bota', 'capacete'] }
  ],
  'Material de Construção': [
    { nome: 'Elétrica & Iluminação', chaves: ['cabo', 'fio', 'disjuntor', 'lâmpada', 'lampada',
        'luminária', 'luminaria', 'eletroduto', 'tomada', 'interruptor', 'quadro de distribuição',
        'reator', 'refletor', 'elétric', 'eletric', 'condulete', 'terminal', 'contator'] },
    { nome: 'Hidráulica', chaves: ['tubo', 'conexão', 'conexao', 'registro', 'joelho', 'luva de',
        'torneira', 'válvula', 'valvula', 'caixa d', 'hidráulic', 'hidraulic', 'sifão', 'sifao', 'ralo'] },
    { nome: 'Alvenaria', chaves: ['cimento', 'areia', 'brita', 'tijolo', 'bloco', 'argamassa',
        'rejunte', 'cal', 'vergalhão', 'vergalhao', 'concreto'] },
    { nome: 'Tintas', chaves: ['tinta', 'verniz', 'massa corrida', 'solvente', 'thinner',
        'primer', 'selador', 'rolo de pintura', 'pincel'] },
    { nome: 'Coberturas', chaves: ['telha', 'calha', 'rufo', 'manta', 'impermeabiliza', 'cobertura', 'policarbonato'] }
  ],
  'Obras & Reformas': [
    { nome: 'Pisos Industriais & Juntas', chaves: ['piso industrial', 'junta', 'polimento', 'lapidação', 'lapidacao'] },
    { nome: 'Pavimentação', chaves: ['pavimenta', 'asfalto', 'cbuq', 'meio-fio', 'guia e sarjeta'] },
    { nome: 'Galpões & Mezaninos', chaves: ['galpão', 'galpao', 'mezanino', 'estrutura metálica', 'estrutura metalica'] },
    { nome: 'Terraplenagem', chaves: ['terraplen', 'escavação', 'escavacao', 'aterro', 'compactação', 'compactacao'] },
    { nome: 'Reformas & Demolição', chaves: ['reforma', 'demoli', 'retrofit'] }
  ],
  'Serviços & Facilities': [
    { nome: 'Limpeza Predial', chaves: ['limpeza predial', 'conservação', 'conservacao', 'zeladoria',
        'auxiliar de limpeza', 'serviço de limpeza', 'servico de limpeza'] },
    { nome: 'Portaria & Acesso', chaves: ['portaria', 'vigilância', 'vigilancia', 'porteiro', 'recepção', 'recepcao'] },
    { nome: 'Jardinagem', chaves: ['jardinagem', 'poda', 'grama', 'paisagismo', 'roçada', 'rocada'] },
    { nome: 'Controle de Pragas', chaves: ['praga', 'dedetiza', 'desratiza', 'imuniza', 'descupiniza'] },
    { nome: 'Gestão de Resíduos', chaves: ['resíduo', 'residuo', 'coleta', 'caçamba', 'cacamba', 'destinação', 'destinacao'] }
  ],
  'Manutenção Predial & Engenharia': [
    { nome: 'Subestações & Geradores', chaves: ['subestação', 'subestacao', 'gerador', 'transformador', 'grupo gerador'] },
    { nome: 'Docas & Niveladoras', chaves: ['doca', 'niveladora', 'abrigo de doca'] },
    { nome: 'Combate a Incêndio', chaves: ['sprinkler', 'hidrante', 'extintor', 'incêndio', 'incendio', 'alarme de'] },
    { nome: 'Climatização', chaves: ['climatiza', 'ar condicionado', 'ar-condicionado', 'chiller', 'split', 'exaustor'] },
    { nome: 'Utilities & Bombas', chaves: ['bomba', 'casa de bombas', 'utilities', 'água', 'agua', 'esgoto', 'reservatório', 'reservatorio'] }
  ],
  'Equipamentos & Locação': [
    { nome: 'Plataformas Elevatórias', chaves: ['plataforma elevatória', 'plataforma elevatoria', 'tesoura', 'articulada'] },
    { nome: 'Empilhadeiras & Carga', chaves: ['empilhadeira', 'paleteira', 'transpaleteira', 'munck', 'guindaste'] },
    { nome: 'Andaimes & Containers', chaves: ['andaime', 'container', 'contêiner', 'escora'] }
  ],
  'Tecnologia & Segurança': [
    { nome: 'CFTV & Monitoramento', chaves: ['cftv', 'câmera', 'camera', 'dvr', 'nvr', 'monitoramento'] },
    { nome: 'Controle de Acesso', chaves: ['catraca', 'biometria', 'controle de acesso', 'crachá', 'cracha', 'leitor'] },
    { nome: 'Rede & Cabeamento', chaves: ['cabeamento', 'rack', 'switch', 'patch', 'wi-fi', 'wifi', 'roteador', 'fibra'] },
    { nome: 'Equipamentos de TI', chaves: ['notebook', 'computador', 'monitor', 'nobreak', 'servidor', 'impressora'] }
  ]
};

// ─────────────────────────────────────────────────────────────
//  CNAE → macro-categoria
//
//  O CNAE diz o que a empresa declara fazer, e às vezes é o único sinal
//  disponível: um fornecedor com poucos itens cotados não dá pistas
//  suficientes pelas descrições.
//
//  Sinal fraco de propósito. O CNAE é o que a empresa registrou na
//  abertura, não o que ela vende hoje — um comércio varejista com CNAE de
//  1990 vende outra coisa. Por isso ele nunca ganha do que o fornecedor
//  cotou de fato: entra quando as descrições não decidem.
//
//  Prefixos, do mais específico para o mais genérico.
// ─────────────────────────────────────────────────────────────

const CF_CNAE_CATEGORIA = [
  ['4321', 'Material de Construção'],          // instalação elétrica
  ['4322', 'Manutenção Predial & Engenharia'], // hidráulica, ar-condicionado
  ['4329', 'Manutenção Predial & Engenharia'],
  ['4744', 'Material de Construção'],          // varejo de material de construção
  ['4679', 'Material de Construção'],          // atacado de material de construção
  ['4741', 'Material de Construção'],          // tintas
  ['4742', 'Material de Construção'],          // material elétrico
  ['4673', 'Material de Construção'],
  ['4120', 'Obras & Reformas'],
  ['4211', 'Obras & Reformas'],
  ['4213', 'Obras & Reformas'],
  ['4222', 'Obras & Reformas'],
  ['4292', 'Obras & Reformas'],
  ['4399', 'Obras & Reformas'],
  ['4313', 'Obras & Reformas'],
  ['8121', 'Serviços & Facilities'],           // limpeza em prédios
  ['8122', 'Serviços & Facilities'],           // imunização e controle de pragas
  ['8129', 'Serviços & Facilities'],
  ['8130', 'Serviços & Facilities'],           // paisagismo
  ['8011', 'Serviços & Facilities'],           // vigilância
  ['8020', 'Tecnologia & Segurança'],          // monitoramento de sistemas de segurança
  ['3811', 'Serviços & Facilities'],           // coleta de resíduos
  ['3812', 'Serviços & Facilities'],
  ['3314', 'Manutenção Predial & Engenharia'], // manutenção de máquinas
  ['3321', 'Manutenção Predial & Engenharia'],
  ['3329', 'Manutenção Predial & Engenharia'],
  ['2790', 'Manutenção Predial & Engenharia'],
  ['7732', 'Equipamentos & Locação'],          // aluguel de máquinas e equipamentos
  ['7731', 'Equipamentos & Locação'],
  ['7739', 'Equipamentos & Locação'],
  ['4663', 'Equipamentos & Locação'],
  ['6209', 'Tecnologia & Segurança'],
  ['6190', 'Tecnologia & Segurança'],
  ['6110', 'Tecnologia & Segurança'],
  ['4651', 'Tecnologia & Segurança'],          // atacado de informática
  ['4652', 'Tecnologia & Segurança'],
  ['4757', 'Tecnologia & Segurança'],
  ['2610', 'Tecnologia & Segurança'],
  ['4761', 'Material de Consumo'],             // papelaria
  ['4647', 'Material de Consumo'],             // atacado de artigos de escritório
  ['4649', 'Material de Consumo'],
  ['4646', 'Material de Consumo'],             // higiene pessoal
  ['4644', 'Material de Consumo'],
  ['4637', 'Material de Consumo'],             // atacado de alimentos
  ['4639', 'Material de Consumo'],
  ['4691', 'Material de Consumo'],             // atacado de mercadorias em geral
  ['4789', 'Material de Consumo'],
  ['1721', 'Material de Consumo'],             // papel e papelão
  ['1742', 'Material de Consumo'],
  ['2062', 'Material de Consumo'],             // produtos de limpeza
  ['2063', 'Material de Consumo']
];

/**
 * A macro-categoria que o CNAE sugere. Vazio quando não reconhece.
 * Aceita "4744-0/99 — Comércio varejista…" ou só os dígitos.
 */
function cfCategoriaPorCnae_(cnae) {
  const d = String(cnae || '').replace(/\D/g, '');
  if (d.length < 4) return '';
  for (let i = 0; i < CF_CNAE_CATEGORIA.length; i++) {
    if (d.indexOf(CF_CNAE_CATEGORIA[i][0]) === 0) return CF_CNAE_CATEGORIA[i][1];
  }
  return '';
}

/**
 * A subcategoria, dentro de uma macro-categoria já decidida.
 * Mesma regra da macro: empate ou nada reconhecido devolve vazio.
 */
function cfSubcategoriaDerivada_(textos, categoria) {
  const subs = CF_SUBCATEGORIAS[categoria];
  if (!subs) return '';
  const alvo = ' ' + (textos || []).map(function (t) { return cfNormalizar_(t || ''); }).join(' ') + ' ';
  if (alvo.trim() === '') return '';

  const pontos = subs.map(function (s) {
    return { nome: s.nome, n: cfContarChaves_(s.chaves, alvo) };
  }).filter(function (p) { return p.n > 0; })
    .sort(function (a, b) { return b.n - a.n; });

  if (!pontos.length) return '';
  if (pontos.length > 1 && pontos[0].n === pontos[1].n) return '';
  return pontos[0].nome;
}

/**
 * Todas as categorias em que um fornecedor atua, em ordem de evidência.
 *
 * Três fontes, e a ordem entre elas importa:
 *
 *  1. As equalizações que ele disputou — categoria já decidida, às vezes
 *     por gente. É a evidência mais forte.
 *  2. O que ele cotou de fato. Vale para os orçamentos avulsos, que são a
 *     maior parte do acervo e onde estão quase todos os fornecedores.
 *  3. O CNAE, só quando as duas primeiras não decidem. É o que a empresa
 *     declarou na abertura, não o que ela vende hoje.
 *
 * Sem a fonte 2 o filtro nasceria vazio: fornecedor que só mandou
 * orçamento solto — que é a maioria — não tem categoria nenhuma.
 */
function cfCategoriasDoFornecedor_(categoriasDeEqualizacao, descricoes, cnae) {
  const contadas = {};
  Object.keys(categoriasDeEqualizacao || {}).forEach(function (c) {
    if (c) contadas[c] = (contadas[c] || 0) + categoriasDeEqualizacao[c] * 10;
  });

  // Cada descrição vota sozinha: uma lista de 40 itens de limpeza e 2 de
  // elétrica tem que resultar em limpeza, e não num empate.
  (descricoes || []).forEach(function (d) {
    const c = cfCategoriaDerivada_([d]);
    if (c) contadas[c] = (contadas[c] || 0) + 1;
  });

  const nomes = Object.keys(contadas).sort(function (a, b) { return contadas[b] - contadas[a]; });

  if (!nomes.length) {
    const porCnae = cfCategoriaPorCnae_(cnae);
    return porCnae ? { lista: [porCnae], principal: porCnae, origem: 'cnae' } : { lista: [], principal: '', origem: '' };
  }

  // Categoria com uma única menção entre dezenas é ruído — o item avulso
  // que qualquer fornecedor cota uma vez. Só entra na lista o que tem
  // presença de verdade.
  const maior = contadas[nomes[0]];
  const relevantes = nomes.filter(function (n) { return contadas[n] >= Math.max(2, maior * 0.15); });

  return {
    lista: relevantes.length ? relevantes : [nomes[0]],
    principal: nomes[0],
    origem: 'itens'
  };
}
