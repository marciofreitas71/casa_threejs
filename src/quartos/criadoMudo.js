import { box, group, cylinder } from '../utils.js';
export function criarCriadoMudo(parent,x,z) {
  const g=group(parent,x,z);box(g,.4,.45,.38,0,.25,0,'#c3ab86');box(g,.36,.16,.02,0,.36,.2,'#d9c5a5');box(g,.07,.014,.03,0,.36,.22,'#8b8064');cylinder(g,.085,.025,0,.49,0,'#8d967d');cylinder(g,.012,.17,0,.58,0,'#8d967d');cylinder(g,.12,.14,0,.72,0,'#ede6d3',.075);return g;
}
