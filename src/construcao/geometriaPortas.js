export const ALCANCE_PORTA = 1;
export const FOLGA_PORTA = .035;

export function pontoParede(wall, offset) {
  return { x: wall.x + (wall.axis === 'x' ? offset : 0), z: wall.z + (wall.axis === 'z' ? offset : 0) };
}

export function listarPortas(linhas) {
  return linhas.flatMap(wall => wall.holes
    .filter(hole => hole.kind === 'door' || hole.kind === 'slide')
    .map(hole => ({
      ...pontoParede(wall,hole.at+hole.w/2), id: hole.id, nome: hole.name, wall, hole,
    })));
}

export function parametrosGiro(wall, hole) {
  const hinge = hole.hinge === 'end' ? hole.w : 0;
  const base = wall.axis === 'z' ? -Math.PI / 2 : 0;
  return { hinge, base, closed: hinge ? Math.PI : 0, swing: hole.swing * Math.PI / 2 };
}

export function paineisDeCorrer(hole) {
  const w = hole.w / 4;
  return [0, 1, 2, 3].map(i => ({
    w, offset: i * w, deslocamento: [0,-w,w,0][i],
    track: i === 0 || i === 3 ? -.036 : .036,
  }));
}

export function folhasDaPorta(wall, hole, progresso) {
  if (hole.kind === 'slide') {
    const vertical = wall.axis === 'z';
    return paineisDeCorrer(hole).map(({w,offset,deslocamento,track}) => {
      const p = pontoParede(wall,hole.at+offset+deslocamento*progresso);
      return vertical
        ? { x:p.x-track, z:p.z, dx:0, dz:1, w }
        : { x:p.x, z:p.z+track, dx:1, dz:0, w };
    });
  }
  const { hinge, base, closed, swing } = parametrosGiro(wall,hole);
  const angulo = base+closed+swing*progresso;
  return [{ ...pontoParede(wall,hole.at+hinge), dx:Math.cos(angulo), dz:-Math.sin(angulo), w:hole.w }];
}

function projetar(folha,x,z) {
  return Math.max(0,Math.min(folha.w,(x-folha.x)*folha.dx+(z-folha.z)*folha.dz));
}

export function distanciaDaPorta(wall,hole,x,z,progresso) {
  return Math.min(...folhasDaPorta(wall,hole,progresso).map(f => {
    const t=projetar(f,x,z);
    return Math.hypot(x-f.x-f.dx*t,z-f.z-f.dz*t);
  }));
}

export function portaPerto(porta,x,z,margem) {
  return Math.abs(porta.x-x)<=porta.hole.w+margem && Math.abs(porta.z-z)<=porta.hole.w+margem;
}

export function encostaNaPorta(porta,x,z,progresso,raio) {
  return portaPerto(porta,x,z,raio+FOLGA_PORTA)
    && distanciaDaPorta(porta.wall,porta.hole,x,z,progresso)<raio+FOLGA_PORTA;
}

export function podeAcionarPorta(porta,x,z,progresso,visivel) {
  if (!portaPerto(porta,x,z,ALCANCE_PORTA)) return false;
  return folhasDaPorta(porta.wall,porta.hole,progresso[porta.id]??0).some(f => {
    const perto=projetar(f,x,z);
    return [perto,f.w*.12,f.w*.5,f.w*.88].some(t => {
      const tx=f.x+f.dx*t, tz=f.z+f.dz*t;
      return Math.hypot(tx-x,tz-z)<=ALCANCE_PORTA && visivel(x,z,tx,tz,progresso,porta.id);
    });
  });
}
