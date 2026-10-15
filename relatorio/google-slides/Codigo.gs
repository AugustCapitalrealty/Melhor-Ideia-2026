/**
 * Gera no Google Slides a apresentação do relatório final (Melhor Ideia 2026 · Gestão de Contratações).
 *
 * Cada slide é a imagem em alta resolução (1920×1080) gerada pelo projeto, ocupando a página inteira,
 * com o título como texto alternativo e nas notas do apresentador.
 *
 * Como usar: escolha a função gerarApresentacao e clique em Executar. Na primeira vez o Google pede autorização.
 * As imagens vêm da pasta do Drive "APRESENTACAO-SLIDES-PNG" (slide-01.png … slide-16.png).
 * A apresentação é criada nessa mesma pasta, e o link aparece no registro de execução.
 */
const PASTA_IMAGENS = 'APRESENTACAO-SLIDES-PNG';
const NOME_APRESENTACAO = 'Gestão de Contratações · Melhor Ideia 2026 · Relatório final';

const TITULOS = [
  'Gestão de Contratações: a contratação começa no escopo',
  'Sumário',
  'Um sistema que guia a montagem do escopo, do cadastro ao documento que vai ao fornecedor',
  'De 2024 a 2026 o escopo passou a existir; faltavam padrão e estrutura',
  'Sem padrão, cada escopo sai num formato e deixa lacunas diferentes',
  'Três casos reais mostram diferenças que o escopo precisa deixar explícitas',
  'Em 11/09, o comitê aprovou começar pelo escopo',
  'Um cadastro alimenta a apresentação, o PDF e a planilha do fornecedor',
  'Qualidade é padronização: todo escopo do sistema sai com a mesma estrutura e a revisão numerada',
  'O próximo escopo parte do último emitido',
  'Para o Facilities do Mega Itajaí, passada a adaptação, montar escopo ficou mais fácil',
  'Os escopos passam a ficar num só lugar, já com 4 reais de duas áreas',
  'Pedido de quem usa vira versão publicada em dias',
  'Sem licença nem servidor novo: roda no que a empresa já tem',
  'Entregue: a montagem do escopo. Fornecedor e preço serão outro projeto, com a TI',
  'Começar melhor. Contratar melhor.',
];

function gerarApresentacao() {
  const pastas = DriveApp.getFoldersByName(PASTA_IMAGENS);
  if (!pastas.hasNext()) throw new Error('Pasta "' + PASTA_IMAGENS + '" não encontrada no Drive.');
  const pasta = pastas.next();

  const imagens = [];
  const it = pasta.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (/^slide-\d+\.png$/i.test(f.getName())) imagens.push(f);
  }
  if (!imagens.length) throw new Error('Nenhum slide-NN.png na pasta "' + PASTA_IMAGENS + '".');
  imagens.sort(function (a, b) { return a.getName().localeCompare(b.getName()); });

  const apresentacao = SlidesApp.create(NOME_APRESENTACAO);
  DriveApp.getFileById(apresentacao.getId()).moveTo(pasta);
  const largura = apresentacao.getPageWidth(), altura = apresentacao.getPageHeight();

  // A apresentação nova vem com um slide de título vazio: é usado como o primeiro.
  const primeiro = apresentacao.getSlides()[0];
  imagens.forEach(function (arquivo, i) {
    const slide = i === 0 ? primeiro : apresentacao.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    if (i === 0) slide.getPageElements().forEach(function (el) { el.remove(); });
    const img = slide.insertImage(arquivo.getBlob());
    img.setLeft(0).setTop(0).setWidth(largura).setHeight(altura);
    const titulo = TITULOS[i] || arquivo.getName();
    img.setTitle(titulo).setDescription(titulo);
    slide.getNotesPage().getSpeakerNotesShape().getText().setText(titulo);
  });

  apresentacao.saveAndClose();
  const url = 'https://docs.google.com/presentation/d/' + apresentacao.getId() + '/edit';
  Logger.log(imagens.length + ' slides · ' + url);
  return url;
}
