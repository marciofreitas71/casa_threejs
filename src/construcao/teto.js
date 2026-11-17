import * as THREE from 'three';
import { material } from '../utils.js';
import { contorno, PE_DIREITO } from './planta.js';

export function criarTeto(parent) {
  const shape = new THREE.Shape();
  contorno.forEach(([x,z],i)=>i ? shape.lineTo(x,-z) : shape.moveTo(x,-z));
  shape.closePath();
  const teto = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false}),material('#f6f3e9'));
  teto.rotation.x=-Math.PI/2;
  teto.position.y=PE_DIREITO;
  teto.castShadow=true;
  teto.receiveShadow=true;
  teto.visible=false;
  parent.add(teto);
  return teto;
}
