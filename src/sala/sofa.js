import { box, group, palette } from '../utils.js';
export function criarSofa(parent,x,z,rotation=0,width=2) {
  const g=group(parent,x,z,rotation);
  box(g,width,.25,.82,0,.25,0,palette.linen); box(g,width,.5,.18,0,.55,-.36,palette.linen);
  for(const sign of [-1,1]) box(g,.16,.4,.85,sign*(width/2-.08),.45,0,palette.linen);
  const seat=(width-.36)/3; for(let i=0;i<3;i++) {box(g,seat-.025,.13,.59,-seat+i*seat,.44,.06,'#eee8d9');const p=box(g,seat-.06,.35,.15,-seat+i*seat,.66,-.22,i===1?'#98a68b':'#e1dac8');p.rotation.x=-.12;}
  for(const a of [-1,1]) for(const b of [-1,1]) box(g,.06,.12,.06,a*(width/2-.15),.06,b*.3,palette.darkWood);return g;
}
