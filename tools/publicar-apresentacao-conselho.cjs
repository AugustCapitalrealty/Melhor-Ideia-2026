/** Atualiza o destino fixo com PPTX, mantendo o ID do Google Slides.
 * Usa a autenticação local do clasp sem gravar nem imprimir credenciais.
 * Conversão suportada em files.update: developers.google.com/workspace/drive/api/guides/manage-uploads
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function publicar(arquivo) {
  const fonte=fs.readFileSync(path.join(__dirname,'../app/Apresentacao_Conselho.gs'),'utf8');
  const id=fonte.match(/const CONSELHO_DECK_ID = '([A-Za-z0-9_-]+)'/)[1];
  const cred=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE||process.env.HOME,'.clasprc.json'),'utf8')).tokens.default;
  const refresh=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:cred.client_id,client_secret:cred.client_secret,refresh_token:cred.refresh_token,grant_type:'refresh_token'})});
  if(!refresh.ok)throw Error('Falha na autenticação do Google: HTTP '+refresh.status);
  const token=(await refresh.json()).access_token;
  async function requisicao(url,op={}) {
    const r=await fetch(url,{...op,headers:{Authorization:'Bearer '+token,...op.headers}});
    if(!r.ok){let erro;try{erro=(await r.json()).error?.message;}catch{}throw Error('Google HTTP '+r.status+': '+(erro||r.statusText));}
    return r;
  }
  const base='https://www.googleapis.com/drive/v3/files/'+id;
  const consulta=base+'?fields=id,name,mimeType,version,capabilities(canEdit)';
  const antes=await (await requisicao(consulta)).json();
  if(!antes.capabilities.canEdit||antes.mimeType!=='application/vnd.google-apps.presentation')throw Error('Destino não é uma apresentação editável.');
  const mime='application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const backup=Buffer.from(await (await requisicao(base+'/export?mimeType='+encodeURIComponent(mime))).arrayBuffer());
  if(backup.subarray(0,2).toString()!=='PK')throw Error('Backup do documento anterior inválido.');
  const pasta=path.dirname(arquivo),copia=path.join(pasta,'backup-conselho-'+Date.now()+'.pptx');
  fs.writeFileSync(copia,backup);
  const atual=await (await requisicao(consulta)).json();
  if(atual.version!==antes.version)throw Error('A apresentação mudou durante a preparação. Execute novamente para preservar a versão mais recente.');
  const boundary='conselho_'+crypto.randomUUID();
  const corpo=Buffer.concat([
    Buffer.from('--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name:'Gestão de Contratações — Apresentação ao Conselho',mimeType:'application/vnd.google-apps.presentation'})+'\r\n--'+boundary+'\r\nContent-Type: '+mime+'\r\n\r\n'),
    fs.readFileSync(arquivo),Buffer.from('\r\n--'+boundary+'--\r\n')
  ]);
  const resultado=await (await requisicao('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=multipart&fields=id,name,mimeType,version',{method:'PATCH',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:corpo})).json();
  if(resultado.id!==id||resultado.mimeType!==antes.mimeType)throw Error('Resposta de publicação inesperada. Backup: '+copia);
  for(const [tipo,nome] of [[mime,'publicado.pptx'],['application/pdf','publicado.pdf']]){
    const r=await requisicao(base+'/export?mimeType='+encodeURIComponent(tipo));fs.writeFileSync(path.join(pasta,nome),Buffer.from(await r.arrayBuffer()));
  }
  console.log(JSON.stringify({id:resultado.id,nome:resultado.name,versao:resultado.version,backup:copia,url:'https://docs.google.com/presentation/d/'+id+'/edit'}));
}
if(require.main===module){
  if(process.argv[2]!=='--publicar'||!process.argv[3])throw Error('Uso: node tools/publicar-apresentacao-conselho.cjs --publicar caminho.pptx');
  publicar(path.resolve(process.argv[3])).catch(e=>{console.error(e.message);process.exitCode=1;});
}
module.exports={publicar};
