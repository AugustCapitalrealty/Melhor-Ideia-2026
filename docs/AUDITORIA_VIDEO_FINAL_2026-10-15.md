# Parecer independente · vídeo final "Gestão de Contratações" (bônus do relatório)

Avaliador do comitê · 15/10/2026 · arquivo avaliado: `02-Video/Gestao-de-Contratacoes_video.mp4`
(idêntico ao `build/render/rascunho-ia.mp4`, mesmo MD5). Duração real: **2:42** (1920×1080, 30 fps, −15 LUFS).

## Veredito (3 linhas)

1. A peça é honesta e bem amarrada: tem fonte em quase toda fala, diz "não medido" e usa telas reais com a marca Capital Realty.
2. Tira nota em quatro pontos: contradição na abertura (0:05 × 0:15), capas que não provam os "3 formatos", problema sem resposta (inclusões/exclusões) e nenhuma palavra sobre viabilidade (20% da nota).
3. No ritmo, cinco cenas abrem com 3 a 4 s de tela vazia e a cena 4.2 é fraca. Tudo isso se corrige em cerca de 1 hora, sem reabrir nenhuma decisão.

## Nota

**7,3 / 10** como peça de apoio ao relatório.
Com as correções 1 a 8, estimo **8,2 a 8,5**. Passar disso só com Impacto medido, o que não cabe hoje.

| Critério (§6) | Como o vídeo ajuda hoje |
| :--- | :--- |
| Viabilidade (20%) | **Fraco.** Não diz que está em produção desde setembro nem que roda no Workspace sem licença nova. A apresentação diz (slides 3 e 14). |
| Inovação (20%) | Médio. O caminho guiado e os 3 documentos saindo do mesmo cadastro aparecem bem (3.1–3.4). |
| Impacto (30%) | Médio. 4 escopos reais e a fala do Mega Itajaí, ditos com a ressalva certa. |
| Qualidade da implementação (30%) | Bom. Telas reais, padrão 4 de 4, revisões. |

## O que está bom (não mexer)

- Sequência clara: contexto → problema → aprovação → solução → um só lugar → testes reais → fecho.
- Rótulos de capítulo ("01 · O CONTEXTO" etc.) e o selo "TELA REAL" ajudam quem não conhece o projeto.
- Ressalvas na tela: "amostra escolhida pela área", "4 reais; os outros 4 da base foram teste ou exemplo", "percepção, não medição".
- As palavras-chave casam com a fala. Todos os `S.w()` das cenas acham a palavra no áudio. Não há pausa maior que 0,5 s dentro das falas.
- Marca e paleta consistentes: logo na abertura e no fecho, azul-marinho, sem efeitos sonoros.
- Texto legível em 1080p. Nada cortado. O rodapé mais baixo fica em y≈1066.

## Correções priorizadas

Legenda: 🔴 tira nota ou passa má impressão · 🟡 melhora clara · ⚪ acabamento.
Tempos do MP4 atual. Falas novas vão no `ROTEIRO.md` (linhas `>`); o áudio do ElevenLabs só é refeito nas cenas cujo texto mudou (hash).

