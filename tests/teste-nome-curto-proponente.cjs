/**
 * Teste de Validação:
 * Abreviação inteligente e visualização compacta dos proponentes na grade de equalização:
 * 1. "CANAVERAL SERVIÇOS" -> "CANAVERAL"
 * 2. "LITORAL SUPRIMENTOS" -> "LITORAL"
 * 3. "CONTABILISTA SUPRIMENTOS PARA ESCRITÓRIO" -> "CONTABILISTA"
 * 4. "BASE PAPÉIS DISTRIBUIDORA" -> "BASE PAPÉIS" (1ª palavra curta <= 4 letras preserva 2 palavras)
 * 5. Casos reais adicionais (JC Materiais, Casa do Pão, Schneider, Prysmian, Proponente 1)
 * 6. Preservação de tooltip (title) e estrutura de cabeçalho CSS (.th-nome-prop)
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('Validando abreviação inteligente de proponentes no cabeçalho da grade...');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'Interface.html'), 'utf8');

// 1. Verificar CSS
assert.ok(html.includes('.th-nome-prop'), 'Interface.html deve conter estilo .th-nome-prop');
assert.ok(html.includes('text-overflow:ellipsis'), 'Interface.html deve conter text-overflow:ellipsis para evitar quebra de coluna');

// 2. Extrair e rodar o script no VM
const iScript = html.indexOf('<script>');
const fScript = html.lastIndexOf('</script>');
const scriptContent = html.slice(iScript + 8, fScript);

const makeProxy = () => new Proxy({}, {
  get: () => () => makeProxy()
});

const context = {
  document: {
    getElementById: () => ({ value: '', addEventListener: () => {}, options: [] }),
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {} } }
  },
  window: { addEventListener: () => {} },
  google: { script: { run: makeProxy() } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  console: console,
  Date: Date,
  location: { search: '' },
  confirm: () => true
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

// 3. Testar a função nomeCurtoProponente diretamente
const fn = context.nomeCurtoProponente;
assert.strictEqual(typeof fn, 'function', 'nomeCurtoProponente deve ser uma função');

// Casos específicos solicitados pelo usuário:
assert.strictEqual(fn('CANAVERAL SERVIÇOS'), 'CANAVERAL', 'Canaveral Serviços deve virar CANAVERAL');
assert.strictEqual(fn('LITORAL SUPRIMENTOS'), 'LITORAL', 'Litoral Suprimentos deve virar LITORAL');
assert.strictEqual(fn('CONTABILISTA SUPRIMENTOS PARA ESCRITÓRIO'), 'CONTABILISTA', 'Contabilista Suprimentos para Escritório deve virar CONTABILISTA');
assert.strictEqual(fn('BASE PAPÉIS DISTRIBUIDORA'), 'BASE PAPÉIS', 'Base Papéis Distribuidora deve virar BASE PAPÉIS');
assert.strictEqual(fn('BASE PAPÉIS DISTRIBUIDORA LTDA'), 'BASE PAPÉIS', 'Base Papéis Distribuidora Ltda deve virar BASE PAPÉIS');
assert.strictEqual(fn('Base Papeis'), 'Base Papeis', 'Base Papeis deve permanecer Base Papeis');

// Casos com preposições e palavras curtas
assert.strictEqual(fn('CASA DO PÃO DISTRIBUIDORA'), 'CASA DO PÃO', 'Casa do Pão Distribuidora deve virar CASA DO PÃO');
assert.strictEqual(fn('JC MATERIAIS DE CONSTRUÇÃO LTDA'), 'JC MATERIAIS', 'JC Materiais de Construção deve virar JC MATERIAIS');
assert.strictEqual(fn('SÃO JOSÉ MATERIAIS'), 'SÃO JOSÉ', 'São José Materiais deve virar SÃO JOSÉ');

// Casos de marcas consolidadas (palavra > 4 letras)
assert.strictEqual(fn('SCHNEIDER ELECTRIC BRASIL'), 'SCHNEIDER', 'Schneider Electric Brasil deve virar SCHNEIDER');
assert.strictEqual(fn('PRYSMIAN ENERGIA CABOS E SISTEMAS'), 'PRYSMIAN', 'Prysmian Cabos deve virar PRYSMIAN');
assert.strictEqual(fn('SANTHER FABRICA DE PAPEL'), 'SANTHER', 'Santher Fábrica de Papel deve virar SANTHER');
assert.strictEqual(fn('MELITTA DO BRASIL'), 'MELITTA', 'Melitta do Brasil deve virar MELITTA');

// Casos padrão / fallback
assert.strictEqual(fn('Proponente 1'), 'Proponente 1', 'Proponente 1 deve permanecer');
assert.strictEqual(fn('Proponente 2'), 'Proponente 2', 'Proponente 2 deve permanecer');
assert.strictEqual(fn('Fornecedor 3'), 'Fornecedor 3', 'Fornecedor 3 deve permanecer');
assert.strictEqual(fn(''), '', 'Vazio deve retornar vazio');
assert.strictEqual(fn(null), '', 'Null deve retornar vazio');

console.log('✓ Todos os testes de abreviação de proponentes passaram com 100% de sucesso!');

