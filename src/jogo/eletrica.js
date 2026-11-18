import { ponto } from '../construcao/planta.js';
import { salas, transformar } from './mapa.js';

// As tomadas das pranchas não são comandos. Os interruptores do jogo ficam
// perto dos acessos, enquanto os pontos de luz seguem as plantas em PDF.
const lateral = Math.PI / 2;
const pontos = {
  sala: [34,736,lateral], varanda: [65,818,0], cozinha: [206,489,lateral],
  servico: [247,268,Math.PI], quartoServico: [311,141,Math.PI],
  banheiroServico: [188,133,-lateral], hall: [190,479,0], lavabo: [114,503,-lateral],
  circulacao: [456,564,0], suite1: [503,628,0], banheiro1: [574,688,lateral],
  suite2: [551,554,Math.PI], banheiro2: [623,496,Math.PI], suite3: [725,554,Math.PI],
  banheiro3: [864,502,lateral], suiteMaster: [768,688,lateral], banheiroMaster: [758,687,-lateral],
};

export const circuitos = salas.map(sala => {
  const [px,pz,giro] = pontos[sala.id.split('/')[1]];
  const [x,z] = transformar(sala.unidade,ponto([px,pz]));
  return { ...sala, comando: {
    id: `luz/${sala.id}`, alvo: sala.id, tipo: 'luz', nome: sala.nome, x,z,y:1.15,
    nx: Math.sin(giro)*sala.unidade.sx, nz: Math.cos(giro)*sala.unidade.sz,
  }};
});

export function luminarias(circuito) {
  const pontos = [{ x:circuito.centro[0], z:circuito.centro[1], largura:.38, profundidade:.38 }];
  if (!circuito.id.endsWith('/suiteMaster')) return pontos;
  for (const coord of [[795,694],[795,732],[795,770]]) {
    const [x,z] = transformar(circuito.unidade,ponto(coord));
    pontos.push({ x,z,largura:.11,profundidade:.11 });
  }
  for (const coord of [[912,720],[912,782]]) {
    const [x,z] = transformar(circuito.unidade,ponto(coord));
    pontos.push({ x,z,largura:.92,profundidade:.045 });
  }
  return pontos;
}
