/**
 * Capital Fornecedores — Conciliação do legado (Etapa 6)
 *
 * Compara o consolidado local (historico_orcamentos.json) com a
 * auditoria de cobertura (auditoria_cobertura.json) e gera um
 * relatório de divergências com correções propostas.
 *
 * Uso: node tools/conciliar-legado.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dadosDir = path.join(root, 'dados');

// ── Carregar dados ──────────────────────────────────────────

const historico = JSON.parse(fs.readFileSync(path.join(dadosDir, 'historico_orcamentos.json'), 'utf8'));
const auditoria = JSON.parse(fs.readFileSync(path.join(dadosDir, 'auditoria_cobertura.json'), 'utf8'));

// ── Análise ──────────────────────────────────────────────────

const relatorio = {
  dataGeracao: new Date().toISOString(),
  resumo: {},
  divergencias: [],
  cotacoesCandidatas: [],
  precosContratuais: [],
  fontesRestritas: [],
  vinculosPendentes: []
};

// 1. Resumo do consolidado local
relatorio.resumo.consolidadoLocal = {
  documentos: historico.documentos.length,
  registros: historico.registros.length,
  fornecedores: [...new Set(historico.documentos.map(d => d.fornecedor))].length,
  megas: (historico.resumo || []).map(r => r.empreendimento)
};

// 2. Cotações candidatas ausentes no consolidado
if (auditoria.cotacoes_candidatas) {
  auditoria.cotacoes_candidatas.forEach(c => {
    relatorio.cotacoesCandidatas.push({
      conjunto: c.conjunto || c.nome || '',
      cotacoes: c.cotacoes || c.quantidade || 0,
      preservar: c.preservar || c.o_que_preservar || '',
      status: 'pendente_incorporacao',
      correcaoProposta: 'Incorporar ao consolidado após validação do documento original',
      fonte: c.fonte || 'Drive principal'
    });
  });
}

// 3. Preços contratuais Canaveral
if (auditoria.precos_contratuais_canaveral) {
  relatorio.precosContratuais = {
    quantidade: auditoria.precos_contratuais_canaveral.length || 28,
    contrato: '0187.2026',
    empresa: 'Capital Realty',
    mega: 'Itajaí',
    status: 'pendente_criacao_serie',
    correcaoProposta: 'Criar série de preços contratuais vinculada às cotações e compras. ' +
                       'NÃO somar como valor comprado — tabela de preços não comprova compra.',
    itens: (auditoria.precos_contratuais_canaveral || []).map(p => ({
      descricao: p.descricao || p.item || '',
      valor: p.valor || p.preco || 0,
      unidade: p.unidade || ''
    }))
  };
}

// 4. Fontes com acesso restrito
if (auditoria.fontes_referenciadas) {
  const restritas = (auditoria.fontes_referenciadas || []).filter(f =>
    (f.acesso_fonte && f.acesso_fonte.includes('401')) ||
    f.status === 'acesso_pendente' ||
    f.status === '401'
  );
  relatorio.fontesRestritas = restritas.map(f => ({
    id: f.id || '',
    nome: f.nome || '',
    url: f.url || '',
    acesso: f.acesso_fonte || '',
    status: 'pendente_acesso',
    correcaoProposta: 'Aguardar liberação de acesso. Não reconstruir informações ausentes por adivinhação.'
  }));
}

// 5. Divergências conhecidas nos registros existentes
relatorio.divergencias.push({
  id: 'wifi-utilities-empresa',
  tipo: 'empresa_ausente',
  registros: 'Wi-Fi Casa de Bombas, Monitoramento Utilities',
  descricao: 'As 4 equalizações na base Google estão sem CNPJ da empresa.',
  correcaoProposta: 'Atribuir CNPJ da empresa usando cfResolverEmpresa_() ao reimportar.',
  prioridade: 'alta',
  fonte: 'auditoria_cobertura.json → base_google'
});

relatorio.divergencias.push({
  id: 'utilities-periodicidade',
  tipo: 'periodicidade_incorreta',
  registros: 'Monitoramento Utilities/Água',
  descricao: 'Os totais declarados equivalem a 12x os valores calculados — mensalidade virou anual no processamento.',
  correcaoProposta: 'Corrigir PERIODO_COBRANCA para "mensal" e DURACAO_CONTRATO_MESES para 12. ' +
                     'Manter o valor mensal como PRECO_UNITARIO e o anual como referência.',
  prioridade: 'alta',
  fonte: 'auditoria_cobertura.json → base_google'
});

relatorio.divergencias.push({
  id: 'wifi-fornecedor-sem-cnpj',
  tipo: 'cadastro_incompleto',
  registros: 'Wi-Fi Casa de Bombas — fornecedor(es)',
  descricao: 'Proposta de Wi-Fi sem CNPJ de fornecedor.',
  correcaoProposta: 'Pendente — localizar CNPJ no documento original (acesso restrito HTTP 401).',
  prioridade: 'media',
  fonte: 'auditoria_cobertura.json → base_google'
});

relatorio.divergencias.push({
  id: 'eletrobarras-duplicacao',
  tipo: 'possivel_duplicacao',
  registros: 'Eletrobarras — Mão de obra',
  descricao: 'Eletrobarras aparece em duas colunas de mão de obra com R$ 2.200,00 cada.',
  correcaoProposta: 'Verificar no documento original se são propostas distintas ou duplicação. NÃO somar automaticamente.',
  prioridade: 'alta',
  fonte: 'auditoria_cobertura.json → base_google'
});

relatorio.divergencias.push({
  id: 'mapas-abril-duplicados',
  tipo: 'duplicacao_confirmada',
  registros: 'Material de consumo Curitiba, abril',
  descricao: 'Dois PDFs representam o mesmo mapa de consumo de abril.',
  correcaoProposta: 'Manter apenas um, vincular o segundo como cópia/revisão.',
  prioridade: 'media',
  fonte: 'auditoria_cobertura.json → cotacoes_candidatas'
});

relatorio.divergencias.push({
  id: 'imunizadora-rp-data',
  tipo: 'data_divergente',
  registros: 'Imunizadora RP — Lavagem de piso Esteio',
  descricao: 'Data divergente entre o mapa de equalização e o orçamento da Imunizadora RP.',
  correcaoProposta: 'Resolver a data divergente antes de confirmar fusão. Manter ambas as datas registradas com fonte.',
  prioridade: 'media',
  fonte: 'auditoria_cobertura.json → auditoria_mapas'
});

relatorio.divergencias.push({
  id: 'ads-revisao',
  tipo: 'revisao_divergente',
  registros: 'ADS Manutenção — Piso Esteio',
  descricao: 'PDF diz REV01 mas equalização diz REV02.',
  correcaoProposta: 'Registrar ambas as revisões com fonte. Não fundir automaticamente.',
  prioridade: 'baixa',
  fonte: 'DadosADS.gs + auditoria'
});

relatorio.divergencias.push({
  id: 'base-papeis-unidades',
  tipo: 'unidade_pendente',
  registros: 'Base Papéis — 79 linhas',
  descricao: '79 linhas sem unidade de embalagem. Códigos genéricos como UN e KG não identificam produtos.',
  correcaoProposta: 'Manter pendentes até confirmação. NÃO inventar unidades.',
  prioridade: 'baixa',
  fonte: 'DadosBasePapeis.gs'
});

relatorio.divergencias.push({
  id: 'litoral-desconto',
  tipo: 'desconto_embutido',
  registros: 'Litoral — 77 itens com desconto 15%',
  descricao: '31 linhas com divergência de centavos entre qtd × unitário e total impresso (desconto já aplicado).',
  correcaoProposta: 'Preservar valores como impressos. NÃO reaplicar desconto. Registrar DESCONTO_PERCENTUAL = 15.',
  prioridade: 'baixa',
  fonte: 'DadosLitoral.gs'
});

// Vínculos pendentes
relatorio.vinculosPendentes.push({
  id: 'oc-fabesul',
  tipo: 'vincular_oc',
  descricao: 'OC Fabesul 034925: 48 bobinas × R$ 13,99 = R$ 671,52 (Curitiba/Demercado).',
  correcaoProposta: 'Vincular à proposta 7503081 já consolidada. É ordem de compra, NÃO gerar outra compra.',
  prioridade: 'media'
});

relatorio.vinculosPendentes.push({
  id: 'contrato-canaveral',
  tipo: 'vincular_contrato',
  descricao: 'Contrato 0187.2026 — 28 preços fixados, Capital Realty/Mega Itajaí.',
  correcaoProposta: 'Preparar vínculo do contrato às cotações existentes. ' +
                     'Preservar diferença entre preço contratual e compra efetiva.',
  prioridade: 'alta'
});

relatorio.vinculosPendentes.push({
  id: 'engenharia-fundacoes',
  tipo: 'relacionar_propostas',
  descricao: 'Fundações Curitiba F7: 5 proponentes com divergências entre PDF, EAP e Resumo.',
  correcaoProposta: 'Documentar relação proposta↔EAP↔equalização. Manter divergências visíveis. ' +
                     'Aude e Maggi: propostas a localizar, não preços a inventar.',
  prioridade: 'media'
});

// ── Totalização ──────────────────────────────────────────────

relatorio.resumo.totalDivergencias = relatorio.divergencias.length;
relatorio.resumo.totalVinculosPendentes = relatorio.vinculosPendentes.length;
relatorio.resumo.cotacoesCandidatasAusentes = relatorio.cotacoesCandidatas.length;
relatorio.resumo.fontesComAcessoPendente = relatorio.fontesRestritas.length;

// ── Saída ────────────────────────────────────────────────────

const saida = path.join(dadosDir, 'relatorio-conciliacao.json');
fs.writeFileSync(saida, JSON.stringify(relatorio, null, 2), 'utf8');

console.log('Relatório de conciliação gerado: ' + saida);
console.log(JSON.stringify(relatorio.resumo, null, 2));
console.log('');
console.log('Divergências:');
relatorio.divergencias.forEach(d => {
  console.log('  ' + (d.prioridade === 'alta' ? '🔴' : d.prioridade === 'media' ? '🟡' : '🟢') +
              ' [' + d.tipo + '] ' + d.descricao.slice(0, 80));
});
console.log('');
console.log('Vínculos pendentes:');
relatorio.vinculosPendentes.forEach(v => {
  console.log('  📎 [' + v.tipo + '] ' + v.descricao.slice(0, 80));
});
