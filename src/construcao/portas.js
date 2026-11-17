import * as THREE from 'three';
import { box, group } from '../utils.js';
import { paredes, pontoParede } from './estrutura.js';

// Shared plan-view geometry for walking collision and the animated swing.
export function distanciaDaFolha(door, x, z, angle = door.leaf.rotation.y) {
  const theta = door.base + angle;
  const dx = Math.cos(theta), dz = -Math.sin(theta);
  const projection = THREE.MathUtils.clamp((x-door.pivot.x)*dx+(z-door.pivot.z)*dz, .025, door.width-.025);
  return Math.hypot(x-door.pivot.x-dx*projection,z-door.pivot.z-dz*projection);
}
export function criarPortas(parent) {
  const all = new THREE.Group(); parent.add(all);
  const items = [];
  for (const wall of paredes) for (const hole of wall.holes ?? []) {
    if (hole.kind !== 'door') continue;
    const p = pontoParede(wall,hole.at);
    const base = wall.axis === 'z' ? -Math.PI/2 : 0;
    const frame = group(all,p.x,p.z,base);
    for (const x of [0,hole.w]) box(frame,.045,2.15,.17,x,1.075,0,'#c1ab8d');
    box(frame,hole.w,.045,.17,hole.w/2,2.15,0,'#c1ab8d');
    const end = hole.hinge === 'end';
    const closed = end ? Math.PI : 0;
    const opened = closed + hole.swing*Math.PI/2;
    const leaf = group(frame,end ? hole.w : 0,0,closed);
    box(leaf,hole.w-.05,2.1,.04,hole.w/2,1.05,0,'#d1b48e');
    for (const side of [-1,1]) box(leaf,.11,.025,.065,hole.w-.14,.98,side*.045,'#657267');
    const pivot = pontoParede(wall,hole.at+(end ? hole.w : 0));
    const points = [];
    for (let i=0;i<=28;i++) {
      const a=closed+(opened-closed)*i/28;
      points.push(new THREE.Vector3((end ? hole.w : 0)+Math.cos(a)*hole.w,.045,-Math.sin(a)*hole.w));
    }
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:'#7b7157',dashSize:.055,gapSize:.04,transparent:true,opacity:.65}));
    arc.computeLineDistances(); frame.add(arc);
    items.push({id:hole.id,name:hole.name,leaf,arc,pivot,base,width:hole.w,closed,opened,target:closed,open:false,blocked:false,center:pontoParede(wall,hole.at+hole.w/2)});
  }
  return {
    group:all, items,
    toggle(door) { door.open=!door.open; door.target=door.open ? door.opened : door.closed; door.blocked=false; },
    collides(x,z,radius=.17) { return items.some(door=>distanciaDaFolha(door,x,z)<radius+.035); },
    nearest(position) {
      return items.filter(door=>Math.hypot(position.x-door.center.x,position.z-door.center.z)<1.7)
        .sort((a,b)=>Math.hypot(position.x-a.center.x,position.z-a.center.z)-Math.hypot(position.x-b.center.x,position.z-b.center.z))[0];
    },
    update(delta,person=null) {
      for (const door of items) {
        door.blocked=false;
        const difference=door.target-door.leaf.rotation.y;
        const step=Math.sign(difference)*Math.min(Math.abs(difference),Math.min(delta,.05)*2);
        // Substeps check the swept leaf, not just its final position.
        for (let i=0;i<8 && step!==0;i++) {
          const next=door.leaf.rotation.y+step/8;
          if (person && distanciaDaFolha(door,person.x,person.z,next)<.215) {door.blocked=true;break;}
          door.leaf.rotation.y=next;
        }
      }
    },
  };
}
