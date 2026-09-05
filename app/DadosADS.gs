/**
 * Acervo extraído dos PDFs da pasta compartilhada em 05/09/2026.
 * Valores, códigos e unidades preservados do documento; campos ausentes são null.
 * Evidências e pendências ficam junto de cada orçamento.
 * Preparação local: estes arquivos não comprovam importação na base do Google.
 * Valores globais; identidade cruzada com equalização de Esteio; sem gravação automática.
 */

const CF_ORC_ADS = [
  {
    "versaoExtracao": 1,
    "tipoDocumento": "orcamento",
    "arquivo": {
      "id": "1dOcriJeFcqaaVzagTSQubH6Sc0O3-ixq",
      "nome": "Orç. ADS_10.000,00 Limpeza piso_REV01.pdf"
    },
    "numero": null,
    "data": "25/01/2026",
    "fornecedor": {
      "cnpj": "41.398.529/0001-92",
      "razaoSocial": "ADS MANUTENÇÃO E CONSERVAÇÃO LTDA",
      "contato": "Adilson Santos",
      "telefone": "(51)9 9123-3022",
      "email": "adsmanutencoes74@gmail.com",
      "cidade": "Novo Hamburgo",
      "uf": "RS",
      "nomeFantasia": "ADS MANUTENÇÃO PREDIAL"
    },
    "cnpjEmpresa": "03.015.145/0001-54",
    "empreendimento": "MEGA CENTRO LOGÍSTICO ESTEIO",
    "ufEmpreendimento": "RS",
    "categoria": "Serviço de limpeza de piso",
    "valorTotalDeclarado": "10000,00",
    "itens": [
      {
        "codigoFornecedor": null,
        "descricao": "Máquina lava",
        "unidade": null,
        "quantidade": null,
        "precoUnitario": null,
        "valorTotal": "2700,00",
        "pagina": 1
      },
      {
        "codigoFornecedor": null,
        "descricao": "Produto de limpeza",
        "unidade": null,
        "quantidade": null,
        "precoUnitario": null,
        "valorTotal": "890,00",
        "pagina": 1
      },
      {
        "codigoFornecedor": null,
        "descricao": "Mão de obra",
        "unidade": null,
        "quantidade": null,
        "precoUnitario": null,
        "valorTotal": "6410,00",
        "pagina": 1
      }
    ],
    "evidencias": {
      "cliente": "CAPITAL REALTY na proposta; vínculo com Capital Realty confirmado pela equalização complementar.",
      "escopo": "Limpeza no piso do armazém 2, cerca de 13 mil metros; varrido e lavado com máquina lava e seca.",
      "empreendimento": "Não consta na proposta. Mega Esteio - Armazém B2 identificado na equalização complementar; Novo Hamburgo é a cidade do fornecedor.",
      "preco": "Valores globais por componente do serviço. Sem quantidade/unidade/preço unitário; não transformar em R$/m².",
      "vinculo": "Cruzamento com EQU_20260202-MEsteio_ArmazémB_Piso.pdf: Mega Esteio - Armazém B2, Capital Realty, ADS, proposta 25/01/2026, R$10.000, prazo 4 dias, mesmo telefone e e-mail.",
      "cadastroFornecedor": "Razão social e CNPJ obtidos na equalização vinculada, não impressos na proposta."
    },
    "pendenciasExtracao": [
      "Valores de escopo global: não comparar como preços unitários.",
      "Nome do PDF indica REV01; equalização menciona REV02. Vínculo confirmado por conteúdo, revisão não equiparada."
    ],
    "prazoExecucaoDias": "4",
    "clienteNomeDocumento": "CAPITAL REALTY",
    "arquivoComplementar": {
      "id": "1QC9cc_vtQKoKfh_TA6mJTXcO9l-G0bbA",
      "nome": "EQU_20260202-MEsteio_ArmazémB_Piso.pdf"
    }
  }
];

/** Importa o orçamento de limpeza de piso da ADS. */
function importarADS() {
  return importarOrcamentos_(CF_ORC_ADS, true);
}
