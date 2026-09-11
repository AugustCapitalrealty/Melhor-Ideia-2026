/** Conteúdo atual da apresentação: produtividade desde a definição do escopo. */
const CN_ROTEIRO = [
  {
    tipo: 'capa', titulo: 'Gestão de Contratações',
    chamada: 'Produtividade no processo de contratação',
    tese: 'Definir melhor o escopo para reduzir revisões e facilitar a contratação.',
    rodape: 'Concurso da Melhor Ideia 2026 · Capital Realty & Demercado',
    fala: 'O problema que queremos resolver é a produtividade no processo de contratação. Parte do tempo gasto na equalização é usada para descobrir o que cada fornecedor considerou. A proposta é organizar esse trabalho desde o escopo: definir o que precisamos, pedir a mesma estrutura de resposta e levar esses itens para a comparação. Gestão de Contratações é o novo nome porque o projeto acompanha esse ciclo completo.'
  },
  {
    titulo: 'O retrabalho começa antes da equalização', selo: 'A DOR DO PROCESSO',
    chamada: 'Quando o escopo é ambíguo, cada fornecedor responde a uma pergunta diferente.',
    cards: [
      ['Propostas diferentes', 'Um fornecedor detalha os serviços. Outro apresenta um preço global. Um terceiro deixa itens de fora.'],
      ['Comparação difícil', 'Uma proposta de R$ 20 mil pode parecer atrativa, mas o valor sozinho não revela o que está incluído.'],
      ['Mais idas e vindas', 'A equipe precisa esclarecer inclusões, pedir revisões e reorganizar os dados antes de comparar os preços.']
    ],
    rodape: 'Exemplo ilustrativo: preço comparável exige escopo, quantidade e condições equivalentes.',
    fala: 'Imagine uma proposta de vinte mil reais sem detalhamento. Ela inclui materiais? Instalação? Testes? Limpeza? Outro fornecedor pode ter considerado tudo isso. Comparar apenas o total mistura propostas diferentes. Antes de negociar, a equipe precisa abrir as composições e pedir revisões. É nesse trabalho de esclarecimento e conferência que o processo perde tempo. O valor é um exemplo, não uma compra ou economia apurada.'
  },
  {
    titulo: 'Uma mesma base para os três Megas', selo: 'FACILITIES E PROPRIEDADES',
    chamada: 'As características locais mudam. As informações necessárias para cotar precisam seguir um padrão.',
    cards: [
      ['Realidades diferentes', 'Curitiba, Esteio e Itajaí têm necessidades próprias. Hoje, os escopos variam na quantidade de texto, fotos e detalhamento.'],
      ['Referência interna', 'A Engenharia já tem experiência na elaboração de escopos e equalizações. Essa prática pode orientar um método comum.'],
      ['Apoio às equipes', 'Facilities e Propriedades ganham uma sequência de preparação e conferência para estruturar a contratação.']
    ],
    rodape: 'Padrão comum de informação, com espaço para a necessidade específica de cada empreendimento.',
    fala: 'Nos três Megas, algumas pessoas usam mais fotos e menos texto; outras fazem o contrário. O objetivo não é impor a mesma quantidade de fotos ou apagar as diferenças locais. É garantir que todos respondam às mesmas perguntas: onde, o quê, quanto, com qual referência e em quais condições. A experiência da Engenharia é uma referência interna para apoiar Facilities e Propriedades, que precisam de um método mais guiado.'
  },
  {
    titulo: 'O escopo nasce com uma estrutura comum', selo: 'FUNCIONA HOJE',
    chamada: 'Preparar melhor a solicitação de cotação torna explícito o que o fornecedor deve considerar.',
    cards: [
      ['Contexto e evidência', 'Local, objetivo, vistoria e fotos junto aos grupos de serviços. O fornecedor entende o problema e onde vai atuar.'],
      ['Itens bem definidos', 'EAP com grupos, descrição, quantidade, unidade e marca de referência. A numeração é automática.'],
      ['Condições claras', 'Prazos, visita técnica, materiais, documentação, responsabilidades e demais requisitos registrados no escopo.']
    ],
    rodape: 'A ferramenta organiza o preenchimento; a qualidade técnica depende da revisão do responsável.',
    fala: 'A melhora começa antes de recebermos qualquer preço. Montamos o escopo por local e serviço, anexamos as fotos ao grupo e estruturamos os itens na EAP. As condições completam a solicitação ou edital de cotação. A ferramenta ajuda a lembrar e organizar os campos, mas não substitui a revisão técnica. Um formulário preenchido não garante, sozinho, que o escopo esteja correto.'
  },
  {
    tipo: 'fluxo', titulo: 'O ciclo começa no escopo', selo: 'FLUXO ATUAL',
    chamada: 'A estrutura preparada no início acompanha a cotação e a decisão.',
    cards: [
      ['1. Escopo', 'Definir serviços, fotos, itens e condições.'],
      ['2. Cotação', 'Baixar o Excel e enviar aos fornecedores.'],
      ['3. Resposta', 'Receber o Excel preenchido na estrutura solicitada.'],
      ['4. Equalização', 'Carregar o escopo e informar os preços de cada proponente.'],
      ['5. Decisão', 'Analisar propostas, negociar e registrar a homologação.'],
      ['6. Memória', 'Avaliar a entrega e consultar o histórico na próxima compra.']
    ],
    rodape: 'Envio e retorno do Excel são externos ao sistema. Os preços são inseridos ou colados pela equipe.',
    fala: 'O ciclo não começa na equalização. Começa no escopo. Da EAP sai uma planilha Excel com os itens preenchidos e os campos de preço em branco. Enviamos esse arquivo aos fornecedores, que o devolvem preenchido. Na nova cotação, escolhemos a mesma revisão do escopo e carregamos os itens. A equipe informa ou cola os preços. Depois vêm a análise, a negociação e a decisão. Após a entrega, a avaliação alimenta as próximas contratações. O envio e a leitura automática das respostas ainda não fazem parte desse fluxo.'
  },
  {
    titulo: 'A equalização aproveita o trabalho já feito', selo: 'FUNCIONA HOJE',
    chamada: 'Os itens solicitados ao fornecedor são a base que o comprador carrega para comparar.',
    cards: [
      ['Antes da resposta', 'Todos recebem os mesmos itens, quantidades, unidades e referências, com os preços a preencher.'],
      ['Na montagem', 'O comprador escolhe o escopo e a revisão enviada. A EAP entra pronta, com os campos de preço vazios.'],
      ['Na conferência', 'A equipe verifica omissões, marcas e condições antes de comparar os valores e solicitar a aprovação.']
    ],
    rodape: 'Menos redigitação e uma base comum de comparação. A resposta do fornecedor ainda precisa ser conferida.',
    fala: 'A equalização nasce estruturada junto com o escopo. Assim, não precisamos reconstruir a lista inteira depois de receber propostas em formatos diferentes. A mesma revisão enviada ao fornecedor alimenta a EAP da compra. Ainda é necessário conferir a resposta: um fornecedor pode omitir um item ou propor outra marca. A vantagem é termos uma referência clara para identificar e resolver essas diferenças.'
  },
  {
    titulo: 'Um apoio adicional para quem avalia', selo: 'EQUALIZAÇÃO MAIS INTELIGENTE',
    chamada: 'A padronização organiza a entrada. Os recursos de análise ajudam na decisão.',
    cards: [
      ['EAP e marcas', 'Numeração automática, quantidades visíveis e marca de referência junto aos itens.'],
      ['Preços anteriores', 'Consulta e alertas históricos ajudam a identificar variações que merecem explicação.'],
      ['Qualidade da entrega', 'O IQF traz avaliações do fornecedor para a próxima compra e sinaliza quando a amostra é preliminar.'],
      ['Registro da decisão', 'Comparativo exportável, parecer, homologação e registro dos valores negociados.']
    ],
    rodape: 'A negociação ocorre entre as pessoas. O sistema registra e organiza o resultado para análise.',
    fala: 'Esses recursos são um ganho adicional à melhora do processo. A numeração automática evita manutenção manual da EAP. O histórico ajuda o comprador a questionar um preço. O IQF acrescenta informação sobre a entrega, com indicação de amostra preliminar. O avaliador recebe um comparativo mais organizado, com condições e justificativa. O sistema não negocia pelo comprador e o menor preço não substitui a avaliação do escopo.'
  },
  {
    titulo: 'Um repositório para a próxima contratação', selo: 'MEMÓRIA COMPARTILHADA',
    chamada: 'Escopos, equalizações e preços deixam de depender de arquivos isolados.',
    cards: [
      ['Escopos e revisões', 'Consultar o que foi definido e recuperar a versão usada em cada solicitação.'],
      ['Equalizações e preços', 'Reaproveitar o histórico de comparação e pesquisar referências por item e empreendimento.'],
      ['Base de fornecedores', 'Identificação por CNPJ, consulta cadastral, contatos e histórico de participação e avaliação.']
    ],
    rodape: 'Consulta pública de CNPJ via BrasilAPI, com prioridade ao cadastro interno e preenchimento manual se necessário.',
    fala: 'O repositório guarda a memória do trabalho. O próximo responsável pode consultar um escopo anterior, uma equalização e os preços registrados. A base de fornecedores usa o CNPJ como referência e consulta dados cadastrais públicos. A consulta externa é feita pela BrasilAPI, que republica dados públicos; não é uma integração direta com a Receita Federal. O cadastro interno vem primeiro e uma indisponibilidade não impede continuar manualmente.'
  },
  {
    titulo: 'Entregas atuais e próximas evoluções', selo: 'ESCOPO DA SOLUÇÃO',
    chamada: 'O fluxo já conecta a preparação do escopo à montagem da equalização.',
    cards: [
      ['Já disponível', 'Escopos com fotos e revisões.\nEAP e Excel para cotação.\nCarga do escopo na equalização.\nHistórico de preços, cadastro e IQF.\nExportação e registro da decisão.'],
      ['Evoluções futuras', 'Convite com envio pelo sistema.\nPortal de resposta do fornecedor.\nImportação automática das respostas.\nIntegrações com sistemas corporativos.\nModelos refinados com o uso das equipes.']
    ],
    rodape: 'Evoluções dependem de priorização e validação. Funcionalidade entregue não equivale a ganho já medido.',
    fala: 'Hoje já temos o escopo com fotos, a EAP, a planilha em branco para o fornecedor e a carga desses itens na equalização. Também temos o histórico de preços, o cadastro por CNPJ, a avaliação e os documentos de apoio à decisão. O envio de convites, o portal e a importação automática das respostas são próximos passos. Precisamos consolidar o uso e medir o resultado antes de ampliar o processo.'
  },
  {
    titulo: 'Medir o processo completo', selo: 'COMO VALIDAR O GANHO',
    chamada: 'Investir mais atenção no escopo faz sentido se reduzir o esforço total da contratação.',
    cards: [
      ['Tempo por etapa', 'Preparação do escopo, montagem da equalização e duração até a decisão.'],
      ['Retrabalho', 'Dúvidas dos fornecedores, itens omitidos e rodadas de correção ou revisão.'],
      ['Uso pelas equipes', 'Contratações realizadas, reaproveitamento de escopos e dificuldades de Facilities e Propriedades.']
    ],
    rodape: 'Comparar casos equivalentes antes e depois. O ganho de tempo ainda precisa ser demonstrado.',
    fala: 'O indicador não pode olhar apenas os minutos gastos para montar a tabela. Se dedicarmos mais tempo a elaborar um escopo e reduzirmos revisões, esclarecimentos e correções, o ganho pode estar no processo completo. Precisamos acompanhar o tempo por etapa, o número de devoluções e a duração até a decisão. A comparação deve considerar compras semelhantes e separar tempo ativo de trabalho de tempo de espera. Não vou afirmar um percentual de redução sem essa comparação.'
  },
  {
    titulo: 'Começar melhor para contratar melhor', selo: 'GESTÃO DE CONTRATAÇÕES',
    chamada: 'Um escopo claro dá uma base comum ao fornecedor, ao comprador e ao avaliador.',
    cards: [
      ['Quem prepara', 'Define a necessidade e revisa os requisitos antes de pedir preço.'],
      ['Quem compra', 'Recebe respostas na estrutura solicitada, confere diferenças e conduz a negociação.'],
      ['Quem decide', 'Analisa propostas com mais contexto e registra uma decisão fundamentada.']
    ],
    rodape: 'Próximo passo: aplicar o padrão em contratações reais dos três Megas e acompanhar o retrabalho.',
    fala: 'A proposta é melhorar as atividades das pessoas em cada momento da contratação. Quem prepara dá clareza ao pedido. Quem compra concentra energia na conferência e na negociação. Quem decide recebe um comparativo mais compreensível. A hipótese é simples: um escopo bem elaborado reduz o ruído que se espalharia pelas etapas seguintes. O próximo passo é usar esse padrão nas contratações reais e medir o resultado com as equipes.'
  }
];

