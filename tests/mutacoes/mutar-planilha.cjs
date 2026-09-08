/**
 * Mutação do teste que impede a base de se reinventar.
 *
 *   node tests/mutacoes/mutar-planilha.cjs
 *
 * Restaura o comportamento antigo — logar e criar outra planilha — e
 * confirma que o teste reprova. Era a falha mais perigosa do sistema:
 * um usuário sem acesso repontuava a base de todos, em silêncio.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const SCHEMA = path.join(root, 'app', 'Schema.gs');
const TESTE = path.join(root, 'tests', 'teste-planilha-nao-inventa.cjs');

const mutacoes = [
  {
    nome: 'volta a criar outra base quando não consegue abrir',
    de: '      throw new Error(',
    para: "      Logger.log('vou criar outra'); } catch (ignorado) { throw new Error(",
    custo: 'um usuário sem acesso repontua a base de todos para uma planilha vazia'
  },
  {
    nome: 'o erro não diz qual planilha nem o que verificar',
    de: "        'Não consegui abrir a planilha-base ' + id + '. ' +",
    para: "        'Erro. ' + (0 ? id : '') +",
    custo: 'quem receber o erro não tem como saber o que consertar'
  }
];

let pegou = 0;
const passou = [];

mutacoes.forEach(function (m) {
  const antes = fs.readFileSync(SCHEMA, 'utf8');
  if (antes.split(m.de).length - 1 !== 1) {
    console.log('  ?  ' + m.nome + ' — alvo não encontrado; a mutação precisa ser reescrita');
    passou.push(m);
    return;
  }
  fs.writeFileSync(SCHEMA, antes.replace(m.de, m.para), 'utf8');

  let falhou = false;
  try { execFileSync(process.execPath, [TESTE], { stdio: 'pipe' }); }
  catch (e) { falhou = true; }

  fs.writeFileSync(SCHEMA, antes, 'utf8');

  if (falhou) { pegou++; console.log('  PEGOU   ' + m.nome); }
  else { passou.push(m); console.log('  PASSOU  ' + m.nome + '  <-- o teste não protege isto'); }
});

console.log('\n' + pegou + ' de ' + mutacoes.length + ' quebras foram pegas.');
if (passou.length) {
  console.log('\nO defeito está no TESTE, não no sistema:');
  passou.forEach(function (m) { console.log('  - ' + m.nome + ': ' + m.custo); });
  process.exit(1);
}
console.log('O teste protege o que diz proteger.');
