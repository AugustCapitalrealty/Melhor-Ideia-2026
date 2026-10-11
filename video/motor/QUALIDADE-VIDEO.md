# Padrão de qualidade de todo vídeo novo (desde 04/10/2026)

Decisão do Guilherme, 04/10/2026, depois da comparação `00-comparar-hoje` × `00-comparar-novo` ("ficou muito bom, gostei
demais, coloque isso para os próximos vídeos, tudo que aprendemos"). **Vale para todos os canais e formatos feitos no motor:
longos e Shorts.** Os vídeos que já estavam prontos não são refeitos.

De onde veio: `_referencias/LEMO-WAKE.md` (fotos que ganham vida, régua de gosto), `_referencias/FFMPEG-SKILL.md` (volume, cor,
conferência), `_referencias/LEIA-ME.md` (motion-video-kit e lemo-opuscar). O detalhe técnico está no `MOTOR/README.md`.

---

## 1. Antes de animar: a ficha da cena

Para cada cena com imagem, responder (pode ser uma linha cada, no comentário da cena):
1. **Do que é e qual o clima.** O clima dá a velocidade: assunto sério não quica, assunto leve não se arrasta.
2. **Quem é o protagonista:** onde o olho cai primeiro. O clímax é dele.
3. **Como cada coisa se move no mundo real:** navio navega e aderna, papel dobra e voa, tinta escorre, carimbo desce, bloco
   sobe e assenta, luz acende e o que ela alcança reage. **O melhor movimento exagera a natureza da coisa**, nunca é um
   "aparece de baixo" genérico.
4. **O movimento-assinatura numa frase**, que só funciona com ESTA imagem. Teste da troca: com outra foto do mesmo tipo, a
   cena continua funcionando? Então está genérica.

## 2. A régua de gosto

- **As coisas da imagem se mexem de verdade.** Câmera, luz ou cor sozinhas não contam: foto inteira só com zoom é "foto parada".
- **A imagem começa incompleta e fica completa no clímax** (o mar vazio e a esquadra chega; a represa sobe bloco a bloco).
- **Uma linha de causa**, não um monte de efeitos: um evento anda pela imagem e cada peça reage quando ele chega. O apoio
  (partícula, brilho) fica mais fraco que a linha principal.
- **O efeito fala a língua do material:** gravura → tinta e traço; papel → dobra, pop-up, tinta que encharca; foto → luz real
  da cena. Anel geométrico que cresce sobre foto parece transição barata; em papel, impacto é riscos curtos, não anel.
- **Coisa rígida continua rígida:** prédio, rosto, navio e letra andam, giram e sobem inteiros; nunca entortam.
- **Todo quadro pausado é uma imagem composta**, até no meio da transição. O que é para ler fica tempo de ler
  (letras ÷ 15 + 1,5 s).
- Já valiam e continuam: antecipação → ação → impacto → rebote → assenta; escalonar 30 a 120 ms; sobrepor ações; variar a
  velocidade (chega devagar, sai rápido); nada parado mais de ~0,6 s.

## 3. Fotos e gravuras: desmontar em peças

Nas cenas em que a foto é protagonista (não precisa em toda foto de passagem):
1. `python _motor/pecas.py <projeto> <foto> --peca NOME:x0,y0,x1,y1 ...` (caixas em pixels da foto original; `--junto` para
   reflexo, sombra ou bandeira que o recorte não pegou; `--limpar` para marca-d'água e carimbo de arquivo).
2. **Olhar a folha `midia/pecas/pc-<foto>-folha.jpg` antes de animar:** peça com auréola ou faltando pedaço, fundo com
   fantasma. Corrigir as caixas e rodar de novo (~1 a 2 min).
3. Na cena:
   - estilo gravura: `gsGravuraPecas(...)`, ou `vivo:` no `bk()` do bskit;
   - fotos comuns (arquivo, editorial): `fotoViva('F07', info, {...})` no começo da cena e depois a função de foto de sempre
     com o nome `'viva-F07'`;
   - movimentos prontos: `pecaEntra` (desliza e assenta, balançando) e `pecaSobe` (sobe e quica).
   - Exemplo aprovado: `00-comparar-novo/cenas/01-cena.js`.
4. **Paralaxe pequena** (`par` de ±8 a ±16 px). Movimento grande com profundidade rasga as bordas (fantasma nas velas, medido
   em 04/10). Para andar muito, a peça tem que estar recortada.
5. **Colagem (Stoff) e pontilhado (editorial do Jacaré) também (04/10/2026):** `fotoViva` + `cgRecorte('viva-S05', ...)` ou
   `edMidiaPontilhada('viva-F07', ...)`. Exemplos: `00-comparar-colagem-novo` e `00-comparar-pontilhado-novo` (lado a lado em
   `00-comparar-estilos/`, **aprovado pelo Guilherme em 04/10/2026: "gostei, ficou muito bom, é isso"**).
6. **Qual fundo usar no `pecas.py`:** foto e gravura com céu/mar → `--fundo lama` (padrão); **desenho de linha sobre papel
   (xilogravura, ilustração de livro) → `--fundo papel`** (o LaMa inventa traço: refez um barril fantasma no Agricola). Bloco
   que sobe do chão: `recorte: true` na peça (ela só aparece dentro da própria caixa).

## 4. Depois do render: medir e olhar

- `python _motor/medir.py <projeto>`: tempo parado, **saltos** (um instante que muda muito mais que a vizinhança: quadro
  preto, clarão, mídia que não carregou; olhar se é de propósito), **primeiro quadro** (quase vazio = prévia ruim em
  Short/Reels) e volume.
- **O `medir.py` não vê se as coisas se mexem:** a câmera viva zera o "tempo parado" até numa foto inteira. Isso se julga na
  folha de revisão (`render.py --folha`) e assistindo.
- O render já sai com cor BT.709 e volume em ganho fixo (−15 LUFS, pico ≤ −2 dBTP). O `pronto.py` roda o `conferir.py`
  e não copia para `VIDEOS-PRONTOS` se houver FALHA.

## 5. Shorts de papel: "em dois" e tremido REPROVADOS (04/10/2026)

O Guilherme viu o teste (`MOTOR/00-comparar-papel/`: Camelo animado "em dois" + tremido de stop-motion) e reprovou: **"não gostei
do resultado, não precisa usar"**. Não ligar `OPCOES.emDois` nem o tremido no papel, e não propor de novo.
Continuam valendo para o papel as §1, §2, §4 e §6. As outras ideias do guia de papercraft (peças que levantam como pop-up, cor que
encharca o papel branco) nunca foram testadas: só com pedido do Guilherme.

## 6. Histórico com o veredito

Toda cena-assinatura aprovada ou reprovada vai para `GERAL/HISTORICO-MOVIMENTOS.md`, com o veredito do Guilherme e o
porquê. Antes de planejar, ler as últimas linhas para não repetir o mesmo truque em vídeos seguidos.
