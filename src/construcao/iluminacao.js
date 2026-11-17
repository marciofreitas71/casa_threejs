import * as THREE from 'three';
import { box, group } from '../utils.js';
import { ambientes, PE_DIREITO } from './planta.js';

// Wall surface, at 1.15 m; rotation points the switch front toward the user.
// Bathroom switches are on the corridor side, outside the wet rooms.
export const interruptores = {
  sala: [1.28,2.555,0], cozinha: [1.665,.99,Math.PI/2],
  quarto1: [7.535,2.36,Math.PI/2], quarto2: [4.72,3.705,0],
  quarto3: [7.32,3.705,0], banheiro1: [5.67,2.555,0],
  banheiro2: [7.12,2.555,0], corredor: [4.72,3.535,Math.PI],
};

export function criarIluminacao(parent) {
  const root=new THREE.Group(); parent.add(root); root.visible=false;
  const circuits=[];
  const rooms=[...ambientes,{id:'corredor',nome:'Corredor',x:2.85,z:2.54,w:4.53,d:1.01}];
  for(const room of rooms) {
    const x=room.x+room.w/2,z=room.z+room.d/2;
    const fixture=group(root,x,z);
    box(fixture,.43,.065,.43,0,PE_DIREITO-.035,0,'#b7b8ad');
    const diffuser=box(fixture,.38,.018,.38,0,PE_DIREITO-.077,0,'#fff2d5');
    diffuser.material=diffuser.material.clone();
    diffuser.material.emissive.set('#ffe4b1');
    diffuser.castShadow=false;
    const power=room.id.startsWith('banheiro')?28:room.id==='corredor'?40:55;
    const light=new THREE.SpotLight('#ffe4bd',power,8,1.28,.55,2);
    light.position.set(x,PE_DIREITO-.12,z);
    light.target.position.set(x,0,z);root.add(light,light.target);
    light.castShadow=true;light.shadow.mapSize.set(1024,1024);
    light.shadow.camera.near=.08;light.shadow.camera.far=8;
    light.shadow.normalBias=.025;light.shadow.bias=-.0002;
    light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
    const [sx,sz,rotation]=interruptores[room.id];
    const wallSwitch=group(root,sx,sz,rotation);
    const plate=box(wallSwitch,.15,.23,.025,0,1.15,0,'#f6f4eb');
    const rocker=box(wallSwitch,.085,.135,.025,0,1.16,.022,'#e1e4d7');
    const indicator=box(wallSwitch,.025,.009,.009,0,1.085,.022,'#86ad69');
    indicator.material=indicator.material.clone();
    const circuit={id:room.id,name:room.nome,on:true,light,power,diffuser,wallSwitch,rocker,indicator,
      position:new THREE.Vector3(sx,1.15,sz),normal:new THREE.Vector3(Math.sin(rotation),0,Math.cos(rotation))};
    for(const mesh of [plate,rocker,indicator])mesh.userData.circuit=circuit;
    circuits.push(circuit);
  }
  const ray=new THREE.Raycaster();
  const direction=new THREE.Vector3();
  function refresh(circuit) {
    circuit.light.intensity=circuit.on?circuit.power:0;
    circuit.diffuser.material.emissiveIntensity=circuit.on?2.4:0;
    circuit.rocker.rotation.x=circuit.on?-.13:.13;
    circuit.indicator.material.color.set(circuit.on?'#86ad69':'#9a9b92');
    circuit.indicator.material.emissive.set(circuit.on?'#426d2d':'#12150e');
    circuit.indicator.material.emissiveIntensity=.5;
    circuit.light.shadow.needsUpdate=true;
  }
  circuits.forEach(refresh);
  return {
    root,circuits,
    setWalking(active) {root.visible=active;this.invalidate();},
    invalidate() {for(const c of circuits)c.light.shadow.needsUpdate=true;},
    toggle(circuit) {circuit.on=!circuit.on;refresh(circuit);},
    nearest(position,occluders) {
      if(!root.visible)return null;
      return circuits.filter(c=>{
        direction.copy(position).sub(c.position);
        if(direction.length()>1.8 || direction.dot(c.normal)<.04)return false;
        const distance=direction.length();
        ray.set(position,direction.copy(c.position).sub(position).normalize());ray.near=0;ray.far=distance-.04;
        return ray.intersectObjects(occluders,true).length===0;
      }).sort((a,b)=>position.distanceToSquared(a.position)-position.distanceToSquared(b.position))[0]??null;
    },
    pick(pointer,camera,occluders) {
      if(!root.visible)return null;
      ray.setFromCamera(pointer,camera);ray.near=0;ray.far=2;
      const hits=ray.intersectObjects([...circuits.map(c=>c.wallSwitch),...occluders],true);
      return hits[0]?.object.userData.circuit??null;
    },
  };
}
