import { cylinder, group } from '../utils.js';

export function criarCriadoMudo(parent, x, z, luminaria = true) {
  const g = group(parent, x, z);
  cylinder(g, .175, .37, 0, .21, 0, '#a97e51');
  cylinder(g, .205, .045, 0, .405, 0, '#bb9568');
  if (luminaria) {
    cylinder(g, .087, .021, 0, .44, 0, '#e7dfd3');
    cylinder(g, .021, .17, 0, .525, 0, '#a88461');
    cylinder(g, .126, .138, 0, .632, 0, '#f5ecdc', .095);
  }
  return g;
}
