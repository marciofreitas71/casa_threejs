import { box, cylinder, group } from '../utils.js';
export function criarFogao(parent,x,z) {
  const g=group(parent,x,z);box(g,.55,.84,.56,0,.45,0,'#dedfd6');box(g,.56,.035,.59,0,.89,0,'#d1d7d1');
  for(const a of [-.14,.14]) for(const b of [-.15,.15]) {cylinder(g,.087,.014,a,.915,b,'#35433b');box(g,.2,.012,.018,a,.93,b,'#738075');box(g,.018,.012,.2,a,.93,b,'#738075');}
  box(g,.44,.4,.015,0,.43,.287,'#48564d');box(g,.38,.03,.06,0,.68,.31,'#a8b1a5');for(const x of [-.18,-.06,.06,.18]) cylinder(g,.023,.03,x,.81,.3,'#536054');return g;
}
