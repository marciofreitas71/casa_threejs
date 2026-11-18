import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { Partida } from './src/jogo/partida.js';

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 8000);
const partida = new Partida();
const ouvintes = new Set();
const estaticos = new Map([['/', 'index.html'],['/index.html','index.html'],
  ['/main.js','main.js'],['/style.css','style.css']]);
const tipos = { html:'text/html; charset=utf-8', js:'text/javascript; charset=utf-8', css:'text/css; charset=utf-8' };
const assets = /^\/(?:src\/(?:jogo\/(?:alarmes|bot|cena|controles|corredor|eletrica|mapa|rede)|construcao\/(?:colisao|geometriaPortas|planta|estrutura|portas|janelas|teto)|utils)|vendor\/three\/three\.(?:core|module))\.js$/;

function json(res,status,resposta) {
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(resposta));
}

async function corpo(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('Formato inválido.');
  const pedacos=[];
  let bytes=0;
  for await (const pedaco of req) {
    bytes+=pedaco.length;
    if (bytes>2048) throw new Error('Comando longo demais.');
    pedacos.push(pedaco);
  }
  const dados=JSON.parse(Buffer.concat(pedacos));
  if (!dados || typeof dados!=='object' || Array.isArray(dados)) throw new Error('Comando inválido.');
  return dados;
}

function publicar() {
  if (!ouvintes.size) return;
  const mensagem=`data: ${JSON.stringify(partida.estado())}\n\n`;
  for (const res of ouvintes) {
    // Um celular lento não deve acumular todos os quadros na fila.
    if (res.writableLength<16_384) res.write(mensagem);
  }
}

const server=createServer(async (req,res) => {
  const path=(req.url ?? '/').split('?')[0];
  if (req.method==='GET' && path==='/api/estado') {
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform',
      'X-Accel-Buffering':'no','Connection':'keep-alive'});
    res.write(`data: ${JSON.stringify(partida.estado())}\n\n`);
    ouvintes.add(res);
    res.on('close',()=>ouvintes.delete(res));
    return;
  }
  if (req.method==='POST' && ['/api/entrar','/api/controle','/api/sair'].includes(path)) {
    try {
      const dados=await corpo(req);
      if (path==='/api/entrar') {
        const chave=partida.entrar(dados.cor,Date.now());
        if (!chave) return json(res,409,{erro:'Essa cor está ocupada. Escolha outra.'});
        publicar();
        return json(res,200,{chave});
      }
      if (path==='/api/sair') {
        partida.sair(dados.chave,Date.now());
        publicar();
        return json(res,200,{ok:true});
      }
      const agora=Date.now();
      const ok=partida.controlar(dados.chave,dados,agora);
      if (!ok) return json(res,410,{ok});
      return json(res,200,partida.dadosDoJogador(dados.chave,dados.aposAviso,agora));
    } catch {
      return json(res,400,{erro:'Comando inválido.'});
    }
  }
  if (req.method==='GET' || req.method==='HEAD') {
    const nome=estaticos.get(path) ?? (assets.test(path) ? path.slice(1) : null);
    if (nome) {
      try {
        const conteudo=await readFile(new URL(nome,import.meta.url));
        res.writeHead(200,{'Content-Type':tipos[nome.split('.').at(-1)],'Cache-Control':'no-cache'});
        res.end(req.method==='HEAD'?undefined:conteudo);
        return;
      } catch {
        return json(res,404,{erro:'Arquivo indisponível.'});
      }
    }
  }
  json(res,404,{erro:'Página inexistente.'});
});

let anterior=Date.now();
const simulacao=setInterval(()=>{
  const agora=Date.now();
  partida.passo(agora,Math.min(.065,(agora-anterior)/1000));
  anterior=agora;
},33);
const sincronizacao=setInterval(publicar,65);
server.on('close',()=>{clearInterval(simulacao);clearInterval(sincronizacao);});
server.listen(port,host,()=>{
  console.log(`Pega-pega aberto em http://localhost:${port}`);
  if (host==='127.0.0.1' || host==='localhost') return;
  for (const endereco of Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal)) {
    console.log(`Celulares no mesmo Wi-Fi: http://${endereco.address}:${port}`);
  }
});
