import { encostaNaPorta, folhasDaPorta } from './geometriaPortas.js';

export function dentro(poly,x,z) {
  let interno=false;
  for (let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const [ax,az]=poly[j], [bx,bz]=poly[i];
    if ((az>z)!==(bz>z) && x<(bx-ax)*(z-az)/(bz-az)+ax) interno=!interno;
  }
  return interno;
}

function cruza(ax,az,bx,bz,x,z,dx,dz) {
  const denom=(bx-ax)*dz-(bz-az)*dx;
  if (Math.abs(denom)<1e-9) return false;
  const t=((x-ax)*dz-(z-az)*dx)/denom;
  const u=((x-ax)*(bz-az)-(z-az)*(bx-ax))/denom;
  return t>0 && t<.998 && u>=0 && u<=1;
}

export function criarColisao({perimetros,solidos,portas,raio}) {
  const piso=(x,z)=>perimetros.some(poly=>dentro(poly,x,z));

  function livre(x,z,progresso={},r=raio) {
    return piso(x-r,z) && piso(x+r,z) && piso(x,z-r) && piso(x,z+r)
      && !solidos.some(b=>x+r>b.minX && x-r<b.maxX && z+r>b.minZ && z-r<b.maxZ)
      && !portas.some(p=>encostaNaPorta(p,x,z,progresso[p.id]??0,r));
  }

  function avancar(x,z,dx,dz,progresso) {
    const passos=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.07));
    for (let i=0;i<passos;i++) {
      if (livre(x+dx/passos,z,progresso)) x+=dx/passos;
      if (livre(x,z+dz/passos,progresso)) z+=dz/passos;
    }
    return {x,z};
  }

  function trajetoLivre(x,z,tx,tz,progresso) {
    const dx=tx-x, dz=tz-z;
    const passos=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.09));
    for (let i=1;i<=passos;i++) {
      if (!livre(x+dx*i/passos,z+dz*i/passos,progresso)) return false;
    }
    return true;
  }

  function visivel(ax,az,bx,bz,progresso={},ignorarPorta) {
    const minX=Math.min(ax,bx), maxX=Math.max(ax,bx), minZ=Math.min(az,bz), maxZ=Math.max(az,bz);
    for (const b of solidos) {
      if (b.minX>maxX || b.maxX<minX || b.minZ>maxZ || b.maxZ<minZ) continue;
      if (cruza(ax,az,bx,bz,b.minX,b.minZ,b.maxX-b.minX,0)
        || cruza(ax,az,bx,bz,b.minX,b.maxZ,b.maxX-b.minX,0)
        || cruza(ax,az,bx,bz,b.minX,b.minZ,0,b.maxZ-b.minZ)
        || cruza(ax,az,bx,bz,b.maxX,b.minZ,0,b.maxZ-b.minZ)) return false;
    }
    return !portas.some(p=>p.id!==ignorarPorta
      && p.x+p.hole.w>=minX && p.x-p.hole.w<=maxX && p.z+p.hole.w>=minZ && p.z-p.hole.w<=maxZ
      && folhasDaPorta(p.wall,p.hole,progresso[p.id]??0)
        .some(f=>cruza(ax,az,bx,bz,f.x,f.z,f.dx*f.w,f.dz*f.w)));
  }

  return {livre,avancar,trajetoLivre,visivel};
}
