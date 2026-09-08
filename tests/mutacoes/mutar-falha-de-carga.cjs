/**
 * Prova por mutação: quebra o código de produção de propósito e exige
 * que o teste FALHE. Um teste que passa com o defeito de volta é
 * teatro.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = 'c:\\Users\\guilherme.marques\\.gemini\\antigravity\\scratch\\Melhor-Ideia-2026';
const alvo = path.join(raiz, 'app', 'Interface.html');
const teste = path.join(raiz, 'tests', 'teste-falha-de-carga.cjs');

const original = fs.readFileSync(alvo, 'utf8');

const mutacoes = [
  {
    nome: 'a trava não cai quando as opções falham',
    de: "  falhaAoCarregar('avisoOpcoes', 'as categorias e os Megas', motivo, 'carregarOpcoes');\r\n  opcoesCarregadas = false;",
    para: "  falhaAoCarregar('avisoOpcoes', 'as categorias e os Megas', motivo, 'carregarOpcoes');"
  },
  {
    nome: 'carregarOpcoes volta a não ter withFailureHandler',
    de: "  })\r\n  .withFailureHandler(function (e) { falhaNasOpcoes(e); })\r\n  .apiOpcoes();",
    para: "  })\r\n  .apiOpcoes();"
  },
  {
    nome: 'o { ok: false } do servidor volta a ser um return calado',
    de: "    if (!r.ok) { falhaNasOpcoes(r.erro); return; }",
    para: "    if (!r.ok) { return; }"
  },
  {
    nome: 'as pílulas voltam a engolir o erro num handler vazio',
    de: "    .withFailureHandler(falhaNasCategorias)\r\n    .apiCategorias();",
    para: "    .withFailureHandler(function () {})\r\n    .apiCategorias();"
  },
  {
    nome: 'a lista de fornecedores não destrava a segunda tentativa',
    de: "      falhaAoCarregar('listaForn', 'os fornecedores', e, 'carregarFornecedores');\r\n      fornecedoresCarregados = false;",
    para: "      falhaAoCarregar('listaForn', 'os fornecedores', e, 'carregarFornecedores');"
  },
  {
    nome: 'a lista de equalizações some sem dizer o motivo',
    de: "      falhaAoCarregar('listaEq', 'as equalizações', e, 'carregarEqualizacoes');\r\n      equalizacoesCarregadas = false;",
    para: "      equalizacoesCarregadas = false;"
  }
];

let todasPegas = true;

mutacoes.forEach(function (m) {
  const n = original.split(m.de).length - 1;
  if (n !== 1) {
    console.log('!! âncora com ' + n + ' ocorrência(s): ' + m.nome);
    todasPegas = false;
    return;
  }

  fs.writeFileSync(alvo, original.replace(m.de, m.para), 'utf8');
  let pegou = false;
  try {
    execFileSync(process.execPath, [teste], { stdio: 'pipe' });
  } catch (e) {
    pegou = true;
  }
  fs.writeFileSync(alvo, original, 'utf8');

  console.log((pegou ? 'PEGOU  ' : 'PASSOU ') + ' · ' + m.nome);
  if (!pegou) todasPegas = false;
});

// E, sem mutação nenhuma, o teste tem de passar.
try {
  execFileSync(process.execPath, [teste], { stdio: 'pipe' });
  console.log('PASSA   · com o código íntegro');
} catch (e) {
  console.log('!! o teste falha com o código íntegro');
  todasPegas = false;
}

process.exit(todasPegas ? 0 : 1);
