/**
 * Capital Fornecedores — gravação do que o leitor encontrou
 *
 * importarEqualizacao() é a ponte de mão única: lê a planilha antiga,
 * grava na base, e ninguém precisa abrir aquele arquivo de novo.
 *
 * Importar é funcionalidade permanente, não migração: o mesmo arquivo pode
 * voltar em dezembro sem duplicar nada, e uma importação ruim sai inteira.
 */

// ─────────────────────────────────────────────────────────────
//  Entrada
// ─────────────────────────────────────────────────────────────

/**
 * Lê e grava. Devolve o relatório do que entrou.
 * @param {string} entrada  ID ou URL da planilha
 * @param {boolean} forcar  regrava mesmo se o arquivo já tiver sido importado
 */
function importarEqualizacao(entrada, forcar) {
  // Valida ANTES de pegar a trava: erro de argumento não deve segurar
  // o script por 300 segundos.
  const idArquivo = cfExtrairId_(entrada);

  return cfComTrava_(function () {
    const analise = analisarEqualizacao(idArquivo);
    const id = idArquivo;

    const impressao = cfImpressaoDoArquivo_(analise);
    const jaImportado = cfLerTudo_('Importacoes').filter(function (i) {
      return String(i.HASH) === impressao;
    })[0];

    if (jaImportado && !forcar) {
      Logger.log('Este arquivo já foi importado em ' + jaImportado.DATA +
                 ' (' + jaImportado.ID + '). Nada foi gravado.\n' +
                 'Para regravar: importarEqualizacao(id, true) — desfaz a anterior antes.');
      return { status: 'ja_importado', importacao: jaImportado.ID };
    }
    if (jaImportado && forcar) {
      desfazerImportacao(jaImportado.ID);
    }

    const idImportacao = cfNovoId_('IMP');
    const escrita = cfGravarAnalise_(analise, idImportacao);

    cfInserir_('Importacoes', [{
      ID: idImportacao,
      ARQUIVO_NOME: analise.arquivo,
      ARQUIVO_ID: id,
      HASH: impressao,
      PARSER_VERSAO: CF_PARSER_VERSAO,
      ORIGEM: 'import_sheets',
      DATA: new Date(),
      USUARIO: cfUsuario_(),
      STATUS: 'concluida',
      RESUMO: JSON.stringify(escrita)
    }]);

    cfLog_('importar', 'arquivo', id, analise.arquivo);
    cfImprimirEscrita_(idImportacao, analise, escrita);
    return { status: 'ok', importacao: idImportacao, escrita: escrita };
  }, 300);
}

/** Remove tudo que veio de uma importação. */
function desfazerImportacao(idImportacao) {
  return cfComTrava_(function () {
    const equalizacoes = cfLerTudo_('Equalizacoes')
      .filter(function (e) { return String(e.ID_IMPORTACAO) === String(idImportacao); })
      .map(function (e) { return String(e.ID); });

    const apagados = { Precos: 0, EAP: 0, Propostas: 0, Equalizacoes: 0, Pendencias: 0 };

    equalizacoes.forEach(function (idEq) {
      apagados.Precos       += cfApagarPor_('Precos', 'ID_EQUALIZACAO', idEq);
      apagados.EAP          += cfApagarPor_('EAP', 'ID_EQUALIZACAO', idEq);
      apagados.Propostas    += cfApagarPor_('Propostas', 'ID_EQUALIZACAO', idEq);
      apagados.Equalizacoes += cfApagarPor_('Equalizacoes', 'ID', idEq);
    });

    apagados.Pendencias += cfApagarPor_('Pendencias', 'ID_IMPORTACAO', idImportacao);
    cfApagarPor_('Importacoes', 'ID', idImportacao);

    // Fornecedor NÃO é apagado: ele pode ter vindo de outra importação
    // ou ter sido enriquecido à mão. Perder cadastro é pior que sobrar.

    cfLog_('desfazer_importacao', 'importacao', idImportacao, JSON.stringify(apagados));
    Logger.log('Desfeito ' + idImportacao + ': ' + JSON.stringify(apagados));
    return apagados;
  }, 300);
}

