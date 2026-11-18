import * as THREE from 'three';
import { box, cylinder, group, material } from '../utils.js';
import { criarForma, ESPESSURA, PE_DIREITO } from '../construcao/planta.js';
import { areaComum, lixeiraCorredor, portaCortaFogo, quadroMedicao } from './mapa.js';

const verde = '#174831';
const vermelho = '#9e2026';
const metal = '#858b8a';
const sombra = '#363d3c';
const branco = '#f0eee4';
export const luzesCorredor = [-9.87,-7.82,-5.42,-3.94,-1.45,1.35,4.22,5.76,7.82,9.87];

export function textura(w,h,desenhar) {
  const canvas=document.createElement('canvas');
  canvas.width=w;
  canvas.height=h;
  desenhar(canvas.getContext('2d'));
  const tex=new THREE.CanvasTexture(canvas);
  tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

function painel(parent,map,w,h,x,y,z) {
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.63}));
  mesh.position.set(x,y,z);
  parent.add(mesh);
}

function sinal(parent,w,h,x,y,z,fundo,desenhar) {
  const map=textura(384,Math.round(384*h/w),ctx=>{
    const altura=ctx.canvas.height;
    ctx.fillStyle=fundo;
    ctx.fillRect(0,0,384,altura);
    ctx.strokeStyle=branco;
    ctx.lineWidth=3;
    ctx.strokeRect(5,5,374,altura-10);
    ctx.fillStyle=branco;
    desenhar(ctx,altura);
  });
  painel(parent,map,w,h,x,y,z);
}

function texto(ctx,t,x,y,tamanho,largura=355) {
  ctx.font=`bold ${tamanho}px Arial, sans-serif`;
  ctx.textBaseline='middle';
  ctx.textAlign='center';
  ctx.fillText(t,x,y,largura);
}

function pictogramaSaida(ctx) {
  ctx.fillRect(60,37,91,117);
  ctx.fillStyle=verde;
  ctx.fillRect(75,50,64,104);
  ctx.fillStyle=branco;
  ctx.beginPath();
  ctx.arc(113,72,11,0,Math.PI*2);
  ctx.fill();
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.lineWidth=12;
  ctx.beginPath();
  ctx.moveTo(84,108); ctx.lineTo(104,91); ctx.lineTo(123,93); ctx.lineTo(148,108);
  ctx.moveTo(110,92); ctx.lineTo(102,113); ctx.lineTo(123,124); ctx.lineTo(141,150);
  ctx.moveTo(102,113); ctx.lineTo(89,138); ctx.lineTo(72,147);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(219,95); ctx.lineTo(275,42); ctx.lineTo(331,95);
  ctx.lineTo(295,95); ctx.lineTo(295,150); ctx.lineTo(255,150); ctx.lineTo(255,95);
  ctx.fill();
}

function frontOeste(parent,x,z) {
  return group(parent,x+ESPESSURA/2,z,Math.PI/2);
}

function criarPiso(parent) {
  const map=textura(512,512,ctx=>{
    const {width,height}=ctx.canvas;
    const pixels=ctx.createImageData(width,height);
    for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
      const tx=x%128, ty=y%128;
      const borda=Math.min(tx,ty,127-tx,127-ty);
      const ruido=((Math.imul(x+11,73856093)^Math.imul(y+7,19349663)) >>> 25)%9-4;
      const tonalidade=(Math.floor(x/128)*11+Math.floor(y/128)*3)%10;
      const cinza=(borda===0 ? 147 : borda===1 ? 194 : 222+tonalidade+(tx-ty)*.032)+ruido*.6;
      const i=(x+y*width)*4;
      pixels.data[i]=cinza+2;
      pixels.data[i+1]=cinza+1;
      pixels.data[i+2]=cinza;
      pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  });
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.repeat.setScalar(1/(4*.42));
  map.anisotropy=4;
  const piso=new THREE.Mesh(new THREE.ShapeGeometry(criarForma(areaComum)),
    new THREE.MeshStandardMaterial({map,roughness:.40}));
  piso.rotation.x=-Math.PI/2;
  piso.position.y=.006;
  parent.add(piso);
}

