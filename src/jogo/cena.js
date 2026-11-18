import * as THREE from 'three';
import { box, group } from '../utils.js';
import { criarEstrutura } from '../construcao/estrutura.js';
import { criarJanelas } from '../construcao/janelas.js';
import { criarLaje, criarPlanta, PE_DIREITO } from '../construcao/planta.js';
import { criarPortas, selecionarPorta } from '../construcao/portas.js';
import { criarTeto } from '../construcao/teto.js';
import { ALTURA, alturaJogador, areaComum, CORES, colunas, elevadores, gradis, linhas, noCorredor, portas,
  unidades, comodo, interage, visivel } from './mapa.js';
import { criarCorredor, luzesCorredor, textura } from './corredor.js';
import { circuitos, luminarias } from './eletrica.js';

export const vistaInicial = [1.66, 1.67, 1.13, -.045];

function placa(parent, texto, largura, x,y,z,rotation,cor,letra='#f8f9f7') {
  const map=textura(256,80,ctx=>{
    ctx.fillStyle=cor;
    ctx.fillRect(0,0,256,80);
    ctx.fillStyle=letra;
    ctx.font='bold 48px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(texto,128,41,236);
  });
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(largura,largura*80/256),new THREE.MeshBasicMaterial({map}));
  mesh.position.set(x,y,z);
  mesh.rotation.y=rotation;
  parent.add(mesh);
}

function renderElevador(parent,e) {
  const [x1,z1,x2,z2]=e.box;
  const frente=e.face==='oeste' ? group(parent,x1-.013,(z1+z2)/2,-Math.PI/2)
    : group(parent,(x1+x2)/2,e.face==='sul'?z2+.013:z1-.013,e.face==='sul'?0:Math.PI);
  const servico=e.id.startsWith('SV');
  box(parent,x2-x1,PE_DIREITO,z2-z1,(x1+x2)/2,PE_DIREITO/2,(z1+z2)/2,'#efede6');
  box(frente,1.26,2.14,.047,0,1.07,.008,'#a19f97');
  box(frente,1.174,2.081,.010,0,1.061,.031,'#484949');
  box(frente,.569,2.052,.013,-.287,1.052,.039,'#969898',{roughness:.39});
  box(frente,.569,2.052,.013,.287,1.052,.039,'#9fa09e',{roughness:.39});
  box(frente,1.187,.020,.11,0,.015,.040,'#797976');
  box(frente,.077,.178,.028,.785,1.17,.019,'#777c7a');
  box(frente,.026,.028,.007,.785,1.182,.036,'#d2d4cf');
  placa(frente,`↑ 16`,.184,0,2.247,.018,0,'#222525','#f34639');
  placa(frente,`${servico?'SERVIÇO':'SOCIAL'} ${e.id}`,.24,.79,1.60,.016,0,'#5a615e');
}

function agruparCaixas(parent) {
  parent.updateMatrixWorld(true);
  const porMaterial=new Map();
  parent.traverse(o=>{
    if (o.isMesh && o.geometry.type==='BoxGeometry' && !o.material.transparent) {
      if (!porMaterial.has(o.material)) porMaterial.set(o.material,[]);
      porMaterial.get(o.material).push(o);
    }
  });
  const grupo=new THREE.Group();
  const unidade=new THREE.BoxGeometry(1,1,1);
  const escala=new THREE.Matrix4();
  const modelo=new THREE.Matrix4();
  for (const [material,objetos] of porMaterial) {
    if (objetos.length<2) continue;
    const mesh=new THREE.InstancedMesh(unidade,material,objetos.length);
    objetos.forEach((o,i)=>{
      const {width,height,depth}=o.geometry.parameters;
      escala.makeScale(width,height,depth);
      mesh.setMatrixAt(i,modelo.multiplyMatrices(o.matrixWorld,escala));
      o.removeFromParent();
      o.geometry.dispose();
    });
    mesh.computeBoundingSphere();
    grupo.add(mesh);
  }
  return grupo;
}

