# Auditoria independente do vídeo e do deck — 11/10/2026

**Deck: COM CORREÇÕES para virar a peça final; NÃO protocolar os PNGs atuais como entrega concluída.** Faltam provas de resultado e o arquivo final. [S02, S07, S09, S11; Regulamento §7, p.5.]
**Vídeo: COM CORREÇÕES; NÃO liberar esta versão como bônus final.** Há texto sobreposto e informações que desaparecem antes da leitura. [V 00:58, 02:13,1; seção B.]
**Prioridade: fechar o deck e suas evidências; depois fechar o bônus.** Impacto e Qualidade somam 60%; Impacto desempata primeiro. [Regulamento §6, pp.3–4; §12, p.6.]

## Base da auditoria

Somente leitura das peças. Nenhuma edição de roteiro, código, cenas ou deck. Nenhuma geração de voz, render de produção, publicação, commit ou push. A única escrita no projeto é este parecer. As extrações de quadros ficaram no scratchpad da sessão.

`git fetch` executado antes da análise. `main..origin/main` vazio. HEAD e origin/main: `a627230f15d2b5c3e7f204b075928618e7529352`. Árvore inicialmente limpa. [Saídas Git desta sessão.]

**Referências:** S01–S15 são os PNGs `relatorio/rascunho/saida/slide-01.png` a `slide-15.png`, todos abertos individualmente. `folha.png` também foi aberta. V significa `video/02-relatorio/rascunho-ia/build/render/rascunho-ia.mp4`, no segundo indicado. R = `video/02-relatorio/rascunho-ia/ROTEIRO.md`; C = `video/02-relatorio/rascunho-ia/cenas/02-relatorio.js`; G = `relatorio/rascunho/gerar.cjs`; H = `docs/HISTORICO.md`. As linhas referem-se aos arquivos atuais abertos.

O MP4 examinado tem **160,474 s na linha de montagem; 2min40,47s no contêiner**, 1920×1080, 30 fps, H.264, BT.709 e áudio AAC estéreo/48 kHz. SHA-256: `185a6d2f77247cd85713269194508c679f693b57a9da8bcd2a745dcee4b47730`. Foram abertos 81 quadros de 00:00 a 02:40, a cada 2 s, em folhas de contato. Também foram abertos os 21 instantes de salto e quadros de detalhe. [FFmpeg sobre V; `build/rascunho-ia.html:1311–1350`.]

O MP4 foi atualizado depois da medição salva. Esta diz **155,7 s**; descreve outra versão. Repeti as análises em memória, sem sobrescrever a medição. [V; `build/render/rascunho-ia.medicao.txt:2`; seção B.]

Elegibilidade, GitHub público e aprovação para seguir pelo escopo são premissas expressas do Guilherme. Não reabro essas decisões. O convite de 11/09 foi aberto: comprova nome/data da reunião; a aprovação do conteúdo é informação do Guilherme, registrada em H:535–538. Não apresentar o convite como ata. [Pedido desta auditoria; `relatorio/evidencias/2026-09-11-reuniao-comite-convite.png`.]

## Achados — mais graves primeiro

🔴 bloqueia a entrega ou derruba nota · 🟡 importante · ⚪ opcional. Pendência declarada não é fraude. Continua sendo lacuna na peça final.

