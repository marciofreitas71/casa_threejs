const teclasDeMovimento = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);

export function criarControles(canvas, joystick, manopla, botaoAbaixar, acao) {
  const teclas=new Set();
  let ativo=false, abaixado=false, yaw=0, pitch=-.035, lateral=0, frente=0;
  let arrasto, ponteiro;

  function moverJoystick(e) {
    const r=joystick.getBoundingClientRect();
    const alcance=r.width*.33;
    const x=(e.clientX-r.left-r.width/2)/alcance;
    const y=(e.clientY-r.top-r.height/2)/alcance;
    const modulo=Math.max(1,Math.hypot(x,y));
    lateral=x/modulo;
    frente=-y/modulo;
    manopla.style.transform=`translate(${lateral*alcance}px,${-frente*alcance}px)`;
  }
  function soltarJoystick() {
    ponteiro=undefined;
    lateral=frente=0;
    manopla.style.transform='';
  }
  function limpar() {
    teclas.clear();
    arrasto=undefined;
    soltarJoystick();
  }
  joystick.addEventListener('pointerdown',e=>{
    if (!ativo || ponteiro!==undefined) return;
    ponteiro=e.pointerId;
    joystick.setPointerCapture(ponteiro);
    moverJoystick(e);
  });
  joystick.addEventListener('pointermove',e=>{if (e.pointerId===ponteiro) moverJoystick(e);});
  for (const evento of ['pointerup','pointercancel','lostpointercapture']) {
    joystick.addEventListener(evento,e=>{if (e.pointerId===ponteiro) soltarJoystick();});
  }

  canvas.addEventListener('pointerdown',e=>{
    if (!ativo || arrasto || e.button!==0) return;
    canvas.setPointerCapture(e.pointerId);
    arrasto={ id:e.pointerId,x:e.clientX,y:e.clientY,dist:0 };
  });
  canvas.addEventListener('pointermove',e=>{
    if (arrasto?.id!==e.pointerId) return;
    const dx=e.clientX-arrasto.x, dy=e.clientY-arrasto.y;
    arrasto.dist+=Math.hypot(dx,dy);
    arrasto.x=e.clientX; arrasto.y=e.clientY;
    if (arrasto.dist<6) return;
    yaw-=dx*.0062;
    pitch=Math.max(-1.16,Math.min(1.16,pitch-dy*.0059));
  });
  canvas.addEventListener('pointerup',e=>{
    if (arrasto?.id!==e.pointerId) return;
    if (arrasto.dist<8) acao(e);
    arrasto=undefined;
  });
  for (const evento of ['pointercancel','lostpointercapture']) {
    canvas.addEventListener(evento,e=>{if (arrasto?.id===e.pointerId) arrasto=undefined;});
  }
  function abaixar(valor) {
    abaixado=valor;
    botaoAbaixar.setAttribute('aria-pressed',String(valor));
    botaoAbaixar.querySelector('b').textContent=valor?'Levantar':'Abaixar';
  }
  botaoAbaixar.addEventListener('click',()=>{if (ativo) abaixar(!abaixado);});
  window.addEventListener('keydown',e=>{
    if (!ativo) return;
    if (teclasDeMovimento.has(e.code)) {teclas.add(e.code);e.preventDefault();}
    if (e.code==='KeyE' && !e.repeat) acao();
    if (e.code==='KeyC' && !e.repeat) abaixar(!abaixado);
  });
  window.addEventListener('keyup',e=>teclas.delete(e.code));
  window.addEventListener('blur',limpar);
  document.addEventListener('visibilitychange',limpar);
  window.matchMedia('(orientation: portrait)').addEventListener('change',limpar);

  return {
    ativar(valor) {ativo=valor;limpar();abaixar(false);if (valor) {yaw=0;pitch=-.035;}},
    olhar:()=>({yaw,pitch}),
    movimento() {
      const f=frente+Number(teclas.has('KeyW')||teclas.has('ArrowUp'))-Number(teclas.has('KeyS')||teclas.has('ArrowDown'));
      const l=lateral+Number(teclas.has('KeyD')||teclas.has('ArrowRight'))-Number(teclas.has('KeyA')||teclas.has('ArrowLeft'));
      const fator=Math.max(1,Math.hypot(f,l));
      return { dx:(-Math.sin(yaw)*f+Math.cos(yaw)*l)/fator, dz:(-Math.cos(yaw)*f-Math.sin(yaw)*l)/fator, abaixado };
    },
  };
}
