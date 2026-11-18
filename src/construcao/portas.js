import * as THREE from '../../vendor/three/three.module.js';
import { box, group } from '../utils.js';
import { paredes } from './estrutura.js';
import { distanciaDaPorta, listarPortas, paineisDeCorrer, parametrosGiro, podeAcionarPorta,
  pontoParede, portaPerto } from './geometriaPortas.js';

export { distanciaDaPorta, folhasDaPorta } from './geometriaPortas.js';

export function selecionarPorta(raio,portas,jogador,progresso,visivel) {
  const origem=raio.ray.origin;
  let selecao;
  for (const porta of portas) {
    if (!portaPerto(porta,origem.x,origem.z,1.25)
      || !podeAcionarPorta(porta,jogador.x,jogador.z,progresso,visivel)) continue;
    porta.frame.updateWorldMatrix(true,true);
    const toque=raio.intersectObjects(porta.alvos,false)[0];
    if (toque && (!selecao || toque.distance<selecao.distancia)
      && visivel(origem.x,origem.z,toque.point.x,toque.point.z,progresso,porta.id)) {
      selecao={id:porta.id,tipo:'porta',nome:porta.nome,distancia:toque.distance};
    }
  }
  return selecao;
}

function criarPortaGiro(frame, wall, hole) {
  const { hinge, closed, swing } = parametrosGiro(wall, hole);
  const { folha = '#d1b48e', marco = '#c1ab8d' } = hole.acabamento ?? {};
  const base = hole.bottom ?? 0;
  const h = hole.top - base;
  const leaf = group(frame, hinge, 0, closed);
  box(leaf, hole.w - .04, h - .05, .04, hole.w / 2, base + (h - .05) / 2, 0, folha);
  for (const side of [-1, 1]) box(leaf, .11, .025, .065, hole.w - .14, base + Math.min(.98,h/2), side * .045, '#657267');
  for (const x of [0, hole.w]) box(frame, .04, h, .17, x, base + h / 2, 0, marco);
  box(frame, hole.w, .04, .17, hole.w / 2, hole.top, 0, marco);

  const points = Array.from({ length: 29 }, (_, i) => {
    const a = closed + swing * i / 28;
    return new THREE.Vector3(hinge + Math.cos(a) * hole.w, 0, -Math.sin(a) * hole.w);
  });
  const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({
    color: '#7b7157', dashSize: .055, gapSize: .04, transparent: true, opacity: .65,
  }));
  arc.computeLineDistances();
  frame.add(arc);

  return {
    arc,
    alvos: leaf.children,
    pose(progress) { leaf.rotation.y = closed + swing * progress; },
    distance(x, z, progress) { return distanciaDaPorta(wall, hole, x, z, progress); },
  };
}

function criarPortaCorrer(frame, wall, hole) {
  const moldura = '#667971';
  const base = hole.bottom ?? 0;
  const h = hole.top - base;
  const folhas = paineisDeCorrer(hole).map(({w,offset,deslocamento,track}) => {
    const leaf = group(frame, offset, track);
    box(leaf, w, h - .06, .023, w / 2, base + h / 2, 0, '#b4d4d1',
      { transparent: true, opacity: .32, depthWrite: false });
    for (const x of [0, w]) box(leaf, .037, h, .041, x, base + h / 2, 0, moldura);
    for (const y of [base + .028, hole.top - .028]) box(leaf, w, .045, .041, w / 2, y, 0, moldura);
    return { leaf, offset, deslocamento, track };
  });
  for (const y of [base + .015, hole.top]) box(frame, hole.w, .03, .14, hole.w / 2, y, 0, moldura);
  return {
    arc: null,
    alvos: folhas.flatMap(({leaf})=>leaf.children),
    pose(progress) {
      for (const { leaf, offset, deslocamento } of folhas) leaf.position.x = offset + deslocamento * progress;
    },
    distance(x, z, progress) { return distanciaDaPorta(wall, hole, x, z, progress); },
  };
}

export function criarPortas(parent, linhas = paredes) {
  const all = new THREE.Group();
  parent.add(all);
  const items = [];
  for (const porta of listarPortas(linhas)) {
    const {wall,hole}=porta;
    const start = pontoParede(wall, hole.at);
    const base = wall.axis === 'z' ? -Math.PI / 2 : 0;
    const frame = group(all, start.x, start.z, base);
    const movimento = hole.kind === 'slide' ? criarPortaCorrer(frame, wall, hole) : criarPortaGiro(frame, wall, hole);
    items.push({ ...porta, ...movimento, frame, name: porta.nome, progress: 0, open: false,
      blocked: false, center: {x:porta.x,z:porta.z} });
  }
  return {
    group: all, items,
    toggle(door) { door.open = !door.open; door.blocked = false; },
    collides(x, z, radius = .17) {
      return items.some(door => door.distance(x, z, door.progress) < radius + .035);
    },
    nearest(position) {
      return items.map(door => ({ door, distancia: Math.hypot(position.x - door.center.x, position.z - door.center.z) }))
        .filter(item => item.distancia < 1.7)
        .sort((a, b) => a.distancia - b.distancia)[0]?.door;
    },
    update(delta, person = null) {
      for (const door of items) {
        door.blocked = false;
        const target = Number(door.open);
        const start = door.progress;
        const end = THREE.MathUtils.clamp(target, start - Math.min(delta, .05) * 1.3, start + Math.min(delta, .05) * 1.3);
        if (start === end) continue;
        for (let i = 1; i <= 8; i++) {
          const next = THREE.MathUtils.lerp(start, end, i / 8);
          if (person && door.distance(person.x, person.z, next) < .215) {
            door.blocked = true;
            break;
          }
          door.progress = next;
        }
        door.pose(door.progress);
      }
    },
  };
}