// ─────────────────────────────────────────────────────────────
//  Gravação
// ─────────────────────────────────────────────────────────────

/**
 * Impressão digital do CONTEÚDO, não do arquivo.
 *
 * Assim renomear a planilha, ou reexportá-la, não faz o mesmo dado entrar
 * duas vezes. Só muda se o que importa mudou.
 */
function cfImpressaoDoArquivo_(analise) {
  const essencia = analise.equalizacoes.map(function (e) {
    return [
      e.aba,
      e.cabecalho.empresa, e.cabecalho.empreendimento, e.cabecalho.projeto,
      e.proponentes.map(function (p) { return p.cnpjLimpo + '|' + p.razaoSocial; }).join(','),
      e.eap.map(function (n) {
        return n.codigoOriginal + '|' + n.descricao + '|' +
               n.precos.map(function (p) { return p.valor; }).join('/');
      }).join(';')
    ].join('§');
  }).join('¶');
  return cfHash_(essencia);
}

function cfGravarAnalise_(analise, idImportacao) {
  const contagem = { equalizacoes: 0, proponentes: 0, nos: 0, precos: 0, fornecedores: 0, pendencias: 0 };
  const agora = new Date();
  const usuario = cfUsuario_();

  const idxFornecedor = cfIndexarPor_('Fornecedores', 'CNPJ');
  const novosFornecedores = [];

  const linhasEq = [], linhasProp = [], linhasEap = [], linhasPreco = [], linhasPend = [];

  analise.equalizacoes.forEach(function (eq) {
    const idEq = cfNovoId_('EQU');
    const empreendimento = eq.cabecalho.empreendimento || '';
    const uf = cfInferirUf_(empreendimento);
    const data = eq.cabecalho.dataEqualizacao || null;

    linhasEq.push({
      ID: idEq,
      CNPJ_EMPRESA: cfSoDigitos_(eq.cabecalho.empresa) || '',
      ID_EMPREENDIMENTO: empreendimento,
      PROJETO: eq.cabecalho.projeto || '',
      AREA: cfAreaDaAba_(eq.aba),
      GRUPO_CENTRO_CUSTO: eq.cabecalho.grupoCentroCusto || '',
      DATA_EQUALIZACAO: data,
      STATUS: 'homologada',
      PARECER_FAVORAVEL: eq.cabecalho.parecerFavoravel || '',
      ORIGEM: 'import_sheets',
      ID_IMPORTACAO: idImportacao,
      CRIADO_POR: usuario,
      CRIADO_EM: agora,
      ATUALIZADO_EM: agora
    });
    contagem.equalizacoes++;

    // ── proponentes e fornecedores
    const idsProposta = {};
    eq.proponentes.forEach(function (p) {
      const idProp = cfNovoId_('PRP');
      idsProposta[p.ordem] = idProp;

      const cnpj = p.cnpjLimpo && p.cnpjLimpo.length === 14 ? p.cnpjLimpo : '';
      if (cnpj && !idxFornecedor[cnpj]) {
        idxFornecedor[cnpj] = true;
        novosFornecedores.push({
          CNPJ: cnpj,
          RAZAO_SOCIAL: p.razaoSocial || '',
          CIDADE: cfCidadeDe_(p.cidadeUf),
          UF: cfUfDe_(p.cidadeUf),
          CONTATO_NOME: p.contatoNome || '',
          CONTATO_TEL: p.contatoTel || '',
          CONTATO_EMAIL: p.contatoEmail || '',
          ORIGEM: 'import_sheets',
          ATUALIZADO_EM: agora
        });
      }

      const total = (eq.validacao.totaisDeclarados
        .filter(function (t) { return t.proponente === p.ordem; })[0] || {}).valor;

      const somaItens = eq.eap.reduce(function (acc, n) {
        if (n.tipo !== 'item') return acc;
        const preco = n.precos[p.ordem - 1];
        return acc + (preco && preco.valor !== null ? preco.valor : 0);
      }, 0);

      linhasProp.push({
        ID: idProp,
        ID_EQUALIZACAO: idEq,
        CNPJ: cnpj,
        ORDEM: p.ordem,
        // Guardado sempre, mesmo quando o CNPJ é recusado: o documento disse
        // "Golden Phone Telecom Ltda / Carryer Telecom Ltda" e essa informação
        // não pode se perder só porque a célula tinha duas empresas.
        RAZAO_SOCIAL_INFORMADA: p.razaoSocial || '',
        RODADA: p.propostaR02 ? 'R02' : (p.propostaR01 ? 'R01' : 'inicial'),
        NUMERO_PROPOSTA: p.numeroProposta || '',
        DATA_PROPOSTA: p.dataProposta || '',
        VALIDADE_DIAS: cfNumero_(p.validade),
        CONDICOES_PAGAMENTO: p.condicoesPagamento || '',
        PRAZO_EXECUCAO_DIAS: cfNumero_(p.prazoExecucao),
        DATA_PREV_INICIO: p.dataPrevInicio || '',
        DATA_PREV_TERMINO: p.dataPrevTermino || '',
        VALOR_TOTAL_DECLARADO: total === undefined ? '' : total,
        VALOR_TOTAL_CALCULADO: somaItens,
        OBSERVACAO: p.nomeCentroCusto || '',
        ORIGEM: 'import_sheets',
        ID_IMPORTACAO: idImportacao
      });
      contagem.proponentes++;
    });

    // ── árvore e preços
    const idsNo = {};
    eq.eap.forEach(function (n) { idsNo[n.id] = cfNovoId_('EAP'); });

    eq.eap.forEach(function (n) {
      linhasEap.push({
        ID: idsNo[n.id],
        ID_EQUALIZACAO: idEq,
        ID_PAI: n.idPai ? idsNo[n.idPai] : '',
        ORDEM: n.ordem,
        TIPO: n.tipo,
        DESCRICAO: n.descricao,
        CODIGO_ORIGINAL: n.codigoOriginal
      });
      contagem.nos++;

      // Só nós que carregam preço viram linha em Precos. Grupo é soma;
      // escopo é texto. Gravar os dois inflaria o histórico com duplicata.
      if (n.tipo !== 'item') return;

      n.precos.forEach(function (preco) {
        const idProp = idsProposta[preco.proponente];
        if (!idProp) return;
        const prop = eq.proponentes[preco.proponente - 1] || {};
        linhasPreco.push({
          ID: cfNovoId_('PRC'),
          ID_EAP: idsNo[n.id],
          ID_PROPOSTA: idProp,
          PRECO_UNITARIO: preco.valor === null ? '' : preco.valor,
          VALOR_TOTAL: preco.valor === null ? '' : preco.valor,
          STATUS_PRECO: preco.status,
          CNPJ: prop.cnpjLimpo || '',
          ID_EQUALIZACAO: idEq,
          ID_EMPREENDIMENTO: empreendimento,
          UF: uf,
          DATA: data,
          ORIGEM: 'import_sheets'
        });
        contagem.precos++;
      });
    });

    // ── pendências, já pela causa-raiz e não pelo sintoma
    (eq.pendencias || []).filter(function (p) {
      return String(p.tipo).indexOf('divergencia_') !== 0;
    }).forEach(function (p) {
      linhasPend.push({
        ID: cfNovoId_('PND'), ID_IMPORTACAO: idImportacao, TIPO: p.tipo,
        DESCRICAO: p.descricao, DADO_BRUTO: p.dadoBruto || '',
        RESOLVIDA: false, CRIADO_EM: agora
      });
    });
    (eq.validacao.diagnostico || []).forEach(function (c) {
      linhasPend.push({
        ID: cfNovoId_('PND'), ID_IMPORTACAO: idImportacao, TIPO: c.tipo,
        DESCRICAO: (c.explicacao || '') + ' [' + eq.aba + ', prop. ' + c.proponente + ']',
        DADO_BRUTO: JSON.stringify(c.bruto || { no: c.no, valor: c.valorEsquecido }),
        RESOLVIDA: false, CRIADO_EM: agora
      });
    });
    eq.validacao.divergencias.filter(function (d) { return d.tipo === 'cesta_incompleta'; })
      .forEach(function (d) {
        linhasPend.push({
          ID: cfNovoId_('PND'), ID_IMPORTACAO: idImportacao, TIPO: 'cesta_incompleta',
          DESCRICAO: 'Proponente ' + d.proponente + ': ' + d.naoCotados + ' de ' +
                     d.deUmTotalDe + ' itens sem cotação [' + eq.aba + ']',
          DADO_BRUTO: (d.itens || []).join(' · '), RESOLVIDA: false, CRIADO_EM: agora
        });
      });
  });

  contagem.fornecedores = cfInserir_('Fornecedores', novosFornecedores);
  cfInserir_('Equalizacoes', linhasEq);
  cfInserir_('Propostas', linhasProp);
  cfInserir_('EAP', linhasEap);
  cfInserir_('Precos', linhasPreco);
  contagem.pendencias = cfInserir_('Pendencias', linhasPend);

  return contagem;
}

