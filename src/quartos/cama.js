import { box, group } from '../utils.js';

export function criarCama(parent, x, z, width = 1.5, rotation = 0) {
  const g = group(parent, x, z, rotation);
  box(g, width + .05, .23, 1.95, 0, .22, 0, '#b39a79');
  box(g, width + .06, .82, .09, 0, .45, -.98, '#b3a38f');
  box(g, width, .22, 1.90, 0, .44, 0, '#f5f0e4');
  box(g, width + .015, .045, 1.35, 0, .57, .26, '#e3dccf');
  box(g, width + .04, .045, .61, 0, .606, .63, '#b8a285');
  const almofadas = width > 1.2 ? [-.36, .36] : [0];
  for (const a of almofadas) {
    box(g, .58, .13, .38, a, .62, -.64, '#fcf9ef');
    box(g, .33, .10, .24, a, .64, -.38, '#d5ccbf');
  }
  return g;
}

export function criarBicama(parent, x, z, rotation = 0) {
  const g = group(parent, x, z, rotation);
  box(g, .88, .33, 1.92, 0, .195, 0, '#bd9e78');
  box(g, .85, .16, 1.88, 0, .44, 0, '#c8b697');
  box(g, .10, .54, 1.96, -.41, .53, 0, '#d2c1a5');
  box(g, .036, .16, 1.82, .441, .24, 0, '#cfb393');
  for (const a of [-.62, .62]) {
    box(g, .34, .12, .39, -.13, .58, a, '#eee7dc').rotation.y = a;
    box(g, .27, .097, .30, .08, .57, a * .70, '#dfd3bf').rotation.y = -a;
  }
  return g;
}
