import { box, cylinder, group } from '../utils.js';
export function criarPia(parent,x,z,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,.53,.018,.4,0,.906,0,'#a3ada7');box(g,.43,.02,.31,0,.915,0,'#6e8179');box(g,.35,.008,.24,0,.928,0,'#bdc6c1');cylinder(g,.019,.26,0,1.03,-.23,'#a6b4ad');box(g,.035,.035,.17,0,1.16,-.16,'#a6b4ad');return g;
}
