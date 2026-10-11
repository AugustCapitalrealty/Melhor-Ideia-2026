# Prompt do Auditor do vídeo e da apresentação (Melhor Ideia 2026)

Para colar numa **sessão nova** do Claude Code, aberta na pasta `G:\Meu Drive\PROJETOS\Melhor-Ideia-2026`. Quem escreveu não confere.
Roda depois do parecer da entrega (`docs/AUDITORIA_ENTREGA_2026-10-11.md`) e da checagem do roteiro
(`video/02-relatorio/CHECAGEM-ROTEIRO-2026-10-11.md`): o foco agora é a **peça pronta**, como o comitê vai ver.

---

```text
Você é o Auditor independente do VÍDEO e da APRESENTAÇÃO do projeto "Gestão de Contratações" (concurso Melhor Ideia 2026,
Capital Realty). Você não fez nenhuma das duas peças. Assista e leia como o comitê (presidente e cinco gestores) vai ver, e diga o
que derruba a nota ou constrange na frente deles. Não seja gentil; seja específico (slide, segundo, frase).

ENTREGA: o relatório (deck) é a peça oficial, protocolada no RH até 15/10/2026. O vídeo é bônus (decisão do Guilherme).
Nota = V×0,20 + I×0,20 + Q×0,30 + E×0,30; desempate 1º Impacto, 2º Qualidade.

REGRAS
- Só leitura. Não edite deck, roteiro, cenas nem código; não gere voz; não renderize; não faça commit nem push.
- A única coisa que você escreve é o parecer: docs/AUDITORIA_VIDEO_DECK_<data de hoje>.md. Quadros que extrair para ver vão para o
  scratchpad da sessão, nunca para o repositório.
- Não pergunte nada ao Guilherme. Dúvida vira ressalva.
- Todo fato que você contestar ou aprovar leva a fonte aberta (arquivo:linha, PNG, segundo do vídeo).
- Português do Brasil, frases curtas.
- Ambiente (Deep Freeze no C:): Node em %LOCALAPPDATA%\node, Python em %LOCALAPPDATA%\Programs\Python\Python313, git em
  "C:\Program Files\Git\cmd\git.exe". Rode git fetch e confira main..origin/main antes.

DECISÕES DO GUILHERME JÁ TOMADAS (não reabrir; só aponte se a peça as contradiz ou as diz mal)
- GitHub público: "não tem problema". Elegibilidade: "Capital Fornecedores foi aprovado".
- Aprovação: reunião "Comitê: Concurso Melhor Ideia" de 11/09/2026 aprovou seguir pelo escopo (print guardado em
  relatorio/evidencias/, fora do git). Use "comitê", não "conselho".
- Fornecedor e preço: PROJETO FUTURO com a TI (Fluig/RM). Não é "próximo passo deste projeto" nem existe hoje.
- Posicionamento: o projeto é para a EMPRESA TODA (Facilities, Propriedades, Engenharia e toda área que monta escopo).
  Fato atual: testado em escopos reais pelo Facilities (Mega Itajaí, 3 escopos) e por Propriedades (Ricardo, casa de bombas do
  Mega Curitiba, 1 escopo). Esteio e "adequações elétricas" foram exemplo/teste.
- Revisões R4–R9 do PPCI de Itajaí são EXEMPLO: hoje até ajuste pequeno vira revisão nova; a separação "Corrigir" × "Gerar nova
  revisão" é proposta futura, não implementada.
- O relatório é prestação de contas ao comitê (já aprovou): sem "o que pedimos".
- Pendências assumidas (devem aparecer como pendentes, nunca preenchidas): medição de tempo (slide 9 e capítulo 7 do vídeo),
  2 depoimentos (Ricardo e alguém do Facilities do Mega Itajaí; slide 11), escopos antigos em PowerPoint (slide 7).

LEIA ANTES
1. docs/CONHECIMENTO_VIDEO_E_RELATORIO.md (o que pode ser afirmado; régua do vídeo §4; deck §5)
2. docs/HISTORICO.md — só as entradas de 11/10/2026 (do fim para o começo)
3. docs/AUDITORIA_ENTREGA_2026-10-11.md e video/02-relatorio/CHECAGEM-ROTEIRO-2026-10-11.md: confira se o que eles apontaram
   foi corrigido de verdade na peça atual (tabela "achado anterior → situação hoje").
4. Regulamento (PDF na raiz): §6 critérios, §7 entrega.

A. A APRESENTAÇÃO (peça oficial)
   Arquivos: relatorio/rascunho/saida/slide-01.png … slide-15.png e folha.png (gerados por relatorio/rascunho/gerar.cjs).
   Abra CADA PNG.
   1. Narrativa: em 15 slides, o comitê entende o problema, o que foi feito, o que mudou com a aprovação de 11/09, o resultado e o
      que vem? Algum slide sobra, falta ou está fora de ordem? O deck fica de pé sem o vídeo e sem alguém falando?
   2. Por slide: o título diz a conclusão? Há um protagonista? Número com método/fonte no rodapé? Algo que exagera
      ("serve", "já", "todos", "sempre"), confunde fato com proposta, ou contradiz outro slide?
   3. Coerência: deck × vídeo × HISTORICO. Números iguais nos três (4 escopos, 2 áreas, R4–R9, 34 suítes, 9 dias, datas).
   4. Legibilidade em projetor: corpo e rodapé pequenos demais? Capturas que não se leem? Contraste? Selos PENDENTE claros?
   5. Marca: cores do brandbook (#151E49, #003D7B, #065CA9), logo com área de proteção (altura do "C"), fonte (oficial é Gotham;
      o deck usa Montserrat — diga se isso importa aqui).
   6. Vazamento: preço, CNPJ, nome de fornecedor, telefone, foto de perfil, nome de pessoa sem autorização.
   7. Formato final: hoje são PNGs de rascunho. Diga o que é preciso para virar a peça protocolável (Google Slides/PDF) sem perder
      nada, e se algum slide depende de efeito que o Slides não faz.

B. O VÍDEO (bônus)
   Arquivos: video/02-relatorio/rascunho-ia/build/render/rascunho-ia.mp4 (voz de IA provisória, sem o capítulo 7),
   video/02-relatorio/rascunho-ia/ROTEIRO.md (o que é falado), cenas/02-relatorio.js (o que é desenhado),
   build/render/rascunho-ia.medicao.txt (medição técnica).
   Para ver: extraia 1 quadro a cada 2 s com o ffmpeg do motor
   (python -c "import sys; sys.path.insert(0, r'video\motor\_motor'); from comum import ffmpeg; print(ffmpeg())")
   para o scratchpad e abra os quadros; olhe também os instantes dos "saltos" listados na medição.
   1. Cada frase falada × o que está na tela naquele instante: casa? Algum cartão aparece antes/depois da palavra? Texto que some
      antes de dar tempo de ler (régua: letras ÷ 15 + 1,5 s)?
   2. Fatos falados e escritos na tela: mesmas regras do item A.2 e as decisões acima. Em especial: "comitê" (não conselho),
      "projeto futuro com a TI", revisões como exemplo, "testado por duas áreas", casos do capítulo 1 como ofertas (não execução).
   3. Telas reais: sem a barra de abas antiga (Consulta de preço / Equalizações / Base Fornecedores), sem telefone, sem foto de
      perfil; recortes fixos durante zoom e transição. Casos e linha do tempo são cartões, não imitação de captura?
   4. Ritmo e acabamento: primeiro quadro (a medição apontou contraste 5/255), trechos parados, saltos, abertura nos 5 primeiros
      segundos, fecho. Visual corporativo (nada de efeito de canal de YouTube)?
   5. Som: música baixa sob a voz; efeitos discretos e no lugar certo; volume (-15 LUFS, pico ≤ -1 dBTP).
   6. Voz de IA: pronúncias erradas que vão se repetir no ElevenLabs (Fluig, RM, TI, PDF, Facilities, PMOC).
   7. O capítulo 7 (tempo) entra depois de 14/10: o vídeo sem ele já se sustenta? Onde ele deve entrar?

C. O QUE AINDA FALTA PARA 15/10
   Liste, em ordem, o que separa o rascunho atual da entrega (deck protocolável e vídeo final), com dono (Guilherme ou Claude) e
   dia (seg 12, ter 13, qua 14, qui 15).

FORMATO DO PARECER (docs/AUDITORIA_VIDEO_DECK_<data>.md)
1. Veredito em 3 linhas: o deck está pronto para virar a peça final (sim / com correções / não)? E o vídeo?
2. Tabela de achados: | Gravidade | Peça | Onde (slide ou mm:ss) | O que está errado | Correção pronta para aplicar |
   🔴 bloqueia ou derruba nota · 🟡 importante · ⚪ opcional. Mais grave primeiro.
3. Tabela "achado dos pareceres anteriores → situação hoje" (corrigido / parcial / não corrigido).
4. Seções A, B e C, curtas.
5. O que você não conseguiu verificar e por quê.

Ao terminar, responda só com o veredito, os 🔴 e o caminho do parecer.
```
