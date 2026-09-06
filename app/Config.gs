/**
 * Capital Fornecedores — Configuração e declaração do schema
 *
 * Este arquivo é a ÚNICA fonte da verdade da estrutura de dados.
 * Schema.gs lê daqui para criar e migrar as abas.
 *
 * Regra de ouro ao editar: coluna nova vai SEMPRE no fim da lista.
 * Inserir no meio desloca dado já gravado.
 */

// ─────────────────────────────────────────────────────────────
//  Constantes de instalação
// ─────────────────────────────────────────────────────────────

/** Pasta no Drive compartilhado onde a base e os arquivos gerados vivem. */
const CF_PASTA_ID = '1iIxcbBjlvpbGyUP6Ir7NSvpxBvXZSM9G';

const CF_NOME_PLANILHA = 'Capital Fornecedores — Base';

/** Sobe de 1 a cada mudança no schema. Gravado em Script Properties. */
const CF_SCHEMA_VERSAO = 3;

/** Versão do parser de importação. Gravada em cada linha importada,
 *  para dar para reprocessar o que veio de uma geração antiga. */
const CF_PARSER_VERSAO = 1;

const CF_PROP = {
  planilhaId: 'CF_PLANILHA_ID',
  schemaVersao: 'CF_SCHEMA_VERSAO',
  pastaId: 'CF_PASTA_ID'
};

/** Marca usada por semearDadosDeTeste() — permite apagar só o fictício. */
const CF_MARCA_TESTE = '::TESTE::';

// ─────────────────────────────────────────────────────────────
//  Domínios (enums). Documentados aqui, validados na escrita.
// ─────────────────────────────────────────────────────────────

const CF_ENUM = {
  /**
   * De onde o registro veio. É o que impede a base de apodrecer:
   * dado digitado no app não tem a mesma confiança de dado extraído
   * de PDF antigo. Toda consulta de preço pode filtrar por isto.
   */
  origem: ['app', 'import_sheets', 'import_xlsx', 'import_pdf', 'manual'],

  /**
   * Preço não é sempre número. Encontrados no acervo real:
   * "INCLUSO", "R$ -", vazio. São três coisas diferentes, e ler
   * vazio como zero fez uma proposta parecer R$ 182 mil mais barata.
   */
  statusPreco: ['cotado', 'incluso_em_outro_item', 'excluido', 'nao_cotado', 'nao_aplicavel'],

  /** Nó da árvore: grupo agrega, item tem preço. */
  tipoNo: ['grupo', 'item'],

  /**
   * Os três canais de nota têm visibilidade diferente.
   * 'interna' NUNCA sai em exportação para fornecedor.
   */
  canalNota: ['consideracao', 'proponente', 'interna'],

  /** Por que um baseline novo nasceu. Escopo e preço são eixos ortogonais. */
  motivoBaseline: ['escopo', 'preco', 'inicial'],

  statusEqualizacao: ['rascunho', 'em_cotacao', 'em_negociacao', 'homologada', 'cancelada'],

  tipoClausula: ['exclusao', 'premissa', 'risco', 'escopo_contratante', 'escopo_contratada'],

  tipoAjuste: ['desconto_comercial', 'acrescimo', 'arredondamento', 'outro'],

  /** De onde saiu o preço de referência mostrado na comparação.
   *  v1 usa 'historico'; v2 passa a usar 'contrato' quando houver LPU. */
  origemReferencia: ['historico', 'contrato', 'orcamento_alvo', 'sem_referencia'],

  statusCatalogo: ['ativo', 'mesclado', 'inativo'],

  origemCalculo: ['informado', 'calculado', 'ausente'],

  periodoCobranca: ['unico', 'mensal', 'trimestral', 'semestral', 'anual']
};