| Gravidade | Peça | Onde (slide ou mm:ss) | O que está errado | Correção pronta para aplicar |
|---|---|---|---|---|
| 🔴 1 | Deck | S07, S09, S11 | O antes está vazio. O principal resultado de tempo é `__ min`. Os dois depoimentos são instruções de preenchimento. O comitê recebe promessa de prova em vez da prova. Os selos estão corretos para rascunho. [PNGs; G:137–177,190–195.] | Até 14/10, inserir os PowerPoints reais, a tabela crua da comparação e as duas falas autorizadas. Se algo não for obtido, substituir o espaço vazio por **“Não coletado até o fechamento”** e explicitar a limitação. Não atribuir ganho nem satisfação sem dado. Retirar o checklist interno da peça final após resolver ou declarar cada item. |
| 🔴 2 | Deck | Arquivo de protocolo; S15 | Há PNGs e HTML de rascunho, sem apresentação final/PDF demonstrado nem caminho para o anexo de evidências. Não basta renomear a pasta como relatório final. [G:389–416; inventário de `relatorio/`; S15; Regulamento §7, p.5.] | Montar apresentação 16:9 e PDF completo, com fontes/evidências acessíveis ao comitê e dados de tempo anexados. Abrir o PDF exportado inteiro e conferir paginação, recortes e links. Guilherme protocola no RH até 15/10 e guarda recebimento. O vídeo fica como bônus e não segura esse protocolo. |
| 🔴 3 | Deck | S04; título de S05 | **“Cada fornecedor entende [...] porque o escopo deixa margem”** e **“começou pela causa”** transformam interpretação em causalidade demonstrada. As fontes mostram ofertas diferentes; não demonstram o pedido original mal feito em todos os casos. A faixa **“pedido mal feito”** acusa mais do que a prova permite. O vídeo já usa conclusão delimitada. [S04/S05; `docs/BASE_DE_CONHECIMENTO.md:394–403,543–552,1338–1349`; R:65,76.] | S04: **“Três casos mostram diferenças que precisam ficar explícitas nas propostas.”** Subtítulo: **“Ofertas reais de Facilities e Engenharia; diferenças de frequência, discriminação de preço e unidade.”** Faixa: **“O escopo precisa explicitar os requisitos antes da comparação.”** S05: **“Em 11/09, o comitê aprovou começar pelo escopo.”** |
| 🔴 4 | Vídeo | 00:53,7–00:59,9; claro em 00:58 | **“O comitê aprova o caminho”** invade **“Escopo em produção”**. A virada central do projeto fica visualmente quebrada. Não é defeito apenas de rodapé. [V 00:54/56/58; C:215–230.] | Quebrar os títulos em duas linhas dentro de cada coluna: **“Comitê aprova / começar pelo escopo”** e **“Escopo / em produção”**. Limitar cada bloco à sua largura. Manter a data de 11/09. |
| 🔴 5 | Vídeo | 00:22,3–00:23,3; 00:28,0–00:29,1; 02:12,9–02:13,5; 02:16,6–02:18,4 | A montagem revela a conclusão no fim e já a dissolve. **“sem preço separado”** tem menos de 1 s; KG fica plenamente visível por cerca de 0,6 s; **“Escopos base”** tem cerca de 0,5 s após a entrada; a explicação de **34** dura menos de 2 s. A régua exige mais. [V e tabela B; C:171–172,184–194,400–416.] | Revelar “sem preço separado” junto da primeira lista de serviços; manter a composição pelo menos 2,6 s. Sustentar VB × KG por 3 s. Mostrar “Escopos base” ao falar **“escopos”** e reservar pelo menos 2,3 s após a entrada completa. Exibir **“34 suítes de teste”** junto do número; sustentar a legenda atual por pelo menos 3,9 s se ela permanecer. |
| 🟡 | Deck/vídeo | S10; V 01:56–02:02 | **“serve à Engenharia e às demais áreas”** afirma adequação validada fora das duas áreas que testaram. O posicionamento corporativo está certo; o verbo exagera o estado atual. [S10; R:116; C:382–387; H:511–518.] | Manter a ambição: **“O projeto é para toda a empresa. Já testado por Facilities e Propriedades; expansão para Engenharia e demais áreas.”** Na tela, trocar **“pode usar”** por **“expansão proposta”**. |
| 🟡 | Deck | S06; S14 | “Mesma EAP” entre saídas pode soar como garantia de sincronismo, embora sejam duas emissões. O teste do comprador registrou planilha R2 com deck R1. O texto atual já retirou “mesma revisão”, mas a limitação continua invisível. [S06; `docs/avaliacao-escopo-2026-10-02/RELATORIO_COMPRADOR.md:121–132`; `app/EscopoInterface.html:209,262–271`.] | S06: **“Um cadastro alimenta apresentação/PDF e planilha, gerados em duas etapas. Neste exemplo, os três estão na R9.”** Nota: **“Após alterar o escopo, conferir a revisão das duas emissões.”** Não vender emissão única nem sincronização automática. |
| 🟡 | Deck/vídeo | S14; V 02:18–02:34 | Fornecedor/preço estão rotulados como **projeto futuro**, mas continuam dentro de “PRÓXIMOS PASSOS” e de “O PRÓXIMO PASSO”. A organização visual mistura outro projeto com a evolução do escopo. [S14; C:425–433; R:128–133.] | Separar **“Evoluções propostas do escopo”** de **“Outro projeto futuro com a TI — fornecedor e preço no Fluig/RM”**. No vídeo, usar **“Alcance e projeto futuro”** como título. Sem prazo prometido para TI. |
| 🟡 | Vídeo | 01:49–01:56 | Os botões desenhados **“Corrigir”** e **“Gerar nova revisão”** ficam por cima de uma janela marcada **TELA REAL**. “Próximo passo” ajuda, mas a proposta ainda parece recurso da interface atual. [V 01:50/54; C:376–380; H:547–555.] | Tirar a proposta da moldura de captura. Usar cartão separado: **“PROPOSTA — NÃO IMPLEMENTADA: separar Corrigir de Gerar nova revisão.”** A captura mostra apenas o histórico que existe. |
| 🟡 | Deck/vídeo | S08, S12; V 02:12–02:18 | As peças não explicam o alcance dos **9 blocos** e das **34 suítes**. Oito campos e nove chips não são uma auditoria de cobertura. “As mudanças passam” generaliza uma execução documentada. [S08/S12; `app/Escopos.gs:180–185`; `package.json:7`; H:428–430.] | S08: **“9 grupos de conteúdo reaproveitados, agrupados neste slide; categoria também é copiada.”** S12: **“34 scripts automatizados no comando de testes; execução registrada antes da v77.”** Não dizer 34 testes individuais nem prova de toda publicação. |
| 🟡 | Deck | S06, S08, S12; rodapés | As capturas de S06 são ilustrações pequenas. Em S08, a busca e a origem não são demonstradas por um detalhe legível. Corpo de 24–26 px e rodapé de 18 px em 1920 px perdem força na projeção; rodapé cinza tem contraste calculado de 3,06:1 sobre branco. [PNGs; G:251–264,290; cálculo desta sessão.] | Ampliar um detalhe por prova; levar capturas integrais ao anexo. Aumentar e escurecer fontes/métodos essenciais. Testar a leitura da última fileira. Em Slides de 720 pt de largura, 18 px desse PNG equivalem a apenas 6,75 pt; exportar em alta resolução não aumenta o tamanho aparente. |
| 🟡 | Deck | S11; S02; S12 | Há **Ricardo** em marcador de depoimento e **Jonatas** atribuído a um pedido. Não localizei autorização de citação. Isso não prova recusa, mas o material de trabalho ainda não comprova a autorização exigida para o depoimento. [PNGs; H:518–521; G:80,194,203.] | No pacote final, usar nome/cargo só com a autorização registrada. Enquanto isso, usar **“Propriedades — depoimento pendente”** e **“Pedido de usuário do Facilities”**. Não anexar o convite bruto: contém contatos, participantes, perfis e acesso à reunião. |
| 🟡 | Deck | S13 | A segunda pessoa para publicar segue **“a definir”**. Documentação não demonstra continuidade operacional. Isso reduz Viabilidade/Sustentabilidade. [S13; Regulamento §6, p.3.] | Nomear responsável de apoio e registrar uma passagem de manutenção. Se não ocorrer até o fechamento: **“Manutenção atual: Guilherme; transferência para segundo operador pendente.”** |
| 🟡 | Vídeo | 00:00; 02:20 | O quadro inicial tem apenas fundo/rodapé. No fecho, **“Toda área que monta escopo”** aparece antes de Facilities: o gatilho pega a primeira ocorrência de “toda”. [V 00:00/02:20; C:107,136–137,426–427; HTML:1344–1348.] | Quadro zero com título e três cartões já compostos; acender números com a fala. Usar a segunda ocorrência: `S.w('toda', 1)` para o chip final. A primeira ocorrência pertence a “empresa toda”. |
| 🟡 | Vídeo | 00:44; 00:58; 02:28–02:30 | O dicionário de pronúncia está corrompido: `Fl?ig` e `t? ?`. Os metadados registram `Fl`/`ig` e `t`. Não certifico como isso soa. É erro concreto de entrada, com risco de ser copiado para a voz final. [ `projeto.json:1`; `build/audio/2_1.json`, `2_3.json`, `8_1.json`; `video/motor/_motor/gerar.py:54,66–69`.] | Corrigir o texto de entrada para **flúig**, **tê í**, **erre eme**; conferir PDF e Facilities na tomada real. Não transportar o JSON corrompido para o ElevenLabs. PMOC não é falado nesta versão. |
| 🟡 | Controle | Medição e histórico | O laudo técnico salvo e H descrevem 155,7 s; V tem 160,47 s. O documento de conhecimento ainda diz **6 reais nos 3 Megas**. Essas fontes podem ressuscitar o erro numa revisão. [Medição:2; H:542; `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:228`; H:505–508.] | Ao produzir a versão final, medir o arquivo exato, associar hash e atualizar a fonte corrente para **4 escopos reais / 2 áreas**. Preservar o registro antigo como superado. Este parecer não altera esses arquivos. |
| ⚪ | Deck | S02, S03, S15 | O comitê demora três slides para chegar ao problema; o fecho só oferece assinatura. [PNGs; `folha.png`.] | Retirar S02 da versão protocolada após fechamento; reduzir S03 se necessário. Acrescentar acesso discreto ao anexo e ao vídeo em S15. Recalcular números e referências após retirar slides. |
| ⚪ | Deck | Tipografia | Montserrat nos títulos e Open Sans no corpo diferem da Gotham oficial. Não é o principal risco da nota. [G:251–258; Brandbook, pp.20–21; H:471–473.] | Preservar a consistência no fechamento. Usar Gotham se disponível e licenciada, com nova conferência de quebras. Não trocar fonte às cegas na véspera. |

