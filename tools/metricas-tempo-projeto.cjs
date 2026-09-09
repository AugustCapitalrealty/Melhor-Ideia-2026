/** Indicador indireto de atividade no Git. Não é apontamento de horas humanas. */
const { execFileSync } = require('child_process');
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const registros = git(['log', '--no-merges', '--format=%at']).split('\n').map(Number).sort((a,b)=>a-b);
const local = t => new Date((t - 3 * 3600) * 1000).toISOString().replace('T',' ').slice(0,19) + ' -03:00';
function estimar(limiteMinutos, inicioMinutos) {
  const sessoes = []; let inicio = registros[0], fim = inicio;
  registros.slice(1).forEach(t => {
    if (t - fim > limiteMinutos * 60) { sessoes.push({ inicio, fim }); inicio = t; }
    fim = t;
  });
  sessoes.push({ inicio, fim });
  const intervalosHoras = sessoes.reduce((s,x)=>s+(x.fim-x.inicio)/3600,0);
  return { limitePausaMinutos:limiteMinutos, minutosAtribuidosPorInicio:inicioMinutos,
    sessoes:sessoes.length, intervalosHoras, estimativaHoras:intervalosHoras+sessoes.length*inicioMinutos/60 };
}
console.log(JSON.stringify({
  metodo:'Intervalos entre commits de autoria, sem merges; lacunas acima do limite iniciam nova sessão. Acréscimo por início é hipótese, não medição.',
  corte:git(['rev-parse','--short','HEAD']), commitsTotais:Number(git(['rev-list','--count','HEAD'])),
  commitsSemMerge:registros.length, primeiro:local(registros[0]), ultimo:local(registros.at(-1)),
  horasCorridas:(registros.at(-1)-registros[0])/3600,
  central:estimar(90,20), sensibilidade:[30,60,90,120].map(m=>estimar(m,20)),
  limitacoes:'Não mede trabalho anterior ao primeiro commit, posterior ao último, reuniões, tempo humano versus IA ou trabalho paralelo. Intervalos podem conter pausas; sessões longas sem commits podem ser omitidas.'
},null,2));
