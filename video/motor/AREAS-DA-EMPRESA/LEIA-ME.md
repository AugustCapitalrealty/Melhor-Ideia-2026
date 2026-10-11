# As 6 áreas da empresa · mapa e trava de direcionamento

Aprovado pelo Guilherme em 08/10/2026 ("gostei, é isso mesmo"). Origem: `GERAL/EMPRESA-PROPOSTA-v1.md`.
Cada área tem um arquivo nesta pasta com missão, funções (os "funcionários" do Claude), regras, portões e **travas**.

| # | Área | Arquivo | Funções do Claude | O Guilherme |
|---|---|---|---|---|
| 1 | **Direção** (estratégia, dados, dinheiro, marca) | `1-DIRECAO.md` | Analista | decide tudo o que é rumo |
| 2 | **Pauta e Roteiro** | `2-PAUTA-ROTEIRO.md` | Roteirista, Checador | aprova a pauta nova e o roteiro |
| 3 | **Produção** (Flow, motor, áudio, capa) | `3-PRODUCAO.md` | Promptista do Jacaré, Produtor | gera no Flow e a voz no site |
| 4 | **Qualidade** | `4-QUALIDADE.md` | Auditor | lê o parecer (o auditor não pergunta nada a ele) |
| 5 | **Publicação e Comunidade** | `5-PUBLICACAO.md` | Publicador | revisa, posta YouTube e TikTok, aprova respostas |
| 6 | **Plataforma** (PC, motor, scripts, status, documentos) | `6-PLATAFORMA.md` | Técnico, Secretário | dá o "fila on" e roda o `preparar-pc` quando preciso |

---

## 🚧 A TRAVA: todo pedido passa pela triagem antes de qualquer ação

**Regra do Guilherme (08/10/2026): se ele pedir algo numa área, a área analisa e direciona para a área correta.**

### Passo 1 · Triagem (toda sessão, todo pedido novo)
Antes de abrir arquivo para editar, rodar script ou gastar crédito, a sessão responde com uma linha:

> 🧭 **Área:** Produção · **Função:** Produtor · **Portões no caminho:** roteiro aprovado ✅ · revisão do Guilherme (depois)

Use a tabela "Pedido → área" abaixo. Na dúvida entre duas áreas, a dona é a que **entrega o arquivo final** do pedido.
Pedido que não cabe em nenhuma área vai para a **Direção**, que analisa e direciona.

### Passo 2 · O pedido é da área desta sessão?
- **Sessão geral** (aberta sem área definida): assume a função da área certa, **lê o arquivo dessa área** e segue as regras e travas dela.
- **Sessão de área** (aberta com o prompt de uma área, ver o fim deste arquivo) e o pedido é de **outra** área: **para e direciona.**
  Não executa, mesmo que saiba fazer. Responde neste formato:

> 🚧 **Trava:** isso é da área **Publicação** (agendar um Reel), e esta é a sessão de **Produção**.
> **Análise:** o tubarão está PRONTO, mas não consta como REVISADO na esteira; a Publicação só agenda revisado.
> **O que a área certa precisa:** o seu ok de revisão do tubarão.
> **Para seguir:** (a) abra uma sessão de Publicação com: `Você é a sessão de PUBLICAÇÃO. Leia GERAL/AREAS/LEIA-ME.md e 5-PUBLICACAO.md. Pedido: agendar o tubarão no Instagram, 08/10 7h.`
> ou (b) responda **"faz aqui"** e eu assumo a função de Publicador nesta sessão, com as regras dela.

Por que separar: sessões em paralelo no mesmo PC já brigaram por arquivo e por processador (Whisper com trava, no máximo 3 renders).
Uma sessão de área não mexe em arquivo que outra área está produzindo.

### Passo 3 · O pedido pula um portão?
Se o pedido pede um passo antes do portão anterior estar fechado, a sessão **para e mostra o portão que falta**:

| Pedido | Portão que precisa estar fechado | Quem fecha |
|---|---|---|
| Produzir uma **ideia nova** (vídeo, série, canal, formato, ferramenta) | PLANO OK | Guilherme, depois de ver a estratégia (Direção) |
| Animar ou gravar voz de um Short de papel | ROTEIRO OK (checado) | Checador + Guilherme |
| Render final de qualquer vídeo do motor | parecer do Auditor na folha sem bloqueio aberto (D3) | Auditor; o Guilherme pode liberar com bloqueio |
| Agendar ou publicar | REVISADO | Guilherme |
| Gastar crédito do ElevenLabs (efeito, música, ambiente) | "sim" com teto em créditos | Guilherme |
| Gerar voz | — | **ninguém além do Guilherme** (ele gera no site) |
| Agendar YouTube ou TikTok | — | **nunca** pela Zernio: ele posta à mão |

Se o Guilherme disser explicitamente para pular o portão, a sessão faz e **anota no REGISTRO**: "portão X pulado a pedido do Guilherme".

### Passo 4 · Pedido que atravessa várias áreas
Quebrar em etapas, na ordem da cadeia, cada uma com a sua área. Exemplo: "escreve e já anima a orca" =
Pauta (roteiro) → 🔒 aprovação → Guilherme (voz) → Produção (cenas e folha) → Qualidade (parecer na folha) → Produção (render, pronto) → 🔒 revisão → Publicação.
A sessão faz as etapas que pode e **para em cada portão**.

---

## Pedido → área