## Achados anteriores → situação hoje

Situação é da peça atual, não da intenção registrada no histórico. “Corrigido por decisão” significa premissa encerrada pelo Guilherme, sem falsa certificação independente.

| Achado dos pareceres anteriores | Situação hoje | Evidência aberta / ressalva |
|---|---|---|
| Elegibilidade e GitHub público, auditoria da entrega:30–31 | **Corrigido por decisão; encerrado nesta auditoria** | Pedido atual; H:480–483. Não exige nova confirmação. |
| 19/05 apresentado como aprovação; reunião não identificada | **Corrigido** | S05 distingue complementação de 19/05 e aprovação de 11/09. Convite aberto; H:535–538. Aprovação do conteúdo é premissa do Guilherme. |
| Produção iniciada em outubro; linha do tempo errada | **Corrigido no conteúdo** | S05; R:69–80; `P-arquivos.json:8–9,38–39`. Vídeo tem novo defeito de sobreposição. |
| Conclusão jurídica sobre laudo; selo na proposta errada | **Corrigido** | S04; V 00:12,9; R:50–52. Alerta na proposta de 2 visitas. PDF-PMOC, p.1, observações. |
| “Não abriu o conteúdo” no caso de mão de obra | **Corrigido** | S04; R:54–57; V 00:22,6; base:1341–1349. Os serviços estão descritos; faltam preços separados. |
| VB/KG/M³ para o mesmo serviço | **Corrigido** | S04; V 00:28,5; base:548–549. Tela usa armadura e apenas VB/KG. |
| Causa exclusiva e “pedido mal feito” | **Parcial** | R:65,76 delimitam a conclusão. S04 e título de S05 mantêm causalidade indevida. |
| “Com um clique” gera todos os documentos | **Corrigido** | V 01:20; R:99; C:320–323; interface:59. Há duas etapas explícitas. |
| Garantia universal da mesma revisão | **Parcial** | Retirada da locução. S06 ainda sugere coerência automática pela “mesma EAP”; teste do comprador:121–132 exige cautela. |
| Próximo escopo “começa pronto” | **Corrigido no essencial** | S08 e R:105–109 expõem o que precisa ser preenchido. “9” precisa ser explicado como agrupamento. |
| 6 reais, três Megas; Esteio sem confirmação | **Corrigido nas peças; parcial na documentação** | S10; V 01:40/44; H:505–518. Conhecimento:228 permanece antigo. Quatro títulos/capas de PDFs locais conferidos. |
| R9 equivale a nove emissões; planilha em cada revisão | **Corrigido** | S10 diz R4–R9 como exemplo. V 01:46 mostra seis pares e uma planilha R9. JSON:4–49. |
| Separar Corrigir/Gerar revisão apresentado como já entregue | **Corrigido no texto; parcial no visual** | S14 e R:116 dizem próximo passo. V 01:50 põe botões propostos dentro de janela TELA REAL. |
| Empresa toda como adoção comprovada | **Parcial** | Duas áreas identificadas corretamente. “Serve” em S10/R:116 e “pode usar” em C:387 ainda ampliam a validação. |
| Teste antes de toda mudança; contagem 35 | **Parcial** | Contagem atual: 34 scripts em `package.json:7`. Texto do vídeo melhorou; S12 ainda generaliza. H:428 registra execução antes da v77. |
| “Custo zero”, independência do autor, ausência de base paralela | **Parcial** | S13 reconhece trabalho humano, dados ocultos e segundo operador pendente. Sustentação continua sem substituto demonstrado. |
| Slide 14 pede nova aprovação | **Corrigido** | S14 é prestação de contas; não há “o que pedimos”. A disposição de outro projeto entre próximos passos ainda merece separação. |
| Contatos, perfil e navegação antiga nas capturas | **Corrigido nos enquadramentos examinados** | S06/S08; V 01:00–01:24 e 01:44–01:56; C:278–319,338–340,377–379. Não usar a prévia antiga de 20 s. Limite de amostragem na seção final. |
| Tempo, antes/depois e depoimentos vazios | **Não corrigido; pendência assumida** | S07/S09/S11. Capítulo 7 permanece ausente corretamente. Não preencher ficticiamente. |
| PNG/HTML não são pacote final; legibilidade | **Não corrigido** | Inventário de `relatorio/`; G:389–416; S06/S08/S12. |
| Voz definitiva e verificação audiovisual | **Parcial** | Existe MP4 completo sem capítulo 7. Inspeção visual e volume refeitos aqui. Escuta e voz definitiva continuam sem aprovação desta auditoria. |

