import { box, group } from '../utils.js';
export function criarGeladeira(parent,x,z,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,.64,1.85,.65,0,.95,0,'#d6ded7');box(g,.61,.55,.035,0,1.59,.34,'#e8ece4');box(g,.61,1.21,.035,0,.68,.34,'#e8ece4');box(g,.025,.29,.055,-.23,1.55,.38,'#8b9a8d');box(g,.025,.43,.055,-.23,1.04,.38,'#8b9a8d');return g;
}
