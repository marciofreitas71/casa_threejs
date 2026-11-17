import * as THREE from 'three';
import { box, group, plant } from './src/utils.js';
import { criarPlanta, ambientes, formatar } from './src/construcao/planta.js';
import { criarEstrutura } from './src/construcao/estrutura.js';
import { criarJanelas } from './src/construcao/janelas.js';
import { criarTeto } from './src/construcao/teto.js';
import { criarIluminacao } from './src/construcao/iluminacao.js';
import { criarPortas } from './src/construcao/portas.js';
import { criarSofa } from './src/sala/sofa.js';
import { criarRack } from './src/sala/rack.js';
import { criarBancada } from './src/cozinha/bancada.js';
import { criarPia } from './src/cozinha/pia.js';
import { criarFogao } from './src/cozinha/fogao.js';
import { criarGeladeira } from './src/cozinha/geladeira.js';
import { criarMesa } from './src/cozinha/mesa.js';
import { criarCama } from './src/quartos/cama.js';
import { criarGuardaRoupa } from './src/quartos/guardaRoupa.js';
import { criarCriadoMudo } from './src/quartos/criadoMudo.js';
import { criarVaso } from './src/banheiros/vaso.js';
import { criarPiaBanheiro } from './src/banheiros/pia.js';
import { criarChuveiro } from './src/banheiros/chuveiro.js';
import { criarMovimento } from './src/controles/movimento.js';

const $=selector=>document.querySelector(selector);
const viewport=$('#viewport');
const scene=new THREE.Scene();scene.background=new THREE.Color('#eeeee6');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.domElement.setAttribute('aria-label','Modelo tridimensional da residência');viewport.prepend(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').hidden=false;$('#loading').textContent='A visualização foi interrompida. Recarregue a página para continuar.';});
const camera=new THREE.PerspectiveCamera(39,1,.05,120);
const planCamera=new THREE.OrthographicCamera(-8,8,6,-6,.1,80);planCamera.position.set(5.1,25,3.15);planCamera.up.set(0,0,-1);planCamera.lookAt(5.1,0,3.15);
const ambient=new THREE.HemisphereLight('#fffced','#b4bc9e',1.8);scene.add(ambient);
const sunlight=new THREE.DirectionalLight('#fff4dd',2.5);sunlight.position.set(-3,14,7);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:40});sunlight.shadow.normalBias=.025;sunlight.shadow.bias=-.0003;sunlight.shadow.radius=4;scene.add(sunlight);sunlight.target.position.set(5,0,3);scene.add(sunlight.target);
const ground=box(scene,200,.1,200,5,-.4,3,'#eeeee6');ground.castShadow=false;
const grid=new THREE.GridHelper(50,100,'#d7dbcd','#dfe2d5');grid.position.set(5,-.345,3);grid.material.transparent=true;grid.material.opacity=.33;scene.add(grid);
const house=new THREE.Group();scene.add(house);criarPlanta(house);
const {walls,colliders}=criarEstrutura(house);const windows=criarJanelas(house);const doors=criarPortas(house);
const ceiling=criarTeto(house);const lighting=criarIluminacao(house);
const furniture=new THREE.Group();house.add(furniture);
// Sala: the L-shaped seating arrangement follows the supplied plan.
box(furniture,1.8,.02,2,1.39,.047,4.8,'#e6dfca');
criarSofa(furniture,1.25,3.82,0,1.7);criarSofa(furniture,2.37,4.85,-Math.PI/2,2.1);criarRack(furniture,1.35,6.12,Math.PI);
const coffee=group(furniture,1.14,4.83);box(coffee,.67,.045,.84,0,.39,0,'#b9a07b');for(const x of [-.24,.24])box(coffee,.045,.35,.65,x,.19,0,'#9a805b');plant(coffee,0,0,.4,.42);plant(furniture,.35,5.95,.9);
// Cozinha: stove, sink and refrigerator against the back wall.
criarFogao(furniture,2.83,.36);criarBancada(furniture,3.49,.34,.7);criarPia(furniture,3.49,.34);criarGeladeira(furniture,4.14,.36);criarMesa(furniture,2.37,1.67);
// Quarto principal and the two lower bedrooms.
box(furniture,2.25,.02,2.35,9.05,.047,1.4,'#e5dfcc');criarCama(furniture,9.04,1.15,1.5);criarCriadoMudo(furniture,7.98,.43);criarCriadoMudo(furniture,10.09,.43);criarGuardaRoupa(furniture,9.59,3.24,1.7,Math.PI);plant(furniture,7.83,2.05,.7);
criarCama(furniture,4.02,5.55,.95,Math.PI/2);criarCriadoMudo(furniture,3.25,4.83);criarGuardaRoupa(furniture,5.67,5.35,1.65,-Math.PI/2);
criarCama(furniture,8.28,5.55,.95,-Math.PI/2);criarCriadoMudo(furniture,9.07,4.83);criarGuardaRoupa(furniture,6.45,5.35,1.65,Math.PI/2);
for(const room of ambientes.filter(r=>r.id.startsWith('banheiro'))){criarChuveiro(furniture,room.x+.65,.43);criarVaso(furniture,room.x+1.01,1.29,-Math.PI/2);criarPiaBanheiro(furniture,room.x+1.05,2.03,-Math.PI/2);}

