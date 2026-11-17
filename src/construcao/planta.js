import * as THREE from 'three';
import { box, material } from '../utils.js';

// Interior dimensions from the supplied image. One world unit equals one meter.
export const ESPESSURA = .14;
export const PE_DIREITO = 2.7;
export const ambientes = [
  { id: 'sala', nome: 'Sala', tipo: 'Estar e convivência', icon: '▱', x: 0, z: 2.54, w: 2.85, d: 3.85, label: [1.12, 4.7], entrada: [1.2, 3.6] },
  { id: 'cozinha', nome: 'Cozinha', tipo: 'Cozinha e refeições', icon: '▤', x: 1.65, z: 0, w: 2.85, d: 2.4, label: [3.55, 1.65], entrada: [3.8, 2] },
  { id: 'quarto1', nome: 'Quarto 01', tipo: 'Quarto principal', icon: '▥', x: 7.52, z: 0, w: 3, d: 3.55, label: [8.8, 2.5], entrada: [8.2, 2.7] },
  { id: 'quarto2', nome: 'Quarto 02', tipo: 'Quarto de solteiro', icon: '▥', x: 2.99, z: 3.69, w: 3, d: 2.7, label: [4.3, 4.75], entrada: [5.4, 4.3] },
  { id: 'quarto3', nome: 'Quarto 03', tipo: 'Quarto de solteiro', icon: '▥', x: 6.13, z: 3.69, w: 3.2, d: 2.7, label: [7.7, 4.75], entrada: [6.7, 4.3] },
  { id: 'banheiro1', nome: 'Banheiro 01', tipo: 'Banheiro social', icon: '▧', x: 4.64, z: 0, w: 1.3, d: 2.4, label: [5.29, 1.05], entrada: [5.1, 1.8] },
  { id: 'banheiro2', nome: 'Banheiro 02', tipo: 'Banheiro social', icon: '▧', x: 6.08, z: 0, w: 1.3, d: 2.4, label: [6.73, 1.05], entrada: [6.5, 1.8] },
];
export const contorno = [[1.51,-.14],[10.66,-.14],[10.66,3.69],[9.47,3.69],[9.47,6.53],[-.14,6.53],[-.14,2.4],[1.51,2.4]];
export const formatar = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function criarPlanta(parent) {
  const shape = new THREE.Shape(); contorno.forEach(([x,z], i) => i ? shape.lineTo(x,-z) : shape.moveTo(x,-z)); shape.closePath();
  const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .22, bevelEnabled: false }), material('#d4cfc0'));
  slab.rotation.x = -Math.PI / 2; slab.position.y = -.22; slab.receiveShadow = true; slab.castShadow = true; parent.add(slab);
  const floor = new THREE.Mesh(new THREE.ShapeGeometry(shape), material('#d8c5aa')); floor.rotation.x = -Math.PI / 2; floor.position.y = .003; floor.receiveShadow = true; parent.add(floor);
  for (const room of ambientes) {
    const tiled = room.id.startsWith('banheiro') || room.id === 'cozinha';
    box(parent,room.w,.025,room.d,room.x+room.w/2,.015,room.z+room.d/2,tiled ? '#e0e1d5' : '#c9aa83');
    const points = []; const step = tiled ? .4 : .17;
    for (let z = step; z < room.d; z += step) points.push(new THREE.Vector3(room.x,.031,room.z+z),new THREE.Vector3(room.x+room.w,.031,room.z+z));
    for (let row = 0; row < room.d / step; row++) {
      const spacing = tiled ? .4 : .95;
      for (let x = tiled ? spacing : (row % 3) * .31 + .15; x < room.w; x += spacing) points.push(new THREE.Vector3(room.x+x,.031,room.z+row*step),new THREE.Vector3(room.x+x,.031,room.z+Math.min((row+1)*step,room.d)));
    }
    const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({ color:tiled ? '#babfb0' : '#947b58', transparent:true, opacity:.28 })); parent.add(lines);
  }
}