## A. Apresentação — peça oficial

### Narrativa e cada slide

A sequência problema → aprovação → solução → resultado → qualidade → continuidade é compreensível sem o vídeo. O deck ainda não fica de pé como prestação de contas concluída: a seção de Impacto contém dois vazios centrais. Depois de resolver esses vazios e os achados, a estrutura serve ao protocolo. Inovação fica implícita no reaproveitamento e na geração; o antes/depois real precisa mostrar a diferença em relação à prática interna. [S04–S14; Regulamento §6–7, pp.3–5.]

Na tabela, o PNG da coluna “Slide” é a fonte visual de todas as avaliações. Os títulos são avaliados pela conclusão que comunicam, não por preferência estética.

| Slide | Título / protagonista | Número, método e avaliação |
|---|---|---|
| S01 | Identifica o projeto; a frase de apoio posiciona o escopo. Fotos dominam a metade superior. | Autor e data aparecem. As três fotos são ambientação; não afirmar três Megas em uso. |
| S02 | Conclusão de trabalho interno; tabela de pendências. | Quatro linhas, responsáveis e datas legíveis. Correta como controle de rascunho; não é abertura para a banca. A referência do antes/depois já aponta S07. |
| S03 | Tese clara; cinco seções. | Numeração e faixas conferem hoje. “Sem licença nova” reaparece com contexto em S13. Revisar faixas se retirar S02. |
| S04 | Título conclui além da prova; três protagonistas competem. | 2/3/12, preço agregado e VB/KG conferem no alcance documental. Rodapé identifica ofertas. Falta retirar a causalidade. |
| S05 | Ponte necessária com o projeto inscrito; linha do tempo. | 29/04 → 19/05 → 11/09 → setembro está coerente. Projeto futuro com TI está explícito. Retirar “causa” do título. |
| S06 | Boa conclusão; fluxo de cadastro e três saídas. | Saídas reais, exemplo R9. Capturas pequenas demais para conferir campos/EAP no projetor. Informar duas etapas e revisão do exemplo. |
| S07 | Padrão corporativo é a conclusão; “depois” domina. | Antes × depois ainda não compara nada. Selos e caixas vazias são inequívocos. Falta arquivo antigo. |
| S08 | Reaproveitamento claro; número 9 domina. | Nove chips de conteúdo, não total de campos. Categoria também é copiada. A captura não mostra a base já aberta/origem. [ `app/Escopos.gs:178–185`.] |
| S09 | Conclusão futura; espaços vazios dominam. | Mediana, amostra pequena e PDF pronto estão previstos. Sem dado, não há resultado. Método precisa controlar escopo, entregáveis e familiaridade. |
| S10 | Conclusão atual delimitada às duas áreas; três indicadores. | 4 é contagem de escopos, R4–R9 é exemplo e 9 dias é intervalo de desenvolvimento. Não tratá-los como três medidas de impacto. Explicar 9 **dias decorridos**, não dias úteis nem tempo de trabalho. |
| S11 | Assunto, ainda sem conclusão; dois cartões vazios. | Não há satisfação observada. Título final deve decorrer das falas reais. Rodapé deve dizer “coleta prevista” enquanto estiver pendente, em vez de sugerir “coletados”. |
| S12 | Conclusão clara; pedido → versão. | Datas e versões têm fonte; 34 scripts conferem. Sete tamanhos para um refere-se ao corpo na análise registrada, com exceção da EAP; não foi recontado nesta auditoria. Evitar aspas em paráfrases de usuário. [ `docs/AUDITORIA_ENTREGA_2026-10-11.md:110`; G:202,209,211.] |
| S13 | Viabilidade identificável; quatro cartões. | Corrigiu custo zero. Falta responsável de apoio. O rodapé distingue ocultação de eliminação da base. |
| S14 | Entregue versus futuro claro; dois blocos. | Revisões desde 15/09 e escopo base em 11/10 estão separados. Corrigir/Gerar nova revisão permanece proposta. Propriedades já testou: o futuro deve dizer **ampliar o uso**, sem apagar esse teste. |
| S15 | Fecho e autor claros; assinatura domina. | Sem prova ou link. Acrescentar caminho ao anexo e, se pronto, ao bônus. |

