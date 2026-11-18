import * as THREE from '../../vendor/three/three.module.js';
import { material } from '../utils.js';

export const ESPESSURA = .14;
export const PE_DIREITO = 2.6;
const pixelsPorMetro = 61.5;

// Coordenadas traçadas na prancha rotacionada. A escala foi aferida pelos
// vãos cotados de 4,70 m da varanda e de 1,40 m das janelas.
export const metros = pixels => pixels / pixelsPorMetro;
export const ponto = ([x, z]) => [metros(x - 25), metros(z - 10)];
const retangulo = (x1, z1, x2, z2) => [[x1, z1], [x2, z1], [x2, z2], [x1, z2]];
const arcoVaranda = [
  [552, 839], [525, 852], [485, 870], [445, 886], [405, 900],
  [365, 912], [325, 923], [285, 933], [245, 940], [205, 947],
  [165, 952], [125, 956], [85, 959], [45, 961], [25, 961],
];
export const bordaVaranda = arcoVaranda.map(ponto);
export const patamar = retangulo(362, 332, 518, 378).map(ponto);

function ambiente(id, nome, icon, area, piso, perimetro, centro, forro = PE_DIREITO, entrada = centro) {
  return { id, nome, icon, area, piso, perimetro: perimetro.map(ponto), centro: ponto(centro), entrada: ponto(entrada), forro };
}

// Áreas conforme os rótulos da prancha, independentemente dos arredondamentos do traçado.
export const ambientes = [
  ambiente('sala', 'Estar e jantar', '▱', 23.14, 'porcelanato', retangulo(30, 562, 389, 808), [215, 672], PE_DIREITO, [333, 598]),
  ambiente('varanda', 'Varanda', '▱', 13.30, 'porcelanato', [[30, 817], [544, 817], ...arcoVaranda.map(([x, z]) => [Math.min(544, Math.max(30, x - 4)), z - 5]).slice(0, -1)], [229, 868], 2.30, [230, 839]),
  ambiente('cozinha', 'Cozinha', '▤', 10.69, 'ceramica', retangulo(205, 277, 352, 553), [272, 429]),
  ambiente('servico', 'Área de serviço', '▤', 5.91, 'ceramica', [[125, 150], [352, 150], [352, 269], [220, 269], [220, 220], [125, 220]], [275, 206]),
  ambiente('quartoServico', 'Quarto de serviço', '▥', 5.18, 'ceramica', retangulo(197, 18, 352, 141), [291, 79], PE_DIREITO, [277, 108]),
  ambiente('banheiroServico', 'Banheiro de serviço', '▧', 2.04, 'ceramica', retangulo(125, 18, 189, 141), [157, 108], 2.30),
  ambiente('hall', 'Hall', '▱', 1.60, 'porcelanato', retangulo(124, 478, 196, 555), [159, 522], 2.30),
  ambiente('lavabo', 'Lavabo', '▧', 1.71, 'ceramica', retangulo(35, 479, 115, 553), [82, 527], 2.30),
  ambiente('circulacao', 'Circulação', '▱', 4.81, 'porcelanato', retangulo(390, 563, 718, 619), [557, 588], 2.40),
  ambiente('suite1', 'Suíte 01', '▥', 8.15, 'porcelanato', retangulo(398, 627, 565, 808), [467, 709], PE_DIREITO, [529, 703]),
  ambiente('banheiro1', 'Banheiro da suíte 01', '▧', 3.59, 'ceramica', [[573, 627], [654, 627], [654, 809], [594, 809], [594, 756], [573, 756]], [617, 710], 2.30),
  ambiente('suite2', 'Suíte 02', '▥', 9.59, 'porcelanato', [[362, 386], [552, 386], [552, 505], [645, 505], [645, 554], [426, 554], [426, 544], [362, 544]], [452, 466], PE_DIREITO, [520, 512]),
  ambiente('banheiro2', 'Banheiro da suíte 02', '▧', 2.57, 'ceramica', [[561, 389], [655, 389], [655, 499], [561, 499]], [603, 455], 2.30),
  ambiente('suite3', 'Suíte 03', '▥', 8.67, 'porcelanato', retangulo(665, 386, 855, 555), [760, 474], PE_DIREITO, [714, 508]),
  ambiente('banheiro3', 'Banheiro da suíte 03', '▧', 3.35, 'ceramica', [[864, 386], [928, 386], [928, 443], [944, 443], [944, 554], [864, 554]], [906, 502], 2.30),
  ambiente('suiteMaster', 'Suíte master', '▥', 13.78, 'porcelanato', [[728, 564], [943, 564], [943, 842], [768, 842], [768, 619], [728, 619]], [855, 714], PE_DIREITO, [797, 620]),
  ambiente('banheiroMaster', 'Banheiro da suíte master', '▧', 4.59, 'ceramica', retangulo(662, 627, 757, 809), [715, 699], 2.30),
];

export const entradaPasseio = ponto([166, 578]);
export const contorno = [
  [115, 9], [363, 9], [363, 376], [518, 376], [518, 368], [594, 368],
  [594, 376], [961, 376], [961, 443], [952, 443], [952, 786],
  [961, 786], [961, 851], [742, 851], [742, 818], [594, 818], [594, 851],
  [543, 851], [543, 843], ...arcoVaranda.slice(1), [25, 469],
  [195, 469], [195, 376], [197, 376], [197, 271], [217, 271], [217, 224], [115, 224],
].map(ponto);

const xs = contorno.map(([x]) => x);
const zs = contorno.map(([, z]) => z);
export const largura = Math.max(...xs) - Math.min(...xs);
export const profundidade = Math.max(...zs) - Math.min(...zs);
export const centroPlanta = [Math.min(...xs) + largura / 2, Math.min(...zs) + profundidade / 2];
export const formatar = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function criarForma(perimetro) {
  const shape = new THREE.Shape();
  perimetro.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  shape.closePath();
  return shape;
}

export function criarLaje(parent, perimetro, base, espessura, acabamento) {
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(criarForma(perimetro), {
    depth: espessura, bevelEnabled: false,
  }), material(acabamento));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = base;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function acabamentoPiso(paleta, tamanho) {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = paleta.rejunte;
  ctx.fillRect(0, 0, 192, 128);
  for (let linha = 0; linha < 2; linha++) {
    for (let coluna = 0; coluna < 3; coluna++) {
      ctx.fillStyle = paleta.placas[(linha + coluna) % 3];
      ctx.fillRect(coluna * 64 + 1, linha * 64 + 1, 63, 63);
    }
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.repeat.set(1 / (3 * tamanho), 1 / (2 * tamanho));
  textura.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: textura, roughness: .72 });
}

export function criarPlanta(parent) {
  criarLaje(parent, contorno, -.22, .22, '#e0d6c6');
  criarLaje(parent, patamar, -.22, .20, '#b8bbb0');
  const pisos = {
    porcelanato: acabamentoPiso({ rejunte: '#d7ccbc', placas: ['#eee7da', '#ebe2d4', '#f0e9df'] }, .73),
    ceramica: acabamentoPiso({ rejunte: '#d1cbc1', placas: ['#e7e2d9', '#e4dfd6', '#eae4da'] }, .53),
  };
  for (const room of ambientes) {
    const floor = new THREE.Mesh(new THREE.ShapeGeometry(criarForma(room.perimetro)), pisos[room.piso]);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = .006;
    floor.receiveShadow = true;
    parent.add(floor);
  }
}
