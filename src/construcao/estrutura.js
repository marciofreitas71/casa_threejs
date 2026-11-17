import * as THREE from 'three';
import { box, palette } from '../utils.js';
import { ESPESSURA as T, PE_DIREITO as H } from './planta.js';

// Walls run along x (horizontal in plan) or z (vertical in plan).
// Opening offsets are relative to the start of each wall.
export const paredes = [
  { x:1.58,z:-.07,len:9.01,axis:'x',holes:[{at:.05,w:.8,kind:'door',id:'cozinha',name:'Cozinha',hinge:'start',swing:-1},{at:1.35,w:1.2,kind:'window'},{at:3.27,w:.7,kind:'high'},{at:4.71,w:.7,kind:'high'},{at:6.65,w:1.55,kind:'window'}] },
  { x:1.58,z:0,len:2.47,axis:'z' },
  { x:0,z:2.47,len:1.58,axis:'x',holes:[{at:.15,w:.9,kind:'door',id:'sala',name:'Entrada da sala',hinge:'start',swing:-1}] },
  { x:-.07,z:2.47,len:3.99,axis:'z',holes:[{at:1.25,w:1.35,kind:'window'}] },
  { x:0,z:6.46,len:9.4,axis:'x',holes:[{at:.55,w:1.4,kind:'window'},{at:3.7,w:1.3,kind:'window'},{at:7,w:1.3,kind:'window'}] },
  { x:9.4,z:3.62,len:2.84,axis:'z' },
  { x:7.45,z:3.62,len:3.14,axis:'x' },
  { x:10.59,z:0,len:3.62,axis:'z',holes:[{at:1.1,w:1.4,kind:'window'}] },
  { x:4.57,z:0,len:2.47,axis:'z' },
  { x:6.01,z:0,len:2.47,axis:'z' },
  { x:7.45,z:0,len:3.62,axis:'z',holes:[{at:2.62,w:.88,kind:'door',id:'quarto1',name:'Quarto 01',hinge:'end',swing:-1}] },
  { x:4.57,z:2.47,len:1.44,axis:'x',holes:[{at:.08,w:.75,kind:'door',id:'banheiro1',name:'Banheiro 01',hinge:'start',swing:1}] },
  { x:6.01,z:2.47,len:1.44,axis:'x',holes:[{at:.08,w:.75,kind:'door',id:'banheiro2',name:'Banheiro 02',hinge:'start',swing:1}] },
  { x:2.92,z:3.62,len:3.14,axis:'x',holes:[{at:2.06,w:.88,kind:'door',id:'quarto2',name:'Quarto 02',hinge:'end',swing:1}] },
  { x:6.06,z:3.62,len:3.34,axis:'x',holes:[{at:.12,w:.88,kind:'door',id:'quarto3',name:'Quarto 03',hinge:'start',swing:-1}] },
  { x:2.92,z:3.62,len:2.84,axis:'z' },
  { x:6.06,z:3.62,len:2.84,axis:'z' },
];
export function pontoParede(wall, offset) { return { x:wall.x+(wall.axis==='x'?offset:0), z:wall.z+(wall.axis==='z'?offset:0) }; }
export function criarEstrutura(parent) {
  const walls = new THREE.Group(); parent.add(walls); const colliders = [];
  for (const wall of paredes) {
    const segment = (start,end,bottom=0,top=H) => {
      if(end<=start || top<=bottom) return;
      const p = pontoParede(wall,(start+end)/2); const w = wall.axis==='x'?end-start:T; const d = wall.axis==='z'?end-start:T;
      box(walls,w,top-bottom,d,p.x,(top+bottom)/2,p.z,palette.wall);
      if(bottom<1.7 && top>.2) colliders.push({minX:p.x-w/2,maxX:p.x+w/2,minZ:p.z-d/2,maxZ:p.z+d/2});
      if(bottom===0) box(walls,w+.008,.09,d+.008,p.x,.045,p.z,palette.trim);
    };
    let cursor=0;
    for(const hole of wall.holes??[]) { segment(cursor,hole.at); const sill=hole.kind==='door'?0:hole.kind==='high'?1.8:.95; const top=hole.kind==='door'?2.15:hole.kind==='high'?2.35:2.2; segment(hole.at,hole.at+hole.w,0,sill); segment(hole.at,hole.at+hole.w,top,H); cursor=hole.at+hole.w; }
    segment(cursor,wall.len);
  }
  return { walls, colliders };
}
