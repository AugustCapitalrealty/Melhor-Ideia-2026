/**
 * Orçamentos da Canaveral — extraídos dos PDFs em 05/09/2026
 *
 * Fornecedor: CANAVERAL PRODUTOS DE HIGIENE E LIMPEZA · 07.052.432/0001-95
 * Material de consumo · Mega Itajaí
 *
 * 4 documentos · 58 itens · os quatro totais fecham ao centavo.
 *
 * ⚠️ O empreendimento NÃO consta nos documentos: eles identificam apenas a
 * matriz Capital Realty em Curitiba (código interno 99903576). "Mega Itajaí"
 * vem do contexto informado pelo Guilherme e do endereço do fornecedor,
 * não do papel. Registrado aqui para não virar fato inventado depois.
 *
 * O campo NÚMERO vem literalmente "0" nos quatro — não é sequencial.
 */

const CF_FORNECEDOR_CANAVERAL = {
  cnpj: '07.052.432/0001-95',
  razaoSocial: 'CANAVERAL PRODUTOS DE HIGIENE E LIMPEZA',
  contato: 'JEANINE',
  telefone: '(47) 3348-6300',
  email: '',                       // rótulo existe no PDF, valor em branco
  cidade: 'Itajaí',
  uf: 'SC'
};

function cfOrcCanaveral_(arquivo, id, data, total, itens) {
  return {
    fornecedor: CF_FORNECEDOR_CANAVERAL,
    arquivo: { nome: arquivo, id: id },
    numero: '0',
    data: data,
    empreendimento: 'MEGA CENTRO LOGÍSTICO ITAJAÍ',
    cnpjEmpresa: '03.015.145/0001-54',
    condicoesPagamento: 'BOLETO 28 DIAS',
    valorTotalDeclarado: total,
    itens: itens.map(function (i) {
      return { codigoFornecedor: i[0], descricao: i[1], unidade: i[2],
               quantidade: i[3], precoUnitario: i[4], valorTotal: i[5] };
    })
  };
}

