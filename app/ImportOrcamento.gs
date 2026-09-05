/**
 * Capital Fornecedores — importação de orçamento avulso
 *
 * Orçamento não é equalização: tem um fornecedor só e nenhuma comparação.
 * Mas é ponto de preço legítimo — e, nos documentos que analisamos, é o
 * ÚNICO que sempre traz quantidade, unidade e preço unitário. A equalização
 * recebe isso pronto do fornecedor e joga fora.
 *
 * Por isso `Propostas` aceita ID_EQUALIZACAO vazio.
 *
 * O dado chega como objeto JS porque o Apps Script não lê PDF. A extração é
 * feita fora e versionada no repositório — o que também deixa rastro de
 * quem extraiu o quê.
 */

const CF_VERSAO_ORCAMENTO = '2026-09-05.1';

/**
 * @param {Object}  orc     um orçamento no formato documentado abaixo
 * @param {boolean} forcar  regrava se já tiver sido importado
 *
 * orc = {
 *   fornecedor: { cnpj, razaoSocial, contato, telefone, email, cidade, uf },
 *   numero, data: 'dd/mm/aaaa', empreendimento, cnpjEmpresa,
 *   condicoesPagamento, validadeDias, prazoEntregaDias, valorTotalDeclarado,
 *   arquivo: { nome, id },
 *   itens: [{ codigoFornecedor, descricao, unidade, quantidade,
 *             descontoPct, precoUnitario, valorTotal }]
 * }
 */
function importarOrcamento(orc, forcar) {
  if (!orc || !orc.itens || !orc.itens.length) {
    throw new Error('Orçamento sem itens. Nada a importar.');
  }

  return cfComTrava_(function () {
    const impressao = cfHash_([
      orc.fornecedor && orc.fornecedor.cnpj, orc.numero, orc.data,
      orc.itens.map(function (i) {
        return [i.codigoFornecedor, i.descricao, i.quantidade, i.precoUnitario].join('|');
      }).join(';')
    ].join('§'));

    const jaImportado = cfLerTudo_('Importacoes').filter(function (i) {
      return String(i.HASH) === impressao;
    })[0];

    if (jaImportado && !forcar) {
      Logger.log('Orçamento ' + (orc.numero || orc.arquivo && orc.arquivo.nome) +
                 ' já importado em ' + jaImportado.DATA + ' (' + jaImportado.ID + ').');
      return { status: 'ja_importado', importacao: jaImportado.ID };
    }
    if (jaImportado && forcar) desfazerImportacao(jaImportado.ID);

    const idImportacao = cfNovoId_('IMP');
    const contagem = cfGravarOrcamento_(orc, idImportacao);

    cfInserir_('Importacoes', [{
      ID: idImportacao,
      ARQUIVO_NOME: (orc.arquivo && orc.arquivo.nome) || ('Orçamento ' + (orc.numero || '')),
      ARQUIVO_ID: (orc.arquivo && orc.arquivo.id) || '',
      HASH: impressao,
      PARSER_VERSAO: CF_PARSER_VERSAO,
      ORIGEM: 'import_pdf',
      DATA: new Date(),
      USUARIO: cfUsuario_(),
      STATUS: 'concluida',
      RESUMO: JSON.stringify(contagem)
    }]);

    Logger.log('  ' + (orc.arquivo && orc.arquivo.nome || orc.numero) + ': ' +
               contagem.itens + ' itens · ' + contagem.precos + ' preços' +
               (contagem.divergencia ? '  ⚠ total diverge em R$ ' + contagem.divergencia.toFixed(2) : ''));
    return { status: 'ok', importacao: idImportacao, contagem: contagem };
  }, 300);
}