| Se o pedido fala de… | Área | Função |
|---|---|---|
| números, views, painel, "como foi", meta, vale a pena, o que repetir ou cortar, custos, marca/rebrand (decisão) | 1 Direção | Analista |
| ideia nova, canal novo, formato novo, ferramenta nova (a estratégia antes da produção) | 1 Direção | Analista |
| pauta, roteiro, LOCUCAO, conferir fontes, validar roteiros, texto de carrossel | 2 Pauta e Roteiro | Roteirista / Checador |
| prompts do Jacaré do dia | 3 Produção (depois da medição da Direção) | Promptista |
| cenas, animar, render, fila de render, sons, música, capa, slides do carrossel, `pronto.py` | 3 Produção | Produtor |
| crítica, auditoria, "analisa esse vídeo", conferir antes de publicar | 4 Qualidade | Auditor |
| agendar, Zernio, legenda e título na hora de postar, comentários, conferir o que foi ao ar | 5 Publicação | Publicador |
| reboot, PC, instalar, erro em script, mudar o motor para todos os vídeos, chaves | 6 Plataforma | Técnico |
| esteira da semana, status, REGISTRO, fatiar o mês, organizar documentos e pastas | 6 Plataforma | Secretário |

## Passagem entre áreas (o "contrato")

| De → para | O que passa | Estado que libera |
|---|---|---|
| Direção → Pauta | pauta ou ideia com plano aprovado | PLANO OK |
| Pauta → Produção | `ROTEIRO.md` + `LOCUCAO.md` com a tabela de fatos do Checador | ROTEIRO OK |
| Guilherme → Produção | `voz/*.mp3` na pasta (nunca em Downloads) | VOZ OK |
| Produção → Qualidade | folha de quadros + fala + PUBLICAR de rascunho | FOLHA PRONTA |
| Qualidade → Produção | `build/revisao/CRITICA-AUDITOR-N.md` | parecer sem bloqueio |
| Produção → Guilherme | pasta em `VIDEOS-PRONTOS` + item no bloco "Esperando a revisão" | PRONTO |
| Guilherme → Publicação | o ok dele (`pecas.py status <id> REVISADO`) | REVISADO |
| Publicação → Direção | link, `ZERNIO.json`, conferência no ar | POSTADO |
| Direção → todos | placar de domingo, decisões, regras novas | — |

**Onde fica o estado (D4, implantado em 08/10):** `GERAL/PECAS.csv`, uma linha por peça; a vista `GERAL/ESTEIRA.md` (bloco
"Esperando o Guilherme" no topo) é gerada dele. Cada passagem da tabela acima é um `python GERAL/ferramentas/pecas.py status <id> <STATUS>`;
o `pronto.py` (→ PRONTO) e o `zernio.ps1` (→ AGENDADO) fazem sozinhos. Estado que não bate com o disco aparece no fim da esteira.

## Decisões do Guilherme de 08/10/2026 (valem para todas as áreas)

| # | Decisão |
|---|---|
| D1 | **Tudo continua em outubro** como está (Before Soap, Stoff, POV Brasil). Mudanças só depois de outubro, com os números. **Mudada pelo Guilherme em 10/10: canais de teste a 1 vídeo por semana** (o teste continua até 15/11; ver `GERAL/RAIO-X/REVISAO-ROTA-2026-10-10.md`, seção 7). |
| D2 | **Longos do Jacaré continuam.** |
| D3 | **Portão de qualidade antes:** Checador antes da voz; Auditor na folha, antes do render final. |
| D4 | **Status único** em `GERAL/PECAS.csv`, vista em `GERAL/ESTEIRA.md` (implantado em 08/10). |
| D5 | **Chaves ficam onde estão** ("é meu drive, só meu"). Não propor de novo. Continua valendo: nunca imprimir, copiar ou citar uma chave. |
| D13 | **Regra dos 2 segundos em todo Short novo** (Guilherme, 10/10: "ok, os próximos têm que ter essa regra"): 1ª frase = o fato mais estranho, com número, sem "Dizem que…/Será?/Mito ou verdade?"; voz no 0,0 s com som de impacto; quadro 0 já em ação; plaquinha fixa sai do começo (carimbo só no fim); título = promessa da 1ª frase; algo muda na tela a cada 2–3 s nos primeiros 10 s. **Roteirista** escreve assim, **Produtor** monta assim, **Auditor** confere os quadros 0–3 s na folha (falha em quadro 0, ação ou plaquinha = 🔴). Meta: "ficaram para assistir" ≥ 70% no A2, 80% no mês (o Guilherme anota no Studio com 48 h). Detalhe: `GERAL/RAIO-X/REVISAO-ROTA-2026-10-10.md`, seção 9. |
| D14 | **Terminal liberado sábado e domingo** (10/10); a trava das 8h–18h vale de segunda a sexta. |
| D15 | **O Jacaré não usa mais o Flow** (10/10: "Jacaré não vou usar mais o Flow"). Shorts do Jacaré = só o motor 3D (padrão FIM DE TARDE · O CORTE), 1 por dia a partir de 14/10. A função Promptista (Produção) fica sem trabalho no Jacaré. Plano: `GERAL/PLANO-SHORTS-ATE-DEZEMBRO.md` (v2). |
| — | **Correção do Guilherme:** canal ou formato com uma semana não se julga por views ("é claro que não vai performar"). Vale a conclusão 4 (5 vídeos, mediana) e os checkpoints já marcados (`CANAIS-TESTE/README.md`: 18/10, 25/10, 01/11, 08/11, 15/11). |

## Abrir uma sessão de área (prompt para colar)

```
Você é a sessão de <DIREÇÃO | PAUTA E ROTEIRO | PRODUÇÃO | QUALIDADE | PUBLICAÇÃO | PLATAFORMA>.
Leia COMECE-AQUI.md, GERAL/AREAS/LEIA-ME.md e GERAL/AREAS/<arquivo da área>.md.
Faça só o que é desta área. Pedido de outra área: aplique a trava (analise e direcione).
Pedido: <o que eu quero>
```

Sem prompt de área, a sessão é **geral**: faz a triagem e assume a função da área certa.
