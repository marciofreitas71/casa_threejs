import * as THREE from '../../vendor/three/three.module.js';
import { box, material, palette } from '../utils.js';
import { bordaVaranda, ESPESSURA, metros, patamar, PE_DIREITO, ponto } from './planta.js';
import { pontoParede } from './geometriaPortas.js';

export { pontoParede };

function porta(inicio, fim, id, name, hinge, swing) {
  return { inicio, fim, id, name, hinge, swing, kind: 'door', bottom: 0, top: 2.10 };
}
function janela(inicio, fim, bottom = 1.10, altura = 1.10) {
  return { inicio, fim, bottom, top: bottom + altura, kind: 'window' };
}
function parede(axis, fixa, inicio, fim, aberturas = []) {
  const [x, z] = ponto(axis === 'x' ? [inicio, fixa] : [fixa, inicio]);
  return { x, z, axis, len: metros(fim - inicio), holes: aberturas.map(({ inicio: a, fim: b, ...hole }) => ({
    ...hole, at: metros(a - inicio), w: metros(b - a),
  })) };
}
const horizontal = (z, x1, x2, aberturas) => parede('x', z, x1, x2, aberturas);
const vertical = (x, z1, z2, aberturas) => parede('z', x, z1, z2, aberturas);

export const paredes = [
  // Serviço, cozinha e acesso social.
  horizontal(14, 120, 358),
  vertical(120, 14, 224, [porta(166, 215, 'entrada-servico', 'Entrada de serviço', 'end', -1)]),
  vertical(193, 14, 146),
  horizontal(146, 120, 358, [
    porta(147, 184, 'banho-servico', 'Banheiro de serviço', 'end', -1),
    porta(253, 297, 'quarto-servico', 'Quarto de serviço', 'start', 1),
  ]),
  vertical(358, 14, 558, [janela(54, 103), janela(166, 252), janela(286, 371)]),
  horizontal(224, 120, 221),
  vertical(221, 224, 273),
  horizontal(273, 201, 358, [{ inicio: 259, fim: 314, kind: 'passage', bottom: 0, top: 2.10 }]),
  vertical(201, 273, 558, [porta(502, 546, 'cozinha', 'Cozinha', 'end', -1)]),
  horizontal(474, 26, 201, [porta(135, 185, 'entrada', 'Entrada social', 'start', -1)]),
  vertical(119, 474, 558, [porta(514, 552, 'lavabo', 'Lavabo', 'end', 1)]),
  vertical(29, 474, 875),
  horizontal(558, 29, 119),
  horizontal(558, 201, 358),

  // Fachada posterior, suítes 02 e 03 e seus banheiros.
  horizontal(381, 358, 950, [
    janela(414, 499), janela(614, 651), janela(716, 802), janela(870, 907),
  ]),
  vertical(557, 381, 501),
  horizontal(501, 557, 660, [porta(564, 601, 'banho-2', 'Banheiro da suíte 02', 'start', 1)]),
  vertical(660, 381, 559),
  vertical(859, 381, 559, [porta(515, 552, 'banho-3', 'Banheiro da suíte 03', 'end', -1)]),
  horizontal(559, 358, 950, [
    porta(562, 606, 'suite-2', 'Suíte 02', 'end', -1),
    porta(669, 713, 'suite-3', 'Suíte 03', 'start', 1),
  ]),
  vertical(948, 381, 846, [janela(607, 644, .20, 2)]),

  // Suítes voltadas à fachada principal.
  horizontal(623, 393, 763, [porta(514, 558, 'suite-1', 'Suíte 01', 'end', 1)]),
  vertical(393, 623, 813),
  vertical(569, 627, 813, [porta(633, 670, 'banho-1', 'Banheiro da suíte 01', 'start', 1)]),
  vertical(658, 623, 813),
  vertical(723, 559, 623, [porta(573, 617, 'suite-master', 'Suíte master', 'start', 1)]),
  vertical(763, 623, 846, [porta(633, 670, 'banho-master', 'Banheiro da suíte master', 'start', -1)]),
  horizontal(813, 393, 763, [janela(445, 519, .20, 2), janela(595, 632), janela(698, 735)]),
  horizontal(846, 763, 948, [janela(818, 892, .20, 2)]),

  horizontal(813, 29, 393, [
    { inicio: 75, fim: 364, kind: 'slide', id: 'varanda', name: 'Porta de correr da varanda', bottom: 0, top: 2.20 },
  ]),
];

export const pilares = [
  [25, 488, 34, 563], [310, 267, 363, 284], [352, 544, 426, 563],
  [518, 368, 595, 389], [644, 499, 663, 563], [928, 376, 961, 443],
  [25, 809, 50, 872], [543, 808, 594, 851], [742, 808, 767, 851],
  [943, 786, 961, 851],
];