### Coerência numérica e fontes

| Informação | Conferência |
|---|---|
| **4 escopos reais, 2 áreas** | S10 e cartões de V 01:40/44 conferem com H:505–518. Foram abertas as capas dos PDFs na pasta externa `G:/Meu Drive/MELHOR IDEIA 2026/PLANO/`: sinalização viária R2, bombas de drenagem R2, PPCI R9 e bombas de água potável R1. Confirmam os quatro objetos e empreendimentos. A classificação teste/real e a área são decisões informadas pelo Guilherme; os PDFs não provam envio nem adoção contínua. |
| **R4–R9** | Seis pares apresentação/PDF; só uma planilha R9. [ `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:4–49`; V 01:46.] Não são nove pacotes. |
| **34 suítes** | Há 34 scripts encadeados no comando `test`. É esse o método da contagem. Execução antes da v77 está registrada em H:428–430. Não executei testes nem certifiquei cobertura. [ `package.json:7`; S12; V 02:14–02:18.] |
| **9 dias** | 11/10 menos 02/10 = 9 dias decorridos; são dez datas se contar os extremos. S10 explicita o intervalo. Não mede dedicação nem prazo de cada correção. [H:498–500; G:186.] |
| **2/3/12 visitas e verba anual** | PDF original `G:/Meu Drive/MELHOR IDEIA 2026/MCtba - Mapa de Equalização Manut Preventiva + Emissão de PMOC_v02.pdf`, p.1, aberto por extração. A observação anual e as três frequências conferem. Duas visitas é a proposta sem laudo PMOC com ART. Não inferir execução ou que 12 visitas seria melhor. |
| **Cronologia** | Produção de escopo em setembro; texto/fotos/justificado em 02/10; base/aviso/modo escopo em 11/10. S08 e S12 avisam sobre o prazo de implementação de 10/10. O vídeo mostra 11/10, mas não explica esse corte. Acrescentar **“Evoluções de 11/10, posteriores ao prazo de implementação”** se mantiver tais recursos como prova. [H:498–500; R:122; Regulamento §5.3, p.3.] |
| **Tempo** | S09 e capítulo 7 do roteiro principal usam mediana e amostra. Não há número para aprovar. Medir os mesmos escopos, com mesmos insumos e PDF equivalente; registrar pessoa, ordem das tarefas, familiaridade, uso de base e tempos brutos. Separar comparação de montagem do eventual benefício de reaproveitamento. [S09; `video/02-relatorio/ROTEIRO.md:127–132`; H:447–451.] |

### Legibilidade, marca, exposição e formato

Os selos PENDENTE de S07/S09/S10/S11 têm texto, borda e contraste suficientes no arquivo aberto. O problema é o espaço reservado continuar vazio na entrega. Não localizei corte ou sobreposição estrutural que inutilize um PNG. S04 é denso; S06 e S08 perdem a prova nos detalhes pequenos. [PNGs e `folha.png`.]

As três cores principais conferem: `#151E49`, `#003D7B`, `#065CA9`. Gradientes e transparências são permitidos. A fonte oficial é Gotham; o deck usa Montserrat e Open Sans. Isso é desvio de identidade, de prioridade menor que fatos/resultado. A regra de proteção usa a altura do **C do lettering**, não a altura do símbolo. Nos logos principais de S01/S15 não identifiquei invasão evidente dessa área; a aplicação reduzida nos documentos de exemplo precisa ser conferida no tamanho final. [Brandbook, pp.17–21; G:251–253; S01/S06/S07/S15.]

Não identifiquei preço preenchido, CNPJ, telefone ou foto de perfil nos recortes de S06/S08. Morley é marca de referência do equipamento, não fornecedor contratado. Há identificação nominativa em S02/S11/S12; autorização não foi demonstrada. Fotos de empreendimentos podem conter marcas de ocupantes/veículos; isso não equivale a revelar o proponente dos casos. [S01/S02/S06/S08/S11/S12/S15; `docs/BASE_DE_CONHECIMENTO.md:548`; R:12–13.]