function criarPortaCortaFogo(parent) {
  const {x,z,w,top}=portaCortaFogo;
  const g=frontOeste(parent,x,z);
  const altura=top-.028;
  box(g,w,top,.065,0,top/2,-.064,sombra);
  box(g,w-.080,altura-.024,.052,0,altura/2,-.039,'#8d9294',{roughness:.63});
  for (const lado of [-1,1]) box(g,.048,top,.105,lado*(w/2-.016),top/2,-.043,'#a9aba9');
  box(g,w+.015,.049,.105,0,top-.018,-.043,'#a9aba9');
  box(g,w,.012,.19,0,.012,-.025,'#777772');
  box(g,.048,.093,.018,-.305,1.01,-.006,'#393d3e');
  box(g,.111,.024,.027,-.264,1.025,.031,'#292e30',{roughness:.45});
  box(g,.024,.026,.036,-.306,1.025,.015,'#292e30');
  sinal(g,.31,.114,0,2.237,.009,verde,(ctx,h)=>texto(ctx,'SAÍDA',192,h/2,101));
  sinal(g,.23,.115,0,1.91,-.011,verde,pictogramaSaida);
  const manterFechada=(ctx,h)=>{
    texto(ctx,'PORTA CORTA-FOGO',192,h*.30,34);
    texto(ctx,'MANTENHA FECHADA',192,h*.72,34);
  };
  sinal(g,.33,.085,0,1.765,-.011,verde,manterFechada);
  sinal(g,.24,.062,0,1.13,-.011,verde,manterFechada);
  box(g,.23,.068,.053,.68,2.36,.027,'#deddd2');
  box(g,.18,.041,.018,.68,2.362,.061,'#f3f1e9');
  box(g,.010,.007,.004,.752,2.35,.071,'#c72e23',{emissive:'#c42620',emissiveIntensity:.6});
}

function mapaMedidor(disjuntor) {
  return textura(192,disjuntor?105:234,ctx=>{
    const h=ctx.canvas.height;
    ctx.fillStyle='#858d8b';
    ctx.fillRect(0,0,192,h);
    ctx.fillStyle='#3b4447';
    ctx.beginPath();ctx.roundRect(5,5,182,h-10,12);ctx.fill();
    ctx.fillStyle='#c1bcb0';
    if (disjuntor) {
      ctx.fillRect(69,22,54,61);
      ctx.fillStyle='#525c5c';ctx.fillRect(77,34,38,35);
      ctx.fillStyle='#d4d3c8';ctx.fillRect(82,43,28,15);
    } else {
      ctx.fillRect(46,35,99,107);
      ctx.fillStyle='#899582';ctx.fillRect(60,48,73,26);
      ctx.fillStyle='#37423e';texto(ctx,'00000',96,63,16);
      ctx.fillStyle='#777a73';
      for (let i=0;i<4;i++) ctx.fillRect(61,86+i*9,56+i%2*8,2);
      ctx.fillStyle='#252f30';
      ctx.beginPath();ctx.roundRect(76,162,40,13,5);ctx.fill();
      ctx.fillStyle='#9e997c';ctx.fillRect(69,190,54,5);
    }
    const vidro=ctx.createLinearGradient(0,0,192,h);
    vidro.addColorStop(0,'#cddbd74d');
    vidro.addColorStop(.33,'#cddbd71a');
    vidro.addColorStop(.5,'#e6efed55');
    vidro.addColorStop(.61,'#abc2c314');
    vidro.addColorStop(1,'#dde3dc52');
    ctx.fillStyle=vidro;
    ctx.beginPath();ctx.roundRect(5,5,182,h-10,12);ctx.fill();
    ctx.strokeStyle='#d9e1dc88';ctx.lineWidth=3;
    ctx.beginPath();ctx.roundRect(9,9,174,h-18,10);ctx.stroke();
    ctx.fillStyle='#e1e5dc99';
    for (const x of [17,175]) for (const y of [17,h-17]) {
      ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();
    }
  });
}

