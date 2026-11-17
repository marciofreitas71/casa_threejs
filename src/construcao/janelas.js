import * as THREE from 'three';
import { box, group } from '../utils.js';
import { paredes, pontoParede } from './estrutura.js';
export function criarJanelas(parent) {
  const all = new THREE.Group(); parent.add(all);
  for(const wall of paredes) for(const hole of wall.holes??[]) {
    if(hole.kind==='door') continue;
    const p=pontoParede(wall,hole.at+hole.w/2); const g=group(all,p.x,p.z,wall.axis==='z'?Math.PI/2:0);
    const bottom=hole.kind==='high'?1.8:.95, top=hole.kind==='high'?2.35:2.2, height=top-bottom;
    box(g,hole.w,height,.025,0,bottom+height/2,0,'#b4d4d1',{transparent:true,opacity:.28,roughness:.12,depthWrite:false});
    for(const x of [-hole.w/2,0,hole.w/2]) box(g,.035,height,.07,x,bottom+height/2,0,'#6c796f');
    for(const y of [bottom,top]) box(g,hole.w,.04,.09,0,y,0,'#6c796f');
    box(g,hole.w+.07,.045,.23,0,bottom,0,'#d5d6cb');
  }
  return all;
}
