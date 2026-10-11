# Design system editorial — vídeos longos do Jacaré

Criado em 28/09/2026 a partir da referência em `REFERENCIA-estilo-editorial.md`. **Aprovação pendente:** o teste de
10 s está em `00-estilo/build/render/00-estilo.mp4`.

- **Código:** `_motor/editorial.js`. O `gerar.py` injeta o arquivo em todo player; os projetos antigos não mudam
  (nada desenha sozinho, só as cenas que declaram `tema`).
- **Exemplo completo:** `00-estilo/cenas/cap0.js` (as três cenas do teste).

## A ideia

Um apresentador fixo (**o jacaré**), fundo claro com uma cor por capítulo, texto grande com **uma palavra em serifa
itálica colorida**, rótulos em fonte mono nos cantos e tudo o que é imagem passa por um **pontilhado** preto e branco.
A narração dita o ritmo: cada palavra entra na tela quando é dita, e a boca do jacaré mexe nas sílabas.

**Quando usar:** nas cenas de explicação (números, cortes, mapas, comparações, gancho, fechamento).
**Quando não usar:** os clipes do Veo e os vídeos reais continuam em tela cheia no visual de cinema. Por cima deles pode
ficar o jacaré no círculo e os rótulos de canto, mas o fundo pastel não.

## Cores (um tema por capítulo)

| Tema | Fundo | Destaque (serifa, anel, dados) | Para quê |
|---|---|---|---|
| `vivo` | `#2A55D6` azul forte | `#FFD84D` amarelo | **gancho e momentos de impacto** (texto branco) |
| `papel` | `#F3F3EF` | `#2F7A45` verde jacaré | neutro, respiro |
| `agua` | `#D8ECE7` | `#0E6B62` | mar, rio, pontes, fundações |
| `terra` | `#F1E5D5` | `#A4531D` | escavação, túnel, deserto |
| `rocha` | `#E1E5EC` | `#34528A` | montanha, subsolo, engenharia |
| `alerta` | `#F2DFDB` | `#A53A2E` | acidente, mortes, tom sóbrio |
| `noite` | `#0D1012` | `#8BD068` | fechamento, suspense, "a seguir" |

Cada tema também tem `tinta` (texto), `mudo` (rótulos), `claro` (áreas de gráfico), `cartao` e `borda`.

## Tipografia

| Papel | Fonte (Google Fonts) | Uso |
|---|---|---|
| Sans | **Geist** 600, espaçamento −3,5% | frases e números |
| Serifa | **Instrument Serif** itálica, 15% maior | **só a palavra-chave** da frase, na cor de destaque |
| Mono | **Geist Mono** 500 | `// rótulos`, legendas de cartão, timecode |

Escala (px em 1080p): `gigante 210` (número) · `xl 124` · `l 104` (frase principal) · `m 72` · `s 56` · `corpo 40` ·
`sobre 26` (rótulo acima da frase) · `canto 21`.

**Regra da serifa:** uma palavra (ou duas) por tela. Se tudo é destaque, nada é.

## Componentes (`_motor/editorial.js`)

| Função | O que faz |
|---|---|
| `edFundo(tema)` | fundo do tema com a grade de pontos |
| `edFrase(linhas, x, y, lt, S, {tema, tam})` | frase que entra palavra por palavra **na hora em que é dita**. Segmento: `{t, f: 'serif', em: 'mil'}` (`em` prende a outra palavra da fala, ex.: "1.138" ↔ "mil") |
| `edMono(texto, x, y, tema, {p})` | rótulo `// assim` |
| `edContador(valor, x, y, tam, p, {tema})` | número que conta, dígitos com largura fixa |
| `edCartao(caixa, tema, p, b => {...})` | cartão branco que sobe; o conteúdo é recortado nos cantos |
| `edMidiaPontilhada('R11', caixa, tema, {zoom, x, y, contraste})` | foto ou vídeo pontilhado nas cores do tema |
| `pontilhar(id, w, h, desenhar, {tinta, papel})` | o filtro (Bayer 8×8), para qualquer desenho |
| rótulos de canto | automáticos: `// 01 — <rotulo da cena>` e `O JACARÉ 00:01:12:04` |

## O apresentador

Jacaré desenhado em código (`desenhaJacare`), de camiseta com bolso, cabeça em 3/4 com o focinho virado para o texto.
**Colorido desde 28/09** (pedido do Guilherme: "ficou muito branco"): pele verde `#5FAE4E`, barriga `#D8E59C`,
camiseta laranja `#F07A2A`, língua rosa. O pontilhado continua: ponto claro = a cor, ponto escuro = a cor escurecida.
`OPCOES.jacarePB = true` volta à versão preto e branco. **Pixel do pontilhado: 3 px** (`ED.celula`), o mesmo das fotos.
As fotos pontilhadas saem na cor de destaque do tema (não em preto), e o círculo do apresentador na cor `claro`.

Chapéus (`chapeu` na cena ou em `edPoseJacare`): `'capacete'` (obra, descida) e `'detetive'` (dossiê).
Fora do lugar fixo: `edJacare(x, y, tam, edPoseJacare(NOW, {olhar, chapeu}), {id, pb, tinta, papel, inverter})`.

Cada cena declara onde ele está:

```js
CENAS['2.4'] = {
  tema: 'agua',            // cor do capítulo (liga o apresentador e os rótulos)
  rotulo: 'brooklyn',      // aparece no canto: "// 02 — brooklyn"
  apres: 'circulo',        // 'grande' (à direita, corpo cortado) | 'circulo' (canto inferior esquerdo) | 'fora'
  olhar: { x: -0.5, y: 0.1 },  // para onde ele olha (−1 esquerda … 1 direita)
  aceno: [0, 1.8],         // acena entre esses segundos da cena
  marca: false,            // desliga a marca antiga "O JACARÉ" do canto
  fn(lt, S) { ... },
};
```

Na troca de cena ele viaja sozinho entre os estados (0,9 s). A boca abre por sílaba a partir do tempo das palavras
do edge-tts; ele pisca, respira e balança a cabeça sem nenhuma configuração.

**Regra:** `grande` no gancho e no fechamento; `circulo` no meio; `fora` nas cenas de Veo que precisam da tela inteira.

## Layout

- Texto sempre à esquerda, a partir de `ED.margem` (150 px). Com o jacaré `grande`, o texto não passa de x ≈ 1050.
- Com o jacaré no `circulo`, nada abaixo de y ≈ 700 no lado esquerdo.
- Cartões à direita (x ≈ 930, largura ≈ 840), um em cima do outro, cantos de 28 px.
- Cada tela, **uma ideia**.

## Formatos alternativos

Ver `FORMATOS.md` (planta, dossiê, descida). Todos reaproveitam este sistema: o jacaré, a tipografia e o pontilhado.

## Pendências

- O Guilherme aprovar o teste: v1 aprovada ("gostei do formato"), mas "muito branco"; v2 com o jacaré colorido e o gancho azul
- Voz: hoje é a Francisca. Se o jacaré ganhar voz própria, trocar em `projeto.json`
- Poses extras do jacaré (apontando, surpreso, sério para o tema `alerta`)
