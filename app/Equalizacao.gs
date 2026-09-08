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
      // O saving da NEGOCIAÇÃO, que é o que foi prometido ao comitê:
      // "diferença entre proposta inicial e valor contratado".
      //
      // Não confundir com a economia da disputa (o quanto o vencedor é
      // mais barato que o mais caro). Aquela existe por ter cotado;
      // esta existe por ter negociado, e é a única que a ferramenta
      // pode reivindicar como resultado do processo.
      //
      // Null quando não houve rodada registrada — e null é diferente de
      // zero: zero afirmaria que se negociou e não se ganhou nada.
      savingAbsoluto: cfSavingDaEqualizacao_(eq, minhas),
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
 * O saving do time ao longo do tempo.
 *
 * Este é o ponto do indicador, e vale escrever para não se perder:
 * o saving já existia — ele ficava disperso numa planilha por compra.
 * Para saber como o time negociou num semestre era preciso abrir
 * dezenas de arquivos, e o que não fosse aberto simplesmente não
 * entrava na conta.
 *
 * O que a ferramenta acrescenta não é economizar mais: é tornar o
 * que se economizou visível, somável e comparável — por mês, por
 * Mega, por categoria e por quem negociou.
 *
 * Duas decisões de leitura:
 *
 *  - O saving entra no mês da DECISÃO (HOMOLOGADO_EM), não no da
 *    cotação. Uma compra cotada em março e fechada em maio rendeu em
 *    maio; jogá-la em março faria o mês fechado mudar depois.
 *  - Equalização sem HOMOLOGADO_EM (as anteriores a esta versão)
 *    cai para a data da equalização, e isso vai marcado em
 *    `dataAproximada` — para ninguém apresentar como precisão o que
 *    é aproximação.
 */
function cfPanoramaSaving_() {
  const propostas = cfLerTudo_('Propostas');
  const porMes = {}, porMega = {}, porCategoria = {}, porPessoa = {};
  let total = 0, compras = 0, homologadas = 0, aproximadas = 0;
  let totalContratado = 0;

  const acumular = function (mapa, chave, saving, contratado) {
    if (!chave) chave = '(sem registro)';
    const g = mapa[chave] || (mapa[chave] = { chave: chave, saving: 0, compras: 0, contratado: 0 });
    g.saving += saving;
    g.contratado += contratado || 0;
    g.compras++;
  };

  let semDecisao = 0;

  cfLerTudo_('Equalizacoes').forEach(function (eq) {
    if (String(eq.STATUS || '') !== 'homologada') {
      // O acervo importado cai TODO aqui, e é preciso dizer isso.
      //
      // Uma equalização importada traz as propostas e o valor inicial,
      // mas não traz quem venceu: o documento de origem não registra a
      // decisão. Sem vencedor marcado ela não produz saving — e, calada,
      // o painel mostraria zero sem explicar que existem N compras
      // esperando um clique de duas pessoas para virarem número.
      //
      // Não é ruído: é a fila de trabalho que separa o painel vazio do
      // painel com a série histórica inteira.
      semDecisao++;
      return;
    }
    homologadas++;

    const minhas = propostas.filter(function (p) {
      return String(p.ID_EQUALIZACAO) === String(eq.ID);
    });
    const saving = cfSavingDaEqualizacao_(eq, minhas);
    if (saving === null) return;

    const contratado = cfValorContratado_(eq, minhas) || 0;
    total += saving;
    totalContratado += contratado;
    compras++;

    const dataDecisao = cfData_(eq.HOMOLOGADO_EM);
    const data = dataDecisao || cfData_(eq.DATA_EQUALIZACAO);
    if (!dataDecisao) aproximadas++;

    const mes = data
      ? (data.getFullYear() + '-' + ('0' + (data.getMonth() + 1)).slice(-2))
      : '(sem data)';

    acumular(porMes, mes, saving, contratado);
    acumular(porMega, eq.ID_EMPREENDIMENTO, saving, contratado);
    acumular(porCategoria, eq.CATEGORIA, saving, contratado);
    // O fallback vai MARCADO. Equalização anterior ao schema v7 não
    // tem HOMOLOGADO_POR, e cair calado para CRIADO_POR faria a
    // quebra "por quem negociou" medir quem digitou — exatamente o
    // que a coluna nova existe para evitar.
    const negociador = eq.HOMOLOGADO_POR ||
      (eq.CRIADO_POR ? eq.CRIADO_POR + ' (criou; sem registro de quem homologou)' : '');
    acumular(porPessoa, negociador, saving, contratado);
  });

  // Percentual sobre o contratado: R$ 50 mil de saving em R$ 200 mil
  // comprados é outra história de R$ 50 mil em R$ 5 milhões.
  const comPercentual = function (mapa, ordenarPorChave) {
    const lista = Object.keys(mapa).map(function (k) {
      const g = mapa[k];
      g.percentual = g.contratado > 0
        ? Math.round((g.saving / (g.saving + g.contratado)) * 1000) / 10
        : null;
      g.saving = Math.round(g.saving * 100) / 100;
      return g;
    });
    return ordenarPorChave
      ? lista.sort(function (a, b) { return String(a.chave).localeCompare(String(b.chave)); })
      : lista.sort(function (a, b) { return b.saving - a.saving; });
  };

  return {
    total: Math.round(total * 100) / 100,
    totalContratado: Math.round(totalContratado * 100) / 100,
    percentual: totalContratado > 0
      ? Math.round((total / (total + totalContratado)) * 1000) / 10 : null,
    compras: compras,
    homologadas: homologadas,
    // Quantas homologadas NÃO produziram saving: ou não houve rodada,
    // ou ninguém registrou o valor inicial. As duas são acionáveis, e
    // esconder o denominador transformaria o indicador em vitrine.
    semRegistro: homologadas - compras,
    // Equalizações que existem na base e ainda não têm decisão marcada.
    // Cada uma é um saving que a tela não pode mostrar ainda.
    semDecisao: semDecisao,
    dataAproximada: aproximadas,
    porMes: comPercentual(porMes, true),
    porMega: comPercentual(porMega),
    porCategoria: comPercentual(porCategoria),
    porPessoa: comPercentual(porPessoa)
  };
}

