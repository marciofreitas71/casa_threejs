import { box, group } from '../utils.js';
export function criarGuardaRoupa(parent,x,z,width=1.4,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,width,2.18,.52,0,1.11,0,'#c4b798');
  for(const sign of [-1,1]) {box(g,width/2-.014,2.1,.025,sign*width/4,1.11,.274,'#e0d7bf');box(g,.018,.29,.032,sign*.055,1.06,.3,'#8d8d72');}return g;
}
