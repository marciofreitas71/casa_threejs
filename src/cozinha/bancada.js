import { box, group } from '../utils.js';
export function criarBancada(parent,x,z,width=1.1,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,width,.79,.56,0,.43,0,'#839279');box(g,width+.04,.065,.62,0,.86,0,'#e9e4d6');
  for(let i=0;i<Math.round(width/.5);i++){const n=Math.round(width/.5),w=width/n;box(g,w-.025,.69,.02,-width/2+w*(i+.5),.45,.29,'#98a48b');box(g,.16,.02,.03,-width/2+w*(i+.5),.71,.31,'#bfc2b5');}return g;
}
