/**
 * Cotações da Base Papéis — extraídas dos PDFs em 05/09/2026
 *
 * Fornecedor: BASE PAPÉIS · 07.986.449/0001-10 · Porto Alegre/RS
 * Contato: ANDRESSA · andressa@basepapeis.com.br · (51) 3371-8100
 *
 * 5 cotações · 79 itens · os cinco totais fecham ao centavo.
 *
 * É a primeira SÉRIE DE PREÇO REAL do acervo: mesmo fornecedor, sete meses,
 * código de produto estável. Aqui o histórico deixa de ser promessa.
 *
 * ⚠️ Três correções que a extração trouxe:
 *
 * 1. O arquivo "Orç. Base Papéis Armazém B2" é a cotação 185903 — o número
 *    estava escondido atrás de um nome descritivo.
 * 2. A cotação 188139 NÃO é Mega Esteio: o endereço de entrega é Juvevê,
 *    Curitiba. Mesmo fornecedor e mesma tabela, outro empreendimento.
 * 3. As quatro de Esteio trazem a UF escrita como "PR" no endereço, o que é
 *    erro do fornecedor — Esteio é RS. Gravamos RS.
 *
 * O layout da Base Papéis não tem coluna de unidade nem de desconto. Não é
 * falha de leitura: são colunas que o fornecedor não emite.
 */

const CF_FORNECEDOR_BASEPAPEIS = {
  cnpj: '07.986.449/0001-10',
  razaoSocial: 'BASE PAPEIS',
  contato: 'ANDRESSA',
  telefone: '(51) 3371-8100',
  email: 'andressa@basepapeis.com.br',
  cidade: 'Porto Alegre',
  uf: 'RS'
};

function cfCotBasePapeis_(numero, id, data, total, prazoPgto, empreendimento, itens) {
  return {
    fornecedor: CF_FORNECEDOR_BASEPAPEIS,
    arquivo: { nome: 'CotacaoBasePapeis_' + numero, id: id },
    numero: numero,
    data: data,
    empreendimento: empreendimento,
    cnpjEmpresa: '03.015.145/0001-54',
    condicoesPagamento: prazoPgto + ' · BOLETO',
    validadeDias: '5',
    valorTotalDeclarado: total,
    itens: itens.map(function (i) {
      return { codigoFornecedor: i[0], descricao: i[1], unidade: '',
               quantidade: i[2], precoUnitario: i[3], valorTotal: i[4] };
    })
  };
}

const CF_MEGA_ESTEIO = 'MEGA CENTRO LOGÍSTICO ESTEIO';
const CF_MEGA_CURITIBA = 'MEGA CENTRO LOGÍSTICO CURITIBA';