| # | Grav. | Tempo · cena | Problema (evidência) | Correção exata |
| :-: | :-: | :--- | :--- | :--- |
| 1 | 🔴 | 0:05–0:15 · 1.1 | **Contradição.** A fala e a tela dizem *"toda contratação de manutenção ou de obra **começa** por um escopo"*. Dez segundos depois (1.2): *"muitos serviços eram contratados sem escopo"*. O relato do gerente ainda cita a exceção abaixo de R$ 1 mil (Itajaí). A tabela de fontes do roteiro não tem fonte para 1.1. | **Fala 1.1:** "Nos Megas da Capital Realty, toda contratação de manutenção ou de obra **deve começar** por um escopo: o documento que o fornecedor recebe para cotar." **Tela** (`CENAS['1.1']`): `'Toda contratação deve começar por um escopo'`. Na tabela de fontes: "procedimento interno de contratação (decisão do Guilherme, HISTORICO 15/10)". |
| 2 | 🔴 | 0:15–0:31 · 1.2 | **Português e referente.** *"…embora o procedimento já pedisse. Em 2025, **ele** começou a aparecer. Em 2026, passou a ser **cumprido**."* O "ele" mais próximo é "o procedimento". E escopo não se "cumpre": o que se cumpre é a exigência. O cartão "2026 · Passa a ser cumprido" fica sem sujeito. | **Fala 1.2:** "Até 2024, muitos serviços eram contratados sem escopo, embora o procedimento já exigisse escopo. Em 2025, o escopo começou a aparecer. Em 2026, a exigência passou a ser cumprida. Mas cada Mega montava do seu jeito." **Cartão 2026:** `['A exigência passa', 'a ser cumprida']`. **Código:** `S.w('cumprido')` → `S.w('cumprid')`. Se não trocar, o cartão perde a sincronia (a palavra não é achada e o motor usa 0,5 s). Rodapé: acrescentar "; procedimento interno de contratação". Mantém a decisão: já era exigido e passou a ser cumprido em 2026. |
| 3 | 🔴 | 0:32–0:46 · 1.3 | **A imagem desmente a fala.** A fala diz *"três formatos diferentes"*. A tela mostra três capas de slide azuis, parecidas e com a marca. Duas são 16:9 (720×405 e 960×540) e não se distinguem a olho. O formato A4 (RFQ de Curitiba) não aparece. Quem assiste vê "padrão", não "sem padrão". Há ainda 5,2 s de tela parada (0:37.8–0:43.0) e a metade de baixo vazia. | Copiar `relatorio/rascunho/midia/antigos/curitiba-rfq002-p1.png` para `midia/real/A05-curitiba-rfq-a4.png`. No `CENAS['1.3']`, trocar o laço das capas por:<br>`[['A01','ITAJAÍ','SLIDE 720×405'],['A02','ESTEIO','SLIDE 960×540'],['A05','CURITIBA','A4 · WORD']].forEach(([a,m,f],i)=>comCartao(prog(lt,0.1+i*0.3,0.6+i*0.3),()=>{const x=150+i*400,y=250,w=a==='A05'?200:360;const h=inteira(a,x,y,w);if(a==='A05')rr(x+16,y+h*0.86,w-32,h*0.1,2,'#FFFFFF');txt('DOCUMENTO REAL · '+m,x,y+h+34,17,800,CR.claro,{ls:2});const q=prog(lt,tF-0.3,tF+0.3);if(q>0){ctx.save();ctx.globalAlpha*=q;pilula(f,x,y+h+56,CR.larF,CR.lar,18);ctx.restore();}}));`<br>O retângulo branco cobre a tabela com os nomes (FO e Sourcing) da capa do RFQ. Fala sem mudança. |
| 4 | 🔴 | 2:11–2:20 · 5.1 | **Viabilidade ausente.** O vídeo não diz que o sistema está em produção nem quanto custa. Vale 20% da nota. A apresentação tem: *"Em produção desde setembro"* (slide 3), *"Sem licença nem servidor novo"* (slide 14), *"em produção desde 15/09"* (slide 15). A cena abre ainda com 3,3 s de tela vazia. Não é melhoria futura: é a situação de hoje. | **Fala 5.1:** "Em produção desde setembro, sem licença nova, o sistema já foi testado em escopos reais: três do Facilities, no Mega Itajaí, e um de Propriedades, no Mega Curitiba." **Tela:** no topo de `fn` do 5.1, `comCartao(prog(lt, S.w('producao')-0.4, S.w('producao')+0.2), () => pilula('EM PRODUÇÃO DESDE 15/09/2026 · GOOGLE WORKSPACE · SEM LICENÇA NOVA', 150, 190, '#E8F1FB', CR.dest, 22));`. Na tabela de fontes: "HISTORICO 11/10 (R4 do PPCI em 15/09); apresentação, slide 14". |
| 5 | 🟡 | 1:40–1:50 · 3.5 | **Problema sem resposta.** Em 1.3 o vídeo bate em *"Nenhum tinha seção de inclusões e exclusões. Só um dizia se a visita técnica era obrigatória"*. A solução nunca volta a isso. Quem avalia fica com a pergunta "e o sistema?". O cadastro tem esses campos (apresentação, slide 3), mas o uso real é 3, 1 e 1 de 4 (contagens). Por isso não cabe "4 de 4". | **Fala 3.5:** acrescentar no fim: "E inclusões, exclusões e visita técnica têm seção própria no cadastro." **Tela:** `comCartao(prog(lt, S.w('inclusoes')-0.4, S.w('inclusoes')+0.2), () => pilula('Inclusões · exclusões · visita técnica: seção própria no cadastro', 150, 880, CR.larF, CR.lar, 26));`. Sem selo "4 de 4". Subir `depois` para 1.4. |
| 6 | 🟡 | 0:47–1:05 · 2.1 | **"1 preço" sem fonte na tela e difícil de entender.** O rodapé diz *"Facilities (ar-condicionado) e Propriedades (lavagem de piso)"*. Mas o caso da mão de obra fechada vem das equalizações do Mega Curitiba (BASE §16.3: infraestrutura, cabos e painel sem preço próprio). Quem não conhece o caso não vê por que "1 preço" é ruim. E o "3,3×" é sobre os valores finais (2,6× nas propostas iniciais, segundo a apresentação). | **Fala 2.1:** "…A mão de obra num preço só, sem valor por item. E, na lavagem…" (o resto igual; `S.w('preco')` continua válido). **Cartão 2:** `['para a mão de obra', 'sem valor por item']`. **Rodapé:** "Ofertas reais: ar-condicionado (Facilities), instalação com mão de obra fechada (Mega Curitiba) e lavagem de piso (Propriedades, Mega Esteio; 3,3× nos valores finais). Sem nomes nem valores." |
| 7 | 🟡 | 0:47 · 1:41 · 2:01 · 2:11 · 2:20 | **Telas vazias no começo das cenas.** O primeiro elemento só entra na palavra-chave. Ficam 3 a 4 s só com o título, somados à cauda parada da cena anterior: 2.1 (3,1 s), 3.5 (3,4 s), 4.2 (3,3 s), 5.1 (3,3 s), 5.2 (2,9 s). A medição acusa 63% do vídeo "parado". A cena 4.2 é a mais fraca: cinco pílulas num fundo vazio durante 9 s. | Antecipar o 1º elemento: 2.1, item 1 `S.w('Duas')` → `S.w('propostas')`; 3.5, item 1 `S.w('estrutura')` → `S.w('padrao')`; 5.2, citação 1 `S.w('adaptacao')` → `S.w('testou')`; 5.1 se resolve com a pílula da correção 4. **4.2:** mostrar o cartão real com o botão no topo, desde o início: `comCartao(prog(lt, 0.1, 0.7), () => recorte('C01', 270, 505, 1384, 185, 150, 200, 1620));`. Descer `'VÊM DO ESCOPO BASE'` para y 560 e as pílulas para y 600. |
| 8 | 🟡 | 2:33–2:42 · 6.1 | **Fecho promete demais e não mostra o nome.** *"Um padrão de escopo para a empresa toda"* vem logo depois de "4 escopos reais em 2 Megas". Um avaliador exigente lê isso como exagero. Quando a voz diz *"Gestão de Contratações"*, a tela mostra só o logo da empresa: o nome do projeto não aparece no fecho. | **Fala 6.1:** "Um só padrão de escopo, pronto para todos os Megas. Gestão de Contratações. Começar melhor. Contratar melhor." Frase do Guilherme no slide 15; é a situação de hoje, não um futuro. **Tela:** linhas `'Um só padrão de escopo,'` / `'pronto para todos os Megas.'`; logo em y 470; e `reveal('Gestão de Contratações', 150, 610, 800, 44, CR.branco, E.outCubic(prog(lt, tG-0.2, tG+0.5)));`. |
| 9 | 🟡 | entrega | **Duração errada no LEIA-ME e no HISTORICO.** Os dois dizem "2 min 35 s". O MP4 tem 2:42 e terá cerca de 2:47 depois das correções. Um comitê que confere vê a diferença. | Depois de renderizar: copiar o MP4 novo para `02-Video/Gestao-de-Contratacoes_video.mp4`, corrigir "2 min 35 s" no LEIA-ME e no HISTORICO com a duração nova, e preencher os dois links que faltam no LEIA-ME. |
| 10 | ⚪ | 2:23–2:31 · 5.2 | A 2ª citação junta dois momentos ([00:02] e [00:03]) sem marca de corte, mas o rodapé diz "trechos literais". A 1ª abre pelo negativo ("se bateu") e usa gíria ("bem top"). A transcrição tem uma fala mais forte para Impacto e continuidade, a mesma que a apresentação usa no slide 14. | Citação 2: `'“Fica muito mais padronizado. […] A gente não', 'precisa ficar configurando slide.”'`. Opcional, mais forte: trocar a citação 1 por `'“Vamos continuar usando,', 'que facilita bastante.”'` (literal em [00:01]). |
| 11 | ⚪ | 1:05–1:15 · 2.2 | *"o comitê aprovou começar pelo escopo"*: quem está de fora pergunta "começar o quê?". | **Fala:** "…o comitê aprovou que o projeto começasse pelo escopo." **Cartão:** `'Aprovado: o projeto começa pelo escopo'`. |
| 12 | ⚪ | todo o vídeo | Rodapés com 17 px e 55% de opacidade. São legíveis num monitor, mas não num projetor ou num celular, e são justamente as ressalvas. | Em `rodape()`: `0.55` → `0.72` e `17` → `20`. |
| 13 | ⚪ | 1:33–1:40 · 3.4 | Três miniaturas pequenas na metade de cima e a metade de baixo vazia. A planilha não se lê. | Descer o bloco: rótulos de y 300 para 390 e recortes de y 320 para 410. |
| 14 | ⚪ | 0:05–0:15 · 1.1 | O rótulo "MEGA ESTEIO" fica sobre a foto aérea, cheia de detalhes (caminhões), com pouco contraste. | Em `txt(n, …)` do 1.1, desenhar antes uma faixa `rr(x, 680, 512, 60, [0,0,16,16], 'rgba(14,22,56,0.55)')`. |
| 15 | ⚪ | 1:28–1:33 · 3.3 | "EAP" aparece sem explicação. No zoom final, as descrições ficam cortadas à esquerda ("ISUAL ENDEREÇÁVEL…"). | Título: `'A lista de itens para cotação'`. Limitar o zoom final: `[tM, 520]` → `[tM, 440]` e `[tM, 1120]` → `[tM, 1200]`. |
| 16 | ⚪ | áudio | Não deu para ouvir. A voz em PT pode ler errado "Facilities", "Realty", "Itajaí" e "PDF". O `projeto.json` só tem pronúncia para Fluig, RM e TI. | Ouvir 0:06, 2:15 e 1:36. Se errar, acrescentar em `pronuncia` (ex.: `"Facilities": "Facílitis"`). |