Para protocolar sem perder composição: corrigir conteúdo, fechar evidências, definir a ordem e montar Slides 16:9. Há dois caminhos técnicos: reconstruir com texto/objetos editáveis e refazer a conferência; ou colocar cada PNG aprovado como imagem de página inteira e acrescentar links/notas. O segundo preserva o desenho, mas conserva texto pequeno e não cria texto selecionável. O PDF deve conter todas as páginas e o anexo legível. A apresentação não depende de animação: sombras, cantos, recortes e sobreposições podem ser preservados na imagem; em objetos nativos precisam ser reconstruídos. Nenhum slide exige efeito de movimento incompatível com Slides. [PNGs; G:48–52,249–387,389–416.]

## B. Vídeo — bônus

### Frase falada × imagem

Conferi o texto de cada uma das 19 cenas com as imagens e os tempos de palavras armazenados no HTML/JSON. Isso é sincronismo documental e visual; não é aprovação auditiva da dicção. A linha de montagem reproduz 160,474 s, consistente com V. [ `build/rascunho-ia.html`, `const DADOS` e linhas 1311–1350; R:43–137.]

| Cena / intervalo aproximado | O que passa / o que precisa corrigir |
|---|---|
| 1.1 · 00:00–00:08,8 | “Três propostas”, 2/3/12 e verba anual combinam. Cartões são editoriais. O número aparece a partir de 00:03,4; quadro zero ainda é fundo. |
| 1.2 · 00:08,8–00:13,4 | Laudo associado à proposta de 2 visitas. Fato correto; alerta só está completo perto do final. |
| 1.3 · 00:13,4–00:23,3 | Serviços entram na ordem falada. “Sem preço separado” só aparece na palavra “separados”, tarde demais. |
| 1.4 · 00:23,3–00:29,1 | Armadura e duas VB/duas KG conferem. KG se completa imediatamente antes da saída. |
| 1.5 · 00:29,1–00:35,4 | Conclusão delimitada e leitura suficiente. Não acusa execução nem infração. |
| 2.1 · 00:35,4–00:45,6 | Inscrição e pedido de detalhes combinam. Longa espera sobre a primeira parada; avanço editorial pode ocorrer com a segunda frase. |
| 2.2 · 00:45,6–00:50,5 | Diferenças nas ofertas retomadas em cartões. O roteiro visual manda acender produção, mas C mantém apenas as duas primeiras paradas; não cria erro factual. [R:74; C:245–250.] |
| 2.3 · 00:50,5–00:59,9 | Aprovação de setembro e projeto futuro com TI estão certos. Títulos das paradas 3/4 se sobrepõem. |
| 3.1 · 00:59,9–01:06,5 | Serviços por local destacados em captura real; sem abas antigas no enquadramento. |
| 3.2 · 01:06,5–01:09,3 | “Imagens” acompanha plantas vinculadas ao grupo. Não chama planta de fotografia. |
| 3.3 · 01:09,3–01:13,5 | Lista, quantidade/unidade e marca recebem foco na fala. Demonstra campos; não exige marca em todo item. |
| 3.4 · 01:13,5–01:21,5 | Três documentos e duas etapas corretos. Comandos aparecem tarde e são pequenos; a imagem da planilha serve para reconhecer a saída, não ler a EAP inteira. |
| 4.1 · 01:21,5–01:24,6 | “Usar como base” real e destacado. O efeito não executa a operação: ilustra o botão. |
| 4.2 · 01:24,6–01:36,7 | Campos herdados e campos a preencher seguem a fala. A lista é parcial, como exemplos; não representa todos os campos. |
| 5.1 · 01:36,7–02:02,5 | Duas áreas, histórico real e proposta de separar revisões. Corrigir a promessa “serve” e tirar botões futuros da janela TELA REAL. |
| 6.1 · 02:02,5–02:13,5 | Pedidos/versões em ordem. Último cartão é quase um flash. Datas de 11/10 precisam do contexto do corte de implementação. |
| 6.2 · 02:13,5–02:18,4 | 34 está correto como scripts. A unidade “suítes” chega só perto do fim; apresentar número e unidade juntos. |
| 8.1 · 02:18,4–02:34,5 | Alcance corporativo e projeto futuro com TI certos. Chip “toda área” dispara na ocorrência errada; não implica adoção adicional. |
| 8.2 · 02:34,5–02:40,5 | Fecho corporativo, logo e autor. A composição completa chega perto do fim. Reservar pelo menos 2 s após assinatura completa. |

### Régua de leitura — falhas reproduzíveis

Método: contei letras, sem espaços/pontuação, e apliquei **letras ÷ 15 + 1,5 s**. O tempo disponível abaixo é aproximado, da entrada completa até o início da dissolução ou troca. Falar o texto ajuda, mas não torna uma legenda legível em meio segundo. [Régua: `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:105–110`; C e HTML citados acima; quadros de V.]

| Elemento | Mínimo pela régua | Disponível hoje | Ajuste |
|---|---:|---:|---|
| “sem o laudo PMOC com ART previsto no pedido” | 35 letras → 3,83 s | Cerca de 2,4 s; completo perto de 00:10,6, dissolução por volta de 00:13 | Antecipar o alerta junto de “não incluía”; sustentar até completar a leitura. |
| “sem preço separado” | 16 letras → 2,57 s | Cerca de 0,6 s estável; legível em 00:22,6 e dissolvendo em 00:23,1 | Entrar na primeira lista de serviços; segurar a conclusão. |
| KG no quadro comparativo completo | Ao menos 1,63 s só para “KG”; comparação requer mais | Completo perto de 00:28,4; começa a dissolver em 00:28,7 | Reservar 3 s para o quadro com VB × KG. |
| Dois comandos de geração | 42 letras → 4,30 s | Cerca de 1,8 s depois da entrada completa | Antecipar “em duas etapas” ou manter os comandos enquanto a frase é concluída. |
| “Escopos base” | 11 letras → 2,23 s, sem contar data/versão | Completo perto de 02:13,1; dissolução já começa perto de 02:13,1 | Entrar em “escopos”; ampliar a permanência após a fala. |
| “suítes de teste, rodadas antes de publicar” | 35 letras → 3,83 s | Cerca de 1,4 s estável após completar perto de 02:16,6 | Unidade junto do 34 desde a entrada; encurtar legenda ou aumentar permanência. |