/** O valor efetivamente contratado, na mesma precedência do resto. */
function cfValorContratado_(eq, propostas) {
  const vencedora = (propostas || []).filter(function (p) {
    return p.VENCEDORA === true ||
           (eq.ID_PROPOSTA_VENCEDORA && String(p.ID) === String(eq.ID_PROPOSTA_VENCEDORA));
  })[0];
  if (cfNumero_(eq.VALOR_FINAL) !== null) return cfNumero_(eq.VALOR_FINAL);
  if (!vencedora) return null;
  const dec = cfNumero_(vencedora.VALOR_TOTAL_DECLARADO);
  return dec !== null ? dec : cfNumero_(vencedora.VALOR_TOTAL_CALCULADO);
}

/**
 * Quanto a negociação rendeu nesta equalização.
 *
 * Só existe com três coisas juntas: a compra foi homologada, sabe-se
 * qual proposta venceu, e alguém registrou o valor inicial dela. Sem
 * as três, devolve null — a tela mostra "—" e ninguém apresenta um
 * número que não tem de onde sair.
 *
 * O valor contratado segue a mesma precedência do resto do sistema:
 * o VALOR_FINAL carimbado na homologação manda; depois o total
 * declarado pelo fornecedor; por último a soma dos itens.
 */
function cfSavingDaEqualizacao_(eq, propostas) {
  if (String(eq.STATUS || '') !== 'homologada') return null;

  const vencedora = (propostas || []).filter(function (p) {
    return p.VENCEDORA === true ||
           (eq.ID_PROPOSTA_VENCEDORA && String(p.ID) === String(eq.ID_PROPOSTA_VENCEDORA));
  })[0];
  if (!vencedora) return null;

  const inicial = cfNumero_(vencedora.VALOR_PROPOSTA_INICIAL);
  if (inicial === null || inicial <= 0) return null;

  const contratado = cfNumero_(eq.VALOR_FINAL) !== null
    ? cfNumero_(eq.VALOR_FINAL)
    : (cfNumero_(vencedora.VALOR_TOTAL_DECLARADO) !== null
        ? cfNumero_(vencedora.VALOR_TOTAL_DECLARADO)
        : cfNumero_(vencedora.VALOR_TOTAL_CALCULADO));
  if (contratado === null) return null;

  const saving = inicial - contratado;
  // Contratar por mais que a proposta inicial não é saving negativo:
  // é escopo que mudou no meio, e chamar isso de economia (ou de
  // prejuízo) seria inventar uma leitura que o dado não sustenta.
  return saving > 0 ? Math.round(saving * 100) / 100 : null;
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

  // Uma leitura só das avaliações, antes do laço: por proponente
  // seriam N leituras da mesma faixa.
  const iqfs = cfIqfPorCnpj_();

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
        // A nota do pós-serviço na tela de quem decide.
        //
        // É o que fecha o laço: sem isto, avaliar é um favor que não
        // volta para quem fez, e a avaliação morre como morreu no
        // formulário anterior. A reputação tem de estar à vista no
        // momento da escolha, não numa tela que se visita depois.
        iqf: iqfs[cnpj] || null,
        total: cfNumero_(p.VALOR_TOTAL_DECLARADO),
        calculado: cfNumero_(p.VALOR_TOTAL_CALCULADO),
        vencedora: p.VENCEDORA === true,
        // O rodapé da EQU: sem isto o mapa mostra preço e esconde tudo que
        // decide uma compra — prazo, validade, condição de pagamento.
        numero: p.NUMERO_PROPOSTA || '',
        revisao: p.REVISAO_FORNECEDOR || '',
        data: cfDataTexto_(p.DATA_PROPOSTA),
        validadeAte: (function () {
          if (p.VALIDADE_ATE) return cfDataTexto_(p.VALIDADE_ATE);
          const dias = cfNumero_(p.VALIDADE_DIAS);
          const dtProp = cfData_(p.DATA_PROPOSTA);
          if (dias && dtProp) {
            const dtVal = new Date(dtProp.getTime() + (dias * 86400000));
            return cfDataTexto_(dtVal);
          }
          return '';
        })(),
        condicoes: p.CONDICOES_PAGAMENTO || '',
        leadTime: cfNumero_(p.LEAD_TIME_DIAS),
        prazoExecucao: (function () {
          let pr = cfNumero_(p.PRAZO_EXECUCAO_DIAS);
          if (pr === null && p.DATA_PREV_INICIO && p.DATA_PREV_TERMINO) {
            const d1 = cfData_(p.DATA_PREV_INICIO);
            const d2 = cfData_(p.DATA_PREV_TERMINO);
            if (d1 && d2 && d2 >= d1) {
              pr = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
            }
          }
          return pr;
        })(),
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
      status: pr.STATUS_PRECO || '',
      marcaCotada: pr.MARCA_COTADA || ''
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

  const precosHistoricoBase = typeof cfCarregarPrecos_ === 'function' ? cfCarregarPrecos_() : [];
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

      let refHist = null;
      if (typeof cfBuscarReferenciaPrecoItem_ === 'function' && (n.TIPO || 'item') !== 'grupo') {
        try {
          refHist = cfBuscarReferenciaPrecoItem_(n.DESCRICAO, n.UNIDADE_REFERENCIA, idEq, precosHistoricoBase);
        } catch (eRef) {}
      }

      linhas.push({
        id: n.ID,
        nivel: nivel,
        tipo: n.TIPO || 'item',
        codigo: n.CODIGO_ORIGINAL || '',
        descricao: n.DESCRICAO || '',
        marcaReferencia: n.MARCA_REFERENCIA || '',
        quantidade: cfNumero_(n.QUANTIDADE_REFERENCIA),
        unidade: n.UNIDADE_REFERENCIA || '',
        referenciaHistorica: refHist,
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
    proponentes: (function () {
      const itensParaCotar = linhas.filter(function (l) { return l.tipo !== 'grupo'; });
      const totalItens = itensParaCotar.length;
      if (totalItens > 0) {
        proponentes.forEach(function (p) {
          let cotados = 0;
          itensParaCotar.forEach(function (it) {
            const pr = it.precos[p.id];
            if (pr && (pr.status === 'cotado' || pr.status === 'incluso_em_outro_item') &&
                (pr.valor !== null || pr.status === 'incluso_em_outro_item')) {
              cotados++;
            }
          });
          p.itensCotados = cotados;
          p.totalItens = totalItens;
          p.coberturaEscopo = cotados + '/' + totalItens;
        });
      }
      return proponentes;
    })(),
    linhas: linhas,
    pendencias: (function () {
      const pends = cfPendenciasDaEqualizacao_(idEq);
      const itensParaCotar = linhas.filter(function (l) { return l.tipo !== 'grupo'; });
      const totalItens = itensParaCotar.length;
      if (totalItens === 0) return pends;

      // Nomear os itens é o que faz a ressalva servir para alguma
      // coisa. "Deixou itens sem cotar" manda o comprador varrer a
      // tabela coluna por coluna para descobrir quais; dizer quais
      // entrega a conferência pronta — e é exatamente essa lista que
      // ele vai copiar para cobrar o fornecedor.
      const rotulo = function (it) {
        return (it.codigo ? it.codigo + ' ' : '') + String(it.descricao || '').trim();
      };
      // Teto de itens listados: uma ressalva de trinta linhas não é
      // lida, e o número total já vai dito antes da lista.
      const lista = function (itens, teto) {
        const nomes = itens.slice(0, teto).map(rotulo);
        const resto = itens.length - nomes.length;
        return nomes.join('; ') + (resto > 0 ? '; e mais ' + resto : '');
      };

      proponentes.forEach(function (p) {
        const semCotar = [];
        const semMarca = [];
        const outraMarca = [];

        itensParaCotar.forEach(function (it) {
          const pr = it.precos[p.id];
          const cotou = pr && (pr.status === 'cotado' || pr.status === 'incluso_em_outro_item') &&
                        (pr.valor !== null || pr.status === 'incluso_em_outro_item');

          if (!cotou) {
            // "Excluído" e "não aplicável" são decisão declarada, não
            // omissão: cobrar o fornecedor por eles seria cobrar o que
            // já foi respondido.
            if (!pr || (pr.status !== 'excluido' && pr.status !== 'nao_aplicavel')) {
              semCotar.push(it);
            }
            return;
          }

          // Marca só é pendência onde foi pedida.
          if (!it.marcaReferencia) return;
          if (!pr.marcaCotada) { semMarca.push(it); return; }
          if (cfMarcaDivergente_(pr.marcaCotada, it.marcaReferencia)) outraMarca.push(it);
        });

        if (semCotar.length && p.itensCotados > 0) {
          const jaExiste = pends.some(function (pend) {
            return (pend.descricao || '').indexOf(p.nome) >= 0;
          });
          if (!jaExiste) {
            pends.push({
              tipo: 'cesta_incompleta',
              descricao: p.nome + ' não cotou ' + semCotar.length + ' de ' + totalItens +
                         ' itens: ' + lista(semCotar, 6) + '.'
            });
          }
        }

        if (semMarca.length) {
          pends.push({
            tipo: 'marca_nao_informada',
            descricao: p.nome + ' cotou sem informar a marca: ' + lista(semMarca, 6) + '.'
          });
        }

        if (outraMarca.length) {
          pends.push({
            tipo: 'marca_divergente',
            descricao: p.nome + ' cotou marca diferente da referência: ' +
                       outraMarca.slice(0, 4).map(function (it) {
                         return rotulo(it) + ' (' + it.precos[p.id].marcaCotada +
                                ', pedido ' + it.marcaReferencia + ')';
                       }).join('; ') +
                       (outraMarca.length > 4 ? '; e mais ' + (outraMarca.length - 4) : '') + '.'
          });
        }
      });

      return pends;
    })()
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

// ─────────────────────────────────────────────────────────────
//  Cadastro em tabela, constante como rede
//
//  Os três Megas e as duas contratantes acima nasceram no programa. Isso
//  fecha o projeto em três empreendimentos: abrir o quarto exigiria
//  publicar código, e é justamente a escala (Obras, Demercado, 2027) que
//  o projeto promete. As abas `Empreendimentos` e `Empresas` já existiam
//  no schema desde a v1 e ninguém escrevia nelas.
//
//  Daqui em diante o cadastro manda. As constantes ficam por dois
//  motivos, ambos deliberados:
//
//  1. São a semente — semearCadastrosBase() copia exatamente elas para as
//     abas no primeiro uso.
//  2. São a rede. A base de alguém pode não ter sido semeada, e a aba
//     pode nem existir numa instalação antiga. Tela sem Mega nenhum é
//     falha total; cair na constante é degradar para o que já funcionava.
//
//  O fallback é por AUSÊNCIA DE RESPOSTA, não por tabela vazia: se o
//  cadastro existe mas não conhece este Mega, a constante ainda responde.
// ─────────────────────────────────────────────────────────────

/** Cadastro lido uma vez por execução. Ler a aba por Mega, dentro dos
 *  laços de Manutencao.gs, seria uma leitura de planilha por linha. */
const CF_CACHE_CADASTRO = {};

/** Descarta o cache. Quem escreve no cadastro chama isto. */
function cfLimparCacheCadastro_() {
  Object.keys(CF_CACHE_CADASTRO).forEach(function (k) { delete CF_CACHE_CADASTRO[k]; });
}

/**
 * Lê uma aba de cadastro sem derrubar quem chamou.
 *
 * cfLerTudo_ lança quando a aba não existe, e numa base anterior ao
 * schema atual ela pode mesmo não existir. Cadastro faltando nunca pode
 * impedir de montar ou homologar uma equalização — para isso existem os
 * fallbacks abaixo.
 */
function cfCadastro_(tabela) {
  if (CF_CACHE_CADASTRO[tabela]) return CF_CACHE_CADASTRO[tabela];
  let linhas = [];
  try {
    const lido = cfLerTudo_(tabela);
    if (Array.isArray(lido)) linhas = lido;
  } catch (erro) {
    Logger.log('CF: não consegui ler o cadastro "' + tabela + '" — ' + erro);
  }
  CF_CACHE_CADASTRO[tabela] = linhas;
  return linhas;
}

/**
 * Coluna booleana de cadastro.
 *
 * Em branco conta como o padrão, não como false. A validação de checkbox
 * que cfFormatarAba_ aplica deixa a coluna inteira em FALSE, então quem
 * digita uma linha nova e não marca o quadradinho não pode ver o registro
 * sumir da tela. Só o false EXPLÍCITO desliga.
 */
function cfBooleanoCadastro_(valor, padrao) {
  if (valor === true) return true;
  if (valor === false) return false;
  if (valor === null || valor === undefined || String(valor).trim() === '') return padrao;
  const t = String(valor).trim().toLowerCase();
  if (t === 'false' || t === 'nao' || t === 'não' || t === 'n' || t === '0') return false;
  return true;
}

/** Este texto é o mesmo empreendimento da linha de cadastro? */
function cfLinhaDoMega_(linha, alvoNormalizado) {
  const candidatos = [linha.NOME, linha.ID].concat(
    String(linha.APELIDOS || '').split('|')
  );
  return candidatos.some(function (c) {
    const n = cfNormalizar_(String(c || ''));
    return n && n === alvoNormalizado;
  });
}

/**
 * Os Megas oferecidos na tela, em ordem de cadastro.
 * Tabela primeiro; constante quando a tabela não responde.
 */
function cfEmpreendimentos_() {
  const nomes = [];
  cfCadastro_('Empreendimentos').forEach(function (e) {
    if (!cfBooleanoCadastro_(e.ATIVO, true)) return;
    const nome = String(e.NOME || e.ID || '').trim();
    if (nome && nomes.indexOf(nome) < 0) nomes.push(nome);
  });
  return nomes.length ? nomes : CF_EMPREENDIMENTOS.slice();
}

function cfEmpresaDoMega_(empreendimento) {
  const alvo = String(empreendimento || '').trim();
  if (!alvo) return { cnpj: '', nome: '' };
  const alvoNorm = cfNormalizar_(alvo);

  const doCadastro = cfCadastro_('Empreendimentos').filter(function (e) {
    return cfLinhaDoMega_(e, alvoNorm);
  })[0];

  // Curitiba é Demercado; Esteio e Itajaí são Capital Realty. Continua
  // determinístico e continua derivado — muda só de onde vem a resposta.
  const cnpj = (doCadastro ? cfSoDigitos_(doCadastro.CNPJ_EMPRESA) : '')
    || cfSoDigitos_(CF_EMPRESA_DO_MEGA[alvo] || '');
  if (!cnpj) return { cnpj: '', nome: '' };

  const empresaCadastrada = cfCadastro_('Empresas').filter(function (x) {
    return cfSoDigitos_(x.CNPJ) === cnpj && cfBooleanoCadastro_(x.ATIVA, true);
  })[0];
  const razao = empresaCadastrada ? String(empresaCadastrada.RAZAO_SOCIAL || '').trim() : '';
  if (razao) return { cnpj: cnpj, nome: razao };

  const daConstante = CF_EMPRESAS.filter(function (e) { return e.cnpj === cnpj; })[0];
  return { cnpj: cnpj, nome: daConstante ? daConstante.nome : '' };
}

// ─────────────────────────────────────────────────────────────
//  Cotação mínima por faixa de valor — tabela `Regras`
//
//  A aba existe no schema desde a v1 e nunca foi lida por ninguém. O
//  efeito era que homologar R$ 80 mil com uma proposta só passava sem
//  nenhum registro do porquê. É a primeira pergunta de qualquer comitê e
//  o sistema não tinha resposta.
//
//  Tabela vazia é AUSÊNCIA DE REGRA, não regra zero, e por isso aqui não
//  há fallback para constante: passar a exigir cotações que ninguém
//  configurou seria endurecer a homologação de uma base legada pelas
//  costas de quem a opera. Quem liga a regra é semearCadastrosBase().
// ─────────────────────────────────────────────────────────────

/**
 * A faixa que se aplica a este valor, ou null quando não há regra.
 *
 * VALOR_DE fecha embaixo e VALOR_ATE abre em cima (DE <= v < ATE), com
 * ATE vazio = sem teto. É o que faz um valor cair em exatamente uma faixa
 * quando ele calha de ser o limite entre duas.
 */
function cfRegraCotacao_(valor, cnpjEmpresa) {
  const v = cfNumero_(valor);
  if (v === null) return null;

  const cnpj = cfSoDigitos_(cnpjEmpresa || '');
  const aplicaveis = cfCadastro_('Regras').filter(function (r) {
    if (!cfBooleanoCadastro_(r.ATIVA, true)) return false;
    const minimo = cfNumero_(r.COTACOES_MINIMAS);
    if (minimo === null || minimo < 1) return false;      // regra sem número não é regra
    const de = cfNumero_(r.VALOR_DE);
    const ate = cfNumero_(r.VALOR_ATE);
    if (de !== null && v < de) return false;
    if (ate !== null && v >= ate) return false;
    const daEmpresa = cfSoDigitos_(r.CNPJ_EMPRESA || '');
    return !daEmpresa || daEmpresa === cnpj;
  });
  if (!aplicaveis.length) return null;

  // Regra escrita para a empresa ganha da genérica. Entre duas do mesmo
  // alcance, vale a mais exigente: faixas sobrepostas são erro de
  // cadastro, e escolher a mais frouxa esconderia o erro exatamente onde
  // ele custa caro.
  aplicaveis.sort(function (a, b) {
    const espA = cfSoDigitos_(a.CNPJ_EMPRESA || '') ? 1 : 0;
    const espB = cfSoDigitos_(b.CNPJ_EMPRESA || '') ? 1 : 0;
    if (espA !== espB) return espB - espA;
    return cfNumero_(b.COTACOES_MINIMAS) - cfNumero_(a.COTACOES_MINIMAS);
  });

  const escolhida = aplicaveis[0];
  return {
    id: String(escolhida.ID || ''),
    minimo: cfNumero_(escolhida.COTACOES_MINIMAS),
    permiteExcecao: cfBooleanoCadastro_(escolhida.PERMITE_EXCECAO, true),
    descricao: String(escolhida.DESCRICAO || '')
  };
}

function cfCriarEqualizacao_(d) {
  if (!d) throw new Error('Nada recebido.');
  if (!d.empreendimento) throw new Error('Escolha o empreendimento.');
  if (cfEmpreendimentos_().indexOf(d.empreendimento) < 0) {
    throw new Error('Empreendimento "' + d.empreendimento + '" não é um dos Megas.');
  }

  const proponentes = [];
  (d.proponentes || []).forEach(function (p, idx) {
    if ((p.nome && String(p.nome).trim()) || cfSoDigitos_(p.cnpj)) {
      proponentes.push(Object.assign({}, p, { _colIndex: idx }));
    }
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

    // ── proponentes: preserva os IDs de proposta existentes SOMENTE quando a identidade
    // (CNPJ ou Nome) coincidir. NUNCA reaproveita por ordem de coluna,
    // pois substituir Alfa por Gama na mesma coluna faria Gama herdar a decisão de Alfa (C02/A0).
    const propostasUsadas = {};
    const idsProposta = proponentes.map(function (p) {
      if (ehEdicao && backupPropostas.length) {
        const cnpjP = cfSoDigitos_(p.cnpj);
        const nomeP = String(p.nome || '').trim().toLowerCase();
        let achada = cnpjP ? backupPropostas.filter(function (pa) {
          return !propostasUsadas[pa.ID] && cfSoDigitos_(pa.CNPJ) === cnpjP;
        })[0] : null;
        if (!achada && nomeP) {
          achada = backupPropostas.filter(function (pa) {
            return !propostasUsadas[pa.ID] && String(pa.RAZAO_SOCIAL_INFORMADA || '').trim().toLowerCase() === nomeP;
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
      // Ao voltar para um degrau de cima, os de baixo deixam de existir.
      // Sem esta limpeza a pilha guardava o filho do GRUPO A, e o primeiro
      // item fundo do GRUPO B era gravado com ID_PAI apontando para lá —
      // ao reabrir, ele saía da lista de B, aparecia dentro de A e ainda
      // mudava de posição, porque a leitura remonta a lista pela árvore.
      for (let k = nivel + 1; k <= 3; k++) delete pilha[k];

      linhasEap.push({
        ID: idNo,
        ID_EQUALIZACAO: idEq,
        ID_PAI: nivel > 0 ? (pilha[nivel - 1] || '') : '',
        ORDEM: ordem + 1,
        TIPO: item.tipo === 'grupo' ? 'grupo' : 'item',
        DESCRICAO: String(item.descricao).trim(),
        QUANTIDADE_REFERENCIA: cfNumero_(item.quantidade),
        UNIDADE_REFERENCIA: item.unidade || '',
        CODIGO_ORIGINAL: item.codigo || '',
        MARCA_REFERENCIA: item.marcaReferencia ? String(item.marcaReferencia).trim() : ''
      });

      // Grupo agrega; preço só existe em item. Gravar preço no grupo faz o
      // total contar duas vezes na hora de somar.
      if (item.tipo === 'grupo') return;

      proponentes.forEach(function (p, i) {
        const colIdx = p._colIndex !== undefined ? p._colIndex : i;
        const digitado = cfNumero_((item.precos || [])[colIdx]);
        const cotou = digitado !== null && digitado !== undefined &&
                      String((item.precos || [])[colIdx]).trim() !== '';
        const marcaCotada = cotou && item.marcas && item.marcas[colIdx] ? String(item.marcas[colIdx]).trim() : '';
        const qtd = cfNumero_(item.quantidade);
        // C05: Quantidade zero é zero de fato (não vira 1 silenciosamente).
        const q = qtd !== null ? qtd : 1;

        // O formulário EQU só tem o total da linha; ter o unitário é a
        // melhoria. Quando o comprador transcreve um documento antigo ele
        // digita o total, e o unitário é derivado — ORIGEM_CALCULO guarda
        // qual dos dois foi informado, para o histórico não misturar preço
        // digitado com preço deduzido.
        const porTotal = d.baseValores === 'total';
        const unitario = cotou ? (porTotal ? (q !== 0 ? digitado / q : 0) : digitado) : null;
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
          ORIGEM: 'app',
          MARCA_COTADA: marcaCotada
        });
      });
    });

    // Preserva dados de homologação e decisão anterior quando existirem,
    // garantindo que o vencedor aponte para uma proposta válida existente (sem órfãos).
    let statusFinal = anterior ? (anterior.STATUS || 'em_cotacao') : 'em_cotacao';
    let vencedorFinal = anterior ? (anterior.ID_PROPOSTA_VENCEDORA || '') : '';
    let cnpjVencedorFinal = anterior ? (anterior.CNPJ_VENCEDOR || '') : '';
    let valorFinal = anterior ? (anterior.VALOR_FINAL || '') : '';
    let parecerFinal = anterior ? (anterior.PARECER_FAVORAVEL || '') : '';
    let ocFinal = anterior ? (anterior.NUMERO_OC || '') : '';

    // Se o vencedor anterior não estiver diretamente pelo ID nos atuais,
    // localiza pelo CNPJ do vencedor
    if (vencedorFinal && idsProposta.indexOf(vencedorFinal) < 0) {
      if (cnpjVencedorFinal) {
        const idxPorCnpj = proponentes.findIndex(function (p) { return cfSoDigitos_(p.cnpj) === cnpjVencedorFinal; });
        if (idxPorCnpj >= 0) {
          vencedorFinal = idsProposta[idxPorCnpj];
        } else {
          vencedorFinal = '';
        }
      } else {
        vencedorFinal = '';
      }
    }

    // Se o fornecedor vencedor foi removido ou substituído por outro fornecedor,
    // limpa os vínculos de homologação e parecer para evitar que outra empresa
    // herde indevidamente a decisão (C02 / A0).
    if (!vencedorFinal) {
      cnpjVencedorFinal = '';
      parecerFinal = '';
      valorFinal = '';
      if (statusFinal === 'homologada') statusFinal = 'em_cotacao';
    }

    // Se há vencedor identificado, atualiza o VALOR_FINAL com o novo valor negociado/declarado
    if (vencedorFinal) {
      const idxV = idsProposta.indexOf(vencedorFinal);
      if (idxV >= 0) {
        const pV = proponentes[idxV];
        const r02 = cfNumero_(pV.r02);
        const r01 = cfNumero_(pV.r01);
        const dec = cfNumero_(pV.totalDeclarado);
        const ini = cfNumero_(pV.propostaInicial);
        // C08: O valor vigente é a última rodada de negociação preenchida
        const vAtual = r02 !== null ? r02
                     : (r01 !== null ? r01
                     : (dec !== null ? dec
                     : (ini !== null ? ini : (cotouAlgo[idxV] ? totais[idxV] : null))));
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
        const r02 = cfNumero_(p.r02);
        const r01 = cfNumero_(p.r01);
        const rodada = r02 !== null ? 'R02'
                     : (r01 !== null ? 'R01' : 'inicial');
        const inicial = cfNumero_(p.propostaInicial);
        const dec = cfNumero_(p.totalDeclarado);
        // C08: O valor vigente comercial é determinado pela rodada de negociação
        const declarado = r02 !== null ? r02
                        : (r01 !== null ? r01
                        : (dec !== null ? dec : inicial));

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
              const d1 = cfData_(p.dataPrevInicio);
              const d2 = cfData_(p.dataPrevTermino);
              if (d1 && d2 && d2 >= d1) {
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

    const valEscolhido = valorDe(escolhida);
    if (valEscolhido === null || valEscolhido <= 0) {
      throw new Error('A proposta escolhida não possui valor válido para homologação (valor deve ser maior que zero).');
    }

    // C07: Validade vencida exige justificativa ou confirmação de revalidação no parecer
    if (escolhida.VALIDADE_ATE) {
      const dtValidade = cfData_(escolhida.VALIDADE_ATE);
      const hojeZero = new Date();
      hojeZero.setHours(0, 0, 0, 0);
      if (dtValidade && dtValidade < hojeZero && !String(parecer || '').trim()) {
        throw new Error('A proposta selecionada está com validade vencida (' + cfDataTexto_(dtValidade) + '). Justifique a escolha ou informe a revalidação no parecer.');
      }
    }

    // C03: Cesta incompleta não pode ser homologada sem parecer justificando adjudicação parcial
    const precosEq = cfLerTudo_('Precos').filter(function (pr) { return String(pr.ID_EQUALIZACAO) === String(idEq); });
    const eapEq = cfLerTudo_('EAP').filter(function (eap) { return String(eap.ID_EQUALIZACAO) === String(idEq) && eap.TIPO !== 'grupo'; });
    const totalItensEq = eapEq.length;
    if (totalItensEq > 0) {
      const itensEscolhida = precosEq.filter(function (pr) {
        return String(pr.ID_PROPOSTA) === String(idProposta) &&
          (pr.STATUS_PRECO === 'cotado' || pr.STATUS_PRECO === 'incluso_em_outro_item') &&
          (cfNumero_(pr.PRECO_UNITARIO) !== null || cfNumero_(pr.VALOR_TOTAL) !== null || pr.STATUS_PRECO === 'incluso_em_outro_item');
      }).length;
      if (itensEscolhida < totalItensEq && !String(parecer || '').trim()) {
        throw new Error('A proposta escolhida possui cobertura parcial (' + itensEscolhida + ' de ' + totalItensEq + ' itens). Escreva a justificativa para adjudicação parcial no parecer.');
      }
    }

    // C21: abaixo da cotação mínima da faixa, exige justificativa
    //
    // Mesma forma dos três bloqueios acima: o parecer escrito é o que
    // libera. O número não está aqui — vem da aba `Regras`, porque regra
    // de governança cravada no programa não se audita nem se ajusta sem
    // uma publicação.
    const regraCotacao = cfRegraCotacao_(valEscolhido, eq.CNPJ_EMPRESA);
    let cotacoesValidas = null;
    if (regraCotacao) {
      cotacoesValidas = propostas.filter(function (p) {
        const v = valorDe(p);
        return v !== null && v > 0;      // proposta sem preço não é cotação
      }).length;
      if (cotacoesValidas < regraCotacao.minimo) {
        const faltou = 'Esta compra tem ' + cotacoesValidas + ' cotação(ões) com preço e a faixa de ' +
          cfMoedaTexto_(valEscolhido) + ' exige ' + regraCotacao.minimo + '.';
        if (!regraCotacao.permiteExcecao) {
          throw new Error(faltou + ' Esta faixa não admite exceção — inclua as propostas que faltam antes de homologar.');
        }
        if (!String(parecer || '').trim()) {
          throw new Error(faltou + ' Escreva no parecer a justificativa da dispensa de cotações.');
        }
      }
    }

    // Escolher a mais cara é decisão legítima — prazo, escopo, histórico do
    // fornecedor. Mas precisa estar escrita: é a defesa de quem comprou.
    const comValor = propostas.filter(function (p) {
      const v = valorDe(p);
      return v !== null && v > 0;
    });
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
      HOMOLOGADO_POR: cfUsuario_(),
      HOMOLOGADO_EM: new Date(),
      ID_PROPOSTA_VENCEDORA: escolhida.ID,
      VALOR_FINAL: valorDe(escolhida),
      PARECER_FAVORAVEL: String(parecer || '').trim(),
      ATUALIZADO_EM: new Date()
    });

    cfLog_('homologar', 'equalizacao', idEq, JSON.stringify({
      proposta: escolhida.ID,
      fornecedor: escolhida.RAZAO_SOCIAL_INFORMADA || cfSoDigitos_(escolhida.CNPJ),
      valor: valorDe(escolhida),
      eraMenor: eMaisBarata,
      cotacoes: cotacoesValidas,
      cotacoesMinimas: regraCotacao ? regraCotacao.minimo : null
    }));

    // ── Frente 1: Registrar o comportamento de cotação na tabela Convites
    try {
      const convitesExistentes = cfLerTudo_('Convites').filter(function (c) {
        return String(c.ID_EQUALIZACAO) === String(idEq);
      });
      const convitePorCnpj = {};
      convitesExistentes.forEach(function (c) {
        convitePorCnpj[cfSoDigitos_(c.CNPJ)] = c;
      });

      propostas.forEach(function (p) {
        const cnpjP = cfSoDigitos_(p.CNPJ);
        if (!cnpjP) return;
        const v = valorDe(p);
        const apresentou = v !== null && v > 0;
        const jaExiste = convitePorCnpj[cnpjP];

        const dadosConvite = {
          ID_EQUALIZACAO: idEq,
          CNPJ: cnpjP,
          DATA_CONVITE: p.DATA_PROPOSTA || eq.DATA_EQUALIZACAO || new Date(),
          CONFIRMOU: true,
          VISITOU: false,
          APRESENTOU_PROPOSTA: apresentou,
          MOTIVO_RECUSA: apresentou ? '' : (p.OBSERVACOES || 'Não apresentou proposta cotada'),
          OBSERVACAO: String(p.CONDICOES_PAGAMENTO || p.RODADA || '').trim()
        };

        if (jaExiste) {
          cfAtualizarLinha_('Convites', jaExiste._linha, dadosConvite);
        } else {
          dadosConvite.ID = Utilities.getUuid();
          cfInserir_('Convites', dadosConvite);
        }
      });
    } catch (errConvites) {
      Logger.log('Aviso ao registrar Convites na homologação: ' + errConvites);
    }

    // ── Disparo ativo de e-mail para avaliação pós-serviço (IQF)
    try {
      if (typeof cfDispararNotificacaoAvaliacao_ === 'function') {
        cfDispararNotificacaoAvaliacao_(idEq, escolhida, eq);
      }
    } catch (errEmail) {
      Logger.log('Aviso no disparo de e-mail de avaliação: ' + errEmail);
    }

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