## Ordem para caber em 1 hora

1. Falas 1.1, 1.2, 2.1, 3.5, 5.1 e 6.1 no `ROTEIRO.md`, mais as linhas novas na tabela de fontes (10 min).
2. Código das cenas: correções 2, 3, 4, 5, 6, 7 e 8 (25 min).
3. Gerar o áudio de 6 cenas, renderizar, rodar a medição e olhar as folhas de revisão (15 min).
4. Copiar o MP4 para a entrega e corrigir a duração no LEIA-ME e no HISTORICO (5 min).

Se faltar tempo, façam 1 a 4 primeiro: são as que tiram nota. As ⚪ podem ficar.

## Conferência de fontes (fala × evidência)

| Fala | Confere? | Evidência |
| :--- | :-: | :--- |
| 1.1 "toda contratação… começa por um escopo" | ❌ | Contradiz 1.2 e o relato do gerente (correção 1) |
| 1.2 2024 / 2025 / 2026, "cada Mega do seu jeito" | ✅ | Relato do gerente de 14/10 ("O ponto é questão de padronização e estrutura"); "procedimento já exigia" é decisão do Guilherme |
| 1.3 3 formatos · 0 inclusões e exclusões · 1 visita | ✅ | `contagens-2026-10-15.csv` (9 linhas "sem o sistema") |
| 2.1 2 · 3 · 12 visitas | ✅ | BASE §8.4, mapa PMOC (pasta 05) |
| 2.1 mão de obra num preço só | ⚠️ | BASE §16.3 (Mega Curitiba). O rodapé não cita (correção 6) |
| 2.1 lavagem 3,3× | ✅ | Equalização EQU_20260406, nos valores finais (2,6× nas iniciais) |
| 2.2 comitê 11/09 | ✅ | Convite em 06-Evidencias |
| 3.5 estrutura · prazos · revisão em cada página, 4 de 4 | ✅ | CSV (4 linhas "sistema") |
| 4.1 um só lugar; antes se perdia | ✅ | Tela C01 (8 na base); relato do Guilherme |
| 5.1 3 + 1 escopos reais | ✅ | METODO item 4; pasta 04 |
| 5.2 "mais fácil e mais padronizado"; tempo não medido | ✅ | `feedback-Mega-Itajai-2026-10-14.txt` [00:02]; "passada a adaptação" segue a frase aprovada no HISTORICO |
| 6.1 "para a empresa toda" | ⚠️ | Hoje são 2 Megas e 2 áreas. O correto é "pronto para todos os Megas" (correção 8) |

Nenhuma fala afirma ganho medido de tempo ou de custo. O "não medido" aparece na fala e na tela.