// ─────────────────────────────────────────────────────────────
//  Schema
//
//  tipo: texto | numero | moeda | inteiro | data | booleano | enum:<chave>
//  Colunas marcadas (desnorm) são cópia proposital de outra tabela.
//  Sheets não faz JOIN — a consulta de preço lê UMA faixa e filtra
//  em memória. Sem isso a tela de histórico fica lenta demais.
// ─────────────────────────────────────────────────────────────

const CF_SCHEMA = [

  { nome: 'Config', nota: 'Chave/valor de configuração da instalação.', colunas: [
    { campo: 'CHAVE',      tipo: 'texto', largura: 220 },
    { campo: 'VALOR',      tipo: 'texto', largura: 320 },
    { campo: 'DESCRICAO',  tipo: 'texto', largura: 420 }
  ]},

  { nome: 'Empresas', nota: 'CR e Demercado. O acervo tem 5 grafias para 2 CNPJs.', colunas: [
    { campo: 'CNPJ',            tipo: 'texto', largura: 150 },
    { campo: 'RAZAO_SOCIAL',    tipo: 'texto', largura: 340 },
    { campo: 'APELIDO',         tipo: 'texto', largura: 140 },
    { campo: 'GRAFIAS_ALTERNATIVAS', tipo: 'texto', largura: 420, nota: 'separadas por |, para o importador reconhecer' },
    { campo: 'ATIVA',           tipo: 'booleano', largura: 70 }
  ]},

  { nome: 'Empreendimentos', nota: 'MCtba = MEGA CURITIBA = MEGA. Sem isto a comparação entre Megas não fecha.', colunas: [
    { campo: 'ID',           tipo: 'texto', largura: 120 },
    { campo: 'NOME',         tipo: 'texto', largura: 300 },
    { campo: 'APELIDOS',     tipo: 'texto', largura: 300, nota: 'separados por |' },
    { campo: 'CIDADE',       tipo: 'texto', largura: 160 },
    { campo: 'UF',           tipo: 'texto', largura: 60, nota: 'entra na chave de comparação de preço' },
    { campo: 'CNPJ_EMPRESA', tipo: 'texto', largura: 150 },
    { campo: 'ATIVO',        tipo: 'booleano', largura: 70 }
  ]},

  { nome: 'Fornecedores', nota: 'CNPJ é a única chave real: Cod. Fornecedor veio vazio em 10 de 10 documentos.', colunas: [
    { campo: 'CNPJ',              tipo: 'texto', largura: 150, nota: 'só dígitos — PK' },
    { campo: 'COD_FORNECEDOR_ERP',tipo: 'texto', largura: 130 },
    { campo: 'RAZAO_SOCIAL',      tipo: 'texto', largura: 320 },
    { campo: 'NOME_FANTASIA',     tipo: 'texto', largura: 240 },
    { campo: 'CIDADE',            tipo: 'texto', largura: 160 },
    { campo: 'UF',                tipo: 'texto', largura: 60 },
    { campo: 'SITUACAO_CNPJ',     tipo: 'texto', largura: 110 },
    { campo: 'CNAE_PRINCIPAL',    tipo: 'texto', largura: 260 },
    { campo: 'CONTATO_NOME',      tipo: 'texto', largura: 180 },
    { campo: 'CONTATO_TEL',       tipo: 'texto', largura: 150 },
    { campo: 'CONTATO_EMAIL',     tipo: 'texto', largura: 240 },
    { campo: 'TEM_CONTRATO_ATIVO',tipo: 'booleano', largura: 90, nota: 'vazio na v1; abre a porta para LPU na v2' },
    { campo: 'ORIGEM',            tipo: 'enum:origem', largura: 120 },
    { campo: 'ATUALIZADO_EM',     tipo: 'data', largura: 130 }
  ]},

  { nome: 'Categorias', colunas: [
    { campo: 'ID',          tipo: 'texto', largura: 120 },
    { campo: 'NOME',        tipo: 'texto', largura: 280 },
    { campo: 'CHAVE_BUSCA', tipo: 'texto', largura: 280, nota: 'minúscula, sem acento, espaço colapsado' },
    { campo: 'ID_PAI',      tipo: 'texto', largura: 120 },
    { campo: 'ATIVA',       tipo: 'booleano', largura: 70 }
  ]},

  { nome: 'Catalogo', nota: 'Itens canônicos. UNIDADE_BASE + FATOR_BASE é o que permite comparar pacote com quilo.', colunas: [
    { campo: 'ID',            tipo: 'texto', largura: 120 },
    { campo: 'ID_CATEGORIA',  tipo: 'texto', largura: 120 },
    { campo: 'DESCRICAO',     tipo: 'texto', largura: 400 },
    { campo: 'CHAVE_BUSCA',   tipo: 'texto', largura: 340 },
    { campo: 'MARCA',         tipo: 'texto', largura: 150, nota: 'Pato != Coala. Marca diferente é item diferente.' },
    { campo: 'VARIANTE',      tipo: 'texto', largura: 130, nota: 'saco de lixo azul vs marrom' },
    { campo: 'UNIDADE_PADRAO',tipo: 'texto', largura: 110, nota: 'como se compra: PCT, CX, UN, M3' },
    { campo: 'UNIDADE_BASE',  tipo: 'texto', largura: 110, nota: 'como se compara: KG, L, M3, UN' },
    { campo: 'FATOR_BASE',    tipo: 'numero', largura: 100, nota: '1 PCT de 500g = 0,5 KG' },
    { campo: 'COD_SINAPI',    tipo: 'texto', largura: 120, nota: 'vazio na v1; gancho de benchmark externo' },
    { campo: 'STATUS',        tipo: 'enum:statusCatalogo', largura: 100 },
    { campo: 'MESCLADO_EM',   tipo: 'texto', largura: 120, nota: 'aponta para o item que sobreviveu; junta histórico sem reescrever linha' },
    { campo: 'CRIADO_POR',    tipo: 'texto', largura: 200 },
    { campo: 'CRIADO_EM',     tipo: 'data', largura: 130 }
  ]},

  { nome: 'Presets', nota: 'A identidade do item ao longo do tempo. Versionado: item entra e sai.', colunas: [
    { campo: 'ID',                tipo: 'texto', largura: 120 },
    { campo: 'NOME',              tipo: 'texto', largura: 320 },
    { campo: 'VERSAO',            tipo: 'inteiro', largura: 80 },
    { campo: 'ID_CATEGORIA',      tipo: 'texto', largura: 120 },
    { campo: 'ID_EMPREENDIMENTO', tipo: 'texto', largura: 140, nota: 'vazio = vale para todos' },
    { campo: 'CRIADO_DE_EQUALIZACAO', tipo: 'texto', largura: 150 },
    { campo: 'ATIVO',             tipo: 'booleano', largura: 70 },
    { campo: 'CRIADO_POR',        tipo: 'texto', largura: 200 },
    { campo: 'CRIADO_EM',         tipo: 'data', largura: 130 }
  ]},

  { nome: 'PresetItens', colunas: [
    { campo: 'ID',                  tipo: 'texto', largura: 120 },
    { campo: 'ID_PRESET',           tipo: 'texto', largura: 120 },
    { campo: 'VERSAO',              tipo: 'inteiro', largura: 80 },
    { campo: 'ID_PAI',              tipo: 'texto', largura: 120 },
    { campo: 'ORDEM',               tipo: 'inteiro', largura: 80 },
    { campo: 'TIPO',                tipo: 'enum:tipoNo', largura: 90 },
    { campo: 'ID_CATALOGO',         tipo: 'texto', largura: 120 },
    { campo: 'DESCRICAO',           tipo: 'texto', largura: 420 },
    { campo: 'UNIDADE_REFERENCIA',  tipo: 'texto', largura: 110 },
    { campo: 'QUANTIDADE_SUGERIDA', tipo: 'numero', largura: 120, nota: 'da última rodada; editável' }
  ]},

  { nome: 'Equalizacoes', colunas: [
    { campo: 'ID',                 tipo: 'texto', largura: 150 },
    { campo: 'CNPJ_EMPRESA',       tipo: 'texto', largura: 150 },
    { campo: 'ID_EMPREENDIMENTO',  tipo: 'texto', largura: 140 },
    { campo: 'PROJETO',            tipo: 'texto', largura: 380 },
    { campo: 'AREA',               tipo: 'texto', largura: 160 },
    { campo: 'GRUPO_CENTRO_CUSTO', tipo: 'texto', largura: 240 },
    { campo: 'NOME_CENTRO_CUSTO',  tipo: 'texto', largura: 240 },
    { campo: 'DATA_EQUALIZACAO',   tipo: 'data', largura: 130 },
    { campo: 'STATUS',             tipo: 'enum:statusEqualizacao', largura: 120 },
    { campo: 'ID_PRESET',          tipo: 'texto', largura: 120 },
    { campo: 'PRESET_VERSAO',      tipo: 'inteiro', largura: 90 },
    { campo: 'ID_EQUALIZACAO_ANTERIOR', tipo: 'texto', largura: 150, nota: 'a linhagem da série' },
    { campo: 'REGIME_CONTRATACAO', tipo: 'texto', largura: 200, nota: 'ex.: empreitada global' },
    { campo: 'BDI_INCLUSO',        tipo: 'booleano', largura: 90, nota: 'BDI é premissa de edital, não coluna de preço' },
    { campo: 'PREMISSAS',          tipo: 'texto', largura: 460 },
    { campo: 'NUMERO_OC',          tipo: 'texto', largura: 120 },
    { campo: 'CNPJ_VENCEDOR',      tipo: 'texto', largura: 150 },
    { campo: 'ID_PROPOSTA_VENCEDORA', tipo: 'texto', largura: 150, nota: 'proposta específica, não "o fornecedor"' },
    { campo: 'VALOR_FINAL',        tipo: 'moeda', largura: 130 },
    { campo: 'PARECER_FAVORAVEL',  tipo: 'texto', largura: 460 },
    { campo: 'DETALHAMENTO_APROVACAO', tipo: 'texto', largura: 460 },
    { campo: 'NOTAS_CR',           tipo: 'texto', largura: 380 },
    { campo: 'ORIGEM',             tipo: 'enum:origem', largura: 120 },
    { campo: 'ID_IMPORTACAO',      tipo: 'texto', largura: 120 },
    { campo: 'CRIADO_POR',         tipo: 'texto', largura: 200 },
    { campo: 'CRIADO_EM',          tipo: 'data', largura: 130 },
    { campo: 'ATUALIZADO_EM',      tipo: 'data', largura: 130 },
    { campo: 'ID_FONTE',           tipo: 'texto', largura: 150, nota: 'ID do arquivo-fonte original' }
  ]},

  { nome: 'Baselines', nota: 'Versão de escopo. Histórico só compara dentro do mesmo baseline.', colunas: [
    { campo: 'ID',              tipo: 'texto', largura: 120 },
    { campo: 'ID_EQUALIZACAO',  tipo: 'texto', largura: 150 },
    { campo: 'VERSAO',          tipo: 'inteiro', largura: 80 },
    { campo: 'MOTIVO',          tipo: 'enum:motivoBaseline', largura: 110 },
    { campo: 'DESCRICAO',       tipo: 'texto', largura: 460 },
    { campo: 'DATA',            tipo: 'data', largura: 130 }
  ]},

  { nome: 'Propostas', nota: 'ID_EQUALIZACAO PODE SER VAZIO: orçamento avulso é ponto de preço válido.', colunas: [
    { campo: 'ID',                  tipo: 'texto', largura: 150 },
    { campo: 'ID_EQUALIZACAO',      tipo: 'texto', largura: 150, nota: 'VAZIO = orçamento avulso' },
    { campo: 'CNPJ',                tipo: 'texto', largura: 150 },
    { campo: 'ORDEM',               tipo: 'inteiro', largura: 80 },
    { campo: 'RODADA',              tipo: 'texto', largura: 100, nota: 'inicial, R01, R02… sem teto' },
    { campo: 'ID_BASELINE',         tipo: 'texto', largura: 120 },
    { campo: 'NUMERO_PROPOSTA',     tipo: 'texto', largura: 160 },
    { campo: 'REVISAO_FORNECEDOR',  tipo: 'texto', largura: 130, nota: 'REV02 — eixo ortogonal à rodada' },
    { campo: 'DATA_PROPOSTA',       tipo: 'data', largura: 130 },
    { campo: 'VALIDADE_DIAS',       tipo: 'inteiro', largura: 110 },
    { campo: 'VALIDADE_ATE',        tipo: 'data', largura: 130, nota: 'o acervo mistura duração e data absoluta' },
    { campo: 'CONDICOES_PAGAMENTO', tipo: 'texto', largura: 300 },
    { campo: 'LEAD_TIME_DIAS',      tipo: 'inteiro', largura: 110 },
    { campo: 'PRAZO_EXECUCAO_DIAS', tipo: 'inteiro', largura: 120 },
    { campo: 'FATURAMENTO_DIRETO',  tipo: 'booleano', largura: 100 },
    { campo: 'VALOR_FATURAMENTO_DIRETO', tipo: 'moeda', largura: 150, nota: 'chegou a 71% do contrato' },
    { campo: 'DATA_PREV_INICIO',    tipo: 'data', largura: 130 },
    { campo: 'DATA_PREV_TERMINO',   tipo: 'data', largura: 130 },
    { campo: 'VALOR_TOTAL_DECLARADO', tipo: 'moeda', largura: 150, nota: 'o que o documento diz' },
    { campo: 'VALOR_TOTAL_CALCULADO', tipo: 'moeda', largura: 150, nota: 'a soma dos itens — divergência é alerta' },
    { campo: 'VENCEDORA',           tipo: 'booleano', largura: 90 },
    { campo: 'OBSERVACAO',          tipo: 'texto', largura: 380 },
    { campo: 'ORIGEM',              tipo: 'enum:origem', largura: 120 },
    { campo: 'ID_IMPORTACAO',       tipo: 'texto', largura: 120 },
    // Fica AQUI, e não lá em cima ao lado de ORDEM, porque é esta a posição
    // que a aba tem: cfGarantirAba_ acrescenta coluna nova sempre no fim.
    // Declarada no meio, ela desalinhava cfFormatarAba_ da coluna 5 em diante
    // — o checkbox e os formatos de data e moeda caíam uma coluna adiante.
    { campo: 'RAZAO_SOCIAL_INFORMADA', tipo: 'texto', largura: 300, nota: 'o nome como veio no documento — pode divergir do cadastro, e sobrevive a CNPJ inválido' },
    { campo: 'ID_FONTE',            tipo: 'texto', largura: 150, nota: 'ID do arquivo-fonte no Drive' },
    { campo: 'REVISAO_DOCUMENTO',   tipo: 'texto', largura: 130, nota: 'Revisão do documento do fornecedor' },
    { campo: 'REVISAO_IMPORTACAO',  tipo: 'inteiro', largura: 100, nota: 'Contador de reimportação' },
    { campo: 'CNPJ_EMPRESA',        tipo: 'texto', largura: 150, nota: 'CNPJ da empresa contratante da proposta' },
    // O rodapé "Histórico da Negociação" da planilha EQU. Guardados na
    // própria proposta porque descrevem a MESMA proposta ao longo da
    // negociação — criar uma linha por rodada sem preço de item encheria o
    // mapa de colunas vazias.
    { campo: 'VALOR_PROPOSTA_INICIAL', tipo: 'moeda', largura: 150, nota: 'Antes da negociação' },
    { campo: 'REDUCAO_NEGOCIADA',      tipo: 'moeda', largura: 150, nota: 'Inicial menos o valor final. Derivado, não digitado.' }
  ]},

  { nome: 'EAP', nota: 'A árvore. CODIGO não é gravado: é derivado da posição.', colunas: [
    { campo: 'ID',                    tipo: 'texto', largura: 120 },
    { campo: 'ID_EQUALIZACAO',        tipo: 'texto', largura: 150 },
    { campo: 'ID_PAI',                tipo: 'texto', largura: 120 },
    { campo: 'ORDEM',                 tipo: 'inteiro', largura: 80 },
    { campo: 'TIPO',                  tipo: 'enum:tipoNo', largura: 90 },
    { campo: 'ID_CATALOGO',           tipo: 'texto', largura: 120, nota: 'vazio = texto livre, sem histórico' },
    { campo: 'DESCRICAO',             tipo: 'texto', largura: 480 },
    { campo: 'QUANTIDADE_REFERENCIA', tipo: 'numero', largura: 130, nota: 'o que a CR pede' },
    { campo: 'UNIDADE_REFERENCIA',    tipo: 'texto', largura: 110 },
    { campo: 'CODIGO_ORIGINAL',       tipo: 'texto', largura: 120, nota: 'só para auditoria da importação' },
    { campo: 'ID_IMPORTACAO',         tipo: 'texto', largura: 120, nota: 'Importação que criou este nó' }
  ]},

  { nome: 'Precos', nota: 'Formato longo: 1 linha por item x proponente. ESTA tabela é o histórico de preço.', colunas: [
    { campo: 'ID',                   tipo: 'texto', largura: 130 },
    { campo: 'ID_EAP',               tipo: 'texto', largura: 120 },
    { campo: 'ID_PROPOSTA',          tipo: 'texto', largura: 150 },
    { campo: 'QUANTIDADE',           tipo: 'numero', largura: 120, nota: 'do proponente; pode divergir da referência' },
    { campo: 'UNIDADE',              tipo: 'texto', largura: 100, nota: 'do proponente; CR pede VB, fornecedor cota KG' },
    { campo: 'PRECO_UNITARIO_MATERIAL', tipo: 'moeda', largura: 150 },
    { campo: 'PRECO_UNITARIO_MO',    tipo: 'moeda', largura: 150 },
    { campo: 'PRECO_UNITARIO',       tipo: 'moeda', largura: 140, nota: 'material + M.O.' },
    { campo: 'VALOR_TOTAL',          tipo: 'moeda', largura: 140 },
    { campo: 'STATUS_PRECO',         tipo: 'enum:statusPreco', largura: 160 },
    { campo: 'FATURAMENTO_DIRETO',   tipo: 'booleano', largura: 100 },
    { campo: 'EXECUTOR_TERCEIRO',    tipo: 'texto', largura: 200, nota: 'subcontratado — pode ser concorrente também' },
    { campo: 'DESCRICAO_PROPONENTE', tipo: 'texto', largura: 400, nota: 'para OMISSOS: item que o fornecedor inventou' },
    { campo: 'CNPJ',                 tipo: 'texto', largura: 150, nota: '(desnorm)' },
    { campo: 'ID_CATALOGO',          tipo: 'texto', largura: 120, nota: '(desnorm) chave do histórico' },
    { campo: 'ID_EQUALIZACAO',       tipo: 'texto', largura: 150, nota: '(desnorm)' },
    { campo: 'ID_EMPREENDIMENTO',    tipo: 'texto', largura: 140, nota: '(desnorm)' },
    { campo: 'UF',                   tipo: 'texto', largura: 60, nota: '(desnorm) mesmo serviço custa diferente por praça' },
    { campo: 'DATA',                 tipo: 'data', largura: 130, nota: '(desnorm) preço é função de fornecedor x item x data' },
    { campo: 'ORIGEM',               tipo: 'enum:origem', largura: 120, nota: '(desnorm) confiança do dado' },
    { campo: 'ID_IMPORTACAO',        tipo: 'texto', largura: 120, nota: 'Importação que criou este preço' },
    { campo: 'ORIGEM_CALCULO',       tipo: 'enum:origemCalculo', largura: 120, nota: 'De onde veio o valor: informado, calculado ou ausente' },
    { campo: 'DURACAO_CONTRATO_MESES', tipo: 'inteiro', largura: 110, nota: 'Duração do contrato em meses' },
    { campo: 'PERIODO_COBRANCA',     tipo: 'enum:periodoCobranca', largura: 120, nota: 'Periodicidade: unico, mensal, trimestral, semestral, anual' },
    { campo: 'VISITAS_PERIODO',      tipo: 'inteiro', largura: 110, nota: 'Número de visitas por período' },
    { campo: 'DESCONTO_PERCENTUAL',  tipo: 'numero', largura: 110, nota: 'Percentual de desconto aplicado' }
  ]},

  { nome: 'Notas', nota: "Três canais. 'interna' NUNCA sai em exportação para fornecedor.", colunas: [
    { campo: 'ID',             tipo: 'texto', largura: 120 },
    { campo: 'ID_EQUALIZACAO', tipo: 'texto', largura: 150 },
    { campo: 'ID_EAP',         tipo: 'texto', largura: 120 },
    { campo: 'ID_PROPOSTA',    tipo: 'texto', largura: 150 },
    { campo: 'CANAL',          tipo: 'enum:canalNota', largura: 130 },
    { campo: 'TEXTO',          tipo: 'texto', largura: 520 },
    { campo: 'AUTOR',          tipo: 'texto', largura: 200 },
    { campo: 'CRIADO_EM',      tipo: 'data', largura: 130 }
  ]},

  { nome: 'Ajustes', nota: 'Desconto comercial e afins: não pertencem a item nenhum.', colunas: [
    { campo: 'ID',             tipo: 'texto', largura: 120 },
    { campo: 'ID_EQUALIZACAO', tipo: 'texto', largura: 150 },
    { campo: 'ID_PROPOSTA',    tipo: 'texto', largura: 150 },
    { campo: 'TIPO',           tipo: 'enum:tipoAjuste', largura: 150 },
    { campo: 'DESCRICAO',      tipo: 'texto', largura: 380 },
    { campo: 'VALOR',          tipo: 'moeda', largura: 140 }
  ]},

  { nome: 'Clausulas', nota: 'O que o preço cobre. Sem isto, comparar dois totais é comparar coisas diferentes.', colunas: [
    { campo: 'ID',          tipo: 'texto', largura: 120 },
    { campo: 'ID_PROPOSTA', tipo: 'texto', largura: 150 },
    { campo: 'TIPO',        tipo: 'enum:tipoClausula', largura: 180 },
    { campo: 'TEXTO',       tipo: 'texto', largura: 560 },
    { campo: 'ID_EAP_AFETADO', tipo: 'texto', largura: 130 }
  ]},

  { nome: 'Convites', nota: 'Quem foi chamado e quem recusou. Engenharia já faz; Facilities não.', colunas: [
    { campo: 'ID',             tipo: 'texto', largura: 120 },
    { campo: 'ID_EQUALIZACAO', tipo: 'texto', largura: 150 },
    { campo: 'CNPJ',           tipo: 'texto', largura: 150 },
    { campo: 'DATA_CONVITE',   tipo: 'data', largura: 130 },
    { campo: 'CONFIRMOU',      tipo: 'booleano', largura: 90 },
    { campo: 'VISITOU',        tipo: 'booleano', largura: 80 },
    { campo: 'APRESENTOU_PROPOSTA', tipo: 'booleano', largura: 130 },
    { campo: 'MOTIVO_RECUSA',  tipo: 'texto', largura: 420 },
    { campo: 'OBSERVACAO',     tipo: 'texto', largura: 380 }
  ]},

  { nome: 'Regras', nota: 'Faixas de valor x cotações mínimas. Em tabela porque muda.', colunas: [
    { campo: 'ID',              tipo: 'texto', largura: 100 },
    { campo: 'CNPJ_EMPRESA',    tipo: 'texto', largura: 150, nota: 'vazio = vale para todas' },
    { campo: 'VALOR_DE',        tipo: 'moeda', largura: 130 },
    { campo: 'VALOR_ATE',       tipo: 'moeda', largura: 130, nota: 'vazio = sem teto' },
    { campo: 'COTACOES_MINIMAS',tipo: 'inteiro', largura: 130 },
    { campo: 'PERMITE_EXCECAO', tipo: 'booleano', largura: 120 },
    { campo: 'DESCRICAO',       tipo: 'texto', largura: 380 },
    { campo: 'ATIVA',           tipo: 'booleano', largura: 70 }
  ]},

  { nome: 'Importacoes', nota: 'Importar é funcionalidade permanente, não migração. Hash impede duplicar.', colunas: [
    { campo: 'ID',              tipo: 'texto', largura: 120 },
    { campo: 'ARQUIVO_NOME',    tipo: 'texto', largura: 420 },
    { campo: 'ARQUIVO_ID',      tipo: 'texto', largura: 260 },
    { campo: 'HASH',            tipo: 'texto', largura: 260, nota: 'reimportar o mesmo arquivo não duplica' },
    { campo: 'PARSER_VERSAO',   tipo: 'inteiro', largura: 110 },
    { campo: 'ORIGEM',          tipo: 'enum:origem', largura: 120 },
    { campo: 'DATA',            tipo: 'data', largura: 130 },
    { campo: 'USUARIO',         tipo: 'texto', largura: 220 },
    { campo: 'STATUS',          tipo: 'texto', largura: 110 },
    { campo: 'RESUMO',          tipo: 'texto', largura: 520 },
    { campo: 'ARQUIVO_DRIVE_ID',tipo: 'texto', largura: 260, nota: 'ID real do arquivo no Google Drive' },
    { campo: 'HASH_VERSAO',     tipo: 'inteiro', largura: 100, nota: 'Versão do algoritmo de hash (1=original, 2=ampliado)' }
  ]},

  { nome: 'Pendencias', nota: 'O que o parser não resolveu vai para revisão humana, não some calado.', colunas: [
    { campo: 'ID',            tipo: 'texto', largura: 120 },
    { campo: 'ID_IMPORTACAO', tipo: 'texto', largura: 120 },
    { campo: 'TIPO',          tipo: 'texto', largura: 180 },
    { campo: 'DESCRICAO',     tipo: 'texto', largura: 480 },
    { campo: 'DADO_BRUTO',    tipo: 'texto', largura: 420 },
    { campo: 'RESOLVIDA',     tipo: 'booleano', largura: 90 },
    { campo: 'CRIADO_EM',     tipo: 'data', largura: 130 }
  ]},

  { nome: 'Log', nota: 'Auditoria. Session.getActiveUser() dá o usuário de graça.', colunas: [
    { campo: 'DATA',    tipo: 'data', largura: 150 },
    { campo: 'USUARIO', tipo: 'texto', largura: 240 },
    { campo: 'ACAO',    tipo: 'texto', largura: 200 },
    { campo: 'ENTIDADE',tipo: 'texto', largura: 160 },
    { campo: 'ID_ALVO', tipo: 'texto', largura: 160 },
    { campo: 'DETALHE', tipo: 'texto', largura: 560 }
  ]}
];