function criarGradil(parent, pontos, altura) {
  for (let i = 1; i < pontos.length; i++) {
    const [x1, z1] = pontos[i - 1];
    const [x2, z2] = pontos[i];
    const x = (x1 + x2) / 2;
    const z = (z1 + z2) / 2;
    const comprimento = Math.hypot(x2 - x1, z2 - z1);
    const angulo = -Math.atan2(z2 - z1, x2 - x1);
    box(parent, comprimento + .035, .20, .095, x, .10, z, '#dcd9cc').rotation.y = angulo;
    box(parent, comprimento + .02, .038, .055, x, altura, z, '#5e7069').rotation.y = angulo;
    box(parent, .035, altura - .18, .035, x2, (altura + .20) / 2, z2, '#5e7069');
    box(parent, comprimento, altura - .24, .017, x, (altura + .20) / 2, z, '#b2d0c9',
      { transparent: true, opacity: .38, depthWrite: false }).rotation.y = angulo;
  }
}

function caixaColisao(x, z, w, d) {
  return { minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 };
}

export function colisoresDasParedes(linhas) {
  const resultado = [];
  for (const wall of linhas) {
    let cursor = 0;
    const adicionar = (a, b) => {
      if (b - a < .0001) return;
      const { x, z } = pontoParede(wall, (a + b) / 2);
      resultado.push(caixaColisao(x, z, wall.axis === 'x' ? b - a : ESPESSURA,
        wall.axis === 'z' ? b - a : ESPESSURA));
    };
    for (const hole of wall.holes) {
      if (hole.kind === 'window' || hole.kind === 'fixed') continue;
      adicionar(cursor, hole.at);
      cursor = hole.at + hole.w;
    }
    adicionar(cursor, wall.len);
  }
  return resultado;
}

export function criarEstrutura(parent, {
  linhas = paredes,
  colunas = pilares.map(([x1,z1,x2,z2]) => [...ponto([x1,z1]), ...ponto([x2,z2])]),
  gradisPlanta = [bordaVaranda, [patamar[0], patamar[1], patamar[2]]],
  vistaPlanta = true,
} = {}) {
  const walls = new THREE.Group();
  const gradis = new THREE.Group();
  const corte = new THREE.Group();
  const vergas = new THREE.Group();
  walls.add(vergas);
  parent.add(walls, corte, gradis);
  const colliders = colisoresDasParedes(linhas);
  const materiaisPorFace = new Map();
  for (const wall of linhas) {
    const [facePositiva, faceNegativa] = wall.facesInternas ?? [];
    const cor = facePositiva || faceNegativa ? wall.tinta : palette.wall;
    let materiais;
    if (facePositiva !== faceNegativa) {
      // A BoxGeometry ordena as faces em pares +X, -X, +Y, -Y, +Z, -Z.
      const faceExterna = (wall.axis === 'x' ? 4 : 0) + Number(facePositiva);
      const chave = `${cor}/${faceExterna}`;
      if (!materiaisPorFace.has(chave)) {
        const faces = Array(6).fill(material(cor));
        faces[faceExterna] = material(palette.wall);
        materiaisPorFace.set(chave, faces);
      }
      materiais = materiaisPorFace.get(chave);
    }
    function segmento(start, end, bottom = 0, top = PE_DIREITO) {
      if (end <= start || top <= bottom) return;
      const { x, z } = pontoParede(wall, (start + end) / 2);
      const w = wall.axis === 'x' ? end - start : ESPESSURA;
      const d = wall.axis === 'z' ? end - start : ESPESSURA;
      const parede = box(bottom > 0 ? vergas : walls, w, top - bottom, d, x, (top + bottom) / 2, z, cor);
      if (materiais) parede.material = materiais;
      if (bottom === 0) box(walls, w + .008, .09, d + .008, x, .045, z, palette.trim);
      if (vistaPlanta && bottom === 0 && top === PE_DIREITO) {
        box(corte, w, .05, d, x, .025, z, '#8d9487');
      }
    }
    let cursor = 0;
    for (const hole of wall.holes) {
      const end = hole.at + hole.w;
      segmento(cursor, hole.at);
      segmento(hole.at, end, 0, hole.bottom);
      segmento(hole.at, end, hole.top, PE_DIREITO);
      cursor = end;
    }
    segmento(cursor, wall.len);
  }
  for (const [x1, z1, x2, z2] of colunas) {
    const x = (x1 + x2) / 2;
    const z = (z1 + z2) / 2;
    const w = x2 - x1;
    const d = z2 - z1;
    box(walls, w, PE_DIREITO, d, x, PE_DIREITO / 2, z, '#e2e1d7');
    colliders.push(caixaColisao(x, z, w, d));
    if (vistaPlanta) box(corte, w, .07, d, x, .035, z, '#798477');
  }
  for (const pontos of gradisPlanta) criarGradil(gradis, pontos, 1.10);
  return { walls, colliders, gradis, corte, vergas };
}
