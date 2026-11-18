import { livre, pontosInicio, trajetoLivre } from './mapa.js';

const distancia = 2;
const passo = .24;
const vizinhos = [[1,0],[-1,0],[0,1],[0,-1]];

export function separarDepoisDoToque(pegador, pego, atores, progresso) {
  const dx=pego.x-pegador.x, dz=pego.z-pegador.z;
  const angulo=Math.hypot(dx,dz)>.02 ? Math.atan2(dz,dx) : Math.atan2(pego.dz ?? 0,pego.dx ?? 0);
  const cabem=(x,z)=>livre(x,z,progresso)
    && atores.every(p=>p===pego || Math.hypot(p.x-x,p.z-z)>=.55);
  const ponto=(raio,a)=>({x:pegador.x+Math.cos(a)*raio,z:pegador.z+Math.sin(a)*raio});

  function opcoes(raio) {
    const lados=Math.ceil(raio*Math.PI/.19);
    const alternativas=[ponto(raio,angulo)];
    for (let i=1;i<=lados;i++) {
      const desvio=i*Math.PI/lados;
      alternativas.push(ponto(raio,angulo+desvio),ponto(raio,angulo-desvio));
    }
    return alternativas.filter(p=>cabem(p.x,p.z));
  }

  const destinos=opcoes(distancia);
  const emLinha=destinos.find(p=>trajetoLivre(pego.x,pego.z,p.x,p.z,progresso));
  if (emLinha) return emLinha;

  // Prefere os lugares a dois metros que se alcançam pelo mesmo espaço,
  // inclusive quando é necessário contornar um batente ou virar um canto.
  if (destinos.length) {
    const fila=[[0,0]];
    const vistos=new Set(['0,0']);
    for (let i=0;i<fila.length;i++) {
      const [a,b]=fila[i];
      const x=pego.x+a*passo, z=pego.z+b*passo;
      const perto=destinos.find(p=>Math.hypot(x-p.x,z-p.z)<.29 && trajetoLivre(x,z,p.x,p.z,progresso));
      if (perto) return perto;
      for (const [u,v] of vizinhos) {
        const j=a+u, k=b+v;
        if (Math.abs(j)+Math.abs(k)>18) continue;
        const id=`${j},${k}`;
        if (vistos.has(id)) continue;
        if (!trajetoLivre(x,z,pego.x+j*passo,pego.z+k*passo,progresso)) continue;
        vistos.add(id);
        fila.push([j,k]);
      }
    }
    // Um cômodo pequeno e trancado pode não ter dois metros livres.
    // A reposição usa o piso vizinho sem girar a folha ou liberar a trava.
    return destinos[0];
  }

  for (let raio=distancia+.25;raio<=9;raio+=.25) {
    const [disponivel]=opcoes(raio);
    if (disponivel) return disponivel;
  }
  const inicio=pontosInicio.find(([x,z])=>Math.hypot(pegador.x-x,pegador.z-z)>=distancia && cabem(x,z));
  return inicio && {x:inicio[0],z:inicio[1]};
}