const CF_ORC_CANAVERAL = [

  cfOrcCanaveral_('Orç Canaveral - 4.391,45', '1QWdX6jaXs1VqBFsmNA-ERQODePq24Gcr',
    '12/08/2026', '4391,45', [
    ['85',   'GEL ADESIVO SANITARIO COALA APLIC+REFIL LAVANDA 37G C/6', 'UN', '8',  '19,90', '159,20'],
    ['480',  'AGUA SANITARIA 5 L Q BOA',                                'BB', '1',  '18,90', '18,90'],
    ['249',  'ÁLCOOL LIQUIDO 70% 1 L HOSPITALAR ITAJUBA/VALE',          'UN', '6',  '8,85',  '53,10'],
    ['8490', 'BOM AR LEVEUZE 400ML CAPIM LIMAO',                        'UN', '7',  '9,90',  '69,30'],
    ['7704', 'SAPONACEO CIF 250ML',                                     'UN', '3',  '11,90', '35,70'],
    ['8180', 'AROMATIZANTE COALA 120ML ALGODÃO',                        'UN', '4',  '14,90', '59,60'],
    ['7930', 'DESINFETANTE CANAVERAL LAVANDA 5L',                       'BB', '2',  '15,00', '30,00'],
    ['8171', 'DETERGENTE CLORADO GEL GUIMARAES 5L',                     'BB', '3',  '39,00', '117,00'],
    ['7756', 'DETERGENTE YPÊ NEUTRO 5L',                                'BB', '1',  '27,50', '27,50'],
    ['414',  'FIBRAÇO LEVE BRANCO GDE 26CM 9504',                       'UN', '5',  '1,99',  '9,95'],
    ['6185', 'ESPONJA CONDOR 11X7.5X0.20 PACK C/4',                     'UN', '2',  '3,40',  '6,80'],
    ['7185', 'BACT GERM CANAVERAL 1L SPRAY DESINFETANTE',               'UN', '2',  '15,00', '30,00'],
    ['96',   'FIBRAÇO VERDE GDE 26CM 9502',                             'UN', '3',  '2,25',  '6,75'],
    ['9435', 'LUSTRA LAVANDA MOVEIS SEBOLD C/SILICONE 200ML',           'UN', '1',  '6,99',  '6,99'],
    ['8397', 'PASTILHA ADESIVA SANITARIA COALA LAVANDA C/2',            'UN', '5',  '5,50',  '27,50'],
    ['6959', 'SABONETE LIQUIDO PREMISSE 5L ALGAS MARINHAS',             'BB', '1',  '89,90', '89,90'],
    ['7167', 'SACO DE LIXO AZUL 100L 0,10 C/100',                       'CX', '2',  '79,90', '159,80'],
    ['6714', 'SACO DE LIXO MARROM 100L 0,10 C/ 100',                    'CT', '3',  '79,90', '239,70'],
    ['6708', 'SACO DE LIXO MARROM 40L 0,04 C/ 100',                     'CT', '3',  '19,90', '59,70'],
    ['8900', 'TELA DE MICTORIO PREMISSE CEREJA',                        'UN', '4',  '6,99',  '27,96'],
    ['6306', 'P.TOALHA BOBINA 200M TR IPEL TRACTION 30G C/6',           'UN', '11', '172,50','1897,50'],
    ['6621', 'PAPEL HIG. 300 MT NATUREZA CX C/8',                       'CX', '14', '89,90', '1258,60']
  ]),

  cfOrcCanaveral_('Orç Canaveral - 999,79', '1wmFtKzI4ISOTAVn1LvGdYEYIAkW-qQ03',
    '12/08/2026', '999,79', [
    ['286',  'ACUCAR 1KG',                                    'UN', '9',  '4,90',  '44,10'],
    ['6492', 'CAFE MELITA TRADICIONAL 500G',                  'UN', '22', '35,90', '789,80'],
    ['287',  'FILTRO DE CAFE 103',                            'UN', '10', '5,50',  '55,00'],
    ['6717', 'PANO DE CHAO PLUS 40X60',                       'UN', '3',  '5,50',  '16,50'],
    ['9543', 'PANO DE PRATO CHEF 45X70CM',                    'UN', '3',  '10,90', '32,70'],
    ['279',  'INSETICIDA AEROSOL 350ML',                      'UN', '1',  '11,99', '11,99'],
    ['7737', 'PULVERIZADOR 500ML BRALIMPIA',                  'UN', '1',  '9,90',  '9,90'],
    ['7149', 'PANO UNIDADE DE MICROFIBRA SUPER 60X80 NOBRE',  'UN', '2',  '19,90', '39,80']
  ]),

  cfOrcCanaveral_('Orç Canaveral - 1.595,72', '1zYv7vMJZDTRVdd_bIaVoHQk-0RwqCWH-',
    '28/08/2026', '1595,72', [
    ['8971', 'REFIL C/6 GEL ADESIVO SANIT. COALA LAVANDA',              'UN', '4', '15,00', '60,00'],
    ['249',  'ÁLCOOL LIQUIDO 70% 1 L HOSPITALAR ITAJUBA/VALE',          'UN', '2', '8,85',  '17,70'],
    ['8490', 'BOM AR LEVEUZE 400ML CAPIM LIMAO',                        'UN', '3', '9,90',  '29,70'],
    ['7704', 'SAPONACEO CIF 250ML',                                     'UN', '2', '11,90', '23,80'],
    ['8180', 'AROMATIZANTE COALA 120ML ALGODÃO',                        'UN', '2', '14,90', '29,80'],
    ['7930', 'DESINFETANTE CANAVERAL LAVANDA 5L',                       'BB', '2', '15,00', '30,00'],
    ['6185', 'ESPONJA CONDOR 11X7.5X0.20 PACK C/4',                     'UN', '2', '3,40',  '6,80'],
    ['7185', 'BACT GERM CANAVERAL 1L SPRAY DESINFETANTE',               'UN', '1', '15,00', '15,00'],
    ['96',   'FIBRAÇO VERDE GDE 26CM 9502',                             'UN', '3', '2,25',  '6,75'],
    ['7981', 'LUSTRA MOVEIS POLWAX 200ML LAVANDA',                      'UN', '1', '6,99',  '6,99'],
    ['5704', 'LUVA VERNIZ BOMPACK (PAR) TAM. G AZUL',                   'PC', '1', '7,99',  '7,99'],
    ['6621', 'PAPEL HIG. 300 MT NATUREZA CX C/8',                       'CX', '5', '89,90', '449,50'],
    ['9850', '(COMODATO) P.TOALHA 20 X 200CM 24G C/6 BOBINA TRACTION',  'UN', '4', '172,50','690,00'],
    ['6959', 'SABONETE LIQUIDO PREMISSE 5L ALGAS MARINHAS',             'BB', '1', '89,90', '89,90'],
    ['6714', 'SACO DE LIXO MARROM 100L 0,10 C/ 100',                    'CT', '1', '79,90', '79,90'],
    ['6709', 'SACO DE LIXO MARROM 60L 0,04 C/ 100',                     'CT', '1', '25,00', '25,00'],
    ['6708', 'SACO DE LIXO MARROM 40L 0,04 C/ 100',                     'CT', '1', '19,90', '19,90'],
    ['8901', 'TELA DE MICTORIO PREMISSE LIMÃO',                         'UN', '1', '6,99',  '6,99']
  ]),

  cfOrcCanaveral_('Orç Canaveral - 528,39', '1S7qGBciD_bC57bzhw4VpcAI2vOy6Egos',
    '28/08/2026', '528,39', [
    ['286',  'ACUCAR 1KG',                                    'UN', '3', '4,90',   '14,70'],
    ['6492', 'CAFE MELITA TRADICIONAL 500G',                  'UN', '6', '35,90',  '215,40'],
    ['5957', 'ESSENCIA 10ML PIMENTA ROSA',                    'FR', '1', '15,90',  '15,90'],
    ['7669', 'ESSENCIA 10ML ALECRIM SILVESTRE',               'UN', '1', '15,90',  '15,90'],
    ['7555', 'ESSENCIA 10ML FLOR DE CEREJEIRA',               'UN', '1', '15,90',  '15,90'],
    ['287',  'FILTRO DE CAFE 103',                            'UN', '2', '5,50',   '11,00'],
    ['279',  'INSETICIDA AEROSOL PRO INSET 350ML',            'UN', '1', '11,99',  '11,99'],
    ['7488', 'VASSOURA 1,1M V35 CONDOR CABO DE CHAPA',        'UN', '2', '13,90',  '27,80'],
    ['7149', 'PANO UNIDADE DE MICROFIBRA SUPER 60X80 NOBRE',  'UN', '1', '19,90',  '19,90'],
    ['6090', 'MULT GRAX 5L (1ML/M3)',                         'BB', '1', '179,90', '179,90']
  ])
];

/** Importa os quatro orçamentos da Canaveral. */
function importarCanaveral() {
  return importarOrcamentos_(CF_ORC_CANAVERAL, true);
}
