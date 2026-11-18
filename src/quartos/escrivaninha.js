import { box, group } from '../utils.js';
import { criarCadeira } from '../cozinha/mesa.js';

export function criarEscrivaninha(parent, x, z, largura, rotation = 0) {
  const g = group(parent, x, z, rotation);
  box(g, largura, .055, .47, 0, .74, 0, '#ba9161');
  const lateral = largura / 2 - .15;
  box(g, .28, .68, .43, -lateral, .36, 0, '#b0875a');
  box(g, .045, .69, .43, largura / 2 - .04, .365, 0, '#b0875a');
  for (const y of [.32, .55]) {
    box(g, .258, .20, .026, -lateral, y, .222, '#c8a679');
    box(g, .095, .015, .025, -lateral, y + .04, .242, '#82674e');
  }
  criarCadeira(g, .10, .61, Math.PI, '#b8a58b');
  return g;
}