function materialInterruptor(ligado) {
  const map=textura(96,112,ctx=>{
    ctx.fillStyle=ligado?'#876320':'#58554a';
    ctx.beginPath();ctx.roundRect(2,2,92,108,13);ctx.fill();
    ctx.strokeStyle='#fff8e7';ctx.lineWidth=5;ctx.lineCap='round';
    ctx.beginPath();
    ctx.arc(48,55,12,0,Math.PI*2);
    for (let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      ctx.moveTo(48+18*Math.cos(a),55+18*Math.sin(a));
      ctx.lineTo(48+25*Math.cos(a),55+25*Math.sin(a));
    }
    ctx.stroke();
  });
  return new THREE.MeshBasicMaterial({map,transparent:true});
}

export function criarCena(viewport) {
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.55));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Pavimento do jogo em primeira pessoa');
  viewport.append(renderer.domElement);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#bdd4df');
  scene.fog=new THREE.Fog('#bdd4df',32,75);
  const camera=new THREE.PerspectiveCamera(67,1,.025,90);
  camera.rotation.order='YXZ';
  const ambiente=new THREE.HemisphereLight('#fff4e1','#879d9c',1.65);
  const luzApartamento=new THREE.Color('#fff4e1'), luzCorredor=new THREE.Color('#f3f5fa');
  const reboteApartamento=new THREE.Color('#879d9c'), reboteCorredor=new THREE.Color('#c2c2bc');
  scene.add(ambiente);
  const sol=new THREE.DirectionalLight('#fff5e7',1.00);
  sol.position.set(-10,18,6);
  scene.add(sol);

  const estatico=new THREE.Group();
  for (const unidade of unidades) {
    const g=group(estatico,unidade.x,unidade.z);
    g.scale.set(unidade.sx,1,unidade.sz);
    criarPlanta(g);
    criarTeto(g).visible=true;
  }
  criarLaje(estatico,areaComum,-.22,.22,'#d8d6cf');
  criarLaje(estatico,areaComum,PE_DIREITO,.16,'#eeede7');
  criarEstrutura(estatico,{linhas,colunas,gradisPlanta:gradis,vistaPlanta:false});
  criarJanelas(estatico,linhas,false);
  criarCorredor(estatico,portas);
  for (const e of elevadores) renderElevador(estatico,e);
  for (const p of portas.filter(p=>p.id.endsWith('/entrada'))) {
    const [numero]=p.id.split('/');
    const lado=p.z>0?-1:1;
    placa(estatico,numero,.18,p.x,2.20,p.z+lado*.083,lado<0?Math.PI:0,'#333635');
  }
  box(estatico,150,.10,150,0,-1.25,0,'#a9c3ce');
  scene.add(estatico,agruparCaixas(estatico));

  const folhas=criarPortas(scene,linhas).items;
  for (const p of folhas) if (p.arc) p.arc.visible=false;
  const materialAceso=new THREE.MeshBasicMaterial({color:'#fff1bd'});
  const materialApagado=new THREE.MeshBasicMaterial({color:'#89918b'});
  const lampadas=new Map();
  const spots=[...Array(3)].map(()=>{
    const p=new THREE.PointLight('#fff0c6',0,4.2,2);
    scene.add(p);
    return p;
  });
  for (const c of circuitos) {
    lampadas.set(c.id,luminarias(c).map(p=>{
      const obj=box(scene,p.largura,.034,p.profundidade,p.x,c.forro-.055,p.z,'#fff1bd');
      obj.material=materialAceso;
      return obj;
    }));
  }

  const estadosPainel=[materialInterruptor(false),materialInterruptor(true)];
  const comandos=circuitos.map(({comando:c})=>{
    const obj=new THREE.Mesh(new THREE.PlaneGeometry(.185,.216),estadosPainel[1]);
    obj.position.set(c.x+c.nx*.014,c.y,c.z+c.nz*.014);
    obj.rotation.y=Math.atan2(c.nx,c.nz);
    obj.userData.comando=c;
    scene.add(obj);
    return {...c,obj};
  });
  const raioDaEsfera=.25;
  const espessuraDoAro=.018;
  const esfera=new THREE.SphereGeometry(raioDaEsfera,24,16);
  const anel=new THREE.TorusGeometry(raioDaEsfera-espessuraDoAro,espessuraDoAro,8,32);
  const jogadores=new Map();
  const alarmes=new Map();
  const cores=new Map(CORES.map(c=>[c.id,c.hex]));
  const raio=new THREE.Raycaster();
  const para=new THREE.Vector3();
  let estado={jogadores:[],portas:{},luzesApagadas:[]};
  let progressoPortas={};
  let meusDados=null;
  let circuitoAtual;
  let brilho=1.65, misturaCorredor=0;

  function atualizar(proximo,eu) {
    estado=proximo;
    progressoPortas=Object.fromEntries(Object.entries(proximo.portas).map(([id,val])=>[id,val[0]]));
    meusDados=proximo.jogadores.find(p=>p.id===eu);
    const outros=proximo.jogadores.filter(p=>p.id!==eu);
    for (const [id,visual] of jogadores) if (!outros.some(p=>p.id===id)) {
      visual.bola.material.dispose();
      visual.anel.material.dispose();
      visual.grupo.removeFromParent();
      jogadores.delete(id);
    }
    for (const p of outros) {
      if (!jogadores.has(p.id)) {
        const grupo=group(scene,p.x,p.z);
        grupo.position.y=alturaJogador(p.abaixado);
        const bola=new THREE.Mesh(esfera,new THREE.MeshStandardMaterial({color:cores.get(p.cor),
          roughness:.31,emissive:cores.get(p.cor),emissiveIntensity:.23}));
        const borda=new THREE.Mesh(anel,new THREE.MeshBasicMaterial({color:'#fff1ab'}));
        borda.rotation.x=Math.PI/2;
        borda.position.y=-.29;
        grupo.add(bola,borda);
        jogadores.set(p.id,{grupo,bola,anel:borda});
      }
      const j=jogadores.get(p.id);
      if (j.alvo?.reposicao!==p.reposicao) j.grupo.position.set(p.x,alturaJogador(p.abaixado),p.z);
      j.alvo=p;
      j.anel.visible=p.id===proximo.pegador;
    }
    for (const porta of folhas) {
      const [progresso,aberta]=proximo.portas[porta.id] ?? [0,false];
      porta.alvo=progresso;
      porta.open=aberta;
    }
    atualizarAlarmes(proximo.alarmes??[]);
    const apagadas=new Set(proximo.luzesApagadas);
    for (const [id,objetos] of lampadas) {
      const material=apagadas.has(id)?materialApagado:materialAceso;
      for (const o of objetos) o.material=material;
    }
    for (const c of comandos) {
      c.obj.material=estadosPainel[Number(!apagadas.has(c.alvo))];
    }
  }

  function atualizarAlarmes(ativos) {
    for (const [id,alarme] of alarmes) if (!ativos.some(a=>a.id===id)) {
      alarme.bola.removeFromParent();
      alarme.bola.material.dispose();
      alarmes.delete(id);
    }
    const agora=performance.now();
    for (const a of ativos) {
      if (!alarmes.has(a.id)) {
        const cor=cores.get(a.cor);
        const bola=new THREE.Mesh(esfera,new THREE.MeshStandardMaterial({
          color:cor,roughness:.35,emissive:cor,emissiveIntensity:.38,
        }));
        bola.scale.setScalar(.48);
        bola.position.set(a.x,.126,a.z);
        scene.add(bola);
        alarmes.set(a.id,{bola,piscaDesde:null});
      }
      const alarme=alarmes.get(a.id);
      if (a.restante>0 && alarme.piscaDesde===null) {
        alarme.piscaDesde=agora;
        alarme.piscaAte=agora+a.restante;
        alarme.bola.material.emissiveIntensity=1.15;
      }
    }
  }

  function posicionar(x,z,yaw,pitch,altura=ALTURA) {
    camera.position.set(x,altura,z);
    camera.rotation.set(pitch,yaw,0,'YXZ');
  }

  function proximos() {
    const {x,z}=camera.position;
    const pos=meusDados ?? {x,z};
    return comandos.filter(c=>Math.abs(c.x-x)<2.1 && Math.abs(c.z-z)<2.1
      && interage(pos.x,pos.z,c,progressoPortas,pos.abaixado));
  }

  function detectar(x,y) {
    if (!meusDados) return;
    camera.updateMatrixWorld();
    raio.setFromCamera({x,y},camera);
    const porta=selecionarPorta(raio,folhas,meusDados,progressoPortas,visivel);
    const luz=raio.intersectObjects(proximos().map(c=>c.obj),false)[0];
    if (luz && (!porta || luz.distance<porta.distancia)) return luz.object.userData.comando;
    return porta;
  }

  function mirar() {
    const direto=detectar(0,0);
    if (direto || !meusDados) return direto;
    let melhor=.925, escolhido;
    for (const c of proximos()) {
      para.copy(c.obj.position).sub(camera.position).normalize();
      const desvio=para.dot(raio.ray.direction);
      if (desvio>melhor) {melhor=desvio;escolhido=c;}
    }
    return escolhido;
  }

  function tocar(clientX,clientY) {
    const r=renderer.domElement.getBoundingClientRect();
    return detectar((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);
  }

  function renderizar(dt) {
    const {x,z}=camera.position;
    const suavizar=1-Math.exp(-18*dt);
    const agora=performance.now();
    for (const {bola,piscaDesde,piscaAte} of alarmes.values()) {
      bola.visible=piscaDesde===null || (agora<piscaAte && Math.floor((agora-piscaDesde)/375)%2===0);
    }
    for (const j of jogadores.values()) {
      const alvo=j.alvo;
      j.grupo.position.x+=(alvo.x-j.grupo.position.x)*suavizar;
      j.grupo.position.z+=(alvo.z-j.grupo.position.z)*suavizar;
      j.grupo.position.y+=(alturaJogador(alvo.abaixado)-j.grupo.position.y)*suavizar;
    }
    for (const p of folhas) {
      p.frame.visible=Math.hypot(p.center.x-x,p.center.z-z)<15;
      p.progress+=( (p.alvo??0)-p.progress)*suavizar;
      p.pose(p.progress);
    }
    for (const c of comandos) c.obj.visible=Math.abs(c.x-x)<10 && Math.abs(c.z-z)<10;
    for (const objetos of lampadas.values()) for (const o of objetos) {
      o.visible=Math.abs(o.position.x-x)<12 && Math.abs(o.position.z-z)<12;
    }
    const sala=comodo(x,z);
    const corredor=!sala && noCorredor(x,z);
    const alvo=sala && estado.luzesApagadas.includes(sala.id) ? .29 : 1.72;
    const transicao=1-Math.exp(-5*dt);
    brilho+=(alvo-brilho)*transicao;
    misturaCorredor+=(Number(corredor)-misturaCorredor)*transicao;
    ambiente.intensity=brilho;
    ambiente.color.copy(luzApartamento).lerp(luzCorredor,misturaCorredor);
    ambiente.groundColor.copy(reboteApartamento).lerp(reboteCorredor,misturaCorredor);
    sol.intensity=.53*brilho;
    if (sala!==circuitoAtual) circuitoAtual=sala;
    const luzAtiva=circuitoAtual && !estado.luzesApagadas.includes(circuitoAtual.id);
    const ativos=luzAtiva?lampadas.get(circuitoAtual.id):[];
    const luzes=corredor ? luzesCorredor.filter(p=>Math.abs(p-z)<4.5)
      .sort((a,b)=>Math.abs(a-z)-Math.abs(b-z)) : [];
    for (const [i,p] of spots.entries()) {
      const lampada=ativos[i];
      if (luzes[i]!==undefined) {
        p.color.set('#f6f8ff');
        p.intensity=4.8;
        p.position.set(0,PE_DIREITO-.44,luzes[i]);
      } else if (lampada) {
        p.color.set('#fff0c6');
        p.intensity=i===0?7:2;
        p.position.copy(lampada.position).y-=.14;
      } else p.intensity=0;
    }
    renderer.render(scene,camera);
  }

  const resize=()=>{
    renderer.setSize(viewport.clientWidth,viewport.clientHeight);
    camera.aspect=viewport.clientWidth/Math.max(1,viewport.clientHeight);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(viewport);
  resize();
  posicionar(...vistaInicial);
  return { canvas:renderer.domElement, atualizar, posicionar, mirar, tocar, renderizar };
}
