import { box, cylinder, group, plant } from '../utils.js';
import { ponto } from './planta.js';
import { criarPoltrona, criarPufe, criarSofa } from '../sala/sofa.js';
import { criarRack } from '../sala/rack.js';
import { criarBancada } from '../cozinha/bancada.js';
import { criarPia } from '../cozinha/pia.js';
import { criarFogao } from '../cozinha/fogao.js';
import { criarGeladeira } from '../cozinha/geladeira.js';
import { criarBanqueta, criarMesa, criarMesaVaranda } from '../cozinha/mesa.js';
import { criarBicama, criarCama } from '../quartos/cama.js';
import { criarGuardaRoupa } from '../quartos/guardaRoupa.js';
import { criarCriadoMudo } from '../quartos/criadoMudo.js';
import { criarEscrivaninha } from '../quartos/escrivaninha.js';
import { criarVaso } from '../banheiros/vaso.js';
import { criarPiaBanheiro } from '../banheiros/pia.js';
import { criarChuveiro } from '../banheiros/chuveiro.js';

function tapete(parent, x, z, largura, profundidade) {
  box(parent, largura, .014, profundidade, x, .014, z, '#bcaa8c');
  box(parent, largura - .11, .014, profundidade - .11, x, .019, z, '#daceb8');
}

function mesaCentro(parent, x, z) {
  const g = group(parent, x, z);
  box(g, .63, .065, 1.18, 0, .35, 0, '#aba396');
  box(g, .43, .30, .93, 0, .16, 0, '#9b9284');
  cylinder(g, .122, .032, -.06, .397, .29, '#e2d5bf');
  cylinder(g, .052, .105, -.03, .464, .27, '#8d7258', .035);
  return g;
}

function painelTV(parent, x, z, rotation) {
  const g = group(parent, x, z, rotation);
  box(g, 1.35, .85, .09, 0, 1.16, 0, '#b08b60');
  box(g, 1.04, .59, .045, 0, 1.19, .071, '#303230');
  return g;
}

export function criarMobiliario(parent) {
  const furniture = group(parent);
  const colocar = (criar, x, z, ...args) => criar(furniture, ...ponto([x, z]), ...args);
  const lateral = Math.PI / 2;

  // Estar e jantar, com o rack entre os dois usos.
  colocar(tapete, 115, 688, 2.62, 3.30);
  colocar(criarSofa, 63, 687, lateral, 2.20);
  colocar(criarPufe, 52, 603);
  colocar(criarPufe, 80, 603);
  colocar(criarPoltrona, 131, 604, -Math.PI / 5);
  colocar(criarPoltrona, 133, 778, Math.PI);
  colocar(mesaCentro, 136, 692);
  colocar(criarRack, 197, 688, -lateral);
  colocar(criarCriadoMudo, 61, 785);
  colocar(criarMesa, 304, 688);

  // Varanda, com bancada lateral, mesa redonda e poltrona voltada para a curva.
  colocar(criarBancada, 53, 917, 1.24, lateral, '#e6dfd2');
  colocar(criarPia, 53, 939, lateral);
  colocar(criarMesaVaranda, 188, 886);
  colocar(criarPoltrona, 370, 855, -Math.PI / 3);
  colocar(criarPufe, 323, 884, -Math.PI / 3, .63);
  colocar(plant, 427, 845, .94);
  colocar(plant, 467, 840, 1.25);
  colocar(plant, 417, 871, .78);

  // Cozinha com duas bancadas e área de serviço ao fundo.
  colocar(criarBancada, 331, 371, 2.64, -lateral);
  colocar(criarPia, 331, 345, -lateral);
  colocar(criarBancada, 331, 475, .70, -lateral);
  colocar(criarGeladeira, 328, 526, -lateral);
  colocar(criarBancada, 224, 294, .43, lateral, '#c5c5bf');
  colocar(criarFogao, 224, 326).rotation.y = lateral;
  colocar(criarBancada, 224, 416, 2.30, lateral, '#c5c5bf');
  colocar(criarBanqueta, 262, 429);
  colocar(criarBanqueta, 262, 472);
  colocar(criarBancada, 331, 177, .90, -lateral);
  colocar(criarPia, 331, 177, -lateral);
  const [maquinaX, maquinaZ] = ponto([331, 221]);
  box(furniture, .60, .85, .61, maquinaX, .437, maquinaZ, '#d7d9d7');
  box(furniture, .028, .39, .44, maquinaX - .31, .45, maquinaZ, '#acb1ae');
  colocar(criarCama, 259, 47, .89, lateral);
  colocar(criarGuardaRoupa, 333, 79, 1.91, -lateral);
  colocar(criarEscrivaninha, 217, 109, .67, lateral);

  // Suítes com bicamas, marcenaria e escrivaninhas da referência.
  colocar(tapete, 464, 718, 1.84, 2.20);
  colocar(criarBicama, 431, 718);
  colocar(criarCriadoMudo, 428, 645, false);
  colocar(criarCriadoMudo, 428, 792);
  colocar(criarEscrivaninha, 548, 709, .94, -lateral);
  colocar(criarGuardaRoupa, 546, 779, .86, -lateral);

  colocar(criarBicama, 427, 513, lateral);
  colocar(criarGuardaRoupa, 382, 434, 1.44, lateral);
  colocar(criarEscrivaninha, 528, 435, 1.46, -lateral);

  colocar(criarBicama, 825, 449, Math.PI);
  colocar(criarGuardaRoupa, 686, 424, 1.17, lateral);
  colocar(criarEscrivaninha, 686, 484, .73, lateral);
  colocar(criarCriadoMudo, 793, 405, false);
  colocar(painelTV, 787, 551, Math.PI);

  // Suíte master, com o armário na entrada e a cama contra a fachada.
  colocar(tapete, 858, 733, 2.10, 2.64);
  colocar(criarCama, 877, 733, 1.64, -lateral);
  colocar(criarCriadoMudo, 926, 650, false);
  colocar(criarCriadoMudo, 926, 821);
  colocar(criarGuardaRoupa, 875, 583, 2.18);
  colocar(painelTV, 772, 726, lateral);

  colocar(criarChuveiro, 157, 44, 1.00);
  colocar(criarVaso, 145, 83, lateral);
  colocar(criarPiaBanheiro, 143, 123, lateral);
  colocar(criarVaso, 95, 498, 0);
  colocar(criarPiaBanheiro, 50, 530, lateral);
  colocar(criarChuveiro, 625, 782, .90).rotation.y = Math.PI;
  colocar(criarVaso, 635, 733, -lateral);
  colocar(criarPiaBanheiro, 635, 651, -lateral);
  colocar(criarChuveiro, 632, 426, 1.17).rotation.y = -lateral;
  colocar(criarVaso, 586, 412, 0);
  colocar(criarPiaBanheiro, 637, 476, -lateral);
  colocar(criarChuveiro, 910, 415, 1.04);
  colocar(criarVaso, 925, 469, -lateral);
  colocar(criarPiaBanheiro, 927, 527, -lateral);
  colocar(criarChuveiro, 708, 784, 1.46).rotation.y = Math.PI;
  colocar(criarVaso, 736, 736, -lateral);
  colocar(criarPiaBanheiro, 681, 651, lateral);
  colocar(criarPiaBanheiro, 681, 702, lateral);
  return furniture;
}
