import * as THREE from 'three';
import { box, group } from '../utils.js';
import { paredes, pontoParede } from './estrutura.js';

export function criarJanelas(parent, linhas = paredes, vistaPlanta = true) {
  const completas = new THREE.Group();
  const planta = new THREE.Group();
  parent.add(completas, planta);
  for (const wall of linhas) for (const hole of wall.holes) {
    if (hole.kind !== 'window') continue;
    const { x, z } = pontoParede(wall, hole.at + hole.w / 2);
    const rotation = wall.axis === 'z' ? Math.PI / 2 : 0;
    const frame = group(completas, x, z, rotation);
    const { bottom, top } = hole;
    const height = top - bottom;
    box(frame, hole.w, height, .025, 0, bottom + height / 2, 0, '#b4d4d1',
      { transparent: true, opacity: .30, roughness: .12, depthWrite: false });
    for (const x of [-hole.w / 2, 0, hole.w / 2]) box(frame, .035, height, .07, x, bottom + height / 2, 0, '#6c796f');
    for (const y of [bottom, top]) box(frame, hole.w, .04, .09, 0, y, 0, '#6c796f');
    box(frame, hole.w + .07, .045, .20, 0, bottom, 0, '#d5d6cb');

    if (!vistaPlanta) continue;
    const symbol = group(planta, x, z, rotation);
    box(symbol, hole.w, .016, .105, 0, .019, 0, '#a7c1ba').castShadow = false;
    box(symbol, hole.w, .018, .018, 0, .027, 0, '#6c796f').castShadow = false;
  }
  return { completas, planta };
}
