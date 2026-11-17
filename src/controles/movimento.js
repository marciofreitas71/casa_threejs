import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { contorno } from '../construcao/planta.js';

export function criarMovimento(camera, element, colliders, doors) {
  const orbit=new OrbitControls(camera,element); orbit.enableDamping=true; orbit.dampingFactor=.08; orbit.minDistance=3; orbit.maxDistance=35; orbit.maxPolarAngle=Math.PI/2-.09;
  const keys=new Set(); let walking=false, yaw=0, pitch=0, dragging=false;
  const clear=()=>{keys.clear();dragging=false;};
  window.addEventListener('keydown',e=>{if(!walking || document.querySelector('dialog[open]') || e.target.matches('input,textarea,select'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
  window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  element.addEventListener('pointerdown',e=>{if(walking){dragging=true;element.setPointerCapture(e.pointerId);}});
  element.addEventListener('pointerup',()=>dragging=false);element.addEventListener('pointercancel',()=>dragging=false);
  element.addEventListener('pointermove',e=>{if(!walking||!dragging)return;yaw-=e.movementX*.004;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.004,-1.15,1.15);});
  for(const button of document.querySelectorAll('[data-key]')) {button.addEventListener('pointerdown',e=>{keys.add(button.dataset.key);button.setPointerCapture(e.pointerId);e.preventDefault();});for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>keys.delete(button.dataset.key));}
  function inside(x,z) {let result=false;for(let i=0,j=contorno.length-1;i<contorno.length;j=i++){const [xi,zi]=contorno[i],[xj,zj]=contorno[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)result=!result;}return result;}
  function free(x,z) {const r=.17;return [[x-r,z],[x+r,z],[x,z-r],[x,z+r]].every(([a,b])=>inside(a,b))&&!colliders.some(b=>x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)&&!doors.collides(x,z,r);}
  return { orbit,
    setWalking(value,position=[1.2,3.6]){walking=value;orbit.enabled=!value;clear();if(value){camera.position.set(position[0],1.62,position[1]);yaw=-Math.PI/2;pitch=-.08;camera.rotation.order='YXZ';}else camera.rotation.order='XYZ';},
    teleport(position){camera.position.set(position[0],1.62,position[1]);},
    update(delta){if(!walking){orbit.update();return;}camera.rotation.set(pitch,yaw,0,'YXZ');let forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));let right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));const norm=Math.hypot(forward,right)||1;forward/=norm;right/=norm;const speed=2.1*Math.min(delta,.04);const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed;if(free(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(free(camera.position.x,camera.position.z+dz))camera.position.z+=dz;},
  };
}
