import { box, group } from '../utils.js';

export function criarGuardaRoupa(parent, x, z, width = 1.4, rotation = 0) {
  const g = group(parent, x, z, rotation);
  box(g, width, 2.18, .52, 0, 1.11, 0, '#9d754e');
  const portas = Math.max(2, Math.round(width / .48));
  const largura = width / portas;
  for (let i = 0; i < portas; i++) {
    const centro = (i + .5) * largura - width / 2;
    box(g, largura - .012, 2.08, .028, centro, 1.11, .274, '#bc9464');
    for (const friso of [-.3, -.1, .1, .3]) {
      box(g, .012, 2.08, .012, centro + largura * friso, 1.11, .293, '#aa8255');
    }
    box(g, .018, .21, .028, centro + largura * .34, 1.02, .304, '#80654d');
  }
  return g;
}