const controls=criarMovimento(camera,renderer.domElement,colliders,doors);
const center=new THREE.Vector3(5.2,0,3.15);let mode='3d',selected=null,planZoom=1,transition=null;
const labels=ambientes.map(room=>{const label=document.createElement('div');label.className='room-label'+(room.id.startsWith('banheiro')?' compact':'');label.innerHTML=`${room.nome.replace('Banheiro','Banho').toUpperCase()}<small>${formatar(room.w)} × ${formatar(room.d)} m</small>`;$('#labels').append(label);return {room,label,position:new THREE.Vector3(...[room.label[0],.12,room.label[1]])};});
for(const room of ambientes){const button=document.createElement('button');button.className='room-button';button.dataset.room=room.id;button.setAttribute('aria-pressed','false');button.innerHTML=`<span class="room-icon" aria-hidden="true">${room.icon}</span><span><strong>${room.nome}</strong><small>${formatar(room.w)} × ${formatar(room.d)} m · ${formatar(room.w*room.d)} m²</small></span><span class="arrow" aria-hidden="true">↗</span>`;button.addEventListener('click',()=>focusRoom(room));$('#room-list').append(button);}

function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const span=Math.max(8.5,13/(w/h))/planZoom;planCamera.left=-span*w/h/2;planCamera.right=span*w/h/2;planCamera.top=span/2;planCamera.bottom=-span/2;planCamera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(viewport);
function layers(){document.body.classList.toggle('walking',mode==='walk');ceiling.visible=mode==='walk';lighting.setWalking(mode==='walk');ambient.intensity=mode==='walk'?.22:1.8;const complete=mode==='walk'||$('#walls').checked;const height=complete?1:mode==='plan'?.06:.25;walls.scale.y=height;doors.group.scale.y=height;for(const door of doors.items)door.arc.position.y=.045/height-.045;windows.visible=complete;furniture.visible=$('#furniture').checked;$('#labels').hidden=!$('#dimensions').checked||mode==='walk';$('#walls').disabled=mode==='walk';}
function setSelected(room){selected=room;for(const b of document.querySelectorAll('[data-room]')){const active=b.dataset.room===room?.id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}for(const item of labels)item.label.classList.toggle('selected',item.room===room);$('#scene-title').textContent=room?room.nome:'Uma nova perspectiva.';$('#scene-subtitle').textContent=room?`${room.tipo} · ${formatar(room.w*room.d)} m²`:'Planta mobiliada · vista tridimensional';}
function overview(){transition=null;setSelected(null);planZoom=1;planCamera.position.set(5.1,25,3.15);planCamera.lookAt(5.1,0,3.15);controls.orbit.target.copy(center);const aspect=viewport.clientWidth/viewport.clientHeight;const distance=aspect<.85?1.5:1;camera.position.set(center.x+9*distance,14*distance,center.z+12*distance);camera.lookAt(center);controls.orbit.update();resize();}
function setMode(next){transition=null;mode=next;sunlight.castShadow=next!=='plan';controls.setWalking(next==='walk',selected?.entrada);controls.orbit.enableRotate=next==='3d';controls.orbit.enabled=next==='3d';if(next==='3d')overview();if(next==='plan'){planZoom=1;planCamera.position.set(5.1,25,3.15);planCamera.lookAt(5.1,0,3.15);resize();}for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===next));$('#walk-pad').hidden=next!=='walk';$('#door-interaction').hidden=next!=='walk';$('#light-interaction').hidden=next!=='walk';for(const id of ['zoom-in','zoom-out'])$('#'+id).disabled=next==='walk';$('#mode-status').textContent=next==='3d'?'VISTA GERAL':next==='plan'?'VISTA SUPERIOR':'PASSEIO INTERNO';$('#help').textContent=next==='walk'?'W A S D / setas para andar · Arraste para olhar · E: portas · F: luzes · Esc: sair':next==='plan'?'Role para ampliar · Selecione um ambiente para focar':'Arraste para girar · Role para aproximar · Botão direito para mover';layers();}
function focusRoom(room){setSelected(room);if(mode==='walk'){controls.teleport(room.entrada);return;}const target=new THREE.Vector3(room.x+room.w/2,0,room.z+room.d/2);if(mode==='plan'){planCamera.position.set(target.x,25,target.z);planCamera.lookAt(target);planZoom=1.7;resize();}else{transition={target,position:target.clone().add(new THREE.Vector3(4.7,7.7,6.2))};}}
for(const b of document.querySelectorAll('[data-view]')) b.addEventListener('click',()=>setMode(b.dataset.view));
for(const id of ['furniture','dimensions','walls']) $('#'+id).addEventListener('change',layers);
$('#reset').addEventListener('click',()=>{if(mode==='walk'){setSelected(null);controls.teleport([1.2,3.6]);}else overview();});
function zoom(factor){if(mode==='plan'){planZoom=THREE.MathUtils.clamp(planZoom/factor,.7,3);resize();}else if(mode==='3d'){transition=null;const offset=camera.position.clone().sub(controls.orbit.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,3,35));camera.position.copy(controls.orbit.target).add(offset);}}
$('#zoom-in').addEventListener('click',()=>zoom(.8));$('#zoom-out').addEventListener('click',()=>zoom(1.25));viewport.addEventListener('wheel',e=>{if(mode==='plan'){e.preventDefault();zoom(e.deltaY>0?1.08:.92);}},{passive:false});
controls.orbit.addEventListener('start',()=>transition=null);
const dialog=$('#reference');$('#reference-open').addEventListener('click',()=>dialog.showModal());$('#reference-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&mode==='walk'&&!dialog.open)setMode('3d');});
$('#capture').addEventListener('click',()=>{renderer.render(scene,mode==='plan'?planCamera:camera);const a=document.createElement('a');a.download=`casa-${mode}.png`;a.href=renderer.domElement.toDataURL('image/png');a.click();});

const doorButtons=new Map();
for(const door of doors.items){
  const button=document.createElement('button');
  button.dataset.door=door.id;
  button.addEventListener('click',()=>{doors.toggle(door);updateDoorUI();});
  $('#door-list').append(button);doorButtons.set(door.id,button);
}
function updateDoorUI(){
  for(const door of doors.items){
    const button=doorButtons.get(door.id);
    const label=`${door.open?'Fechar':'Abrir'} · ${door.name}`;
    if(button.textContent!==label){button.textContent=label;button.setAttribute('aria-label',`${door.open?'Fechar':'Abrir'} porta: ${door.name}`);}
  }
  if(mode!=='walk')return;
  const door=doors.nearest(camera.position);
  $('#door-toggle').disabled=!door;
  const label=door?`${door.open?'Fechar':'Abrir'} · ${door.name} [E]`:'Aproxime-se de uma porta';
  if($('#door-toggle').textContent!==label)$('#door-toggle').textContent=label;
  const blocked=doors.items.some(item=>item.blocked);
  const hint=blocked?'Afaste-se da folha para ela terminar de girar.':'Use E ou toque no botão. A abertura é para dentro.';
  if($('#door-hint').textContent!==hint)$('#door-hint').textContent=hint;
}
function toggleNearestDoor(){if(mode!=='walk'||dialog.open)return;const door=doors.nearest(camera.position);if(door){doors.toggle(door);updateDoorUI();}}
$('#door-toggle').addEventListener('click',toggleNearestDoor);
window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!e.target.matches('input,textarea,select')){toggleNearestDoor();}});
updateDoorUI();


