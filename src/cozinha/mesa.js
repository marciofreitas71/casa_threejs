import { box, group, cylinder, plant } from '../utils.js';
export function criarMesa(parent,x,z) {
  const g=group(parent,x,z);box(g,.86,.065,1.02,0,.76,0,'#d5c09e');
  for(const a of [-1,1]) for(const b of [-1,1]) box(g,.055,.72,.055,a*.32,.36,b*.4,'#9a815e');
  for(const sign of [-1,1]) for(const side of [-1,1]) {const c=group(g,side*.57,sign*.29,-side*Math.PI/2);box(c,.34,.06,.36,0,.43,0,'#9eab8e');box(c,.34,.32,.04,0,.62,-.16,'#aab599');for(const a of [-1,1]) for(const b of [-1,1]) box(c,.035,.4,.035,a*.13,.2,b*.13,'#937e5b');}
  cylinder(g,.13,.025,0,.81,0,'#ded5bc');plant(g,0,0,.32,.82);return g;
}