function criarQuadroMedicao(parent) {
  const {x,z,w,bottom,top}=quadroMedicao;
  const g=frontOeste(parent,x,z);
  box(g,w,top-bottom,.075,0,(top+bottom)/2,-.099,'#41494a');
  const medidor=mapaMedidor(false), disjuntor=mapaMedidor(true);
  for (const lado of [-1,1]) {
    box(g,.021,top-bottom,.121,lado*(w/2-.009),(top+bottom)/2,-.068,'#b7b7b0');
    box(g,.735,.203,.038,lado*.476,1.697,-.029,'#a0a5a3');
    for (const pos of [-.238,.238]) for (const y of [1.655,1.690,1.725]) {
      box(g,.123,.008,.010,lado*.476+pos,y,-.005,'#b7bbba');
    }
    for (const constante of [.22,.45,.68]) {
      for (const [y,h,map] of [[1.378,.397,medidor],[1.083,.172,disjuntor],[.793,.397,medidor],[.500,.172,disjuntor]]) {
        const cx=lado*(constante+.054);
        box(g,.221,h,.044,cx,y,-.052,'#777e7e',{roughness:.55});
        painel(g,map,.213,h-.008,cx,y,-.029);
      }
    }
  }
  box(g,w,.067,.137,0,bottom+.026,-.067,'#d9d7ce');
  box(g,.205,1.28,.040,0,.949,-.030,'#a3a6a1');
  box(g,.029,.080,.024,.058,1.27,-.002,'#d3d5ce');
  sinal(g,.106,.078,0,1.414,-.008,'#a3a6a1',(ctx,h)=>{
    ctx.fillStyle='#a52327';texto(ctx,'B6',192,h/2,217);
  });
  sinal(g,.81,.197,0,2.01,.009,'#dddcd3',(ctx,h)=>{
    ctx.fillStyle='#2c3030';texto(ctx,'QUADRO DE MEDIÇÃO COLETIVA',192,h*.32,25);
    texto(ctx,'EDIFÍCIO ORQUÍDEA',192,h*.70,27);
  });
}

function discoFrontal(parent,raio,profundidade,x,y,z,cor) {
  const m=cylinder(parent,raio,profundidade,x,y,z,cor);
  m.rotation.x=Math.PI/2;
  return m;
}