const CF_COT_BASEPAPEIS = [

  cfCotBasePapeis_('177258', '18jmD4kEixd92plqJ8_9DsYMtQgGGIwkz',
    '19/12/2025', '1183,07', '29 dias', CF_MEGA_ESTEIO, [
    ['15119', 'AGUA SANITARIA 5 LT - MARQUI',                                 '3',  '8,90',  '26,70'],
    ['13936', 'ALCOOL LIQUIDO 5 LT FLOPS',                                    '2',  '45,00', '90,00'],
    ['373',   'CAFE MELITTA TRADICIONAL 500 GR',                              '8',  '39,50', '316,00'],
    ['14981', 'COPO PLASTICO 200ML C/100 UN BRANCO COPOBRAS PP',              '10', '6,98',  '69,80'],
    ['13312', 'DESINFETANTE 5 LT LAVANDA - AQUAFAST',                         '3',  '19,95', '59,85'],
    ['12752', 'DETERGENTE 5 LT NEUTRO - AQUAFAST',                            '2',  '22,00', '44,00'],
    ['371',   'FILTRO CAFE 103 C/30 UN BRIGITTA',                             '3',  '5,10',  '15,30'],
    ['614',   'LIMPADOR 500 ML LIMPA VIDROS C/ ALCOOL SQUEEZE - VEJA',        '2',  '13,00', '26,00'],
    ['1489',  'PA DE LIXO JEITOSA C/CABO SUPERPRO BETTANIN',                  '1',  '22,00', '22,00'],
    ['800',   'PAPEL HIG ROLO 8X300M LUXO - IPEL NATUREZA',                   '2',  '75,75', '151,50'],
    ['15289', 'PAPEL INTERFOLHADO 20 X 20 1000F/20 - PENIPEL',                '8',  '19,95', '159,60'],
    ['399',   'SACO ALVEJADO 0,50 X 0,70 - MARTINS',                          '4',  '5,95',  '23,80'],
    ['14672', 'SACO LIXO 060 LT PRETO REFORCADO C/100 (11KG) - BASE LIX',     '2',  '24,90', '49,80'],
    ['13726', 'SACO LIXO 100 LT PRETO REFORCADO C/100 (24KG) - BASE ECOSUL',  '2',  '46,86', '93,72'],
    ['12744', 'SACO LIXO 200 LT PRETO REFORCADO C/50 - BASE ECOSUL',          '1',  '35,00', '35,00']
  ]),

  cfCotBasePapeis_('178511', '1pziA36BWAe_wi6TWtQ4ZvhuOH7XRGry8',
    '20/01/2026', '1127,10', '49 dias', CF_MEGA_ESTEIO, [
    ['15935', 'ACUCAR REFINADO 1 KG GUARANI',                                 '3',  '5,45',  '16,35'],
    ['15119', 'AGUA SANITARIA 5 LT - MARQUI',                                 '2',  '8,90',  '17,80'],
    ['13936', 'ALCOOL LIQUIDO 5 LT FLOPS',                                    '1',  '45,00', '45,00'],
    ['373',   'CAFE MELITTA TRADICIONAL 500 GR',                              '8',  '39,50', '316,00'],
    ['14981', 'COPO PLASTICO 200ML C/100 UN BRANCO COPOBRAS PP',              '10', '6,98',  '69,80'],
    ['13312', 'DESINFETANTE 5 LT LAVANDA - AQUAFAST',                         '3',  '19,95', '59,85'],
    ['12752', 'DETERGENTE 5 LT NEUTRO - AQUAFAST',                            '1',  '22,00', '22,00'],
    ['371',   'FILTRO CAFE 103 C/30 UN BRIGITTA',                             '3',  '5,10',  '15,30'],
    ['614',   'LIMPADOR 500 ML LIMPA VIDROS C/ ALCOOL SQUEEZE - VEJA',        '2',  '13,00', '26,00'],
    ['12900', 'LUVA BORRACHA AZUL M - VOLK',                                  '3',  '4,95',  '14,85'],
    ['796',   'PA DE LIXO COLETORA COM TAMPA COM CABO BETTANIN',              '1',  '43,45', '43,45'],
    ['14899', 'PANO MULTIUSO C/ 5 UNIDADES AZUL INOVEN',                      '2',  '3,15',  '6,30'],
    ['800',   'PAPEL HIG ROLO 8X300M LUXO - IPEL NATUREZA',                   '2',  '75,75', '151,50'],
    ['15289', 'PAPEL INTERFOLHADO 20 X 20 1000F/20 - PENIPEL',                '8',  '19,95', '159,60'],
    ['2037',  'SABONETE ESPUMA REFIL 500ML COTTON HYDRAPLUS',                 '6',  '14,95', '89,70'],
    ['399',   'SACO ALVEJADO 0,50 X 0,70 - MARTINS',                          '4',  '5,95',  '23,80'],
    ['14674', 'SACO LIXO 060 LT PRETO LEVE C/100 (8,0KG) - BASE LIX',         '2',  '24,90', '49,80']
  ]),

  cfCotBasePapeis_('182188', '18CitFo1BwX0cLhZGpbg_S6BmearfeF70',
    '23/04/2026', '1243,73', '17 dias', CF_MEGA_ESTEIO, [
    ['15119', 'AGUA SANITARIA 5 LT - MARQUI',                                 '3',  '8,90',  '26,70'],
    ['515',   'ALCOOL LIQUIDO 1 LT 70 FLOPS',                                 '2',  '7,99',  '15,98'],
    ['373',   'CAFE MELITTA TRADICIONAL 500 GR',                              '5',  '39,50', '197,50'],
    ['1842',  'COPO PLASTICO 200ML C/100 UN TRANSPARENTE ECOCOPPO PP',        '10', '6,98',  '69,80'],
    ['13312', 'DESINFETANTE 5 LT LAVANDA - AQUAFAST',                         '3',  '19,95', '59,85'],
    ['12752', 'DETERGENTE 5 LT NEUTRO - AQUAFAST',                            '2',  '22,00', '44,00'],
    ['12973', 'FIBRA USO GERAL 101 X 225 MM BETTANIN',                        '2',  '2,50',  '5,00'],
    ['371',   'FILTRO CAFE 103 C/30 UN BRIGITTA',                             '2',  '5,10',  '10,20'],
    ['614',   'LIMPADOR 500 ML LIMPA VIDROS C/ ALCOOL SQUEEZE - VEJA',        '2',  '13,00', '26,00'],
    ['12900', 'LUVA BORRACHA AZUL M - VOLK',                                  '3',  '4,95',  '14,85'],
    ['15606', 'MOP PO REFIL 80 CM TONK',                                      '1',  '58,00', '58,00'],
    ['12939', 'MOP UMIDO 190 GR MAXITEX',                                     '1',  '15,50', '15,50'],
    ['800',   'PAPEL HIG ROLO 8X300M LUXO - IPEL NATUREZA',                   '2',  '75,72', '151,44'],
    ['15289', 'PAPEL INTERFOLHADO 20 X 20 1000F/20 - PENIPEL',                '15', '19,95', '299,25'],
    ['2037',  'SABONETE ESPUMA REFIL 500ML COTTON HYDRAPLUS',                 '6',  '14,95', '89,70'],
    ['399',   'SACO ALVEJADO 0,50 X 0,70 - MARTINS',                          '4',  '5,95',  '23,80'],
    ['14674', 'SACO LIXO 060 LT PRETO LEVE C/100 (8,0KG) - BASE LIX',         '2',  '24,90', '49,80'],
    ['13726', 'SACO LIXO 100 LT PRETO REFORCADO C/100 (24KG) - BASE ECOSUL',  '1',  '46,86', '46,86'],
    ['12744', 'SACO LIXO 200 LT PRETO REFORCADO C/50 - BASE ECOSUL',          '1',  '39,50', '39,50']
  ]),

  cfCotBasePapeis_('185903', '1EVSMzEPsL1J4R3cflIRWJoXDEBfzpykf',
    '03/06/2026', '609,58', '27 dias', CF_MEGA_ESTEIO, [
    ['2464',  'ACUCAR REFINADO 1 KG CARAVELAS',                               '2', '5,45',  '10,90'],
    ['15119', 'AGUA SANITARIA 5 LT - MARQUI',                                 '1', '8,90',  '8,90'],
    ['13936', 'ALCOOL LIQUIDO 5 LT FLOPS',                                    '1', '45,00', '45,00'],
    ['373',   'CAFE MELITTA TRADICIONAL 500 GR',                              '2', '38,00', '76,00'],
    ['1842',  'COPO PLASTICO 200ML C/100 UN TRANSPARENTE ECOCOPPO PP',        '8', '6,98',  '55,84'],
    ['15917', 'DESINFETANTE 5 LT LAVANDA - GIRANDO SOL',                      '1', '19,99', '19,99'],
    ['12752', 'DETERGENTE 5 LT NEUTRO - AQUAFAST',                            '1', '23,95', '23,95'],
    ['371',   'FILTRO CAFE 103 C/30 UN BRIGITTA',                             '2', '5,10',  '10,20'],
    ['614',   'LIMPADOR 500 ML LIMPA VIDROS C/ ALCOOL SQUEEZE - VEJA',        '1', '14,50', '14,50'],
    ['800',   'PAPEL HIG ROLO 8X300M LUXO - IPEL NATUREZA',                   '1', '75,95', '75,95'],
    ['15289', 'PAPEL INTERFOLHADO 20 X 20 1000F/20 - PENIPEL',                '5', '19,95', '99,75'],
    ['2037',  'SABONETE ESPUMA REFIL 500ML COTTON HYDRAPLUS',                 '6', '14,95', '89,70'],
    ['14674', 'SACO LIXO 060 LT PRETO LEVE C/100 (8,0KG) - BASE LIX',         '1', '24,90', '24,90'],
    ['13726', 'SACO LIXO 100 LT PRETO REFORCADO C/100 (24KG) - BASE ECOSUL',  '1', '54,00', '54,00']
  ]),

  // ⚠️ Curitiba, não Esteio — endereço de entrega é Juvevê.
  cfCotBasePapeis_('188139', '1LXwNr3leKFiZ48S0rEVa0zaBIAe5-4uL',
    '15/07/2026', '492,05', '27 dias', CF_MEGA_CURITIBA, [
    ['1115',  'ACUCAR REFINADO 1 KG BARRA',                                   '1', '5,45',  '5,45'],
    ['15119', 'AGUA SANITARIA 5 LT - MARQUI',                                 '1', '8,90',  '8,90'],
    ['515',   'ALCOOL LIQUIDO 1 LT 70 FLOPS',                                 '1', '7,99',  '7,99'],
    ['13936', 'ALCOOL LIQUIDO 5 LT FLOPS',                                    '1', '45,00', '45,00'],
    ['373',   'CAFE MELITTA TRADICIONAL 500 GR',                              '4', '37,90', '151,60'],
    ['1837',  'COPO PLASTICO 200ML C/100 UN BRANCO ECOCOPPO PP',              '4', '6,98',  '27,92'],
    ['15917', 'DESINFETANTE 5 LT LAVANDA - GIRANDO SOL',                      '1', '19,99', '19,99'],
    ['12752', 'DETERGENTE 5 LT NEUTRO - AQUAFAST',                            '1', '23,95', '23,95'],
    ['494',   'ESPONJA DUPLA FACE 11CM BETTANIN',                             '3', '1,22',  '3,66'],
    ['371',   'FILTRO CAFE 103 C/30 UN BRIGITTA',                             '3', '5,78',  '17,34'],
    ['800',   'PAPEL HIG ROLO 8X300M LUXO - IPEL NATUREZA',                   '1', '75,95', '75,95'],
    ['399',   'SACO ALVEJADO 0,50 X 0,70 - MARTINS',                          '4', '6,35',  '25,40'],
    ['14672', 'SACO LIXO 060 LT PRETO REFORCADO C/100 (10KG) - BASE LIX',     '1', '24,90', '24,90'],
    ['13726', 'SACO LIXO 100 LT PRETO REFORCADO C/100 (24KG) - BASE ECOSUL',  '1', '54,00', '54,00']
  ])
];

