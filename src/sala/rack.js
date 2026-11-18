import { box, group, plant } from '../utils.js';
export function criarRack(parent,x,z,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,1.7,.34,.36,0,.25,0,'#a88762');
  for(const a of [-.53,0,.53]) {box(g,.5,.27,.015,a,.25,.19,'#bf9b70');box(g,.12,.018,.025,a,.33,.21,'#7a6a51');}
  box(g,.5,.025,.22,0,.44,0,'#3d463f');box(g,.06,.14,.06,0,.49,0,'#3d463f');box(g,1.23,.73,.045,0,.9,-.04,'#303b36');box(g,1.16,.66,.008,0,.9,-.014,'#484644',{roughness:.3});plant(g,.69,0,.42,.43);return g;
}
