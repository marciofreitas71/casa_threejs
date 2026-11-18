import { box, group, cylinder } from '../utils.js';

export function criarCadeira(parent, x, z, rotation = 0, madeira = '#9b7955') {
  const g = group(parent, x, z, rotation);
  box(g, .42, .07, .42, 0, .45, 0, '#d3c6b0');
  box(g, .43, .28, .055, 0, .65, -.18, madeira);
  box(g, .35, .18, .035, 0, .65, -.144, '#c7b79a');
  for (const a of [-.16, .16]) for (const b of [-.16, .16]) {
    box(g, .036, .44, .036, a, .225, b, madeira);
  }
  return g;
}

export function criarMesa(parent, x, z) {
  const g = group(parent, x, z);
  const comprimento = 2.20;
  box(g, .96, .048, comprimento + .03, 0, .732, 0, '#b49574');
  box(g, .93, .026, comprimento, 0, .768, 0, '#f8f6ef');
  for (const a of [-.34, .34]) for (const b of [-.87, .87]) {
    box(g, .066, .716, .066, a, .368, b, '#a68964');
  }
  for (const lado of [-1, 1]) for (const lugar of [-.69, 0, .69]) {
    criarCadeira(g, lado * .68, lugar, -lado * Math.PI / 2);
  }
  return g;
}

export function criarMesaVaranda(parent, x, z) {
  const g = group(parent, x, z);
  cylinder(g, .468, .047, 0, .71, 0, '#ab8b69');
  cylinder(g, .452, .027, 0, .745, 0, '#f8f6ef');
  cylinder(g, .055, .68, 0, .36, 0, '#96704e');
  cylinder(g, .25, .045, 0, .035, 0, '#96704e');
  for (const lado of [-1, 1]) for (const fundo of [-1, 1]) {
    criarCadeira(g, lado * .73, fundo * .45, Math.atan2(-lado, -fundo * .46), '#906442');
  }
  return g;
}

export function criarBanqueta(parent, x, z) {
  const g = group(parent, x, z);
  cylinder(g, .18, .065, 0, .60, 0, '#d7cbb8');
  cylinder(g, .034, .55, 0, .30, 0, '#9b8061');
  cylinder(g, .14, .045, 0, .025, 0, '#9b8061');
  return g;
}