/** Importa as cinco cotações da Base Papéis. */
function importarBasePapeis() {
  return importarOrcamentos_(CF_COT_BASEPAPEIS, true);
}

/** Importa tudo que foi extraído de PDF (21 orçamentos, 7 fornecedores, 274 itens). */
function importarTodosOsOrcamentos() {
  Logger.log('════ 1/7: Canaveral (4 orçamentos, Itajaí) ════');
  importarOrcamentos_(CF_ORC_CANAVERAL, true);
  Logger.log('\n════ 2/7: Base Papéis (5 cotações, Esteio/Curitiba) ════');
  importarOrcamentos_(CF_COT_BASEPAPEIS, true);
  Logger.log('\n════ 3/7: S. Vargas (3 orçamentos, Curitiba) ════');
  importarOrcamentos_(CF_ORC_SVARGAS, true);
  Logger.log('\n════ 4/7: Litoral (4 orçamentos, Itajaí) ════');
  importarOrcamentos_(CF_ORC_LITORAL, true);
  Logger.log('\n════ 5/7: Fabesul (3 orçamentos, Curitiba) ════');
  importarOrcamentos_(CF_ORC_FABESUL, true);
  Logger.log('\n════ 6/7: Contabilista (1 orçamento, Curitiba) ════');
  importarOrcamentos_(CF_ORC_CONTABILISTA, true);
  Logger.log('\n════ 7/7: ADS (1 orçamento global, Esteio) ════');
  importarOrcamentos_(CF_ORC_ADS, true);
  Logger.log('\n Concluída carga unificada de todos os 21 orçamentos do acervo.');
}