// ─────────────────────────────────────────────────────────────
//  Auxiliares
// ─────────────────────────────────────────────────────────────

/** "Mapa de Cotação_Demercado_Equipamentos" → "Equipamentos" */
function cfAreaDaAba_(nomeAba) {
  const limpo = String(nomeAba || '').replace(/^\(PRÉVIA\)\s*/i, '').trim();
  const partes = limpo.split('_');
  return partes.length > 2 ? partes.slice(2).join('_').trim() : '';
}

function cfCidadeDe_(cidadeUf) {
  if (!cidadeUf) return '';
  return String(cidadeUf).split(/[-\/]/)[0].trim();
}

function cfUfDe_(cidadeUf) {
  if (!cidadeUf) return '';
  const m = String(cidadeUf).match(/\b([A-Z]{2})\s*$/);
  return m ? m[1] : '';
}

/** UF a partir do nome do empreendimento, enquanto não há tabela cadastrada. */
function cfInferirUf_(empreendimento) {
  const t = cfNormalizar_(empreendimento);
  if (/curitiba|ctba|campina grande/.test(t)) return 'PR';
  if (/itajai|joinville|esteio sc/.test(t)) return 'SC';
  if (/esteio|porto alegre|canoas/.test(t)) return 'RS';
  return '';
}

function cfImprimirEscrita_(idImportacao, analise, c) {
  Logger.log('\n── gravado ──');
  Logger.log('Importação:   ' + idImportacao);
  Logger.log('Arquivo:      ' + analise.arquivo);
  Logger.log('Equalizações: ' + c.equalizacoes);
  Logger.log('Proponentes:  ' + c.proponentes);
  Logger.log('Nós de EAP:   ' + c.nos);
  Logger.log('Preços:       ' + c.precos + '   ← isto é o histórico');
  Logger.log('Fornecedores novos: ' + c.fornecedores);
  Logger.log('Pendências:   ' + c.pendencias);
  Logger.log('\nPara reverter: desfazerImportacao("' + idImportacao + '")');
}

// ─────────────────────────────────────────────────────────────
//  Atalhos para o menu Executar
// ─────────────────────────────────────────────────────────────

function importarWifiCasaDeBombas() {
  return importarEqualizacao('1iOz9t7xjk19UxCkEP7t-v1yzCOk6HMTR4Qfp9mfCNF4');
}

function importarMonitoramentoUtilities() {
  return importarEqualizacao('1TaqCghQpf2xmNWhiSX0u7orW4Sw_9lum8Qiid9rv_I4');
}
