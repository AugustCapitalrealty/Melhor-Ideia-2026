/**
 * Reprodução da avaliação do aprovador em 06/09/2026.
 * Registra comportamentos atuais, inclusive lacunas; não é suíte de aceite.
 * Não acessa Google/Drive e não gera PDF real. Só captura a grade em memória.
 * Execute da raiz: node tools/avaliar-exportacao-aprovador.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function contexto(arquivos) {
  const ctx = vm.createContext({ Logger: { log() {} } });
  for (const arquivo of arquivos) {
    vm.runInContext(fs.readFileSync(path.join(root, 'app', arquivo), 'utf8'), ctx, { filename: arquivo });
  }
  return ctx;
}

const ctx = contexto(['Util.gs', 'Config.gs', 'Codigo.gs', 'Equalizacao.gs', 'Exportar.gs']);
let captura;
ctx.SpreadsheetApp = {
  create: () => ({
    getSheets: () => [{ setName() {}, getSheetId: () => 0 }],
    getId: () => 'planilha-simulada', getUrl: () => 'sem-rede'
  }),
  flush() {}
};
ctx.DriveApp = { getFileById: () => ({ moveTo() {} }), getFolderById: () => ({}) };
ctx.cfPdfDaPlanilha_ = () => ({ getId: () => 'pdf-simulado', getUrl: () => 'sem-rede' });
ctx.cfPintarExportacao_ = (aba, grade, merges, moeda, faixas) => { captura = { grade, faixas }; };
ctx.cfDataHoraTexto_ = () => '06/09/2026 20:00';
ctx.cfUsuario_ = () => 'avaliacao-local';
ctx.cfLog_ = () => {};
ctx.cfCnpjFormatado_ = valor => valor;

function proponente(id, total, calculado) {
  return {
    id, nome: 'Fornecedor ' + id, cnpj: '', total, calculado,
    propostaInicial: null, reducao: null, leadTime: null,
    prazoExecucao: null, faturamentoDireto: false
  };
}

const mapa = {
  equalizacao: {
    id: 'EQU-SIMULADA', empreendimento: 'MEGA CENTRO LOGÍSTICO ESTEIO',
    projeto: 'Serviço de exemplo', status: 'em_cotacao', vencedora: ''
  },
  proponentes: [proponente('A', 900, 1000), proponente('B', 950, 950)],
  linhas: [],
  pendencias: [{ tipo: 'cesta_incompleta', descricao: 'Fornecedor A deixou itens sem cotar.' }]
};
mapa.proponentes[0].faturamentoDireto = true;
mapa.proponentes[0].valorFaturamentoDireto = 710;
mapa.proponentes[0].dataPrevInicio = '15/09/2026';
mapa.proponentes[0].dataPrevTermino = '20/09/2026';
mapa.linhas = ['incluso_em_outro_item', 'excluido', 'nao_aplicavel'].map((status, i) => ({
  codigo: String(i), descricao: status, tipo: 'item', nivel: 0, quantidade: 1, unidade: 'un',
  precos: { A: { status, valor: null, total: null } }
}));
ctx.cfMapaEqualizacao_ = () => mapa;
ctx.cfExportarEqualizacao_(mapa.equalizacao.id);
const linha = rotulo => captura.grade.find(r => r[1] === rotulo);

assert.equal(linha('Menor proposta:')[2], 'Fornecedor A');
assert.equal(linha('Valor:')[2], 900);
assert.equal(linha('Variação sobre o menor')[6], 0);
assert.ok(Math.abs(linha('Variação sobre o menor')[8] - 50 / 900) < 1e-9);
console.log('E01 CORRIGIDO: resumo e variação unificados (base comercial A=900, 0%; B=950, +5,56%).');

assert.ok(captura.grade.flat().some(cell => String(cell).includes('710')));
console.log('E02 CORRIGIDO: faturamento direto exibe valor em reais.');

assert.equal(captura.grade.flat().includes(mapa.pendencias[0].descricao), true);
console.log('E03 CORRIGIDO: pendências e ressalvas materiais transportadas para a grade exportada.');

assert.equal(captura.grade.find(r => r[2] === 'incluso_em_outro_item')[5], 'incluso');
assert.equal(captura.grade.find(r => r[2] === 'excluido')[5], 'excluído');
assert.equal(captura.grade.find(r => r[2] === 'nao_aplicavel')[5], 'não aplicável');
console.log('E04 CORRIGIDO: incluso, excluído e não aplicável preservam status semântico.');

assert.equal(linha('Prazo de execução:')[5], '5 dias');
console.log('E05 CORRIGIDO: prazo de execução derivado de datas no formato dd/MM/yyyy.');

mapa.equalizacao.status = 'cancelada';
mapa.equalizacao.vencedora = 'A';
mapa.equalizacao.valorFinal = 900;
ctx.cfExportarEqualizacao_(mapa.equalizacao.id);
assert.equal(captura.grade[0][1], 'COTAÇÃO CANCELADA');
console.log('E06 CORRIGIDO: cotação cancelada não é impressa como PROPOSTA HOMOLOGADA.');

const mapaCtx = contexto(['Util.gs', 'Config.gs', 'Codigo.gs', 'Equalizacao.gs']);
mapaCtx.cfDataTexto_ = valor => {
  if (valor && typeof valor.getTime === 'function') {
    const d = String(valor.getDate()).padStart(2, '0');
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${valor.getFullYear()}`;
  }
  return String(valor || '');
};
mapaCtx.cfLerTudo_ = nome => ({
  Equalizacoes: [{ ID: 'EQ1' }],
  Propostas: [{ ID: 'P1', ID_EQUALIZACAO: 'EQ1', DATA_PROPOSTA: '01/09/2026', VALIDADE_DIAS: 10 }],
  Fornecedores: [], EAP: [], Precos: []
}[nome] || []);
assert.equal(mapaCtx.cfMapaEqualizacao_('EQ1').proponentes[0].validadeAte, '11/09/2026');
console.log('E07 CORRIGIDO: proposta importada com validade em dias calcula validadeAte no mapa.');
console.log('7 verificações concluídas com sucesso. Todas as correções do aprovador verificadas.');
