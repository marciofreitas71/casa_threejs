import * as THREE from 'three';
import { ambientes, contorno, criarLaje, PE_DIREITO } from './planta.js';

export function criarTeto(parent) {
  const teto = new THREE.Group();
  criarLaje(teto, contorno, PE_DIREITO, .16, '#f6f3e9');
  for (const room of ambientes) {
    if (room.forro < PE_DIREITO) {
      criarLaje(teto, room.perimetro, room.forro, PE_DIREITO - room.forro, '#f6f3e9');
    }
  }
  teto.visible = false;
  parent.add(teto);
  return teto;
}