/** Mesmo conteúdo é usado no Google Slides e no PowerPoint gerado localmente. */
function _cnRenderNarrativa_(deck, pagina, indice) {
  const W = deck.getPageWidth(), H = deck.getPageHeight();
  const slide = _cnNovoSlide_(deck), capa = pagina.tipo === 'capa';
  if (capa) {
    slide.getBackground().setSolidFill(DS_CN.colors.brandDark);
    _cnUmaLinha_(slide, 40, 43, W - 90, 25, pagina.chamada, {fs:16,fsMin:14,align:'L',cor:DS_CN.colors.brandSoft});
    _cnParagrafo_(slide, 40, 104, W - 80, 100, pagina.titulo, {fs:38,fsMin:32,bold:true,cor:'#FFFFFF',fonte:DS_CN.typography.titles});
    _cnParagrafo_(slide, 40, 223, W - 130, 72, pagina.tese, {fs:20,fsMin:17,cor:'#FFFFFF'});
    _cnUmaLinha_(slide, 40, H - 65, W - 90, 22, 'Guilherme Marques · Suprimentos / Facilities', {fs:11,fsMin:10,align:'L',cor:DS_CN.colors.brandSoft});
    _cnUmaLinha_(slide, 40, H - 37, W - 90, 18, pagina.rodape, {fs:9,fsMin:8,align:'L',cor:DS_CN.colors.brandSoft});
  } else {
    _cnHeader_(slide, W, pagina.titulo, [pagina.selo]);
    _cnParagrafo_(slide, CN_MX, 76, W - 2 * CN_MX, 49, pagina.chamada, {fs:15,fsMin:13,bold:true});
    const cards = pagina.cards, colunas = cards.length === 4 ? 2 : (cards.length === 2 ? 2 : 3);
    const linhas = Math.ceil(cards.length / colunas), espaco = 12;
    const largura = (W - 2 * CN_MX - espaco * (colunas - 1)) / colunas;
    const altura = (H - 190 - espaco * (linhas - 1)) / linhas;
    cards.forEach(function (card, i) {
      const x = CN_MX + (i % colunas) * (largura + espaco), y = 132 + Math.floor(i / colunas) * (altura + espaco);
      _cnCartao_(slide, x, y, largura, altura, DS_CN.colors.brandLight);
      _cnParagrafo_(slide, x + 13, y + 10, largura - 26, linhas > 1 ? 26 : 46, card[0], {fs:linhas > 1 ? 13 : 16,fsMin:11,bold:true,cor:DS_CN.colors.brandMed,fonte:DS_CN.typography.titles});
      const topo = linhas > 1 ? 36 : 61;
      _cnParagrafo_(slide, x + 13, y + topo, largura - 26, altura - topo - 12, card[1], {fs:linhas > 1 ? 11 : 13,fsMin:9.5});
    });
    _cnRodape_(slide, W, H, pagina.rodape);
    _cnUmaLinha_(slide, W - 56, H - 19, 24, 14, String(indice + 1).padStart(2,'0'), {fs:8,fsMin:8,cor:DS_CN.colors.textMuted,folga:0});
  }
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(pagina.fala);
}
