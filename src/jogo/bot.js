import { livre, portaAoAlcance, RAIO, trajetoLivre } from './mapa.js';
import { encostaNaPorta } from '../construcao/geometriaPortas.js';

const passo=.24;
const direcoes=[[1,0],[-1,0],[0,1],[0,-1]];

function procurar(bot,progresso,valor,limite) {
  const raiz={x:bot.x,z:bot.z,i:0,j:0,anterior:null,passos:0};
  const fila=[raiz];
  const visitados=new Set(['0,0']);
  let melhor=raiz, nota=valor(raiz);
  for (let i=0;i<fila.length && i<850 && nota> -Infinity;i++) {
    const p=fila[i];
    const atual=valor(p);
    if (atual<nota) {melhor=p;nota=atual;}
    if (p.passos>=limite || nota===-Infinity) continue;
    for (const [dx,dz] of direcoes) {
      const ix=p.i+dx, iz=p.j+dz;
      const chave=`${ix},${iz}`;
      if (visitados.has(chave)) continue;
      const x=raiz.x+ix*passo, z=raiz.z+iz*passo;
      if (!livre(x,z,progresso)) continue;
      visitados.add(chave);
      fila.push({x,z,i:ix,j:iz,anterior:p,passos:p.passos+1});
    }
  }
  const rota=[];
  for (let p=melhor;p?.anterior;p=p.anterior) rota.push([p.x,p.z]);
  return { rota:rota.reverse(), encontrou:nota===-Infinity };
}

export function rotaBot(bot,pessoa,progresso,fugir) {
  if (!fugir && trajetoLivre(bot.x,bot.z,pessoa.x,pessoa.z,progresso)) return [[pessoa.x,pessoa.z]];
  const valor=p=>{
    const d=Math.hypot(p.x-pessoa.x,p.z-pessoa.z);
    if (!fugir && d<.31) return -Infinity;
    return (fugir?-d:d)+p.passos*(fugir?.086:.021);
  };
  return procurar(bot,progresso,valor,fugir?15:Infinity).rota;
}

export function portaNaRota(bot,rota,portas) {
  if (!portas.length) return;
  let {x,z}=bot;
  for (const [tx,tz] of rota) {
    const dx=tx-x, dz=tz-z;
    const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
    for (let i=1;i<=n;i++) {
      const a=x+dx*i/n, b=z+dz*i/n;
      const porta=portas.find(p=>encostaNaPorta(p,a,b,p.progresso,RAIO));
      if (porta) return porta;
    }
    x=tx;
    z=tz;
  }
}

export function rotaAtePorta(bot,porta,progresso) {
  const valor=p=>{
    if (!portaAoAlcance(porta,p.x,p.z,progresso)) return 0;
    // O bot espera a folha girar a partir de uma posição fora da varredura.
    for (let t=0;t<=1;t+=.125) {
      if (encostaNaPorta(porta,p.x,p.z,t,RAIO+.020)) return 0;
    }
    return -Infinity;
  };
  return procurar(bot,progresso,valor,17);
}
