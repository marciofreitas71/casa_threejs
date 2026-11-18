import { box, group } from '../utils.js';

export function criarSofa(parent, x, z, rotation = 0, width = 2) {
  const g = group(parent, x, z, rotation);
  box(g, width, .23, .84, 0, .23, 0, '#b6a48c');
  box(g, width, .48, .17, 0, .56, -.36, '#b9a68c');
  for (const sign of [-1, 1]) box(g, .15, .32, .88, sign * (width / 2 - .075), .48, 0, '#b9a68c');
  const seat = (width - .34) / 3;
  for (const lugar of [-1, 0, 1]) {
    box(g, seat - .02, .12, .63, lugar * seat, .40, .055, '#cec0aa');
    box(g, seat - .04, .34, .15, lugar * seat, .61, -.22, '#c4b194').rotation.x = -.14;
    const almofada = box(g, .26, .25, .085, lugar * seat, .60, -.08, lugar === 0 ? '#e2d7c5' : '#e9e0ce');
    almofada.rotation.set(-.22, .12, lugar * .18);
  }
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    box(g, .055, .105, .055, a * (width / 2 - .16), .063, b * .30, '#7d624a');
  }
  return g;
}

export function criarPoltrona(parent, x, z, rotation = 0) {
  const g = group(parent, x, z, rotation);
  box(g, .58, .13, .57, 0, .39, 0, '#dacbb3');
  box(g, .58, .39, .10, 0, .61, -.26, '#cbb89a').rotation.x = -.14;
  for (const a of [-.33, .33]) {
    box(g, .052, .045, .64, a, .54, 0, '#95704b');
    for (const b of [-.25, .25]) box(g, .048, .50, .048, a, .26, b, '#95704b');
  }
  return g;
}

export function criarPufe(parent, x, z, rotation = 0, largura = .41) {
  const g = group(parent, x, z, rotation);
  box(g, largura, .27, largura, 0, .18, 0, '#bea98c');
  box(g, largura + .014, .075, largura + .014, 0, .35, 0, '#d5c5ad');
  return g;
}