### Acabamento, saltos, áudio e capítulo 7

Nova análise com as mesmas funções de leitura de `video/motor/_motor/medir.py`: **94,8 s** abaixo do limiar de movimento, cerca de **59%** de 160,5 s; **42 trechos** acima de 0,6 s. O maior, 00:35,9–00:41,1, dura 5,2 s. É uma métrica de diferença de pixels, não medida de atenção. Cartão parado durante leitura é permitido; não adicionar movimento ornamental para maquiar a contagem. O problema real é esperar sobre cartão vazio e retirar a conclusão depressa. [V; função `congelado`; C:107,238,400–416.]

Os **21 saltos atuais** são: 00:13,2; 00:23,1; 00:23,5; 00:28,9; 00:29,0; 00:59,4; 00:59,5; 00:59,6; 01:06,3; 01:09,1; 01:13,2; 01:13,3; 01:21,0; 01:21,1; 01:21,2; 01:24,3; 01:24,4; 01:44,2; 01:56,0; 02:13,3; 02:13,4. Todos foram abertos. Correspondem principalmente a dissoluções de telas claras, entrada/saída de cartões e troca interna de enquadramento. Não vi quadro preto ou mídia ausente nesses instantes. As dissoluções sobrepõem letras de títulos por alguns quadros; usar título persistente ou apagar o anterior antes do novo. A colisão das paradas em 00:58 é permanente, distinta desse efeito transitório. [V nos instantes listados; código de transição no HTML:1408–1433.]

O aspecto geral é corporativo: cartões limpos, marca e telas de sistema. A retícula de fundo é discreta; não domina. O quadro inicial continua quase vazio, embora a fala entre cedo: o primeiro metadado de palavra é 00:00,446. Abrir com os cartões compostos resolve sem inventar ganho. [V 00:00/00:02; C:18–24,107,136–137; HTML `DADOS`/`LINHA`.]

**Áudio técnico aprovado no alcance da medição:** análise FFmpeg `loudnorm`, saída para `null`, sobre o MP4 atual: entrada **−15,11 LUFS**, **−1,82 dBTP**, LRA **2,90 LU**. Atende à meta pedida de −15 LUFS e pico ≤ −1 dBTP, com diferença de 0,11 LU. O referencial interno mais estrito de pico ≤ −2 não é atingido; ajustar no fechamento se essa régua for mantida. Nenhum áudio novo foi salvo. [V; resultado desta sessão; `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:109`.]

A trilha configurada é 0,10; efeitos são 0,35–0,50 e ligados a palavras/documentos. Isso prova configuração, não que a música esteja perceptualmente abaixo da voz em todas as frases. Não aprovo por escuta volume relativo, timbre nem efeitos. A falha de pronúncia que consigo demonstrar é a entrada corrompida `Fl?ig`/`t? ?`. Conferir na voz definitiva: Fluig em 00:44 e 02:29; TI perto de 00:58 e 02:28; PDF perto de 01:16; Facilities perto de 01:40 e 02:20. RM tem substituição por extenso nos metadados. PMOC aparece escrito, mas não é pronunciado na locução atual. [C:14–15,312–313; R:48–133; `projeto.json:1`; `build/audio/*.json`; `LOCUCAO-elevenlabs.md:7`.]

Sem capítulo 7, há começo, solução, uso e fecho; o vídeo se sustenta como demonstração, com pouca prova de impacto. A ausência está correta enquanto não houver medição. Depois de 14/10, inserir o capítulo **entre 6.2 e 8.1**, hoje aproximadamente **02:18,4**, antes do alcance/futuro. Usar a mesma mediana, n e método de S09, sem cronômetro simulado. Restam aproximadamente **19,5 s** até três minutos; essa margem também precisa acomodar as correções de leitura. Renumerar o rótulo visual do atual “07 · O PRÓXIMO PASSO” quando o tempo entrar. Se não couber com leitura clara, reduzir repetição de alcance; não acelerar a voz para esconder a falta de espaço. [R:15,128; C:425; roteiro principal:127–139; duração de V.]

## C. O que falta para quinta-feira, 15/10

Plano recomendado, não relato de tarefas já executadas. Datas seguem America/Sao_Paulo. A sequência preserva as coletas decididas pelo Guilherme. [H:524–533; pedido atual.]

