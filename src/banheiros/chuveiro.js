import { box, group, cylinder } from '../utils.js';
export function criarChuveiro(parent,x,z,width=1.3) {
  const g=group(parent,x,z);box(g,width-.04,.035,.78,0,.05,0,'#dbdfd4');box(g,.1,.008,.1,0,.075,0,'#99a595');
  box(g,width-.04,1.95,.015,0,1.04,.4,'#c2dcd3',{transparent:true,opacity:.22,depthWrite:false,roughness:.15});
  for(const x of [-width/2+.025,0,width/2-.025]) box(g,.02,2,.025,x,1.05,.4,'#899b88');box(g,width, .025,.03,0,2.05,.4,'#899b88');
  cylinder(g,.018,.65,0,1.83,-.32,'#9daa9b');box(g,.035,.035,.24,0,2.14,-.22,'#9daa9b');box(g,.2,.025,.2,0,2.14,-.12,'#b0bdae');return g;
}