function cfGravarOrcamento_(orc, idImportacao) {
  const agora = new Date();
  const data = cfData_(orc.data);
  const forn = orc.fornecedor || {};
  const cnpj = cfSoDigitos_(forn.cnpj);
  const cnpjValido = cnpj.length === 14 ? cnpj : '';

  // Fornecedor: cria se não existe, enriquece o que estiver vazio.
  const existentes = cfIndexarPor_('Fornecedores', 'CNPJ');
  if (cnpjValido && !existentes[cnpjValido]) {
    cfInserir_('Fornecedores', [{
      CNPJ: cnpjValido,
      RAZAO_SOCIAL: forn.razaoSocial || '',
      CIDADE: forn.cidade || '',
      UF: forn.uf || '',
      CONTATO_NOME: forn.contato || '',
      CONTATO_TEL: forn.telefone || '',
      CONTATO_EMAIL: forn.email || '',
      ORIGEM: 'import_pdf',
      ATUALIZADO_EM: agora
    }]);
  }

  const idProposta = cfNovoId_('PRP');
  const somaItens = orc.itens.reduce(function (a, i) {
    const v = cfNumero_(i.valorTotal);
    return a + (v === null ? 0 : v);
  }, 0);
  const declarado = cfNumero_(orc.valorTotalDeclarado);

  cfInserir_('Propostas', [{
    ID: idProposta,
    ID_EQUALIZACAO: '',                       // avulso: não pertence a comparação
    CNPJ: cnpjValido,
    RAZAO_SOCIAL_INFORMADA: forn.razaoSocial || '',
    ORDEM: 1,
    RODADA: 'inicial',
    NUMERO_PROPOSTA: orc.numero || '',
    DATA_PROPOSTA: data || '',
    VALIDADE_DIAS: cfNumero_(orc.validadeDias),
    CONDICOES_PAGAMENTO: orc.condicoesPagamento || '',
    LEAD_TIME_DIAS: cfNumero_(orc.prazoEntregaDias),
    VALOR_TOTAL_DECLARADO: declarado === null ? '' : declarado,
    VALOR_TOTAL_CALCULADO: somaItens,
    ORIGEM: 'import_pdf',
    ID_IMPORTACAO: idImportacao
  }]);

  const linhasEap = [], linhasPreco = [];
  orc.itens.forEach(function (item, i) {
    const idNo = cfNovoId_('EAP');
    const qtd = cfNumero_(item.quantidade);
    const unit = cfNumero_(item.precoUnitario);
    const total = cfNumero_(item.valorTotal);

    linhasEap.push({
      ID: idNo,
      ID_EQUALIZACAO: '',
      ID_PAI: '',
      ORDEM: i + 1,
      TIPO: 'item',
      DESCRICAO: item.descricao || '',
      QUANTIDADE_REFERENCIA: qtd === null ? '' : qtd,
      UNIDADE_REFERENCIA: item.unidade || '',
      // Código do fornecedor: é o identificador mais estável que existe no
      // corpus. Nenhum documento interno tem chave de item.
      CODIGO_ORIGINAL: item.codigoFornecedor || ''
    });

    linhasPreco.push({
      ID: cfNovoId_('PRC'),
      ID_EAP: idNo,
      ID_PROPOSTA: idProposta,
      QUANTIDADE: qtd === null ? '' : qtd,
      UNIDADE: item.unidade || '',
      PRECO_UNITARIO: unit === null ? '' : unit,
      VALOR_TOTAL: total === null ? '' : total,
      STATUS_PRECO: unit === null ? 'nao_cotado' : 'cotado',
      CNPJ: cnpjValido,
      ID_EQUALIZACAO: '',
      ID_EMPREENDIMENTO: orc.empreendimento || '',
      UF: forn.uf || cfInferirUf_(orc.empreendimento),
      DATA: data || '',
      ORIGEM: 'import_pdf'
    });
  });

  cfInserir_('EAP', linhasEap);
  cfInserir_('Precos', linhasPreco);

  // Total que não fecha é informação, não erro a corrigir em silêncio.
  const divergencia = (declarado !== null && Math.abs(declarado - somaItens) > 0.01)
    ? declarado - somaItens : null;
  if (divergencia !== null) {
    cfInserir_('Pendencias', [{
      ID: cfNovoId_('PND'), ID_IMPORTACAO: idImportacao, TIPO: 'total_nao_fecha',
      DESCRICAO: 'Orçamento ' + (orc.numero || '') + ': documento declara R$ ' +
                 declarado.toFixed(2) + ', itens somam R$ ' + somaItens.toFixed(2),
      DADO_BRUTO: String(orc.valorTotalDeclarado), RESOLVIDA: false, CRIADO_EM: agora
    }]);
  }

  return { itens: linhasEap.length, precos: linhasPreco.length,
           somaItens: somaItens, declarado: declarado, divergencia: divergencia };
}

/** Importa uma lista de orçamentos de uma vez. */
function importarOrcamentos_(lista, forcar) {
  const saida = [];
  lista.forEach(function (orc) {
    try {
      saida.push(importarOrcamento(orc, forcar));
    } catch (erro) {
      Logger.log('  falhou: ' + erro);
      saida.push({ status: 'erro', erro: String(erro) });
    }
  });
  Logger.log('\n' + saida.length + ' orçamento(s) processado(s).');
  return saida;
}