| Ordem | Dia | Dono | Entrega concreta |
|---:|---|---|---|
| 1 | **Seg 12** | Claude | Corrigir os textos/diagramas apontados, preparar estrutura de Slides/PDF e anexo. Separar evolução do escopo de outro projeto com TI. Revisar fontes e recortes sem gerar voz. |
| 2 | **Seg 12** | Guilherme | Definir apoio de manutenção ou registrar a dependência atual. Preparar os mesmos casos/insumos e participantes para comparação justa. Confirmar operacionalmente o formato/canal/horário de protocolo com RH, sem reabrir aprovação da ideia. |
| 3 | **Ter 13** | Guilherme | Entregar 2–3 PowerPoints antigos para S07. Identificar o que é exemplo e o que era contratação real. Não usar `TotalTime` do PPTX como cronômetro. |
| 4 | **Ter 13** | Claude | Inserir o antes/depois, ampliar provas e conferir a versão corrigida antes da voz. Preparar títulos do vídeo sem colisão e tempos de leitura. Manter S09/S11 e capítulo 7 pendentes. |
| 5 | **Ter 13** | Guilherme | Gerar a voz definitiva dos capítulos liberados no ElevenLabs; ouvir Fluig, RM, TI, PDF e Facilities. Manter capítulo 7 fechado. [ `LOCUCAO-elevenlabs.md:5–7`; H:532.] |
| 6 | **Qua 14** | Guilherme | Cronometrar 2–3 escopos pareados; guardar dados brutos, pessoa, ordem e condições. Coletar as duas falas e autorizações: Ricardo/Propriedades e Facilities/Mega Itajaí. |
| 7 | **Qua 14** | Claude | Recontar por ID: objeto, empreendimento, autor, data e artefato; separar testes/revisões/duplicatas. Consolidar mediana e n, preencher S09/S10/S11 só com fontes recebidas e anexar memória. Atualizar documentos correntes contraditórios. |
| 8 | **Qua 14** | Claude | Fechar Slides e exportar PDF. Reabrir cada página, links e anexos; revisar permissões de leitura do comitê. Retirar instruções internas e recalcular sumário/referências. |
| 9 | **Qua 14** | Guilherme | Gerar somente o capítulo 7 após a conta conferida. Revisar o deck fechado e a voz completa. |
| 10 | **Qua 14** | Claude | Incorporar a voz, capítulo 7 e correções; conferir folha, leitura e recortes; produzir o vídeo final e medir esse arquivo exato, com hash. Manter o vídeo fora do caminho crítico do deck. |
| 11 | **Qui 15** | Guilherme | Revisão final, ensaio de projeção/arquivo offline e protocolo do deck no RH até o prazo. Guardar comprovante. Incluir o bônus somente se estiver pronto, acessível e revisado. |

Se a coleta de 14/10 falhar, o fechamento honesto é explícito: resultado não medido, depoimento não coletado ou antes/depois indisponível. Isso reduz a força da nota; não autoriza inventar dado nem deve impedir o envio de um relatório fiel do que foi implementado. [Regulamento §7, p.5; regra de evidência em `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:32–33`.]

## O que não foi possível verificar

1. **Escuta integral e pronúncia real.** Este ambiente oferece inspeção de imagens e análise técnica do áudio, sem ferramenta de escuta direta. Não afirmo ter ouvido a música ou um erro fonético. Metadados de palavras não substituem audição. [Arquivos de V e `build/audio/`; pronúncia corrompida em `projeto.json:1`.]
2. **Cada palavra realmente pronunciada.** Texto do roteiro e tempos salvos foram confrontados cena a cena. Não fiz transcrição independente do áudio. Os truncamentos anteriores de 1.3/1.5 estão registrados como refeitos em H:544–545; a existência de metadados completos não prova, sozinha, áudio completo.
3. **Cada um dos cerca de 4.800 quadros.** Abri a grade de 2 s, todos os saltos e detalhes; li as coordenadas de recorte. Não certifiquei ausência de exposição em todo quadro intermediário. O envelope deve ser revisto novamente no render final, sobretudo após trocar voz/transições. [C:53–59,278–319,338–340,377–379.]
4. **Base autenticada, envio e uso continuado.** PDFs e capturas confirmam objetos/artefatos; área e classificação real/teste têm a premissa do Guilherme. Não acessei produção nem auditei destinatários/contratos executados. Não inferi adoção empresarial a partir de emissão. [S10; H:505–518; PDFs locais citados em A.]
5. **Tempo e satisfação futuros.** São pendências assumidas. Não há coleta de 14/10 para aprovar hoje. Não reaproveitei estimativa de cliques, economia antiga ou relato inventado. [S09/S11; roteiro principal:127–132.]
6. **Projetor, Google Slides e PDF final.** As peças atuais são PNGs/HTML. A legibilidade e as quebras foram avaliadas nos arquivos, sem ensaio na sala nem exportação final. Não criei apresentação para testar, pois a autorização desta sessão é só leitura. [G:389–416; inventário de `relatorio/`.]
7. **Autorizações e implantação.** Não localizei autorização de depoimentos, segundo operador demonstrado, ACLs de Drive ou verificação atual da @77 no navegador. Não concluo ausência deles; não foram comprovados nesta auditoria. [S11/S13; H:432,518–533.]
8. **Gotham/licença e integração.** Não verifiquei licença instalada da Gotham nem APIs/bases de Fluig/RM. O plano Creator é informação do registro, não consulta de assinatura. Não reabro essas decisões nem aprovo integração inexistente. [Brandbook p.21; H:466,472–473; S13/S14.]

**Registro de preservação:** não foi usado o gerador do deck, o gerador de voz, `render.py`, `medir.py` em modo de escrita, nem publicação. Foram usadas apenas funções de análise e extração FFmpeg para scratchpad. As recomendações acima são correções para outra etapa; nenhuma foi aplicada às peças nesta auditoria.