function criarAbrigoHidrante(parent) {
  const g=frontOeste(parent,portaCortaFogo.x,-4.45);
  const cinzaClaro='#a5aaa9';
  for (const y of [.60,1.52]) {
    box(g,.95,.82,.038,-.40,y,.020,metal);
    box(g,.903,.775,.013,-.40,y,.041,sombra);
    for (const x of [-.625,-.174]) {
      box(g,.440,.764,.020,x,y,.050,cinzaClaro);
      const xDobr= x-.40<0 ? -.835 : .035;
      for (const dy of [-.30,.30]) box(g,.014,.052,.018,xDobr,y+dy,.066,metal);
      if (y===.60) for (const dy of [.126,.165,.204,.243]) {
        box(g,.158,.007,.012,x,y+dy,.064,'#b5b8b7');
      }
    }
    for (const dy of [-.29,.29]) discoFrontal(g,.015,.004,-.355,y+dy,.063,sombra);
  }
  const cx=.48;
  box(g,.61,1.02,.048,cx,.737,.024,'#802026');
  box(g,.55,.96,.017,cx,.737,.052,'#58171e');
  box(g,.528,.937,.023,cx,.737,.062,vermelho);
  discoFrontal(g,.101,.010,cx,.957,.079,'#41252a');
  discoFrontal(g,.088,.010,cx,.957,.085,'#41484a');
  box(g,.036,.055,.010,.245,.82,.083,'#dcd7cb');
  box(g,.040,.017,.025,.245,.758,.084,'#55252a');
  sinal(g,.16,.18,cx,1.409,.006,vermelho,(ctx,h)=>texto(ctx,'H',192,h/2,330));
  sinal(g,.16,.18,cx,1.86,.006,vermelho,(ctx,h)=>{
    ctx.strokeStyle='#e9e0c6';
    ctx.lineWidth=17;
    ctx.beginPath();
    for (let i=0;i<=128;i++) {
      const t=i/128, r=5+126*t, a=t*8*Math.PI-.5*Math.PI;
      const px=184+Math.cos(a)*r, py=h*.52+Math.sin(a)*r;
      if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.fillStyle='#e9e0c6';
    ctx.fillRect(186,83,86,18);ctx.fillRect(268,76,13,32);
  });
}

function criarExtintor(g) {
  cylinder(g,.075,.259,0,.92,.114,vermelho);
  cylinder(g,.052,.047,0,1.067,.114,vermelho,.037);
  cylinder(g,.024,.042,0,1.104,.114,'#3c3b37');
  box(g,.076,.018,.033,-.012,1.128,.114,'#252828');
  const mangueira=new THREE.CatmullRomCurve3([
    new THREE.Vector3(.012,1.116,.12),new THREE.Vector3(.095,1.111,.112),
    new THREE.Vector3(.109,1.040,.128),new THREE.Vector3(.079,.977,.141),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(mangueira,12,.009,6,false),material('#282929')));
  box(g,.080,.057,.006,0,.939,.183,'#e4ded1');
  sinal(g,.145,.18,0,1.58,.008,vermelho,(ctx,h)=>{
    ctx.beginPath();ctx.roundRect(136,h*.34,102,h*.45,17);ctx.fill();
    ctx.fillRect(165,h*.26,42,40);ctx.fillRect(163,h*.21,88,16);
    ctx.beginPath();ctx.moveTo(235,h*.225);ctx.quadraticCurveTo(290,h*.23,267,h*.47);
    ctx.lineWidth=12;ctx.stroke();
  });
}

function criarTetoCorredor(parent) {
  const largura=2*Math.abs(portaCortaFogo.x)-ESPESSURA;
  for (const lado of [-1,1]) {
    for (const [z,w] of [[3.34,largura],[6.58,largura],[8.98,2.25]]) {
      box(parent,w,.23,.32,0,PE_DIREITO-.115,lado*z,'#eeece3');
    }
  }
  for (const z of luzesCorredor) {
    cylinder(parent,.109,.018,0,PE_DIREITO-.010,z,'#dadbd7');
    cylinder(parent,.086,.007,0,PE_DIREITO-.022,z,'#ffffff')
      .material=new THREE.MeshBasicMaterial({color:'#f8fbff'});
  }
  for (const z of [-6.1,-3.04,-.55,2.58,5.2,9.72]) {
    cylinder(parent,.036,.009,.45,PE_DIREITO-.007,z,metal);
    cylinder(parent,.009,.035,.45,PE_DIREITO-.028,z,sombra);
    cylinder(parent,.018,.007,.45,PE_DIREITO-.048,z,metal);
  }
  box(parent,.66,.011,.59,-1.13,PE_DIREITO-.006,-4.60,'#a9aaa2');
  box(parent,.643,.012,.573,-1.13,PE_DIREITO-.010,-4.60,'#e5e3da');
}

export function criarCorredor(parent,portas) {
  criarPiso(parent);
  criarTetoCorredor(parent);
  criarPortaCortaFogo(parent);
  criarQuadroMedicao(parent);
  criarAbrigoHidrante(parent);
  for (const lado of [-1,1]) {
    criarExtintor(group(parent,lado*1.048,lado*8.34,-lado*Math.PI/2));
  }
  const {x,z,raio} = lixeiraCorredor;
  cylinder(parent,raio*.76,.55,x,.28,z,'#202223',raio*.96);
  cylinder(parent,raio,.027,x,.554,z,'#272929');
  cylinder(parent,raio*.91,.036,x,.58,z,'#2f3232',raio*.72);
  box(parent,.090,.023,.040,x,.61,z,'#232526');
  for (const p of portas.filter(p=>/\/entrada(?:-servico)?$/.test(p.id))) {
    const servico=p.wall.axis==='z';
    const face=servico?-Math.sign(p.x):-Math.sign(p.z);
    const angulo=servico ? face*Math.PI/2 : (face===1 ? 0 : Math.PI);
    const g=group(parent,p.x,p.z,angulo);
    box(g,p.hole.w+.10,.015,.44,0,.014,.37,'#282829',{roughness:.95});
    box(g,p.hole.w,.008,.17,0,.009,.008,'#716e67');
  }
}