const lightButtons=new Map();
for(const circuit of lighting.circuits){
  const button=document.createElement('button');button.dataset.light=circuit.id;
  button.addEventListener('click',()=>{lighting.toggle(circuit);updateLightingUI();});
  $('#light-list').append(button);lightButtons.set(circuit.id,button);
}
const lastDoorAngles=doors.items.map(door=>door.leaf.rotation.y);
let nearbySwitch=null,lastSwitchCheck=0;
function switchOccluders(){return [walls,doors.group,...(furniture.visible?[furniture]:[])];}
function updateLightingUI(){
  let moving=false;doors.items.forEach((door,i)=>{if(lastDoorAngles[i]!==door.leaf.rotation.y){moving=true;lastDoorAngles[i]=door.leaf.rotation.y;}});
  if(moving)lighting.invalidate();
  for(const c of lighting.circuits){
    const button=lightButtons.get(c.id);const text=`${c.on?'Apagar':'Acender'} · ${c.name}`;
    if(button.textContent!==text){button.textContent=text;button.setAttribute('aria-pressed',String(c.on));}
  }
  if(mode!=='walk')return;
  if(performance.now()-lastSwitchCheck>120){house.updateMatrixWorld(true);nearbySwitch=lighting.nearest(camera.position,switchOccluders());lastSwitchCheck=performance.now();}
  const button=$('#light-toggle');button.disabled=!nearbySwitch;
  const text=nearbySwitch?`${nearbySwitch.on?'Apagar':'Acender'} · ${nearbySwitch.name} [F]`:'Aproxime-se de um interruptor';
  if(button.textContent!==text)button.textContent=text;
}
function toggleNearbySwitch(){
  if(mode!=='walk'||dialog.open)return;
  house.updateMatrixWorld(true);const circuit=lighting.nearest(camera.position,switchOccluders());
  if(circuit){lighting.toggle(circuit);updateLightingUI();}
}
$('#light-toggle').addEventListener('click',toggleNearbySwitch);
window.addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&!e.target.matches('input,textarea,select')){e.preventDefault();toggleNearbySwitch();}});
let switchPointer=null;
renderer.domElement.addEventListener('pointerdown',e=>{switchPointer={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointercancel',()=>switchPointer=null);
renderer.domElement.addEventListener('pointerup',e=>{
  const start=switchPointer;switchPointer=null;
  if(mode!=='walk'||dialog.open||!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;
  const rect=renderer.domElement.getBoundingClientRect();
  const pointer=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  house.updateMatrixWorld(true);const circuit=lighting.pick(pointer,camera,switchOccluders());
  if(circuit){lighting.toggle(circuit);updateLightingUI();}
});
updateLightingUI();

overview();layers();$('#loading').hidden=true;
const projected=new THREE.Vector3();let previous=performance.now();
renderer.setAnimationLoop(now=>{const delta=(now-previous)/1000;previous=now;if(transition){const t=1-Math.exp(-delta*5);camera.position.lerp(transition.position,t);controls.orbit.target.lerp(transition.target,t);if(camera.position.distanceTo(transition.position)<.01)transition=null;}if(!dialog.open){doors.update(delta,mode==='walk'?camera.position:null);if(mode!=='plan')controls.update(delta);updateDoorUI();updateLightingUI();}const active=mode==='plan'?planCamera:camera;renderer.render(scene,active);if(!$('#labels').hidden)for(const {label,position} of labels){projected.copy(position).project(active);label.hidden=projected.z>1||projected.z< -1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;label.style.left=`${(projected.x*.5+.5)*viewport.clientWidth}px`;label.style.top=`${(-projected.y*.5+.5)*viewport.clientHeight}px`;}});
